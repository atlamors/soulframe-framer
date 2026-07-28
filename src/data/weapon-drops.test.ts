import { describe, expect, it } from "vitest";
import generatedWeaponDrops from "./weapon-drops.generated.json";
import { weaponDropById } from "./weapon-drops";
import { weaponCatalogue } from "./weapons";

describe("Avakot weapon drop sources", () => {
  it("covers every weapon, including weapons without recorded drops", () => {
    expect(generatedWeaponDrops.items).toHaveLength(weaponCatalogue.length);
    expect(
      new Set(generatedWeaponDrops.items.map((item) => item.itemId)).size,
    ).toBe(weaponCatalogue.length);
    expect(generatedWeaponDrops.coverage).toMatchObject({
      catalogueItems: 59,
      itemsWithDropSources: 49,
      itemsWithoutDropSources: 10,
      totalSourceRows: 363,
    });
  });

  it("provides linked, normalized source rows", () => {
    for (const item of generatedWeaponDrops.items) {
      expect(weaponDropById.get(item.itemId)?.sources).toEqual(item.sources);

      for (const source of item.sources) {
        expect(source.sourceName).not.toBe("");
        expect(source.sourceUrl).toMatch(/^https:\/\/wiki\.avakot\.org\//);
        expect(source.quantity).not.toBe("");
      }
    }
  });

  it("maps a known weapon source", () => {
    expect(weaponDropById.get("weapon-precklies")?.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceName: "Fore-Feller Hewyl",
        }),
      ]),
    );
  });
});
