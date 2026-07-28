import {
  ARMOR_SLOTS,
  WEAPON_HAND_SLOTS,
  VIRTUE_IDS,
  type AffinitySources,
  type ArmorItem,
  type EquipmentSlot,
  type PactArtRank,
  type SoulframeBuild,
  type Talisman,
  type Weapon,
  type VirtueId,
} from "./types";
import {
  BASE_AFFINITY_POINTS,
  MAX_ALLOCATABLE_AFFINITY,
  MAX_ENVOY_RANK,
  getAllocatableAffinity,
  inferAffinitySources,
} from "./affinity";
import { distributeVirtueTotal } from "./virtue-alignment";

export const BUILD_SCHEMA_VERSION = 3 as const;
export const STORAGE_KEY = "soulframe-framer.build.v3";
export const LEGACY_STORAGE_KEYS = [
  "soulframe-framer.build.v2",
  "soulframe-framer.build.v1",
] as const;
const MAX_VIRTUE_VALUE = MAX_ALLOCATABLE_AFFINITY;
const LEGACY_MAX_ENVOY_RANK = 99;

export interface BuildCatalogue {
  armor: readonly ArmorItem[];
  talismans: readonly Talisman[];
  weapons: readonly Weapon[];
}

export type DecodeResult =
  | { ok: true; build: SoulframeBuild; warnings: string[] }
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
    value.schemaVersion === BUILD_SCHEMA_VERSION
      ? validateAffinitySources(value.affinitySources)
      : inferAffinitySources(virtues);
  if (!affinitySources) {
    return { ok: false, error: "Affinity sources are invalid." };
  }
  const suppliedEnvoyRank =
    value.schemaVersion === BUILD_SCHEMA_VERSION &&
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
  const normalizedVirtues =
    suppliedTotal === allocatablePoints
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
  } else if (suppliedTotal !== allocatablePoints) {
    warnings.push(
      `Virtue allocation was normalized to its ${BASE_AFFINITY_POINTS} base points plus Envoy Rank.`,
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

  return {
    ok: true,
    build: {
      schemaVersion: BUILD_SCHEMA_VERSION,
      name: value.name,
      virtues: normalizedVirtues,
      affinitySources,
      equipment,
    },
    warnings,
  };
}

export function serializeBuild(build: SoulframeBuild): string {
  const json = JSON.stringify(build);
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
