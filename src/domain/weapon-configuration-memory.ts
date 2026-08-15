import type {
  Joinery,
  Rune,
  Temper,
  Totem,
  TotemSelection,
  VirtueId,
  Weapon,
  WeaponEnhancements,
} from "./types";
import { VIRTUE_IDS } from "./types";
import { createEmptyWeaponEnhancements, normalizeWeaponEnhancements } from "./enchantments";
import { isCraftworkTier } from "./weapon-configuration";

export const WEAPON_CONFIGURATION_MEMORY_SCHEMA_VERSION = 1 as const;
export const WEAPON_CONFIGURATION_MEMORY_KEY_PREFIX =
  "soulframe-framer.weapon-configurations.v1";
export const WEAPON_CONFIGURATION_LOCAL_WORKSPACE_ID_KEY =
  "soulframe-framer.local-workspace-id.v1";

export interface WeaponConfigurationMemoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createResilientWeaponConfigurationMemoryStorage(
  durableStorage: WeaponConfigurationMemoryStorage,
): WeaponConfigurationMemoryStorage {
  const failedWrites = new Map<string, string | null>();
  return {
    getItem(key) {
      return failedWrites.has(key)
        ? (failedWrites.get(key) ?? null)
        : durableStorage.getItem(key);
    },
    setItem(key, value) {
      failedWrites.set(key, value);
      durableStorage.setItem(key, value);
      failedWrites.delete(key);
    },
    removeItem(key) {
      failedWrites.set(key, null);
      durableStorage.removeItem(key);
      failedWrites.delete(key);
    },
  };
}

export interface WeaponConfigurationMemoryCatalogue {
  weapons: readonly Weapon[];
  runes: readonly Rune[];
  totems: readonly Totem[];
  tempers: readonly Temper[];
  joineries: readonly Joinery[];
}

export interface WeaponConfigurationMemory {
  schemaVersion: 1;
  configurations: Record<string, WeaponEnhancements>;
}

export type WeaponConfigurationMemoryResult = {
  memory: WeaponConfigurationMemory;
  warnings: string[];
  normalized: boolean;
};

type WorkspaceIdFactory = () => string;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isWorkspaceIdentity(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim() === value &&
    value.length > 0 &&
    value.length <= 200
  );
}

function createWorkspaceIdentity(idFactory: WorkspaceIdFactory): string {
  const identity = idFactory();
  if (!isWorkspaceIdentity(identity)) {
    throw new Error("A valid weapon-configuration workspace identity is required.");
  }
  return identity;
}

function defaultWorkspaceIdFactory(): string {
  return globalThis.crypto.randomUUID();
}

export function createLocalWeaponConfigurationWorkspaceKey(
  localWorkspaceId: string,
): string {
  if (!isWorkspaceIdentity(localWorkspaceId)) {
    throw new Error("A valid local Frame workspace ID is required.");
  }
  return `local:${localWorkspaceId}`;
}

export function createCloudWeaponConfigurationWorkspaceKey(
  artifactId: string,
): string {
  if (!isWorkspaceIdentity(artifactId)) {
    throw new Error("A valid cloud Frame artifact ID is required.");
  }
  return `cloud:${artifactId}`;
}

export function getOrCreateLocalWeaponConfigurationWorkspaceKey(
  storage: WeaponConfigurationMemoryStorage,
  idFactory: WorkspaceIdFactory = defaultWorkspaceIdFactory,
): string {
  try {
    const stored = storage.getItem(
      WEAPON_CONFIGURATION_LOCAL_WORKSPACE_ID_KEY,
    );
    if (isWorkspaceIdentity(stored)) {
      return createLocalWeaponConfigurationWorkspaceKey(stored);
    }
  } catch {
    // A transient identity still keeps this mounted workspace isolated.
  }

  return replaceLocalWeaponConfigurationWorkspaceKey(storage, idFactory);
}

export function replaceLocalWeaponConfigurationWorkspaceKey(
  storage: WeaponConfigurationMemoryStorage,
  idFactory: WorkspaceIdFactory = defaultWorkspaceIdFactory,
): string {
  const identity = createWorkspaceIdentity(idFactory);
  try {
    storage.setItem(WEAPON_CONFIGURATION_LOCAL_WORKSPACE_ID_KEY, identity);
  } catch {
    // Storage may be unavailable; the returned identity remains valid in-memory.
  }
  return createLocalWeaponConfigurationWorkspaceKey(identity);
}

function workspaceStorageKey(workspaceId: string): string {
  if (!workspaceId) throw new Error("A weapon-configuration workspace ID is required.");
  return `${WEAPON_CONFIGURATION_MEMORY_KEY_PREFIX}:${encodeURIComponent(workspaceId)}`;
}

