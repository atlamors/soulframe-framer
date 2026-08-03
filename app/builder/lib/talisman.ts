import { DEFENSE_IDS, VIRTUE_IDS } from "@/src/domain/types";
import type { Talisman } from "@/src/domain/types";
import { defenseMeta, virtueMeta } from "../constants";

export function talismanModifiers(item: Talisman) {
  const modifiers: Array<{
    id: string;
    label: string;
    value: number;
    icon: string;
  }> = [
    ...VIRTUE_IDS.flatMap((virtue) =>
      item.stats.virtues[virtue] > 0
        ? [
            {
              id: virtue,
              label: virtueMeta[virtue].label,
              value: item.stats.virtues[virtue],
              icon: virtueMeta[virtue].icon,
            },
          ]
        : [],
    ),
    ...DEFENSE_IDS.flatMap((defense) =>
      item.stats.defenses[defense] > 0
        ? [
            {
              id: defense,
              label: defenseMeta[defense].shortLabel,
              value: item.stats.defenses[defense],
              icon: defenseMeta[defense].icon,
            },
          ]
        : [],
    ),
  ];

  if (item.stats.attack > 0) {
    modifiers.push({
      id: "attack",
      label: "Attack",
      value: item.stats.attack,
      icon: "",
    });
  }
  if (item.stats.stagger > 0) {
    modifiers.push({
      id: "stagger",
      label: "Stagger",
      value: item.stats.stagger,
      icon: "",
    });
  }

  return modifiers;
}

export function formatTalismanSummary(item: Talisman) {
  return talismanModifiers(item)
    .slice(0, 3)
    .map((modifier) => `+${modifier.value} ${modifier.label}`)
    .join(" · ");
}
