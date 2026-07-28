import { describe, expect, it } from "vitest";
import generatedRequirements from "./armor-requirements.generated.json";
import { armorCatalogue } from "./catalogue";

describe("Avakot armor requirements", () => {
  it("covers every catalogue item exactly once", () => {
    expect(generatedRequirements.items).toHaveLength(armorCatalogue.length);
    expect(
      new Set(generatedRequirements.items.map((item) => item.itemId)).size,
    ).toBe(armorCatalogue.length);
    expect(generatedRequirements.coverage).toMatchObject({
      catalogueItems: 72,
      matchedItems: 72,
      itemsWithRequirement: 49,
      itemsWithoutRequirement: 23,
      missingItems: [],
    });
  });

  it("contains only supported virtue thresholds", () => {
    for (const item of generatedRequirements.items) {
      if (!item.requirement) continue;

      expect(["courage", "spirit", "grace"]).toContain(
        item.requirement.virtue,
      );
      expect(item.requirement.value).toBeGreaterThan(0);
    }
  });

  it("is merged into the runtime catalogue", () => {
    for (const item of generatedRequirements.items) {
      expect(
        armorCatalogue.find((catalogueItem) => catalogueItem.id === item.itemId),
      ).toMatchObject({
        requirement: item.requirement,
        rarity: item.rarity,
        armorSet: item.armorSet,
      });
    }
  });
});
