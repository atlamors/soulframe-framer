import {
  ARMOR_SLOTS,
  VIRTUE_IDS,
  type ArmorItem,
  type EquipmentSlot,
  type SoulframeBuild,
  type Talisman,
} from "./types";

export const BUILD_SCHEMA_VERSION = 2 as const;
export const STORAGE_KEY = "soulframe-framer.build.v2";
export const LEGACY_STORAGE_KEY = "soulframe-framer.build.v1";
const MAX_VIRTUE_VALUE = 99;

export interface BuildCatalogue {
  armor: readonly ArmorItem[];
  talismans: readonly Talisman[];
}

export type DecodeResult =
  | { ok: true; build: SoulframeBuild; warnings: string[] }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateBuild(
  value: unknown,
  catalogue?: BuildCatalogue,
): DecodeResult {
  if (!isRecord(value)) return { ok: false, error: "Build data is not an object." };
  if (value.schemaVersion !== 1 && value.schemaVersion !== BUILD_SCHEMA_VERSION) {
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
  const equipment: Partial<Record<EquipmentSlot, string>> = {};
  const warnings: string[] = [];
  const knownArmorIds = catalogue
    ? new Set(catalogue.armor.map((item) => item.id))
    : undefined;
  const knownTalismanIds = catalogue
    ? new Set(catalogue.talismans.map((item) => item.id))
    : undefined;

  if (value.schemaVersion === 1) {
    warnings.push("Legacy build upgraded to include a Talisman slot.");
  }

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

  return {
    ok: true,
    build: {
      schemaVersion: BUILD_SCHEMA_VERSION,
      name: value.name,
      virtues,
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