function parseRankedEnhancement(value: unknown) {
  if (!isRecord(value)) return undefined;
  return typeof value.itemId === "string" &&
    value.itemId.length > 0 &&
    value.itemId.length <= 120 &&
    typeof value.rank === "number" &&
    Number.isInteger(value.rank) &&
    value.rank >= 0 &&
    value.rank <= 3
    ? { itemId: value.itemId, rank: value.rank as 0 | 1 | 2 | 3 }
    : undefined;
}

function parseTotemSelection(value: unknown): TotemSelection | undefined {
  const ranked = parseRankedEnhancement(value);
  if (!ranked || !isRecord(value)) return undefined;
  if (
    typeof value.virtue !== "string" ||
    !VIRTUE_IDS.includes(value.virtue as VirtueId) ||
    (value.variant !== "universal" && value.variant !== "combatArt")
  ) {
    return undefined;
  }
  return {
    ...ranked,
    virtue: value.virtue as VirtueId,
    variant: value.variant,
  };
}

function parseConfiguration(
  value: unknown,
  weapon: Weapon,
  catalogue: WeaponConfigurationMemoryCatalogue,
): { value: WeaponEnhancements; changed: boolean } | null {
  if (
    !isRecord(value) ||
    !isCraftworkTier(value.craftwork) ||
    !Array.isArray(value.totems) ||
    value.totems.length !== 4 ||
    !Array.isArray(value.tempers) ||
    !value.tempers.every(
      (temperId) => typeof temperId === "string" && temperId.length <= 120,
    ) ||
    (value.joineryId !== null && typeof value.joineryId !== "string")
  ) {
    return null;
  }

  const rune = value.rune === null ? null : parseRankedEnhancement(value.rune);
  if (rune === undefined) return null;
  const knownTotemIds = new Set(catalogue.totems.map((totem) => totem.id));
  const totems = value.totems.map((candidate) => {
    if (candidate === null) return null;
    const selection = parseTotemSelection(candidate);
    return selection && knownTotemIds.has(selection.itemId) ? selection : null;
  }) as WeaponEnhancements["totems"];

  const supplied: WeaponEnhancements = {
    rune,
    totems,
    craftwork: value.craftwork,
    tempers: [...value.tempers],
    joineryId: value.joineryId,
  };
  const normalized = normalizeWeaponEnhancements(
    supplied,
    weapon,
    new Map(catalogue.runes.map((item) => [item.id, item])),
    new Map(catalogue.tempers.map((item) => [item.id, item])),
    new Map(catalogue.joineries.map((item) => [item.id, item])),
  );
  return {
    value: normalized.value,
    changed:
      normalized.changed || JSON.stringify(supplied) !== JSON.stringify(value),
  };
}

export function createEmptyWeaponConfigurationMemory(): WeaponConfigurationMemory {
  return { schemaVersion: WEAPON_CONFIGURATION_MEMORY_SCHEMA_VERSION, configurations: {} };
}

export function parseWeaponConfigurationMemory(
  value: string | null,
  catalogue: WeaponConfigurationMemoryCatalogue,
): WeaponConfigurationMemoryResult {
  if (!value) {
    return {
      memory: createEmptyWeaponConfigurationMemory(),
      warnings: [],
      normalized: false,
    };
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== WEAPON_CONFIGURATION_MEMORY_SCHEMA_VERSION ||
      !isRecord(parsed.configurations)
    ) {
      return {
        memory: createEmptyWeaponConfigurationMemory(),
        warnings: ["Weapon configuration memory used an unsupported format and was discarded."],
        normalized: true,
      };
    }
    const weaponById = new Map(catalogue.weapons.map((weapon) => [weapon.id, weapon]));
    const warnings: string[] = [];
    const configurations = Object.fromEntries(
      Object.entries(parsed.configurations).flatMap(([weaponId, candidate]) => {
        const weapon = weaponById.get(weaponId);
        const parsedConfiguration = weapon
          ? parseConfiguration(candidate, weapon, catalogue)
          : null;
        if (!parsedConfiguration) {
          warnings.push(`Remembered configuration for "${weaponId}" was discarded.`);
          return [];
        }
        if (parsedConfiguration.changed) {
          warnings.push(`Remembered configuration for "${weaponId}" was adjusted.`);
        }
        return [[weaponId, parsedConfiguration.value]];
      }),
    );
    return {
      memory: { schemaVersion: WEAPON_CONFIGURATION_MEMORY_SCHEMA_VERSION, configurations },
      warnings,
      normalized: warnings.length > 0,
    };
  } catch {
    return {
      memory: createEmptyWeaponConfigurationMemory(),
      warnings: ["Weapon configuration memory was malformed and was discarded."],
      normalized: true,
    };
  }
}

