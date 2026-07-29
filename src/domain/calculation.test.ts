import { describe, expect, it } from "vitest";
import { armorCatalogue } from "../data/catalogue";
import { talismanCatalogue } from "../data/talismans";
import {
  calculateBuild,
  calculateDefense,
  calculateItemContribution,
} from "./calculation";
import type { SoulframeBuild } from "./types";

const affinitySources: SoulframeBuild["affinitySources"] = {
  envoyRank: 20,
  pactArts: { courage: 0, spirit: 0, grace: 0 },
  fables: { shewolf: null, wasteBear: null },
};
const additionalBuildSystems = {
  pact: { itemId: null, rank: 30 },
  weaponEnhancements: {
    mainHand: { rune: null, totems: [null, null, null, null] },
    offHand: { rune: null, totems: [null, null, null, null] },
  },
} satisfies Pick<SoulframeBuild, "pact" | "weaponEnhancements">;

describe("armor calculations", () => {
  it("matches the workbook formula for an individual defense", () => {
    expect(
      calculateDefense(
        4,
        { courage: 3, spirit: 0, grace: 0 },
        { courage: 28, spirit: 4, grace: 4 },
      ),
    ).toEqual({ base: 4, scaling: 10, total: 14 });
  });

  it("matches the Arbearer's Mask courage scenario", () => {
    const item = armorCatalogue.find((entry) => entry.id === "helm-arbearers-mask");
    expect(item).toBeDefined();
    expect(
      calculateItemContribution(item!, { courage: 28, spirit: 4, grace: 4 }),
    ).toMatchObject({
      requirementMet: true,
      defenses: {
        physicalDefense: { total: 14 },
        magickDefense: { total: 4 },
        stabilityIncrease: { total: 8 },
      },
      total: 26,
    });
  });

  it("aggregates multiple equipped pieces", () => {
    const build: SoulframeBuild = {
      schemaVersion: 4,
      ...additionalBuildSystems,
      name: "Test",
      virtues: { courage: 19, spirit: 12, grace: 12 },
      affinitySources,
      equipment: {
        helm: "helm-arbearers-mask",
        cuirass: "cuirass-arbearers-pauncher",
        leggings: "leggings-arbearers-braes",
      },
    };
    const result = calculateBuild(build, armorCatalogue, talismanCatalogue);
    expect(result.items).toHaveLength(3);
    expect(result.total).toBe(
      result.defenses.physicalDefense +
        result.defenses.magickDefense +
        result.defenses.stabilityIncrease,
    );
    expect(result.warnings).toEqual([]);
  });

  it("applies base defenses but suppresses scaling when a requirement is unmet", () => {
    const item = armorCatalogue.find((entry) => entry.id === "helm-arbearers-mask");
    expect(item).toBeDefined();

    expect(
      calculateItemContribution(item!, { courage: 12, spirit: 12, grace: 12 }),
    ).toMatchObject({
      requirementMet: false,
      defenses: {
        physicalDefense: { base: 4, scaling: 0, total: 4 },
        magickDefense: { base: 1, scaling: 0, total: 1 },
        stabilityIncrease: { base: 2, scaling: 0, total: 2 },
      },
      total: 7,
    });
  });

  it("reports equipped armor with unmet requirements", () => {
    const build: SoulframeBuild = {
      schemaVersion: 4,
      ...additionalBuildSystems,
      name: "Unmet",
      virtues: { courage: 12, spirit: 12, grace: 12 },
      affinitySources,
      equipment: { helm: "helm-arbearers-mask" },
    };

    expect(calculateBuild(build, armorCatalogue).warnings).toEqual([
      "Arbearer's Mask needs 19 courage; attunement scaling is inactive.",
    ]);
  });

  it("reports unknown item ids without crashing", () => {
    const build: SoulframeBuild = {
      schemaVersion: 4,
      ...additionalBuildSystems,
      name: "Unknown",
      virtues: { courage: 12, spirit: 12, grace: 12 },
      affinitySources,
      equipment: { helm: "helm-does-not-exist" },
    };
    expect(calculateBuild(build, armorCatalogue).warnings).toEqual([
      "Unknown item id: helm-does-not-exist",
    ]);
  });

  it("applies Talisman virtue bonuses before armor requirements and scaling", () => {
    const build: SoulframeBuild = {
      schemaVersion: 4,
      ...additionalBuildSystems,
      name: "Talisman virtues",
      virtues: { courage: 18, spirit: 12, grace: 12 },
      affinitySources,
      equipment: {
        helm: "helm-arbearers-mask",
        talisman: "talisman-wyldings-hilt",
      },
    };

    const result = calculateBuild(build, armorCatalogue, talismanCatalogue);

    expect(result.effectiveVirtues).toEqual({
      courage: 21,
      spirit: 12,
      grace: 12,
    });
    expect(result.items[0].requirementMet).toBe(true);
    expect(result.talisman?.virtues.courage).toBe(3);
  });

  it("adds flat Talisman defense and exposes raw combat modifiers", () => {
    const build: SoulframeBuild = {
      schemaVersion: 4,
      ...additionalBuildSystems,
      name: "Talisman defense",
      virtues: { courage: 12, spirit: 12, grace: 12 },
      affinitySources,
      equipment: {
        talisman: "talisman-the-cogah-lorcaan",
      },
    };

    const result = calculateBuild(build, armorCatalogue, talismanCatalogue);

    expect(result.defenses.physicalDefense).toBe(2);
    expect(result.talismanDefense).toBe(2);
    expect(result.modifiers.attack).toBe(10);
    expect(result.warnings).toContain(
      "The Cogah Lorcaan has an encounter-dependent effect that is not included in calculated totals.",
    );
  });

  it("applies Pact Art and Fable bonuses without changing the allocatable pool", () => {
    const build: SoulframeBuild = {
      schemaVersion: 4,
      ...additionalBuildSystems,
      name: "Fixed affinity sources",
      virtues: { courage: 18, spirit: 9, grace: 9 },
      affinitySources: {
        envoyRank: 20,
        pactArts: { courage: 2, spirit: 1, grace: 0 },
        fables: { shewolf: "courage", wasteBear: "grace" },
      },
      equipment: {},
    };

    const result = calculateBuild(build, armorCatalogue, talismanCatalogue);

    expect(result.allocatedVirtues).toEqual({
      courage: 18,
      spirit: 9,
      grace: 9,
    });
    expect(result.sourceVirtues).toEqual({
      courage: 4,
      spirit: 1,
      grace: 1,
    });
    expect(result.effectiveVirtues).toEqual({
      courage: 22,
      spirit: 10,
      grace: 10,
    });
  });
});
