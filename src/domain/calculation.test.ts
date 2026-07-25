import { describe, expect, it } from "vitest";
import { armorCatalogue } from "../data/catalogue";
import {
  calculateBuild,
  calculateDefense,
  calculateItemContribution,
} from "./calculation";
import type { SoulframeBuild } from "./types";

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
      schemaVersion: 1,
      name: "Test",
      virtues: { courage: 12, spirit: 12, grace: 12 },
      equipment: {
        helm: "helm-arbearers-mask",
        cuirass: "cuirass-arbearers-pauncher",
        leggings: "leggings-arbearers-braes",
      },
    };
    const result = calculateBuild(build, armorCatalogue);
    expect(result.items).toHaveLength(3);
    expect(result.total).toBe(
      result.defenses.physicalDefense +
        result.defenses.magickDefense +
        result.defenses.stabilityIncrease,
    );
    expect(result.warnings).toEqual([]);
  });

  it("reports unknown item ids without crashing", () => {
    const build: SoulframeBuild = {
      schemaVersion: 1,
      name: "Unknown",
      virtues: { courage: 12, spirit: 12, grace: 12 },
      equipment: { helm: "helm-does-not-exist" },
    };
    expect(calculateBuild(build, armorCatalogue).warnings).toEqual([
      "Unknown item id: helm-does-not-exist",
    ]);
  });
});
