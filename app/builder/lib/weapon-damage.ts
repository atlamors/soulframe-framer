import { VIRTUE_IDS } from "@/src/domain/types";
import { temperById } from "@/src/data/tempers";
import {
  getEffectiveWeaponAttunement,
  getEquippedTemperNumericalModifiers,
} from "@/src/domain/weapon-configuration";
import type {
  CraftworkTier,
  Joinery,
  VirtueValues,
  Weapon,
  WeaponLevelStats,
} from "@/src/domain/types";

const FARILWYD_RANK_30_FALLBACK = {
  attack: 122,
  chargedAttack: 190,
  stagger: 112,
} as const satisfies WeaponLevelStats;

const CRAFTWORK_RANKS = {
  Stock: 0,
  Military: 1,
  Officer: 2,
  Noble: 3,
  Sovereign: 4,
  Legendary: 5,
} as const satisfies Record<CraftworkTier, number>;

function isDualBlade(item: Weapon) {
  return (
    item.combatArt === "Short Blade" &&
    ((item.sourceSlot === "Weapon" && item.name !== "Rostrum") ||
      item.name === "Clivers")
  );
}

function getCraftworkLightAttackBonus(
  item: Weapon,
  craftwork: CraftworkTier,
) {
  const damagePerRank = isDualBlade(item) ? 2 : 4;
  return CRAFTWORK_RANKS[craftwork] * damagePerRank;
}

function getCraftworkActionBonus(
  item: Weapon,
  key: keyof WeaponLevelStats,
  lightAttackBonus: number,
) {
  if (key === "attack") return lightAttackBonus;

  const level0Attack = item.stats.level0.attack;
  const level0Action = item.stats.level0[key];
  if (level0Attack !== undefined && level0Action !== undefined) {
    return Math.round((lightAttackBonus * level0Action) / level0Attack);
  }

  return item.name === "Farilwyd" && key === "chargedAttack"
    ? lightAttackBonus * 2
    : 0;
}

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

export function getWeaponDamage(
  item: Weapon,
  virtues: VirtueValues,
  joinery?: Joinery,
  craftwork: CraftworkTier = "Stock",
  temperIds: readonly string[] = [],
) {
  const level30Stats = getRank30WeaponStats(item);
  const temperModifiers = getEquippedTemperNumericalModifiers(
    temperIds,
    temperById,
  );
  const stockAttack = level30Stats.attack;
  const charged = getChargedWeaponStat(level30Stats);
  const lightCraftworkBonus = getCraftworkLightAttackBonus(item, craftwork);
  const primaryCraftworkBonus =
    stockAttack === undefined ? 0 : lightCraftworkBonus;
  const secondaryCraftworkBonus =
    charged.value === undefined
      ? 0
      : getCraftworkActionBonus(item, charged.key, lightCraftworkBonus);
  const baseAttack =
    stockAttack === undefined
      ? undefined
      : stockAttack + primaryCraftworkBonus;
  const secondaryBase =
    charged.value === undefined
      ? undefined
      : charged.value + secondaryCraftworkBonus;
  const effectiveAttunement = getEffectiveWeaponAttunement(
    item.attunement,
    joinery,
  );
  const naturalGracePips =
    item.attunement.grace > 0 && effectiveAttunement.grace < 5
      ? effectiveAttunement.grace + 0.6
      : effectiveAttunement.grace;
  const rawAttunement =
    0.5 *
    (virtues.courage * effectiveAttunement.courage +
      virtues.spirit * effectiveAttunement.spirit +
      virtues.grace * naturalGracePips);
  const requirementMet = meetsWeaponRequirements(item, virtues);
  const primaryCap = getAttunementComponentCap(
    item,
    "lightAttack",
    stockAttack,
    primaryCraftworkBonus,
  );
  const primaryBonus =
    requirementMet && baseAttack !== undefined
      ? Math.round(Math.min(rawAttunement, primaryCap))
      : 0;
  let secondaryBonus = 0;

  if (
    requirementMet &&
    baseAttack !== undefined &&
    charged.value !== undefined
  ) {
    const secondaryCap = getSecondaryAttunementComponentCap(
      item,
      charged.key,
      charged.value,
      secondaryCraftworkBonus,
      primaryCraftworkBonus,
    );
    const secondaryRaw =
      charged.key === "chargedAttack" ? rawAttunement * 2 : rawAttunement;
    secondaryBonus = Math.round(Math.min(secondaryRaw, secondaryCap));
  }

  const hasStaggerTemperModifier = temperModifiers.staggerDamage !== 0;
  const baseStagger =
    level30Stats.stagger ?? (hasStaggerTemperModifier ? 0 : undefined);
  const stagger =
    baseStagger === undefined
      ? undefined
      : baseStagger + temperModifiers.staggerDamage;
  const staggerBonus = hasStaggerTemperModifier
    ? temperModifiers.staggerDamage
    : undefined;
  const hasSmiteTemperModifier =
    temperModifiers.smiteChancePercentagePoints !== 0;
  // An empty source Smite field contributes no base chance. A nonempty source
  // value without a parsed percentage remains unknown and is never replaced.
  const baseSmitePercent =
    item.stats.smite.percent ??
    (hasSmiteTemperModifier && item.stats.smite.display === "" ? 0 : null);
  const smiteBonus =
    baseSmitePercent !== null &&
    hasSmiteTemperModifier
      ? temperModifiers.smiteChancePercentagePoints
      : undefined;
  const smitePercent =
    baseSmitePercent === null
      ? undefined
      : baseSmitePercent + (smiteBonus ?? 0);

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
      base: secondaryBase,
      bonus: secondaryBonus,
      total:
        secondaryBase === undefined
          ? undefined
          : secondaryBase + secondaryBonus,
    },
    stagger,
    staggerBonus,
    smite: {
      bonus: smiteBonus,
      percent: smitePercent,
      display:
        smiteBonus === undefined
          ? item.stats.smite.display || undefined
          : `${smitePercent}%`,
    },
  };
}

