import { describe, expect, it } from "vitest";
import type { ArtNodeDefinition } from "@/src/domain/types";
import { formatArtRankOutcome } from "./ArtAllocationList";

function artNode(
  overrides: Partial<ArtNodeDefinition> = {},
): ArtNodeDefinition {
  return {
    id: "test-art",
    name: "Smitten",
    description: "Increase Smite chance.",
    scope: "combat",
    kind: "combat",
    maxRank: 3,
    rankCosts: [1, 1, 1],
    rankValues: ["+1%", "+2%", "+3%"],
    mechanicStatus: "descriptive",
    ...overrides,
  };
}

describe("formatArtRankOutcome", () => {
  it("previews rank one at zero and formats the selected rank", () => {
    const node = artNode();

    expect(formatArtRankOutcome(node, 0)).toBe("Smitten (+1%)");
    expect(formatArtRankOutcome(node, 3)).toBe("Smitten (+3%)");
  });

  it("does not fall back when the selected rank has no source value", () => {
    const node = artNode({ maxRank: 4, rankValues: ["Known at rank one"] });

    expect(formatArtRankOutcome(node, 4)).toBeNull();
  });

  it("labels numeric Virtue values without inventing other units", () => {
    expect(
      formatArtRankOutcome(
        artNode({
          name: "Mora's Pride",
          scope: "pact",
          kind: "virtue",
          virtue: "courage",
          rankCosts: [1, 2, 3],
          rankValues: [1, 3, 6],
          mechanicStatus: "modeled",
        }),
        2,
      ),
    ).toBe("Mora's Pride (+3 Courage)");
    expect(
      formatArtRankOutcome(
        artNode({ name: "Rife Nocked", rankValues: [25, 30, 35] }),
        2,
      ),
    ).toBe("Rife Nocked (30)");
  });
});
