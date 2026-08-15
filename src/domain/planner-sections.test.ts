import { describe, expect, it } from "vitest";
import { pactCatalogue } from "../data/pacts";
import { releasedWeaponCatalogue, weaponById } from "../data/weapons";
import type { SoulframeBuild } from "./types";
import {
  updatePlannerAffinitySources,
  updatePlannerCombatArt,
  updatePlannerPact,
  updatePlannerVirtues,
  updatePlannerWeapon,
} from "./planner-sections";

function plannerBuild(): SoulframeBuild {
  const mainHand = releasedWeaponCatalogue.find(
    (item) => item.slot === "mainHand",
  )!;
  const offHand = releasedWeaponCatalogue.find(
    (item) => item.slot === "offHand" && item.combatArt !== mainHand.combatArt,
  )!;
  return {
    schemaVersion: 6,
    name: "Planner sections",
    virtues: { courage: 10, spirit: 10, grace: 10 },
    affinitySources: {
      envoyRank: 18,
      pactArts: { courage: 0, spirit: 0, grace: 0 },
      fables: { shewolf: null, wasteBear: null },
    },
    equipment: { mainHand: mainHand.id, offHand: offHand.id },
    pact: { itemId: null, artAllocation: {} },
    combatArts: { [mainHand.combatArt]: {}, [offHand.combatArt]: { retained: 1 } },
    weaponEnhancements: {
      mainHand: { rune: null, totems: [null, null, null, null], craftwork: "Stock", tempers: [], joineryId: null },
      offHand: { rune: null, totems: [null, null, null, null], craftwork: "Stock", tempers: [], joineryId: null },
    },
  };
}

describe("planner section updates", () => {
  it("equips and unequips a weapon without changing unrelated fields", () => {
    const build = plannerBuild();
    const offHandId = build.equipment.offHand!;
    const offHandArt = weaponById.get(offHandId)!.combatArt;
    const weapon = releasedWeaponCatalogue.find(
      (item) => item.slot === "mainHand" && item.combatArt !== offHandArt,
    )!;
    const equipped = updatePlannerWeapon(build, "mainHand", weapon.id);
    expect(equipped).not.toBe(build);
    expect(equipped.equipment.mainHand).toBe(weapon.id);
    expect(equipped.pact).toBe(build.pact);
    const unequipped = updatePlannerWeapon(equipped, "mainHand", undefined);
    expect(unequipped.equipment.mainHand).toBeUndefined();
    expect(unequipped.weaponEnhancements.mainHand).toEqual({ rune: null, totems: [null, null, null, null], craftwork: "Stock", tempers: [], joineryId: null });
    expect(unequipped.combatArts[weapon.combatArt]).toBeUndefined();
    expect(unequipped.combatArts[offHandArt]).toEqual(
      equipped.combatArts[offHandArt],
    );
    expect(Object.keys(unequipped.combatArts)).toEqual([offHandArt]);
  });

  it("rejects allocations for inactive combat Arts", () => {
    const build = plannerBuild();
    expect(updatePlannerCombatArt(build, "not active", { node: 3 })).toBe(build);
  });

  it("derives Pact affinity from the normalized Pact allocation", () => {
    const pact = pactCatalogue[0]!;
    const next = updatePlannerPact(plannerBuild(), pact.id, { invalid: 99 });
    expect(next.pact.itemId).toBe(pact.id);
    expect(next.pact.artAllocation).not.toHaveProperty("invalid");
    expect(next.affinitySources.pactArts).toEqual({ courage: 0, spirit: 0, grace: 0 });
  });

  it("preserves derived Pact Arts when affinity sources change", () => {
    const build = plannerBuild();
    const next = updatePlannerAffinitySources(build, {
      ...build.affinitySources,
      envoyRank: build.affinitySources.envoyRank + 1,
      pactArts: { courage: 3, spirit: 3, grace: 3 },
    });
    expect(next.affinitySources.pactArts).toEqual(build.affinitySources.pactArts);
    expect(Object.values(next.virtues).reduce((sum, value) => sum + value, 0)).toBeGreaterThanOrEqual(
      Object.values(build.virtues).reduce((sum, value) => sum + value, 0),
    );
  });

  it("normalizes direct Virtue updates against the active source pool", () => {
    const next = updatePlannerVirtues(plannerBuild(), {
      courage: 36,
      spirit: 0,
      grace: 0,
    });
    expect(next.virtues).toEqual({ courage: 32, spirit: 1, grace: 1 });
  });
});
