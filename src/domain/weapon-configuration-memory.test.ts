import { describe, expect, it } from "vitest";
import { joineryCatalogue } from "../data/joineries";
import { runeCatalogue } from "../data/runes";
import { temperCatalogue } from "../data/tempers";
import { totemCatalogue } from "../data/totems";
import { releasedWeaponCatalogue } from "../data/weapons";
import { createEmptyWeaponEnhancements } from "./enchantments";
import type { WeaponEnhancements } from "./types";
import { isTemperCompatible } from "./weapon-configuration";
import * as memoryModule from "./weapon-configuration-memory";
import {
  clearRememberedWeaponConfiguration,
  createCloudWeaponConfigurationWorkspaceKey,
  createResilientWeaponConfigurationMemoryStorage,
  getOrCreateLocalWeaponConfigurationWorkspaceKey,
  loadWeaponConfigurationMemory,
  recallWeaponConfiguration,
  rememberWeaponConfiguration,
  replaceLocalWeaponConfigurationWorkspaceKey,
  resolveWeaponConfiguration,
  type WeaponConfigurationMemoryStorage,
} from "./weapon-configuration-memory";

class MemoryStorage implements WeaponConfigurationMemoryStorage {
  readonly values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
}

class FlakyMemoryStorage extends MemoryStorage {
  failWrites = false;
  override setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("storage unavailable");
    super.setItem(key, value);
  }
}

const catalogue = {
  weapons: releasedWeaponCatalogue,
  runes: runeCatalogue,
  totems: totemCatalogue,
  tempers: temperCatalogue,
  joineries: joineryCatalogue,
};
const weapon = releasedWeaponCatalogue.find(
  (candidate) => candidate.id === "weapon-avex",
)!;
const compatibleTempers = temperCatalogue.filter((temper) =>
  isTemperCompatible(temper, weapon),
);