export function getWeaponDamageRows(
  item?: Weapon,
  virtues?: VirtueValues,
  joinery?: Joinery,
  craftwork: CraftworkTier = "Stock",
  temperIds: readonly string[] = [],
) {
  const stats = item ? getRank30WeaponStats(item) : undefined;
  const calculated =
    item && virtues
      ? getWeaponDamage(item, virtues, joinery, craftwork, temperIds)
      : undefined;
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
      bonus: calculated?.staggerBonus,
      value: calculated?.stagger ?? stats?.stagger,
    },
    {
      id: "smite",
      label: "Smite",
      bonus:
        calculated?.smite.bonus === undefined
          ? undefined
          : `${calculated.smite.bonus}%`,
      value:
        calculated?.smite.display ?? (item?.stats.smite.display || undefined),
    },
  ];
}

type DamageCapKey = keyof Weapon["stats"]["damageCaps"];

function getAttunementComponentCap(
  item: Weapon,
  capKey: DamageCapKey,
  stockRank30Base: number | undefined,
  craftworkActionBonus = 0,
) {
  if (stockRank30Base === undefined) return 0;

  const exactTotalCap = item.stats.damageCaps[capKey];
  if (exactTotalCap !== undefined) {
    const stockComponent = Math.max(0, exactTotalCap - stockRank30Base);
    const level0Action = item.stats.level0.attack;
    const craftworkComponent =
      level0Action === undefined
        ? 0
        : Math.round((craftworkActionBonus * stockComponent) / level0Action);
    return stockComponent + craftworkComponent;
  }

  if (item.name !== "Farilwyd" || capKey !== "lightAttack") return 0;
  const level0Base = item.stats.level0.attack;
  if (level0Base === undefined) return 0;
  const rarityMultiplier = item.rarity === "Common" ? 1 : 1.5;
  const stockComponent = level0Base * rarityMultiplier;
  return (
    stockComponent +
    Math.round((craftworkActionBonus * stockComponent) / level0Base)
  );
}

function getSecondaryAttunementComponentCap(
  item: Weapon,
  key: keyof WeaponLevelStats,
  stockRank30Base: number,
  craftworkActionBonus: number,
  lightCraftworkBonus: number,
) {
  const capKey: DamageCapKey | undefined =
    key === "chargedAttack" || key === "fullChargedCast"
      ? "chargedHeavyAttack"
      : key === "chargedShot"
        ? "chargedShotAttack"
        : key === "throw" || key === "perfectThrow"
          ? key
          : undefined;

  if (capKey) {
    const exactTotalCap = item.stats.damageCaps[capKey];
    if (exactTotalCap !== undefined) {
      const stockComponent = Math.max(0, exactTotalCap - stockRank30Base);
      const level0Action = item.stats.level0[key];
      const craftworkComponent =
        level0Action === undefined
          ? 0
          : Math.round(
              (craftworkActionBonus * stockComponent) / level0Action,
            );
      return stockComponent + craftworkComponent;
    }
  }

  if (item.name === "Farilwyd" && key === "chargedAttack") {
    return getAttunementComponentCap(
      item,
      "lightAttack",
      getRank30WeaponStats(item).attack,
      lightCraftworkBonus,
    ) * 2;
  }

  return 0;
}
