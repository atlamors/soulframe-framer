import { describe, expect, it } from "vitest";
import {
  COMBAT_ART_SOURCE_REVISION,
  PACT_ART_COST_MODEL,
  PACT_ART_SOURCE_REVISION,
  combatArtByName,
  pactArtTrees,
  pactArtTreeByPactId,
} from "../data/arts";
import {
  createDefaultPactArtAllocation,
  getAllocatedCombatArtEffects,
  getArtPointsSpent,
  getPactArtVirtueBonuses,
  normalizeActiveCombatArtAllocations,
  normalizeCombatArtAllocation,
  normalizePactArtAllocation,
} from "./arts";

describe("Arts definitions and allocation rules", () => {
  it("locks the curated source revisions", () => {
    expect(PACT_ART_SOURCE_REVISION).toMatchObject({
      revisionId: 46500,
      timestamp: "2026-06-28T17:50:33Z",
    });
    expect(COMBAT_ART_SOURCE_REVISION).toMatchObject({
      revisionId: 48121,
      timestamp: "2026-07-23T21:54:28Z",
    });
    expect(PACT_ART_COST_MODEL).toMatchObject({
      status: "product-modeled",
      marginalCosts: [1, 2, 3, 4],
    });
  });

  it("gives every exact Pact tree a 60-point full maximum", () => {
    for (const tree of pactArtTrees) {
      const allMax = Object.fromEntries(
        tree.nodes.map((node) => [node.id, node.maxRank]),
      );
      for (const node of tree.nodes) {
        expect(node.rankCosts, `${tree.pactId} · ${node.id}`).toEqual(
          PACT_ART_COST_MODEL.marginalCosts.slice(0, node.maxRank),
        );
      }
      expect(getArtPointsSpent(tree.nodes, allMax), tree.pactId).toBe(60);
    }
  });

  it("keeps standard defaults empty and makes exactly 30 points spendable", () => {
    const standardTrees = pactArtTrees.filter(
      (tree) => !tree.pactId.startsWith("pact-wyld-"),
    );

    for (const tree of standardTrees) {
      const pact = { id: tree.pactId, variant: "normal" as const };
      expect(createDefaultPactArtAllocation(pact), tree.pactId).toEqual({});

      const allMax = Object.fromEntries(
        tree.nodes.map((node) => [node.id, node.maxRank]),
      );
      expect(
        normalizePactArtAllocation(pact, allMax).pointsSpent,
        tree.pactId,
      ).toBe(30);
    }
  });

  it(
    "fully allocates every Wyld exact-ID tree to 60 with no rank left to increase",
    () => {
      const wyldTrees = pactArtTrees.filter((tree) =>
        tree.pactId.startsWith("pact-wyld-"),
      );

      for (const tree of wyldTrees) {
        const pact = { id: tree.pactId, variant: "wyld" as const };
        const allocation = createDefaultPactArtAllocation(pact);

        expect(
          tree.nodes.every((node) => allocation[node.id] === node.maxRank),
          tree.pactId,
        ).toBe(true);
        expect(getArtPointsSpent(tree.nodes, allocation), tree.pactId).toBe(60);
      }
    },
  );

  it("normalizes Pact allocations by exact node id, rank, and Pact point cap", () => {
    const pact = { id: "pact-duelo", variant: "normal" as const };
    const nodes = pactArtTreeByPactId.get(pact.id)!.nodes;
    const requested = Object.fromEntries(
      nodes.map((node) => [node.id, node.maxRank]),
    );
    requested.unknown = 99;

    const normalized = normalizePactArtAllocation(pact, requested);
    expect(normalized.pointsSpent).toBe(30);
    expect(normalized.changed).toBe(true);
    expect(normalized.value).not.toHaveProperty("unknown");
  });

  it("derives Pact Virtue bonuses from active allocation ranks", () => {
    expect(
      getPactArtVirtueBonuses("pact-orengall", {
        "pact-art-courage": 2,
        "pact-art-spirit": 1,
      }),
    ).toEqual({ courage: 3, spirit: 1, grace: 0 });
  });

  it("bounds Combat Art ranks without imposing a global point cap", () => {
    const smitten = combatArtByName
      .get("Flyblade")!
      .nodes.find((node) => node.name === "Smitten")!;
    const normalized = normalizeCombatArtAllocation("Flyblade", {
      [smitten.id]: 99,
      unknown: 3,
    });

    expect(normalized.value).toEqual({ [smitten.id]: 3 });
    expect(normalized.pointsSpent).toBe(3);
    expect(normalized.changed).toBe(true);
  });

  it("keeps one exact-name config for a shared equipped Combat Art", () => {
    const normalized = normalizeActiveCombatArtAllocations(
      { Bow: {}, Magick: {}, Unknown: { node: 1 } },
      ["Bow", "Bow", "Magick"],
    );

    expect(normalized.value).toEqual({ Bow: {}, Magick: {} });
    expect(normalized.changed).toBe(true);
  });

  it("surfaces allocated conditional Combat Arts descriptively", () => {
    const art = combatArtByName.get("Long Blade")!;
    const momentum = art.nodes.find((node) => node.name === "Momentum")!;
    expect(
      getAllocatedCombatArtEffects("Long Blade", { [momentum.id]: 1 }),
    ).toEqual([
      expect.objectContaining({
        id: momentum.id,
        source: "Long Blade · Combat Art",
        mechanicStatus: "descriptive",
      }),
    ]);
  });
});
