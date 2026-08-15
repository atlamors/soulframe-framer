import { describe, expect, it } from "vitest";
import generatedJoineries from "./joineries.generated.json";
import { joineryCatalogue } from "./joineries";

describe("Avakot Joinery catalogue", () => {
  it("contains the approved 30 active exact-name variants", () => {
    expect(joineryCatalogue).toHaveLength(30);
    expect(new Set(joineryCatalogue.map((joinery) => joinery.id)).size).toBe(30);
    expect(joineryCatalogue.every((joinery) => joinery.id === joinery.name)).toBe(true);
  });
  it("preserves parent inheritance and archive boundary", () => {
    expect(generatedJoineries.parents).toEqual(["Feybalt", "Gildaur", "Quicksilver", "Verite"]);
    expect(generatedJoineries.archives).toHaveLength(5);
    expect(joineryCatalogue.find((joinery) => joinery.family === "Gildaur")?.compatibility).toEqual({ scope: "all" });
    expect(joineryCatalogue.every((joinery) => joinery.icon.sha1)).toBe(true);
  });
});
