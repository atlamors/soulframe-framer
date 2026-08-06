import { VIRTUE_IDS } from "@/src/domain/types";
import type {
  VirtueValues,
  Weapon,
  WeaponLevelStats,
} from "@/src/domain/types";

const FARILWYD_RANK_30_FALLBACK = {
  attack: 122,
  chargedAttack: 190,
  stagger: 112,
} as const satisfies WeaponLevelStats;

function getRank30WeaponStats(item: Weapon): WeaponLevelStats {
  const stats = item.stats.level30;
  if (item.name !== "Farilwyd") return stats;

  return {
    ...stats,
    attack: stats.attack ?? FARILWYD_RANK_30_FALLBACK.attack,
    chargedAttack:
      stats.chargedAttack ?? FARILWYD_RANK_30_FALLBACK.chargedAttack,
    stagger: stats.stagger ?? FARILWYD_RANK_30_FALLBACK.stagger,
  };
}

export function getChargedWeaponStat(stats: WeaponLevelStats) {
  const candidates: Array<[keyof WeaponLevelStats, string]> = [
    ["chargedAttack", "Charged Attack"],
    ["chargedShot", "Charged Shot"],
    ["fullChargedCast", "Charged Cast"],
    ["perfectThrow", "Perfect Throw"],
    ["throw", "Throw"],
    ["orbit", "Orbit"],
  ];
  for (const [key, label] of candidates) {
    if (stats[key] !== undefined) {
      return { key, label, value: stats[key] };
    }
  }

  return {
    key: "chargedAttack" as const,
    label: "Charged Attack",
    value: undefined,
  };
}

export function meetsWeaponRequirements(
  item: Weapon,
  virtues: VirtueValues,
) {
  return VIRTUE_IDS.every(
    (virtue) => virtues[virtue] >= item.requirements[virtue],
  );
}

export function getWeaponDamage(item: Weapon, virtues: VirtueValues) {
  const level30Stats = getRank30WeaponStats(item);
  const baseAttack = level30Stats.attack;
  const charged = getChargedWeaponStat(level30Stats);
  const naturalGracePips =
    item.attunement.grace > 0 ? item.attunement.grace + 0.6 : 0;
  const rawAttunement =
    0.5 *
    (virtues.courage * item.attunement.courage +
      virtues.spirit * item.attunement.spirit +
      virtues.grace * naturalGracePips);
  const rarityMultiplier =
    item.rarity === "Common" &&
    !["Vasp-IV", "Rivt-II", "Clivers"].includes(item.name)
      ? 1
      : 1.5;
  const requirementMet = meetsWeaponRequirements(item, virtues);
  const primaryBonus =
    requirementMet && baseAttack !== undefined
      ? Math.floor(Math.min(rawAttunement, baseAttack * rarityMultiplier))
      : 0;
  let secondaryBonus = 0;

  if (
    requirementMet &&
    baseAttack !== undefined &&
    charged.value !== undefined
  ) {
    if (charged.key === "chargedAttack") {
      secondaryBonus = primaryBonus * 2;
    } else {
      const capMultiplier =
        charged.key === "chargedShot"
          ? 2.5
          : charged.key === "fullChargedCast"
            ? 4.5
            : 1.5;
      secondaryBonus = Math.floor(
        Math.min(
          rawAttunement,
          baseAttack * capMultiplier * rarityMultiplier,
        ),
      );
    }
  }

  return {
    requirementMet,
    primary: {
      base: baseAttack,
      bonus: primaryBonus,
      total:
        baseAttack === undefined ? undefined : baseAttack + primaryBonus,
    },
    secondary: {
      key: charged.key,
      label: charged.label,
      base: charged.value,
      bonus: secondaryBonus,
      total:
        charged.value === undefined
          ? undefined
          : charged.value + secondaryBonus,
    },
    stagger: level30Stats.stagger,
  };
}

export function getWeaponDamageRows(
  item?: Weapon,
  virtues?: VirtueValues,
) {
  const stats = item ? getRank30WeaponStats(item) : undefined;
  const calculated =
    item && virtues ? getWeaponDamage(item, virtues) : undefined;
  const charged = stats
    ? getChargedWeaponStat(stats)
    : { label: "Charged Attack", value: undefined };

  return [
    {
      id: "attack",
      label: "Attack",
      bonus: calculated?.primary.bonus,
      value: calculated?.primary.total ?? stats?.attack,
    },
    {
      id: "charged",
      label: calculated?.secondary.label ?? charged.label,
      bonus: calculated?.secondary.bonus,
      value: calculated?.secondary.total ?? charged.value,
    },
    {
      id: "stagger",
      label: "Stagger",
      bonus: undefined,
      value: calculated?.stagger ?? stats?.stagger,
    },
    {
      id: "smite",
      label: "Smite",
      bonus: undefined,
      value: item?.stats.smite.display || undefined,
    },
  ];
}
