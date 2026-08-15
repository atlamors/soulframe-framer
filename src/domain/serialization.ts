import {
  ARMOR_SLOTS,
  WEAPON_HAND_SLOTS,
  VIRTUE_IDS,
  type AffinitySources,
  type ArmorItem,
  type EquipmentSlot,
  type Joinery,
  type PactArtRank,
  type Pact,
  type Rune,
  type SoulframeBuild,
  type Talisman,
  type Temper,
  type Totem,
  type TotemSelection,
  type Weapon,
  type WeaponEnhancements,
  type VirtueId,
} from "./types";
import {
  BASE_AFFINITY_POINTS,
  MAX_ALLOCATABLE_AFFINITY,
  MAX_ENVOY_RANK,
  MIN_BASE_VIRTUE_VALUE,
  getAllocatableAffinity,
  inferAffinitySources,
} from "./affinity";
import { distributeVirtueTotal } from "./virtue-alignment";
import {
  createEmptyWeaponEnhancements,
  normalizeWeaponEnhancements,
} from "./enchantments";
import {
  createDefaultPactArtAllocation,
  getPactVirtueArtRanks,
  normalizeActiveCombatArtAllocations,
  normalizePactArtAllocation,
} from "./arts";
import { joineryById as defaultJoineryById } from "../data/joineries";
import { runeById as defaultRuneById } from "../data/runes";
import { temperById as defaultTemperById } from "../data/tempers";
import { weaponById } from "../data/weapons";
import { isCraftworkTier } from "./weapon-configuration";

export const BUILD_SCHEMA_VERSION = 6 as const;
export const STORAGE_KEY = "soulframe-framer.build.v6";
export const LEGACY_STORAGE_KEYS = [
  "soulframe-framer.build.v5",
  "soulframe-framer.build.v4",
  "soulframe-framer.build.v3",
  "soulframe-framer.build.v2",
  "soulframe-framer.build.v1",
] as const;
export const ARTS_MIGRATION_WARNING =
  "Saved build upgraded with direct Pact and Combat Art configuration.";
export const UNMAPPED_LEGACY_PACT_ARTS_WARNING =
  "Legacy Pact Art Virtue bonuses were preserved but could not be attached to an exact Pact.";
export const WEAPON_CONFIGURATION_MIGRATION_WARNING =
  "Saved build upgraded with Craftwork, Temper, and Joinery configuration.";
const MAX_VIRTUE_VALUE = MAX_ALLOCATABLE_AFFINITY;
const LEGACY_MAX_ENVOY_RANK = 99;

export interface BuildCatalogue {
  armor: readonly ArmorItem[];
  talismans: readonly Talisman[];
  weapons: readonly Weapon[];
  pacts?: readonly Pact[];
  runes?: readonly Rune[];
  totems?: readonly Totem[];
  tempers?: readonly Temper[];
  joineries?: readonly Joinery[];
}

export type DecodeResult =
  | {
      ok: true;
      build: SoulframeBuild;
      warnings: string[];
      sourceSchemaVersion: 1 | 2 | 3 | 4 | 5 | 6;
    }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseVirtueId(value: unknown): VirtueId | null | undefined {
  if (value === null) return null;
  return typeof value === "string" &&
    VIRTUE_IDS.includes(value as VirtueId)
    ? (value as VirtueId)
    : undefined;
}

