import { describe, expect, it } from "vitest";
import { armorCatalogue } from "./catalogue";
import { armorImageById, armorImages } from "./armor-images";

describe("Avakot armor image manifest", () => {
  it("covers every catalogue item exactly once", () => {
    expect(armorImages).toHaveLength(armorCatalogue.length);
    expect(new Set(armorImages.map((image) => image.itemId)).size).toBe(
      armorImages.length,
    );
  });

  it("preserves the catalogue identity and slot", () => {
    for (const item of armorCatalogue) {
      const image = armorImageById.get(item.id);

      expect(image).toMatchObject({
        itemId: item.id,
        name: item.name,
        slot: item.slot,
      });
    }
  });

  it("contains usable original-image metadata", () => {
    for (const image of armorImages) {
      expect(image.imageUrl).toMatch(
        /^https:\/\/static\.wikitide\.net\/soulframewiki\//,
      );
      expect(image.descriptionUrl).toMatch(
        /^https:\/\/wiki\.avakot\.org\/File:/,
      );
      expect(image.mimeType).toMatch(/^image\//);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
      expect(image.bytes).toBeGreaterThan(0);
      expect(image.sha1).toMatch(/^[0-9a-f]{40}$/);
    }
  });
});
