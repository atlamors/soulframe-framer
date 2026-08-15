import { describe, expect, it } from "vitest";
import generatedTempers from "./tempers.generated.json";
import { temperCatalogue } from "./tempers";

describe("Avakot Temper catalogue", () => {
  it("contains the approved 36 canonical Tempers and 46 ordered stat rows", () => {
    expect(temperCatalogue).toHaveLength(36);
    expect(new Set(temperCatalogue.map((temper) => temper.id)).size).toBe(36);
    expect(temperCatalogue.reduce((count, temper) => count + temper.stats.length, 0)).toBe(46);
    expect(temperCatalogue.every((temper) => temper.id === temper.name)).toBe(true);
  });

  it("preserves source-backed stacks, images, provenance, and the known placeholder", () => {
    expect(Object.keys(generatedTempers.source).sort()).toEqual([
      "apiUrl",
      "attributionUrl",
      "contentLicense",
      "moduleUrl",
      "name",
      "publisher",
      "revisionId",
      "revisionTimestamp",
    ]);
    expect("source" in generatedTempers.source).toBe(false);
    const placeholder = temperCatalogue.find((temper) => temper.isPlaceholder);
    expect(placeholder?.name).toBe("PH AspectCassidParryStaggerName");
    for (const temper of temperCatalogue) {
      expect(temper.icon.sha1).toMatch(/^[0-9a-f]{40}$/);
      expect(temper.provenance.pageRevisionId).toBeGreaterThan(0);
      for (const stat of temper.stats) {
        expect(stat.ranksRaw).toBe(`${stat.stacks.single}/${stat.stacks.double}`);
        expect(stat.effectId).not.toBe("");
      }
    }
  });
});
