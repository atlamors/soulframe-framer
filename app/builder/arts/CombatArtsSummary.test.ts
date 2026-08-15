import { describe, expect, it } from "vitest";
import { combatArtByName } from "@/src/data/arts";
import { releasedWeaponCatalogue } from "@/src/data/weapons";
import type { SoulframeBuild, Weapon } from "@/src/domain/types";
import {
  getCombatArtSummaryEntries,
  NO_COMBAT_ART_RANKS_LABEL,
} from "./CombatArtsSummary";

function emptyBuild(): SoulframeBuild {
  return {
    schemaVersion: 6,
    name: "Combat Art summary",
    virtues: { courage: 10, spirit: 10, grace: 10 },
    affinitySources: {
      envoyRank: 18,
      pactArts: { courage: 0, spirit: 0, grace: 0 },
      fables: { shewolf: null, wasteBear: null },
    },
    equipment: {},
    pact: { itemId: null, artAllocation: {} },
    combatArts: {},
    weaponEnhancements: {
      mainHand: { rune: null, totems: [null, null, null, null], craftwork: "Stock", tempers: [], joineryId: null },
      offHand: { rune: null, totems: [null, null, null, null], craftwork: "Stock", tempers: [], joineryId: null },
    },
  };
}

function findSharedArtWeapons(): [Weapon, Weapon] {
  const mainHand = releasedWeaponCatalogue.find(
    (weapon) =>
      weapon.slot === "mainHand" &&
      releasedWeaponCatalogue.some(
        (candidate) =>
          candidate.slot === "offHand" &&
          candidate.combatArt === weapon.combatArt,
      ),
  )!;
  const offHand = releasedWeaponCatalogue.find(
    (weapon) =>
      weapon.slot === "offHand" && weapon.combatArt === mainHand.combatArt,
  )!;
  return [mainHand, offHand];
}

describe("getCombatArtSummaryEntries", () => {
  it("deduplicates a shared equipped Art and selects its deterministic main-hand source", () => {
    const [mainHand, offHand] = findSharedArtWeapons();
    const build = emptyBuild();
    build.equipment = { mainHand: mainHand.id, offHand: offHand.id };

    expect(getCombatArtSummaryEntries(build)).toEqual([
      expect.objectContaining({
        name: mainHand.combatArt,
        pointsSpent: 0,
        allocatedRanks: [],
        sourceSlots: ["mainHand", "offHand"],
        openSlot: "mainHand",
      }),
    ]);
  });

  it("reports points and outcomes only for normalized allocated ranks", () => {
    const weapon = releasedWeaponCatalogue.find(
      (candidate) => candidate.slot === "mainHand",
    )!;
    const art = combatArtByName.get(weapon.combatArt)!;
    const rankedNode = art.nodes.find((node) => node.rankValues?.length)!;
    const build = emptyBuild();
    build.equipment.mainHand = weapon.id;
    build.combatArts[art.name] = {
      [rankedNode.id]: 2,
      invalid: 99,
    };

    const [entry] = getCombatArtSummaryEntries(build);
    expect(entry.pointsSpent).toBe(2);
    expect(entry.allocatedRanks).toEqual([
      {
        nodeId: rankedNode.id,
        name: rankedNode.name,
        rank: 2,
        maxRank: rankedNode.maxRank,
        outcome: expect.stringContaining(rankedNode.name),
      },
    ]);
  });

  it("keeps the exact empty-rank state and ignores unknown equipment", () => {
    const build = emptyBuild();
    build.equipment.mainHand = "not-source-verified";
    expect(getCombatArtSummaryEntries(build)).toEqual([]);
    expect(NO_COMBAT_ART_RANKS_LABEL).toBe("No ranks allocated");
  });
});