export function loadWeaponConfigurationMemory(
  storage: WeaponConfigurationMemoryStorage,
  workspaceId: string,
  catalogue: WeaponConfigurationMemoryCatalogue,
): WeaponConfigurationMemoryResult {
  try {
    return parseWeaponConfigurationMemory(
      storage.getItem(workspaceStorageKey(workspaceId)),
      catalogue,
    );
  } catch {
    return {
      memory: createEmptyWeaponConfigurationMemory(),
      warnings: ["Weapon configuration memory could not be read."],
      normalized: false,
    };
  }
}

function saveWeaponConfigurationMemory(
  storage: WeaponConfigurationMemoryStorage,
  workspaceId: string,
  memory: WeaponConfigurationMemory,
): string | null {
  try {
    storage.setItem(workspaceStorageKey(workspaceId), JSON.stringify(memory));
    return null;
  } catch {
    return "Weapon configuration memory could not be updated.";
  }
}

export function rememberWeaponConfiguration(
  storage: WeaponConfigurationMemoryStorage,
  workspaceId: string,
  weaponId: string,
  configuration: WeaponEnhancements,
  catalogue: WeaponConfigurationMemoryCatalogue,
): WeaponConfigurationMemoryResult {
  const loaded = loadWeaponConfigurationMemory(storage, workspaceId, catalogue);
  const weapon = catalogue.weapons.find((candidate) => candidate.id === weaponId);
  const canonical = weapon
    ? parseConfiguration(configuration, weapon, catalogue)
    : null;
  if (!canonical) {
    return {
      memory: loaded.memory,
      warnings: [
        ...loaded.warnings,
        `Configuration for unknown weapon "${weaponId}" was not remembered.`,
      ],
      normalized: loaded.normalized,
    };
  }
  const memory = {
    schemaVersion: WEAPON_CONFIGURATION_MEMORY_SCHEMA_VERSION,
    configurations: {
      ...loaded.memory.configurations,
      [weaponId]: canonical.value,
    },
  } satisfies WeaponConfigurationMemory;
  const saveWarning = saveWeaponConfigurationMemory(storage, workspaceId, memory);
  return {
    memory,
    warnings: [
      ...loaded.warnings,
      ...(canonical.changed
        ? [`Configuration for "${weaponId}" was adjusted before being remembered.`]
        : []),
      ...(saveWarning ? [saveWarning] : []),
    ],
    normalized: loaded.normalized || canonical.changed,
  };
}

export function recallWeaponConfiguration(
  storage: WeaponConfigurationMemoryStorage,
  workspaceId: string,
  weaponId: string,
  catalogue: WeaponConfigurationMemoryCatalogue,
): { configuration: WeaponEnhancements | null; warnings: string[] } {
  const loaded = loadWeaponConfigurationMemory(storage, workspaceId, catalogue);
  const saveWarning = loaded.normalized
    ? saveWeaponConfigurationMemory(storage, workspaceId, loaded.memory)
    : null;
  return {
    configuration: loaded.memory.configurations[weaponId] ?? null,
    warnings: [
      ...loaded.warnings,
      ...(saveWarning ? [saveWarning] : []),
    ],
  };
}

export function clearRememberedWeaponConfiguration(
  storage: WeaponConfigurationMemoryStorage,
  workspaceId: string,
  weaponId: string,
  catalogue: WeaponConfigurationMemoryCatalogue,
): WeaponConfigurationMemoryResult {
  const loaded = loadWeaponConfigurationMemory(storage, workspaceId, catalogue);
  if (!(weaponId in loaded.memory.configurations)) return loaded;
  const configurations = { ...loaded.memory.configurations };
  delete configurations[weaponId];
  const memory = {
    schemaVersion: WEAPON_CONFIGURATION_MEMORY_SCHEMA_VERSION,
    configurations,
  } satisfies WeaponConfigurationMemory;
  const saveWarning = saveWeaponConfigurationMemory(storage, workspaceId, memory);
  return {
    memory,
    warnings: [
      ...loaded.warnings,
      ...(saveWarning ? [saveWarning] : []),
    ],
    normalized: loaded.normalized,
  };
}

/** Saved active Frame state is authoritative; memory is only a swap-time fallback. */
export function resolveWeaponConfiguration(
  saved: WeaponEnhancements | undefined,
  recalled: WeaponEnhancements | null,
): WeaponEnhancements {
  return saved ?? recalled ?? createEmptyWeaponEnhancements();
}
