import { describe, expect, it } from "vitest";
import { talismanCatalogue } from "./talismans";

describe("Avakot Talisman catalogue", () => {
  it("contains a unique canonical id for every indexed Talisman", () => {
    expect(talismanCatalogue).toHaveLength(23);
    expect(new Set(talismanCatalogue.map((item) => item.id)).size).toBe(
      talismanCatalogue.length,
    );
  });

  it("contains normalized modifier values", () => {
    const periapt = talismanCatalogue.find(
      (item) => item.name === "Paragon Periapt",
    );
    expect(periapt?.stats).toMatchObject({
      virtues: { courage: 3, spirit: 3, grace: 3 },
      defenses: {
        physicalDefense: 0,
        magickDefense: 0,
        stabilityIncrease: 0,
      },
      attack: 0,
      stagger: 0,
    });
  });

  it("contains usable image metadata and source pages", () => {
    for (const item of talismanCatalogue) {
      expect(item.pageUrl).toMatch(/^https:\/\/wiki\.avakot\.org\//);
      expect(item.imageUrl).toMatch(
        /^https:\/\/static\.wikitide\.net\/soulframewiki\//,
      );
      expect(item.thumbnailUrl).toMatch(
        /^https:\/\/static\.wikitide\.net\/soulframewiki\/thumb\//,
      );
      expect(item.thumbnailWidth).toBe(128);
      expect(item.sha1).toMatch(/^[0-9a-f]{40}$/);
    }
  });
});