function validateAffinitySources(value: unknown): AffinitySources | undefined {
  if (!isRecord(value)) return undefined;
  if (
    typeof value.envoyRank !== "number" ||
    !Number.isInteger(value.envoyRank) ||
    value.envoyRank < 0 ||
    value.envoyRank > LEGACY_MAX_ENVOY_RANK ||
    !isRecord(value.pactArts) ||
    !isRecord(value.fables)
  ) {
    return undefined;
  }

  const pactArtValues = value.pactArts;
  const fableValues = value.fables;
  const pactArts = Object.fromEntries(
    VIRTUE_IDS.map((virtue) => {
      const rank = pactArtValues[virtue];
      if (
        typeof rank !== "number" ||
        !Number.isInteger(rank) ||
        rank < 0 ||
        rank > 3
      ) {
        throw new Error(`Invalid ${virtue} Pact Art rank.`);
      }
      return [virtue, rank as PactArtRank];
    }),
  ) as AffinitySources["pactArts"];
  const shewolf = parseVirtueId(fableValues.shewolf);
  const wasteBear = parseVirtueId(fableValues.wasteBear);
  if (shewolf === undefined || wasteBear === undefined) return undefined;

  return {
    envoyRank: Math.min(MAX_ENVOY_RANK, value.envoyRank),
    pactArts,
    fables: { shewolf, wasteBear },
  };
}

