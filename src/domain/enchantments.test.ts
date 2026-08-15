import { describe, expect, it } from "vitest";
import { runeById, runeCatalogue } from "../data/runes";
import { weaponById } from "../data/weapons";
import type { WeaponEnhancements } from "./types";
import {
  canEquipTotemInSlot,
  createEmptyWeaponEnhancements,
  getTotemSlotVirtue,
  normalizeWeaponEnhancements,
} from "./enchantments";

describe("weapon enhancement rules", () => {
  it("clears a Rune that does not match the weapon combat art", () => {
    const weapon = weaponById.get("weapon-farilwyd");
    const incompatibleRune = runeCatalogue.find(
      (rune) => rune.weaponArt !== weapon?.combatArt,
    );
    expect(weapon).toBeDefined();
    expect(incompatibleRune).toBeDefined();

    const result = normalizeWeaponEnhancements(
      {
        ...createEmptyWeaponEnhancements(),
        rune: { itemId: incompatibleRune!.id, rank: 3 },
      },
      weapon,
      runeById,
    );
    expect(result.value.rune).toBeNull();
    expect(result.changed).toBe(true);
  });

  it("requires a Rune for slot four and prevents duplicate Totems per weapon", () => {
    const selection = {
      itemId: "totem-armour-coat",
      rank: 3 as const,
      virtue: "courage" as const,
      variant: "universal" as const,
    };
    const result = normalizeWeaponEnhancements(
      {
        ...createEmptyWeaponEnhancements(),
        rune: null,
        totems: [selection, selection, null, selection],
      },
      weaponById.get("weapon-farilwyd"),
      runeById,
    );
    expect(result.value.totems).toEqual([selection, null, null, null]);
  });

  it("rejects a Totem already equipped in another slot", () => {
    const selection = {
      itemId: "totem-armour-coat",
      rank: 3 as const,
      virtue: "courage" as const,
      variant: "universal" as const,
    };
    const enhancements: WeaponEnhancements = {
      ...createEmptyWeaponEnhancements(),
      rune: null,
      totems: [selection, null, null, null],
    };

    expect(canEquipTotemInSlot(enhancements, selection.itemId, 1)).toBe(false);
    expect(canEquipTotemInSlot(enhancements, selection.itemId, 0)).toBe(true);
    expect(canEquipTotemInSlot(enhancements, "totem-different", 1)).toBe(true);
  });

  it("uses the three base Virtues and the Rune-provided fourth slot", () => {
    const rune = runeCatalogue.find((candidate) => candidate.addedSlot);
    expect(rune).toBeDefined();
    expect([0, 1, 2].map((index) => getTotemSlotVirtue(index, rune))).toEqual([
      "courage",
      "spirit",
      "grace",
    ]);
    expect(getTotemSlotVirtue(3)).toBeNull();
    expect(getTotemSlotVirtue(3, rune)).toBe(rune!.addedSlot);
  });
});
