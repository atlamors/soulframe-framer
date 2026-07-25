import {
  DEFENSE_IDS,
  VIRTUE_IDS,
  type ArmorItem,
  type BuildCalculation,
  type DefenseContribution,
  type DefenseId,
  type ItemContribution,
  type SoulframeBuild,
  type VirtueValues,
} from "./types";

export const ARMOR_SCALE = 0.12;

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
  const defenses = Object.fromEntries(
    DEFENSE_IDS.map((defense) => [
      defense,
      calculateDefense(
        item.defenses[defense].base,
        item.defenses[defense].pips,
        virtues,
      ),
    ]),
  ) as Record<DefenseId, DefenseContribution>;

  return {
    itemId: item.id,
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
): BuildCalculation {
  const byId = new Map(catalogue.map((item) => [item.id, item]));
  const warnings: string[] = [];
  const items = Object.values(build.equipment).flatMap((itemId) => {
    if (!itemId) return [];
    const item = byId.get(itemId);
    if (!item) {
      warnings.push(`Unknown item id: ${itemId}`);
      return [];
    }
    return [calculateItemContribution(item, build.virtues)];
  });

  const defenses = Object.fromEntries(
    DEFENSE_IDS.map((defense) => [
      defense,
      items.reduce((sum, item) => sum + item.defenses[defense].total, 0),
    ]),
  ) as Record<DefenseId, number>;

  return {
    defenses,
    total: DEFENSE_IDS.reduce((sum, defense) => sum + defenses[defense], 0),
    items,
    warnings,
  };
}