function validateBuild(
  value: unknown,
  catalogue?: BuildCatalogue,
): DecodeResult {
  if (!isRecord(value)) return { ok: false, error: "Build data is not an object." };
  if (
    value.schemaVersion !== 1 &&
    value.schemaVersion !== 2 &&
    value.schemaVersion !== 3 &&
    value.schemaVersion !== 4 &&
    value.schemaVersion !== 5 &&
    value.schemaVersion !== BUILD_SCHEMA_VERSION
  ) {
    return { ok: false, error: "This build uses an unsupported schema version." };
  }
  if (typeof value.name !== "string" || value.name.length > 80) {
    return { ok: false, error: "Build name is invalid." };
  }
  const virtueValues = value.virtues;
  if (!isRecord(virtueValues)) {
    return { ok: false, error: "Virtue values are missing." };
  }
  const virtues = Object.fromEntries(
    VIRTUE_IDS.map((virtue) => {
      const amount = virtueValues[virtue];
      if (
        typeof amount !== "number" ||
        !Number.isInteger(amount) ||
        amount < 0 ||
        amount > MAX_VIRTUE_VALUE
      ) {
        throw new Error(`Invalid ${virtue} value.`);
      }
      return [virtue, amount];
    }),
  ) as SoulframeBuild["virtues"];

  if (!isRecord(value.equipment)) {
    return { ok: false, error: "Equipment data is missing." };
  }
  const warnings: string[] = [];
  const affinitySources =
    value.schemaVersion === 3 ||
    value.schemaVersion === 4 ||
    value.schemaVersion === 5 ||
    value.schemaVersion === BUILD_SCHEMA_VERSION
      ? validateAffinitySources(value.affinitySources)
      : inferAffinitySources(virtues);
  if (!affinitySources) {
    return { ok: false, error: "Affinity sources are invalid." };
  }
  const suppliedEnvoyRank =
    (value.schemaVersion === 3 ||
      value.schemaVersion === 4 ||
      value.schemaVersion === 5 ||
      value.schemaVersion === BUILD_SCHEMA_VERSION) &&
    isRecord(value.affinitySources) &&
    typeof value.affinitySources.envoyRank === "number"
      ? value.affinitySources.envoyRank
      : undefined;
  if (
    suppliedEnvoyRank !== undefined &&
    suppliedEnvoyRank > MAX_ENVOY_RANK
  ) {
    warnings.push(
      `Envoy Rank was capped at the current maximum of ${MAX_ENVOY_RANK}.`,
    );
  }

  const allocatablePoints = getAllocatableAffinity(affinitySources);
  const suppliedTotal = VIRTUE_IDS.reduce(
    (sum, virtue) => sum + virtues[virtue],
    0,
  );
  const hasVirtueBelowMinimum = VIRTUE_IDS.some(
    (virtue) => virtues[virtue] < MIN_BASE_VIRTUE_VALUE,
  );
  const normalizedVirtues =
    suppliedTotal === allocatablePoints && !hasVirtueBelowMinimum
      ? virtues
      : distributeVirtueTotal(allocatablePoints, virtues);

  if (value.schemaVersion === 1) {
    warnings.push(
      "Legacy build upgraded to include a Talisman slot and affinity sources.",
    );
  } else if (value.schemaVersion === 2) {
    warnings.push(
      "Saved build upgraded with affinity sources inferred from its Virtue pool.",
    );
  } else if (value.schemaVersion === 3) {
    warnings.push(
      "Saved build upgraded with Pact, Rune, and Totem configuration.",
    );
  } else if (value.schemaVersion === 4) {
    warnings.push(ARTS_MIGRATION_WARNING);
  } else if (value.schemaVersion === 5) {
    warnings.push(WEAPON_CONFIGURATION_MIGRATION_WARNING);
  } else if (suppliedTotal !== allocatablePoints || hasVirtueBelowMinimum) {
    warnings.push(
      hasVirtueBelowMinimum
        ? "Virtue allocation was normalized to retain at least one point in each Virtue."
        : `Virtue allocation was normalized to its ${BASE_AFFINITY_POINTS} base points plus Envoy Rank.`,
    );
  }

  const equipment: Partial<Record<EquipmentSlot, string>> = {};
  const knownArmorIds = catalogue
    ? new Set(catalogue.armor.map((item) => item.id))
    : undefined;
  const knownTalismanIds = catalogue
    ? new Set(catalogue.talismans.map((item) => item.id))
    : undefined;
  const knownWeaponIds = catalogue
    ? new Set(catalogue.weapons.map((item) => item.id))
    : undefined;

  for (const slot of ARMOR_SLOTS) {
    const itemId = value.equipment[slot];
    if (itemId === undefined) continue;
    if (typeof itemId !== "string" || itemId.length > 120) {
      return { ok: false, error: `Invalid item id for ${slot}.` };
    }
    if (knownArmorIds && !knownArmorIds.has(itemId)) {
      warnings.push(`Unknown ${slot} item "${itemId}" was ignored.`);
      continue;
    }
    equipment[slot] = itemId;
  }

  const talismanId = value.equipment.talisman;
  if (talismanId !== undefined) {
    if (typeof talismanId !== "string" || talismanId.length > 120) {
      return { ok: false, error: "Invalid item id for talisman." };
    }
    if (knownTalismanIds && !knownTalismanIds.has(talismanId)) {
      warnings.push(`Unknown talisman item "${talismanId}" was ignored.`);
    } else {
      equipment.talisman = talismanId;
    }
  }

  for (const slot of WEAPON_HAND_SLOTS) {
    const itemId = value.equipment[slot];
    if (itemId === undefined) continue;
    if (typeof itemId !== "string" || itemId.length > 120) {
      return { ok: false, error: `Invalid item id for ${slot}.` };
    }
    const weapon = knownWeaponIds
      ? catalogue?.weapons.find((item) => item.id === itemId)
      : undefined;
    if (knownWeaponIds && !knownWeaponIds.has(itemId)) {
      warnings.push(`Unknown ${slot} item "${itemId}" was ignored.`);
      continue;
    }
    if (weapon && weapon.slot !== slot) {
      warnings.push(`Incompatible ${slot} item "${itemId}" was ignored.`);
      continue;
    }
    equipment[slot] = itemId;
  }

  const knownPactIds = catalogue?.pacts
    ? new Set(catalogue.pacts.map((item) => item.id))
    : undefined;
  const pactValue =
    (value.schemaVersion === 4 ||
      value.schemaVersion === 5 ||
      value.schemaVersion === BUILD_SCHEMA_VERSION) &&
    isRecord(value.pact)
      ? value.pact
      : undefined;
  let pactItemId: string | null = null;
  let pactArtAllocation: SoulframeBuild["pact"]["artAllocation"] = {};
  if (pactValue) {
    if (
      pactValue.itemId !== null &&
      (typeof pactValue.itemId !== "string" || pactValue.itemId.length > 120)
    ) {
      return { ok: false, error: "Selected Pact is invalid." };
    }
    if (
      value.schemaVersion === 4 &&
      (typeof pactValue.rank !== "number" ||
        !Number.isInteger(pactValue.rank) ||
        pactValue.rank < 0 ||
        pactValue.rank > 30)
    ) {
      return { ok: false, error: "Pact rank is invalid." };
    }
    if (
      (value.schemaVersion === 5 || value.schemaVersion === BUILD_SCHEMA_VERSION) &&
      !isRecord(pactValue.artAllocation)
    ) {
      return { ok: false, error: "Pact Art allocation is invalid." };
    }
    if (
      typeof pactValue.itemId === "string" &&
      knownPactIds &&
      !knownPactIds.has(pactValue.itemId)
    ) {
      warnings.push(`Unknown Pact "${pactValue.itemId}" was ignored.`);
    } else {
      pactItemId = pactValue.itemId as string | null;
    }
  }
  const selectedPact = pactItemId
    ? catalogue?.pacts?.find((pact) => pact.id === pactItemId) ?? {
        id: pactItemId,
        variant: pactItemId.startsWith("pact-wyld-") ? "wyld" : "normal",
      }
    : undefined;
  if (value.schemaVersion === 5 || value.schemaVersion === BUILD_SCHEMA_VERSION) {
    const normalized = normalizePactArtAllocation(
      selectedPact,
      pactValue?.artAllocation,
    );
    pactArtAllocation = normalized.value;
    if (normalized.changed) {
      warnings.push("Pact Art allocation was normalized to the active tree.");
    }
  } else if (value.schemaVersion === 4 && selectedPact) {
    pactArtAllocation = normalizePactArtAllocation(
      selectedPact,
      Object.fromEntries(
        VIRTUE_IDS.flatMap((virtue) => {
          const rank = affinitySources.pactArts[virtue];
          return rank > 0 ? [[`pact-art-${virtue}`, rank]] : [];
        }),
      ),
    ).value;
  } else {
    pactArtAllocation = createDefaultPactArtAllocation(selectedPact);
  }

  const knownRuneIds = catalogue?.runes
    ? new Set(catalogue.runes.map((item) => item.id))
    : undefined;
  const knownTotemIds = catalogue?.totems
    ? new Set(catalogue.totems.map((item) => item.id))
    : undefined;
  const temperById = catalogue?.tempers
    ? new Map(catalogue.tempers.map((item) => [item.id, item]))
    : undefined;
  const joineryById = catalogue?.joineries
    ? new Map(catalogue.joineries.map((item) => [item.id, item]))
    : undefined;
  const runeById = new Map((catalogue?.runes ?? []).map((item) => [item.id, item]));
  const rawEnhancements =
    (value.schemaVersion === 4 ||
      value.schemaVersion === 5 ||
      value.schemaVersion === BUILD_SCHEMA_VERSION) &&
    isRecord(value.weaponEnhancements)
      ? value.weaponEnhancements
      : {};
  const weaponEnhancements = Object.fromEntries(
    WEAPON_HAND_SLOTS.map((slot) => {
      const empty = createEmptyWeaponEnhancements();
      const raw = rawEnhancements[slot];
      if (!isRecord(raw)) return [slot, empty];

      let rune: WeaponEnhancements["rune"] = null;
      if (raw.rune !== null && raw.rune !== undefined) {
        if (
          !isRecord(raw.rune) ||
          typeof raw.rune.itemId !== "string" ||
          raw.rune.itemId.length > 120 ||
          typeof raw.rune.rank !== "number" ||
          !Number.isInteger(raw.rune.rank) ||
          raw.rune.rank < 0 ||
          raw.rune.rank > 3
        ) {
          throw new Error(`Invalid Rune selection for ${slot}.`);
        }
        if (!knownRuneIds || knownRuneIds.has(raw.rune.itemId)) {
          rune = { itemId: raw.rune.itemId, rank: raw.rune.rank as 0 | 1 | 2 | 3 };
        } else {
          warnings.push(`Unknown ${slot} Rune "${raw.rune.itemId}" was ignored.`);
        }
      }

      const sourceTotems = Array.isArray(raw.totems) ? raw.totems : [];
      const totems = Array.from({ length: 4 }, (_, index) => {
        const candidate = sourceTotems[index];
        if (candidate === null || candidate === undefined) return null;
        if (
          !isRecord(candidate) ||
          typeof candidate.itemId !== "string" ||
          candidate.itemId.length > 120 ||
          typeof candidate.rank !== "number" ||
          !Number.isInteger(candidate.rank) ||
          candidate.rank < 0 ||
          candidate.rank > 3 ||
          typeof candidate.virtue !== "string" ||
          !VIRTUE_IDS.includes(candidate.virtue as VirtueId) ||
          (candidate.variant !== "universal" &&
            candidate.variant !== "combatArt")
        ) {
          throw new Error(`Invalid Totem selection for ${slot}.`);
        }
        if (knownTotemIds && !knownTotemIds.has(candidate.itemId)) {
          warnings.push(
            `Unknown ${slot} Totem "${candidate.itemId}" was ignored.`,
          );
          return null;
        }
        return {
          itemId: candidate.itemId,
          rank: candidate.rank as 0 | 1 | 2 | 3,
          virtue: candidate.virtue,
          variant: candidate.variant,
        } as TotemSelection;
      }) as WeaponEnhancements["totems"];

      let craftwork: WeaponEnhancements["craftwork"] = "Stock";
      let tempers: string[] = [];
      let joineryId: string | null = null;
      if (value.schemaVersion === BUILD_SCHEMA_VERSION) {
        if (!isCraftworkTier(raw.craftwork)) {
          throw new Error(`Invalid Craftwork selection for ${slot}.`);
        }
        if (
          !Array.isArray(raw.tempers) ||
          !raw.tempers.every(
            (temperId) =>
              typeof temperId === "string" && temperId.length <= 120,
          )
        ) {
          throw new Error(`Invalid Temper selections for ${slot}.`);
        }
        if (
          raw.joineryId !== null &&
          (typeof raw.joineryId !== "string" || raw.joineryId.length > 120)
        ) {
          throw new Error(`Invalid Joinery selection for ${slot}.`);
        }
        craftwork = raw.craftwork;
        tempers = [...raw.tempers];
        joineryId = raw.joineryId;
      }

      const selectedWeaponId = equipment[slot];
      const selectedWeapon = selectedWeaponId
        ? catalogue?.weapons.find((weapon) => weapon.id === selectedWeaponId)
        : undefined;
      const normalized = catalogue
        ? normalizeWeaponEnhancements(
            { rune, totems, craftwork, tempers, joineryId },
            selectedWeapon,
            runeById,
            temperById,
            joineryById,
          )
        : {
            value: { rune, totems, craftwork, tempers, joineryId },
            changed: false,
          };
      if (normalized.changed) {
        warnings.push(
          `${slot === "mainHand" ? "Main Hand" : "Off Hand"} enchantments were normalized for compatibility.`,
        );
      }
      return [slot, normalized.value];
    }),
  ) as SoulframeBuild["weaponEnhancements"];

  if (
    (value.schemaVersion === 5 || value.schemaVersion === BUILD_SCHEMA_VERSION) &&
    !isRecord(value.combatArts)
  ) {
    return { ok: false, error: "Combat Art configuration is invalid." };
  }
  const activeCombatArtNames = catalogue
    ? WEAPON_HAND_SLOTS.flatMap((slot) => {
        const itemId = equipment[slot];
        const weapon = itemId
          ? catalogue.weapons.find((candidate) => candidate.id === itemId)
          : undefined;
        return weapon && weapon.combatArt !== "Unreleased"
          ? [weapon.combatArt]
          : [];
      })
    : (value.schemaVersion === 5 || value.schemaVersion === BUILD_SCHEMA_VERSION) &&
        isRecord(value.combatArts)
      ? Object.keys(value.combatArts)
      : [];
  const normalizedCombatArts = normalizeActiveCombatArtAllocations(
    value.schemaVersion === 5 || value.schemaVersion === BUILD_SCHEMA_VERSION
      ? value.combatArts
      : {},
    activeCombatArtNames,
  );
  if (
    (value.schemaVersion === 5 || value.schemaVersion === BUILD_SCHEMA_VERSION) &&
    normalizedCombatArts.changed
  ) {
    warnings.push(
      "Combat Art configuration was normalized to the equipped Arts.",
    );
  }
  const hasCompatibilityPactArts =
    !selectedPact &&
    VIRTUE_IDS.some((virtue) => affinitySources.pactArts[virtue] > 0);
  const hasUnmappedLegacyPactArts =
    (value.schemaVersion === 3 || value.schemaVersion === 4) &&
    hasCompatibilityPactArts;
  if (hasUnmappedLegacyPactArts) {
    warnings.push(UNMAPPED_LEGACY_PACT_ARTS_WARNING);
  }
  const normalizedAffinitySources: AffinitySources = {
    ...affinitySources,
    pactArts: hasCompatibilityPactArts
      ? affinitySources.pactArts
      : getPactVirtueArtRanks(pactItemId, pactArtAllocation),
  };

  return {
    ok: true,
    sourceSchemaVersion: value.schemaVersion,
    build: {
      schemaVersion: BUILD_SCHEMA_VERSION,
      name: value.name,
      virtues: normalizedVirtues,
      affinitySources: normalizedAffinitySources,
      equipment,
      pact: { itemId: pactItemId, artAllocation: pactArtAllocation },
      combatArts: normalizedCombatArts.value,
      weaponEnhancements,
    },
    warnings,
  };
}

