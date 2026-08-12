import { describe, expect, it } from "vitest";
import type { SoulframeBuild } from "./types";
import {
  isArmorTalismanSlot,
  updateArmorTalismanEquipment,
} from "./armor-talisman-equipment";

function equipmentBuild(): SoulframeBuild {
  return {
    schemaVersion: 5,
    name: "Equipment isolation",
    virtues: { courage: 21, spirit: 18, grace: 15 },
    affinitySources: {
      envoyRank: 4,
      pactArts: { courage: 2, spirit: 1, grace: 3 },
      fables: { shewolf: "courage", wasteBear: "grace" },
    },
    equipment: {
      helm: "helm-original",
      cuirass: "cuirass-original",
      leggings: "leggings-original",
      talisman: "talisman-original",
      mainHand: "main-hand-original",
      offHand: "off-hand-original",
    },
    pact: { itemId: "pact-original", artAllocation: { root: 2 } },
    combatArts: { "main-hand-original": { strike: 3 } },
    weaponEnhancements: {
      mainHand: {
        rune: { itemId: "rune-main", rank: 2 },
        totems: [null, null, null, null],
      },
      offHand: {
        rune: null,
        totems: [null, null, null, null],
      },
    },
  };
}

describe("armor and Talisman equipment helpers", () => {
  it("equips only the selected armor slot without mutation", () => {
    const build = equipmentBuild();
    const before = structuredClone(build);
    const next = updateArmorTalismanEquipment(build, "helm", "helm-next");

    expect(build).toEqual(before);
    expect(next).not.toBe(build);
    expect(next.equipment).not.toBe(build.equipment);
    expect(next.equipment).toEqual({
      ...build.equipment,
      helm: "helm-next",
    });
    expect(next.equipment.cuirass).toBe("cuirass-original");
    expect(next.equipment.leggings).toBe("leggings-original");
    expect(next.equipment.talisman).toBe("talisman-original");
    expect(next.equipment.mainHand).toBe("main-hand-original");
    expect(next.equipment.offHand).toBe("off-hand-original");
    expect(next.virtues).toBe(build.virtues);
    expect(next.affinitySources).toBe(build.affinitySources);
    expect(next.pact).toBe(build.pact);
    expect(next.combatArts).toBe(build.combatArts);
    expect(next.weaponEnhancements).toBe(build.weaponEnhancements);
  });

  it("unequips only the selected Talisman without mutation", () => {
    const build = equipmentBuild();
    const before = structuredClone(build);
    const next = updateArmorTalismanEquipment(build, "talisman", undefined);

    expect(build).toEqual(before);
    expect(next).not.toBe(build);
    expect(next.equipment).not.toBe(build.equipment);
    expect(next.equipment).toEqual({
      helm: "helm-original",
      cuirass: "cuirass-original",
      leggings: "leggings-original",
      mainHand: "main-hand-original",
      offHand: "off-hand-original",
    });
    expect(next.virtues).toBe(build.virtues);
    expect(next.affinitySources).toBe(build.affinitySources);
    expect(next.pact).toBe(build.pact);
    expect(next.combatArts).toBe(build.combatArts);
    expect(next.weaponEnhancements).toBe(build.weaponEnhancements);
  });

  it("recognizes only armor and Talisman picker slots", () => {
    expect(isArmorTalismanSlot("helm")).toBe(true);
    expect(isArmorTalismanSlot("cuirass")).toBe(true);
    expect(isArmorTalismanSlot("leggings")).toBe(true);
    expect(isArmorTalismanSlot("talisman")).toBe(true);
    expect(isArmorTalismanSlot("mainHand")).toBe(false);
    expect(isArmorTalismanSlot("offHand")).toBe(false);
    expect(isArmorTalismanSlot(undefined)).toBe(false);
  });
});
