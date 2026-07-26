import {
  ARMOR_SLOTS,
  DEFENSE_IDS,
  VIRTUE_IDS,
  type ArmorItem,
  type BuildCalculation,
  type DefenseContribution,
  type DefenseId,
  type ItemContribution,
  type SoulframeBuild,
  type Talisman,
  type TalismanContribution,
  type VirtueValues,
} from "./types";

export const ARMOR_SCALE = 0.12;

export function meetsArmorRequirement(
  item: ArmorItem,
  virtues: VirtueValues,
) {
  return (
    item.requirement === null ||
    virtues[item.requirement.virtue] >= item.requirement.value
  );
}

export function calculateDefense(
  base: number,
  pips: VirtueValues,
  virtues: VirtueValues,
): DefenseContribution {
  const weightedPips = VIRTUE_IDS.reduce(
    (sum, virtue) => sum + pips[virtue] * virtues[virtue],
    0,
  );
  const scaling = Math.floor(ARMOR_SCALE * weightedPips);
  return { base, scaling, total: base + scaling };
}

export function calculateItemContribution(
  item: ArmorItem,
  virtues: VirtueValues,
): ItemContribution {
  const requirementMet = meetsArmorRequirement(item, virtues);
  const effectiveVirtues = requirementMet
    ? virtues
    : { courage: 0, spirit: 0, grace: 0 };
  const defenses = Object.fromEntries(
    DEFENSE_IDS.map((defense) => [
      defense,
      calculateDefense(
        item.defenses[defense].base,
        item.defenses[defense].pips,
        effectiveVirtues,
      ),
    ]),
  ) as Record<DefenseId, DefenseContribution>;

  return {
    itemId: item.id,
    requirementMet,
    defenses,
    total: DEFENSE_IDS.reduce(
      (sum, defense) => sum + defenses[defense].total,
      0,
    ),
  };
}

export function calculateBuild(
  build: SoulframeBuild,
  catalogue: readonly ArmorItem[],
  talismans: readonly Talisman[] = [],
): BuildCalculation {
  const byId = new Map(catalogue.map((item) => [item.id, item]));
  const talismanById = new Map(talismans.map((item) => [item.id, item]));
  const warnings: string[] = [];
  const equippedTalismanId = build.equipment.talisman;
  const equippedTalisman = equippedTalismanId
    ? talismanById.get(equippedTalismanId)
    : undefined;

  if (equippedTalismanId && !equippedTalisman) {
    warnings.push(`Unknown Talisman id: ${equippedTalismanId}`);
  }

  const talisman = equippedTalisman
    ? ({
        itemId: equippedTalisman.id,
        virtues: equippedTalisman.stats.virtues,
        defenses: equippedTalisman.stats.defenses,
        attack: equippedTalisman.stats.attack,
        stagger: equippedTalisman.stats.stagger,
        totalDefense: DEFENSE_IDS.reduce(
          (sum, defense) => sum + equippedTalisman.stats.defenses[defense],
          0,
        ),
        hasUnmodeledConditionalEffect:
          equippedTalisman.hasUnmodeledConditionalEffect,
      } satisfies TalismanContribution)
    : undefined;
  const effectiveVirtues = Object.fromEntries(
    VIRTUE_IDS.map((virtue) => [
      virtue,
      build.virtues[virtue] + (talisman?.virtues[virtue] ?? 0),
    ]),
  ) as VirtueValues;

  const items = ARMOR_SLOTS.flatMap((slot) => {
    const itemId = build.equipment[slot];
    if (!itemId) return [];
    const item = byId.get(itemId);
    if (!item) {
      warnings.push(`Unknown item id: ${itemId}`);
      return [];
    }
    const contribution = calculateItemContribution(item, effectiveVirtues);
    if (!contribution.requirementMet && item.requirement) {
      warnings.push(
        `${item.name} needs ${item.requirement.value} ${item.requirement.virtue}; attunement scaling is inactive.`,
      );
    }
    return [contribution];
  });

  const defenses = Object.fromEntries(
    DEFENSE_IDS.map((defense) => [
      defense,
      items.reduce((sum, item) => sum + item.defenses[defense].total, 0) +
        (talisman?.defenses[defense] ?? 0),
    ]),
  ) as Record<DefenseId, number>;
  const armorDefense = items.reduce((sum, item) => sum + item.total, 0);
  const talismanDefense = talisman?.totalDefense ?? 0;

  if (talisman?.hasUnmodeledConditionalEffect && equippedTalisman) {
    warnings.push(
      `${equippedTalisman.name} has an encounter-dependent effect that is not included in calculated totals.`,
    );
  }

  return {
    allocatedVirtues: build.virtues,
    effectiveVirtues,
    defenses,
    armorDefense,
    talismanDefense,
    total: DEFENSE_IDS.reduce((sum, defense) => sum + defenses[defense], 0),
    items,
    talisman,
    modifiers: {
      attack: talisman?.attack ?? 0,
      stagger: talisman?.stagger ?? 0,
    },
    warnings,
  };
}