export function serializeBuild(
  build: SoulframeBuild,
  catalogue?: BuildCatalogue,
): string {
  const activeCombatArtNames = WEAPON_HAND_SLOTS.flatMap((slot) => {
    const itemId = build.equipment[slot];
    const weapon = itemId ? weaponById.get(itemId) : undefined;
    return weapon && weapon.combatArt !== "Unreleased"
      ? [weapon.combatArt]
      : [];
  });
  const runeById = catalogue?.runes
    ? new Map(catalogue.runes.map((item) => [item.id, item]))
    : defaultRuneById;
  const temperById = catalogue?.tempers
    ? new Map(catalogue.tempers.map((item) => [item.id, item]))
    : defaultTemperById;
  const joineryById = catalogue?.joineries
    ? new Map(catalogue.joineries.map((item) => [item.id, item]))
    : defaultJoineryById;
  const weaponEnhancements = Object.fromEntries(
    WEAPON_HAND_SLOTS.map((slot) => {
      const weaponId = build.equipment[slot];
      const weapon = weaponId
        ? catalogue?.weapons.find((candidate) => candidate.id === weaponId) ??
          weaponById.get(weaponId)
        : undefined;
      return [
        slot,
        normalizeWeaponEnhancements(
          build.weaponEnhancements[slot],
          weapon,
          runeById,
          temperById,
          joineryById,
        ).value,
      ];
    }),
  );
  const json = JSON.stringify({
    ...build,
    virtues: distributeVirtueTotal(
      getAllocatableAffinity(build.affinitySources),
      build.virtues,
    ),
    combatArts: normalizeActiveCombatArtAllocations(
      build.combatArts,
      activeCombatArtNames,
    ).value,
    weaponEnhancements,
  });
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function deserializeBuild(
  encoded: string,
  catalogue?: BuildCatalogue,
): DecodeResult {
  try {
    const normalized = encoded.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(padded), (character) => character.charCodeAt(0)),
    );
    return validateBuild(JSON.parse(json), catalogue);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Build data is malformed.",
    };
  }
}

export function parseStoredBuild(
  value: string,
  catalogue: BuildCatalogue,
): DecodeResult {
  try {
    return validateBuild(JSON.parse(value), catalogue);
  } catch {
    return { ok: false, error: "Saved build data is malformed." };
  }
}
