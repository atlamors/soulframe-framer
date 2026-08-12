import {
  ARMOR_SLOTS,
  VIRTUE_IDS,
  type ArmorItem,
  type ArmorSlot,
  type BuildCalculation,
  type SoulframeBuild,
  type Talisman,
  type VirtueValues,
} from "./types";
import {
  calculateBuild,
  calculateItemContribution,
  meetsArmorRequirement,
} from "./calculation";
import { getAllocatableAffinity, MIN_BASE_VIRTUE_VALUE } from "./affinity";
import { distributeVirtueTotal } from "./virtue-alignment";

export interface AffinityOptimization {
  kind: "affinity";
  currentBuild: SoulframeBuild;
  recommendedBuild: SoulframeBuild;
  currentCalculation: BuildCalculation;
  recommendedCalculation: BuildCalculation;
  equippedArmorCount: number;
  currentMetRequirements: number;
  recommendedMetRequirements: number;
  changed: boolean;
}

export interface ArmorOptimizationChange {
  slot: ArmorSlot;
  currentItemId?: string;
  recommendedItemId: string;
  currentTotal: number;
  recommendedTotal: number;
  delta: number;
}

export interface ArmorOptimization {
  kind: "armor";
  currentBuild: SoulframeBuild;
  recommendedBuild: SoulframeBuild;
  currentCalculation: BuildCalculation;
  recommendedCalculation: BuildCalculation;
  changes: ArmorOptimizationChange[];
  changed: boolean;
}

function countMetRequirements(calculation: BuildCalculation) {
  return calculation.items.filter((item) => item.requirementMet).length;
}

function affinityMovement(left: VirtueValues, right: VirtueValues) {
  return VIRTUE_IDS.reduce(
    (distance, virtue) => distance + Math.abs(left[virtue] - right[virtue]),
    0,
  );
}

function isBetterAffinityCandidate(
  candidate: BuildCalculation,
  best: BuildCalculation,
  candidateVirtues: VirtueValues,
  bestVirtues: VirtueValues,
  currentVirtues: VirtueValues,
) {
  const candidateRequirements = countMetRequirements(candidate);
  const bestRequirements = countMetRequirements(best);
  if (candidateRequirements !== bestRequirements) {
    return candidateRequirements > bestRequirements;
  }

  if (candidate.armorDefense !== best.armorDefense) {
    return candidate.armorDefense > best.armorDefense;
  }

  return (
    affinityMovement(candidateVirtues, currentVirtues) <
    affinityMovement(bestVirtues, currentVirtues)
  );
}

export function optimizeAffinityForArmor(
  build: SoulframeBuild,
  catalogue: readonly ArmorItem[],
  talismans: readonly Talisman[] = [],
): AffinityOptimization {
  const total = getAllocatableAffinity(build.affinitySources);
  const normalizedVirtues = distributeVirtueTotal(total, build.virtues);
  const normalizedBuild = VIRTUE_IDS.every(
    (virtue) => normalizedVirtues[virtue] === build.virtues[virtue],
  )
    ? build
    : { ...build, virtues: normalizedVirtues };
  const currentCalculation = calculateBuild(
    normalizedBuild,
    catalogue,
    talismans,
  );
  const equippedArmorCount = currentCalculation.items.length;

  if (equippedArmorCount === 0) {
    return {
      kind: "affinity",
      currentBuild: normalizedBuild,
      recommendedBuild: normalizedBuild,
      currentCalculation,
      recommendedCalculation: currentCalculation,
      equippedArmorCount,
      currentMetRequirements: 0,
      recommendedMetRequirements: 0,
      changed: false,
    };
  }

  let bestVirtues = normalizedBuild.virtues;
  let bestCalculation = currentCalculation;

  for (let courage = MIN_BASE_VIRTUE_VALUE; courage <= total - 2; courage += 1) {
    for (let spirit = MIN_BASE_VIRTUE_VALUE; spirit <= total - courage - 1; spirit += 1) {
      const candidateVirtues = {
        courage,
        spirit,
        grace: total - courage - spirit,
      };
      const candidateCalculation = calculateBuild(
        { ...build, virtues: candidateVirtues },
        catalogue,
        talismans,
      );

      if (
        isBetterAffinityCandidate(
          candidateCalculation,
          bestCalculation,
          candidateVirtues,
          bestVirtues,
          normalizedBuild.virtues,
        )
      ) {
        bestVirtues = candidateVirtues;
        bestCalculation = candidateCalculation;
      }
    }
  }

  const recommendedBuild = { ...normalizedBuild, virtues: bestVirtues };
  const changed = VIRTUE_IDS.some(
    (virtue) => bestVirtues[virtue] !== build.virtues[virtue],
  );

  return {
    kind: "affinity",
    currentBuild: normalizedBuild,
    recommendedBuild,
    currentCalculation,
    recommendedCalculation: bestCalculation,
    equippedArmorCount,
    currentMetRequirements: countMetRequirements(currentCalculation),
    recommendedMetRequirements: countMetRequirements(bestCalculation),
    changed,
  };
}

