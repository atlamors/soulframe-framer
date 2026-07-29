import { describe, expect, it } from "vitest";
import { pactAbilityCatalogue, pactCatalogue } from "./pacts";
import { runeCatalogue } from "./runes";
import { totemCatalogue } from "./totems";

describe("generated Pact, Rune, and Totem catalogues", () => {
  it("contains the released Avakot Pact catalogue", () => {
    expect(pactCatalogue).toHaveLength(12);
    expect(pactAbilityCatalogue).toHaveLength(45);
    expect(pactCatalogue.some((pact) => pact.name === "Vadagar")).toBe(false);
    expect(new Set(pactCatalogue.map((pact) => pact.id)).size).toBe(12);
  });

  it("contains all current runes with weapon-art compatibility", () => {
    expect(runeCatalogue).toHaveLength(16);
    expect(runeCatalogue.every((rune) => rune.weaponArt)).toBe(true);
    expect(runeCatalogue.every((rune) => rune.stats.length > 0)).toBe(true);
  });

  it("preserves unknown grip-specific Totem values", () => {
    expect(totemCatalogue).toHaveLength(26);
    expect(totemCatalogue.some((totem) => totem.hasUnknownGripValues)).toBe(true);
    expect(
      totemCatalogue.some((totem) =>
        totem.gripRankValues.flat().includes(null),
      ),
    ).toBe(true);
  });
});
