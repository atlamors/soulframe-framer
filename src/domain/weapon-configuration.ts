import type {
  CraftworkTier,
  Joinery,
  JoineryWeaponType,
  Temper,
  VirtueValues,
  Weapon,
} from "./types";

export const CRAFTWORK_TIERS = [
  "Stock",
  "Military",
  "Officer",
  "Noble",
  "Sovereign",
  "Legendary",
] as const satisfies readonly CraftworkTier[];

export const CRAFTWORK_TEMPER_RANGES = {
  Stock: { minimum: 0, maximum: 1 },
  Military: { minimum: 1, maximum: 3 },
  Officer: { minimum: 2, maximum: 4 },
  Noble: { minimum: 3, maximum: 5 },
  Sovereign: { minimum: 4, maximum: 6 },
  Legendary: { minimum: 5, maximum: 8 },
} as const satisfies Record<
  CraftworkTier,
  { minimum: number; maximum: number }
>;

const MELEE_WEAPON_TYPES = new Set<JoineryWeaponType>([
  "Heavy",
  "Long Blade",
  "Polearm",
  "Shield",
  "Short Blade",
]);

export function isCraftworkTier(value: unknown): value is CraftworkTier {
  return (
    typeof value === "string" &&
    CRAFTWORK_TIERS.includes(value as CraftworkTier)
  );
}

export function getCraftworkTemperRange(tier: CraftworkTier) {
  return CRAFTWORK_TEMPER_RANGES[tier];
}

export type CraftworkTemperStatus = {
  used: number;
  minimum: number;
  maximum: number;
  missing: number;
  remaining: number;
  complete: boolean;
  withinCapacity: boolean;
};

/**
 * Reports edit-time completeness separately from the hard capacity boundary.
 * Configurations below the Craftwork minimum remain editable and serializable,
 * while callers can identify them as incomplete. Values above the maximum are
 * never valid and are removed by selection normalization.
 */
export function getCraftworkTemperStatus(
  tier: CraftworkTier,
  used: number,
): CraftworkTemperStatus {
  const { minimum, maximum } = CRAFTWORK_TEMPER_RANGES[tier];
  const normalizedUsed = Math.max(0, Math.trunc(used));

  return {
    used: normalizedUsed,
    minimum,
    maximum,
    missing: Math.max(0, minimum - normalizedUsed),
    remaining: Math.max(0, maximum - normalizedUsed),
    complete: normalizedUsed >= minimum && normalizedUsed <= maximum,
    withinCapacity: normalizedUsed <= maximum,
  };
}

export function getPromotedCraftworkTier(
  currentTier: CraftworkTier,
  used: number,
): CraftworkTier | null {
  const normalizedUsed = Math.max(0, Math.trunc(used));
  const currentIndex = CRAFTWORK_TIERS.indexOf(currentTier);

  return (
    CRAFTWORK_TIERS.slice(currentIndex).find(
      (tier) => CRAFTWORK_TEMPER_RANGES[tier].maximum >= normalizedUsed,
    ) ?? null
  );
}

export type TemperCompatibilityReason =
  | "placeholder"
  | "weapon-missing"
  | "origin"
  | "weapon-type";

export function getTemperCompatibilityReasons(
  temper: Temper,
  weapon?: Weapon,
): TemperCompatibilityReason[] {
  if (temper.isPlaceholder) return ["placeholder"];
  if (!weapon) return ["weapon-missing"];

  const reasons: TemperCompatibilityReason[] = [];
  if (temper.origin !== "Universal" && temper.origin !== weapon.origin) {
    reasons.push("origin");
  }

  const matchesWeaponType =
    temper.compatibility === "All Weapons" ||
    (temper.compatibility === "Melee"
      ? MELEE_WEAPON_TYPES.has(weapon.combatArt as JoineryWeaponType)
      : temper.compatibility === weapon.combatArt);
  if (!matchesWeaponType) reasons.push("weapon-type");

  return reasons;
}

export function isTemperCompatible(temper: Temper, weapon?: Weapon): boolean {
  return getTemperCompatibilityReasons(temper, weapon).length === 0;
}

export type EquippedTemperEffect = {
  id: string;
  effectId: string;
  temperId: string;
  temperName: string;
  occurrences: 1 | 2;
  text: string;
  numericalModifier: EquippedTemperNumericalModifier | null;
};

export type EquippedTemperNumericalModifier = {
  metric: "Stagger" | "Smite chance";
  value: number;
};

export type EquippedTemperNumericalModifiers = {
  staggerDamage: number;
  smiteChancePercentagePoints: number;
};

function parseSourceBackedTemperNumericalModifier(
  effectId: string,
  stackValue: string,
): EquippedTemperNumericalModifier | null {
  const match =
    effectId === "hit_stagger_damage"
      ? /^([+-]?\d+(?:\.\d+)?) Stagger Damage$/.exec(stackValue)
      : effectId === "smite_proc_chance"
        ? /^([+-]?\d+(?:\.\d+)?)%$/.exec(stackValue)
        : null;
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  return {
    metric: effectId === "hit_stagger_damage" ? "Stagger" : "Smite chance",
    value,
  };
}

export function getEquippedTemperEffects(
  temperIds: readonly string[],
  temperById: ReadonlyMap<string, Temper>,
): EquippedTemperEffect[] {
  const occurrenceCounts = new Map<string, 1 | 2>();
  for (const temperId of temperIds) {
    const current = occurrenceCounts.get(temperId);
    occurrenceCounts.set(
      temperId,
      current === undefined ? 1 : 2,
    );
  }

  return [...occurrenceCounts].flatMap(([temperId, occurrences]) => {
    const temper = temperById.get(temperId);
    if (!temper) return [];
    const stack = occurrences === 2 ? "double" : "single";
    return temper.stats.map((stat, index) => {
      const stackValue = stat.stacks[stack];
      return {
        id: `${temper.id}-${stat.effectId}-${index}`,
        effectId: stat.effectId,
        temperId: temper.id,
        temperName: temper.name,
        occurrences,
        text: stat.effect.replaceAll("$1", stackValue),
        numericalModifier: parseSourceBackedTemperNumericalModifier(
          stat.effectId,
          stackValue,
        ),
      };
    });
  });
}

