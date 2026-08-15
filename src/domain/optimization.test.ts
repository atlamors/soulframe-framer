import { describe, expect, it } from "vitest";
import {
  optimizeAffinityForArmor,
  optimizeArmorForAffinity,
} from "./optimization";
import type {
  ArmorItem,
  ArmorSlot,
  SoulframeBuild,
  VirtueId,
  VirtueValues,
} from "./types";

const emptyVirtues = { courage: 0, spirit: 0, grace: 0 };

function armor(
  id: string,
  slot: ArmorSlot,
  base: number,
  pips: Partial<VirtueValues> = {},
  requirement?: { virtue: VirtueId; value: number },
): ArmorItem {
  return {
    id,
    name: id,
    slot,
    rarity: "Common",
    armorSet: "Test",
    requirement: requirement ?? null,
    defenses: {
      physicalDefense: {
        base,
        pips: { ...emptyVirtues, ...pips },
      },
      magickDefense: { base: 0, pips: emptyVirtues },
      stabilityIncrease: { base: 0, pips: emptyVirtues },
    },
    provenance: {
      status: "verified",
      sourceSheet: "test",
      sourceRow: 1,
    },
  };
}

function build(
  virtues: VirtueValues,
  equipment: SoulframeBuild["equipment"],
): SoulframeBuild {
  return {
    schemaVersion: 6,
    name: "Optimizer Test",
    virtues,
    affinitySources: {
      envoyRank: 0,
      pactArts: { courage: 0, spirit: 0, grace: 0 },
      fables: { shewolf: null, wasteBear: null },
    },
    equipment,
    pact: { itemId: null, artAllocation: {} },
    combatArts: {},
    weaponEnhancements: {
      mainHand: { rune: null, totems: [null, null, null, null], craftwork: "Stock", tempers: [], joineryId: null },
      offHand: { rune: null, totems: [null, null, null, null], craftwork: "Stock", tempers: [], joineryId: null },
    },
  };
}

describe("armor optimization", () => {
  it("exhaustively reallocates affinity for equipped armor requirements and scaling", () => {
    const catalogue = [
      armor(
        "courage-helm",
        "helm",
        10,
        { courage: 2 },
        { virtue: "courage", value: 10 },
      ),
    ];
    const current = build(
      { courage: 6, spirit: 5, grace: 5 },
      { helm: "courage-helm" },
    );

    const result = optimizeAffinityForArmor(current, catalogue);

    expect(result.recommendedBuild.virtues).toEqual({
      courage: 11,
      spirit: 1,
      grace: 4,
    });
    expect(result.currentMetRequirements).toBe(0);
    expect(result.recommendedMetRequirements).toBe(1);
    expect(result.recommendedCalculation.armorDefense).toBeGreaterThan(
      result.currentCalculation.armorDefense,
    );
  });

  it("normalizes an invalid optimizer baseline before recommending affinity", () => {
    const current = build(
      { courage: 16, spirit: 0, grace: 0 },
      { helm: "courage-helm" },
    );
    const result = optimizeAffinityForArmor(
      current,
      [armor("courage-helm", "helm", 10, { courage: 2 })],
    );

    expect(result.currentBuild.virtues).toEqual({
      courage: 14,
      spirit: 1,
      grace: 1,
    });
    expect(Object.values(result.recommendedBuild.virtues)).not.toContain(0);
  });

  it("does not move affinity when no armor is equipped", () => {
    const current = build({ courage: 6, spirit: 5, grace: 5 }, {});

    const result = optimizeAffinityForArmor(current, []);

    expect(result.changed).toBe(false);
    expect(result.recommendedBuild).toBe(current);
  });

  it("recommends the strongest compatible armor and preserves non-armor slots", () => {
    const catalogue = [
      armor("helm-current", "helm", 10),
      armor("helm-best", "helm", 20),
      armor("cuirass-compatible", "cuirass", 16),
      armor(
        "cuirass-incompatible",
        "cuirass",
        100,
        {},
        { virtue: "spirit", value: 20 },
      ),
      armor("leggings-only", "leggings", 12),
    ];
    const current = build(
      { courage: 16, spirit: 0, grace: 0 },
      {
        helm: "helm-current",
        cuirass: "cuirass-compatible",
        leggings: "leggings-only",
        talisman: "keep-talisman",
        mainHand: "keep-main-hand",
        offHand: "keep-off-hand",
      },
    );

    const result = optimizeArmorForAffinity(current, catalogue);

    expect(result.recommendedBuild.equipment).toMatchObject({
      helm: "helm-best",
      cuirass: "cuirass-compatible",
      leggings: "leggings-only",
      talisman: "keep-talisman",
      mainHand: "keep-main-hand",
      offHand: "keep-off-hand",
    });
    expect(result.recommendedBuild.equipment.cuirass).not.toBe(
      "cuirass-incompatible",
    );
    expect(result.changed).toBe(true);
    expect(result.recommendedCalculation.armorDefense).toBeGreaterThan(
      result.currentCalculation.armorDefense,
    );
  });
});