describe("workspace-scoped weapon configuration memory", () => {
  it("keeps one stable local identity, isolates cloud artifacts, and rotates explicit handoffs", () => {
    const storage = new MemoryStorage();
    let generated = 0;
    const firstLocal = getOrCreateLocalWeaponConfigurationWorkspaceKey(
      storage,
      () => `local-${++generated}`,
    );
    const sameLocal = getOrCreateLocalWeaponConfigurationWorkspaceKey(
      storage,
      () => `local-${++generated}`,
    );
    const cloud = createCloudWeaponConfigurationWorkspaceKey("artifact-1");
    const configuration = createEmptyWeaponEnhancements("Military");

    rememberWeaponConfiguration(
      storage,
      firstLocal,
      weapon.id,
      configuration,
      catalogue,
    );
    rememberWeaponConfiguration(
      storage,
      cloud,
      weapon.id,
      createEmptyWeaponEnhancements("Legendary"),
      catalogue,
    );
    const freshLocal = replaceLocalWeaponConfigurationWorkspaceKey(
      storage,
      () => `local-${++generated}`,
    );

    expect(firstLocal).toBe("local:local-1");
    expect(sameLocal).toBe(firstLocal);
    expect(generated).toBe(2);
    expect(freshLocal).toBe("local:local-2");
    expect(
      recallWeaponConfiguration(storage, cloud, weapon.id, catalogue)
        .configuration?.craftwork,
    ).toBe("Legendary");
    expect(
      recallWeaponConfiguration(storage, freshLocal, weapon.id, catalogue)
        .configuration,
    ).toBeNull();
  });

  it("isolates exact-weapon configurations between caller-supplied workspaces", () => {
    const storage = new MemoryStorage();
    const configuration: WeaponEnhancements = {
      ...createEmptyWeaponEnhancements("Military"),
      tempers: [compatibleTempers[0].id],
    };
    rememberWeaponConfiguration(storage, "frame-a", weapon.id, configuration, catalogue);

    expect(
      recallWeaponConfiguration(storage, "frame-a", weapon.id, catalogue)
        .configuration,
    ).toEqual(configuration);
    expect(
      recallWeaponConfiguration(storage, "frame-b", weapon.id, catalogue)
        .configuration,
    ).toBeNull();
  });

  it("recalls failed durable writes from the mounted-session fallback", () => {
    const durableStorage = new FlakyMemoryStorage();
    const storage = createResilientWeaponConfigurationMemoryStorage(
      durableStorage,
    );
    durableStorage.failWrites = true;
    const configuration = createEmptyWeaponEnhancements("Military");

    const remembered = rememberWeaponConfiguration(
      storage,
      "frame-a",
      weapon.id,
      configuration,
      catalogue,
    );

    expect(remembered.warnings).toContain(
      "Weapon configuration memory could not be updated.",
    );
    expect(
      recallWeaponConfiguration(storage, "frame-a", weapon.id, catalogue)
        .configuration,
    ).toEqual(configuration);

    durableStorage.failWrites = false;
    const recovered = rememberWeaponConfiguration(
      storage,
      "frame-a",
      weapon.id,
      createEmptyWeaponEnhancements("Legendary"),
      catalogue,
    );
    expect(recovered.warnings).not.toContain(
      "Weapon configuration memory could not be updated.",
    );
    expect(
      recallWeaponConfiguration(storage, "frame-a", weapon.id, catalogue)
        .configuration?.craftwork,
    ).toBe("Legendary");
  });

  it("canonicalizes before every write and exposes no raw writer bypass", () => {
    const storage = new MemoryStorage();
    const invalid: WeaponEnhancements = {
      ...createEmptyWeaponEnhancements("Stock"),
      tempers: [compatibleTempers[0].id, compatibleTempers[1].id],
      joineryId: "not-real",
    };
    const result = rememberWeaponConfiguration(
      storage,
      "frame-a",
      weapon.id,
      invalid,
      catalogue,
    );
    expect(result.warnings).toEqual([
      `Configuration for "${weapon.id}" was adjusted before being remembered.`,
    ]);
    expect(result.memory.configurations[weapon.id]).toMatchObject({
      tempers: [compatibleTempers[0].id],
      joineryId: null,
    });
    expect(memoryModule).not.toHaveProperty("saveWeaponConfigurationMemory");
  });

  it("discards malformed recalled entries with a recovery warning", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "soulframe-framer.weapon-configurations.v1:frame-a",
      JSON.stringify({
        schemaVersion: 1,
        configurations: { [weapon.id]: { craftwork: "Impossible" } },
      }),
    );
    const loaded = loadWeaponConfigurationMemory(storage, "frame-a", catalogue);
    expect(loaded.memory.configurations).toEqual({});
    expect(loaded.warnings).toEqual([
      `Remembered configuration for "${weapon.id}" was discarded.`,
    ]);
  });

  it("normalizes stale recall once and persists the recovered configuration", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "soulframe-framer.weapon-configurations.v1:frame-a",
      JSON.stringify({
        schemaVersion: 1,
        configurations: {
          [weapon.id]: {
            ...createEmptyWeaponEnhancements("Stock"),
            tempers: [compatibleTempers[0].id, compatibleTempers[1].id],
            joineryId: "not-real",
          },
        },
      }),
    );

    const recovered = recallWeaponConfiguration(
      storage,
      "frame-a",
      weapon.id,
      catalogue,
    );
    const recalledAgain = recallWeaponConfiguration(
      storage,
      "frame-a",
      weapon.id,
      catalogue,
    );

    expect(recovered.configuration).toMatchObject({
      tempers: [compatibleTempers[0].id],
      joineryId: null,
    });
    expect(recovered.warnings).toEqual([
      `Remembered configuration for "${weapon.id}" was adjusted.`,
    ]);
    expect(recalledAgain.warnings).toEqual([]);
  });

  it("clears only the requested exact-weapon configuration", () => {
    const storage = new MemoryStorage();
    rememberWeaponConfiguration(
      storage,
      "frame-a",
      weapon.id,
      createEmptyWeaponEnhancements("Military"),
      catalogue,
    );

    const cleared = clearRememberedWeaponConfiguration(
      storage,
      "frame-a",
      weapon.id,
      catalogue,
    );

    expect(cleared.memory.configurations).toEqual({});
    expect(
      recallWeaponConfiguration(storage, "frame-a", weapon.id, catalogue)
        .configuration,
    ).toBeNull();
  });

  it("keeps explicit saved active state authoritative over recalled memory", () => {
    const saved = createEmptyWeaponEnhancements("Legendary");
    const recalled = createEmptyWeaponEnhancements("Military");
    expect(resolveWeaponConfiguration(saved, recalled)).toBe(saved);
    expect(resolveWeaponConfiguration(undefined, recalled)).toBe(recalled);
  });
});