export function getEquippedTemperNumericalModifiers(
  temperIds: readonly string[],
  temperById: ReadonlyMap<string, Temper>,
): EquippedTemperNumericalModifiers {
  return getEquippedTemperEffects(temperIds, temperById).reduce(
    (modifiers, effect) => {
      if (effect.numericalModifier?.metric === "Stagger") {
        modifiers.staggerDamage += effect.numericalModifier.value;
      } else if (effect.numericalModifier?.metric === "Smite chance") {
        modifiers.smiteChancePercentagePoints += effect.numericalModifier.value;
      }
      return modifiers;
    },
    { staggerDamage: 0, smiteChancePercentagePoints: 0 },
  );
}

export function isJoineryCompatible(joinery: Joinery, weapon?: Weapon): boolean {
  if (!weapon) return false;
  return (
    joinery.compatibility.scope === "all" ||
    joinery.compatibility.types.includes(weapon.combatArt as JoineryWeaponType)
  );
}

export type JoineryPipApplication = {
  virtue: Joinery["virtue"];
  native: number;
  effective: number;
  granted: number;
  applied: number;
  wasted: number;
};

export function getJoineryPipApplication(
  nativeAttunement: VirtueValues,
  joinery: Joinery,
): JoineryPipApplication {
  const native = nativeAttunement[joinery.virtue];
  const cappedNative = Math.min(5, native);
  const granted = joinery.attunementPips;
  const applied = Math.min(granted, Math.max(0, 5 - cappedNative));

  return {
    virtue: joinery.virtue,
    native,
    effective: Math.min(5, cappedNative + granted),
    granted,
    applied,
    wasted: granted - applied,
  };
}

export function getEffectiveWeaponAttunement(
  nativeAttunement: VirtueValues,
  joinery?: Joinery,
): VirtueValues {
  const effectiveAttunement = {
    courage: Math.min(5, nativeAttunement.courage),
    spirit: Math.min(5, nativeAttunement.spirit),
    grace: Math.min(5, nativeAttunement.grace),
  };
  if (joinery) {
    const application = getJoineryPipApplication(nativeAttunement, joinery);
    effectiveAttunement[application.virtue] = application.effective;
  }
  return effectiveAttunement;
}

export function resolveValidWeaponJoinery(
  joineryId: string | null,
  weapon: Weapon | undefined,
  joineryById: ReadonlyMap<string, Joinery>,
): Joinery | undefined {
  if (!joineryId || !weapon) return undefined;
  const joinery = joineryById.get(joineryId);
  return joinery && isJoineryCompatible(joinery, weapon)
    ? joinery
    : undefined;
}

export type WeaponConfigurationSelectionNormalization = {
  value: { tempers: string[]; joineryId: string | null };
  changed: boolean;
  reasons: Array<
    | "temper-unknown"
    | "temper-incompatible"
    | "temper-duplicate-limit"
    | "temper-capacity"
    | "joinery-unknown"
    | "joinery-incompatible"
  >;
};

/**
 * Canonicalizes catalogue-backed selections without inventing required minimum
 * Tempers. The Craftwork minimum describes the in-game roll range; an
 * in-progress planner configuration may remain below it until the user fills it.
 */
export function normalizeWeaponConfigurationSelections({
  craftwork,
  tempers,
  joineryId,
  weapon,
  temperById,
  joineryById,
}: {
  craftwork: CraftworkTier;
  tempers: readonly string[];
  joineryId: string | null;
  weapon?: Weapon;
  temperById?: ReadonlyMap<string, Temper>;
  joineryById?: ReadonlyMap<string, Joinery>;
}): WeaponConfigurationSelectionNormalization {
  const maximum = CRAFTWORK_TEMPER_RANGES[craftwork].maximum;
  const occurrences = new Map<string, number>();
  const reasons: WeaponConfigurationSelectionNormalization["reasons"] = [];
  const normalizedTempers: string[] = [];

  for (const temperId of tempers) {
    if (normalizedTempers.length >= maximum) {
      reasons.push("temper-capacity");
      continue;
    }
    const temper = temperById?.get(temperId);
    if (temperById && !temper) {
      reasons.push("temper-unknown");
      continue;
    }
    if (temper && !isTemperCompatible(temper, weapon)) {
      reasons.push("temper-incompatible");
      continue;
    }
    const count = occurrences.get(temperId) ?? 0;
    if (count >= 2) {
      reasons.push("temper-duplicate-limit");
      continue;
    }
    occurrences.set(temperId, count + 1);
    normalizedTempers.push(temperId);
  }

  let normalizedJoineryId = joineryId;
  if (joineryId && joineryById) {
    const joinery = joineryById.get(joineryId);
    if (!joinery) {
      reasons.push("joinery-unknown");
      normalizedJoineryId = null;
    } else if (!isJoineryCompatible(joinery, weapon)) {
      reasons.push("joinery-incompatible");
      normalizedJoineryId = null;
    }
  }

  return {
    value: { tempers: normalizedTempers, joineryId: normalizedJoineryId },
    changed:
      normalizedJoineryId !== joineryId ||
      normalizedTempers.length !== tempers.length ||
      normalizedTempers.some((temperId, index) => temperId !== tempers[index]),
    reasons: [...new Set(reasons)],
  };
}
