import { describe, expect, it } from "vitest";
import generatedArmorDrops from "./armor-drops.generated.json";
import { armorCatalogue } from "./catalogue";
import { armorDropById } from "./armor-drops";

describe("Avakot armor drop sources", () => {
  it("covers every armor item, including items without recorded drops", () => {
    expect(generatedArmorDrops.items).toHaveLength(armorCatalogue.length);
    expect(
      new Set(generatedArmorDrops.items.map((item) => item.itemId)).size,
    ).toBe(armorCatalogue.length);
    expect(generatedArmorDrops.coverage).toMatchObject({
      catalogueItems: 72,
      itemsWithDropSources: 42,
      itemsWithoutDropSources: 30,
      totalSourceRows: 73,
    });
  });

  it("provides linked, normalized source rows", () => {
    for (const item of generatedArmorDrops.items) {
      expect(armorDropById.get(item.itemId)?.sources).toEqual(item.sources);

      for (const source of item.sources) {
        expect(source.sourceName).not.toBe("");
        expect(source.sourceUrl).toMatch(/^https:\/\/wiki\.avakot\.org\//);
        expect(source.quantity).not.toBe("");
      }
    }
  });

  it("maps known fragment sources", () => {
    expect(armorDropById.get("helm-arbearers-mask")?.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceName: "Vadagar Bear",
          fragment: true,
        }),
      ]),
    );
  });
});
