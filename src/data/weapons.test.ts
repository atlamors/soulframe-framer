import { describe, expect, it } from "vitest";
import { weaponCatalogue } from "./weapons";

describe("Avakot weapon catalogue", () => {
  it("contains every indexed weapon with unique ids", () => {
    expect(weaponCatalogue).toHaveLength(59);
    expect(new Set(weaponCatalogue.map((item) => item.id)).size).toBe(
      weaponCatalogue.length,
    );
    expect(
      weaponCatalogue.filter((item) => item.slot === "mainHand"),
    ).toHaveLength(47);
    expect(
      weaponCatalogue.filter((item) => item.slot === "offHand"),
    ).toHaveLength(12);
  });

  it("normalizes requirements, attunement, damage, and Smite", () => {
    const farilwyd = weaponCatalogue.find(
      (item) => item.name === "Farilwyd",
    );

    expect(farilwyd).toMatchObject({
      dataStatus: "verified",
      slot: "mainHand",
      rarity: "Rare",
      combatArt: "Polearm",
      requirements: { courage: 12, spirit: 0, grace: 10 },
      attunement: { courage: 3, spirit: 0, grace: 2 },
      stats: {
        smite: {
          display: "1 in 20",
          numerator: 1,
          denominator: 20,
          percent: 5,
        },
        level0: { attack: 68, stagger: 52 },
      },
    });
  });

  it("retains indexed upcoming weapons with explicit data status", () => {
    const coiledDawn = weaponCatalogue.find(
      (item) => item.name === "Coiled Dawn",
    );
    expect(coiledDawn).toMatchObject({
      dataStatus: "partial",
      isUpcoming: true,
      stats: { level0: {}, level30: {} },
    });
  });

  it("contains usable image metadata and source pages", () => {
    for (const item of weaponCatalogue) {
      expect(item.pageUrl).toMatch(/^https:\/\/wiki\.avakot\.org\//);
      expect(item.imageUrl).toMatch(
        /^https:\/\/static\.wikitide\.net\/soulframewiki\//,
      );
      expect(item.thumbnailUrl).toMatch(
        /^https:\/\/static\.wikitide\.net\/soulframewiki\//,
      );
      expect(item.sha1).toMatch(/^[0-9a-f]{40}$/);
    }
  });
});