function chooseBestArmorForSlot(
  slot: ArmorSlot,
  currentItemId: string | undefined,
  virtues: VirtueValues,
  catalogue: readonly ArmorItem[],
) {
  const compatible = catalogue.filter(
    (item) => item.slot === slot && meetsArmorRequirement(item, virtues),
  );
  if (!compatible.length) return undefined;

  let best =
    compatible.find((item) => item.id === currentItemId) ?? compatible[0];
  let bestTotal = calculateItemContribution(best, virtues).total;

  for (const candidate of compatible) {
    const candidateTotal = calculateItemContribution(candidate, virtues).total;
    if (
      candidateTotal > bestTotal ||
      (candidateTotal === bestTotal &&
        best.id !== currentItemId &&
        candidate.name.localeCompare(best.name) < 0)
    ) {
      best = candidate;
      bestTotal = candidateTotal;
    }
  }

  return best;
}

export function optimizeArmorForAffinity(
  build: SoulframeBuild,
  catalogue: readonly ArmorItem[],
  talismans: readonly Talisman[] = [],
): ArmorOptimization {
  const currentCalculation = calculateBuild(build, catalogue, talismans);
  const virtues = currentCalculation.effectiveVirtues;
  const recommendedBuild: SoulframeBuild = {
    ...build,
    equipment: { ...build.equipment },
  };

  for (const slot of ARMOR_SLOTS) {
    const recommended = chooseBestArmorForSlot(
      slot,
      build.equipment[slot],
      virtues,
      catalogue,
    );
    if (recommended) recommendedBuild.equipment[slot] = recommended.id;
  }

  const recommendedCalculation = calculateBuild(
    recommendedBuild,
    catalogue,
    talismans,
  );
  const changes = ARMOR_SLOTS.flatMap((slot) => {
    const recommendedItemId = recommendedBuild.equipment[slot];
    if (!recommendedItemId) return [];
    const currentItemId = build.equipment[slot];
    const recommendedItem = catalogue.find(
      (item) => item.id === recommendedItemId,
    );
    if (!recommendedItem) return [];
    const currentItem = currentItemId
      ? catalogue.find((item) => item.id === currentItemId)
      : undefined;
    const currentTotal = currentItem
      ? calculateItemContribution(currentItem, virtues).total
      : 0;
    const recommendedTotal = calculateItemContribution(
      recommendedItem,
      virtues,
    ).total;

    return [
      {
        slot,
        currentItemId,
        recommendedItemId,
        currentTotal,
        recommendedTotal,
        delta: recommendedTotal - currentTotal,
      },
    ];
  });
  const changed = changes.some(
    (change) => change.currentItemId !== change.recommendedItemId,
  );

  return {
    kind: "armor",
    currentBuild: build,
    recommendedBuild,
    currentCalculation,
    recommendedCalculation,
    changes,
    changed,
  };
}
