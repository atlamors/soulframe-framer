import { describe, expect, it } from "vitest";
import { armorCatalogue } from "../data/catalogue";
import { talismanCatalogue } from "../data/talismans";
import { weaponCatalogue } from "../data/weapons";
import { pactCatalogue } from "../data/pacts";
import { runeCatalogue } from "../data/runes";
import { totemCatalogue } from "../data/totems";
import { combatArtCatalogue } from "../data/arts";
import {
  deserializeBuild,
  parseStoredBuild,
  serializeBuild,
} from "./serialization";
import type { SoulframeBuild } from "./types";

const build: SoulframeBuild = {
  schemaVersion: 5,
  name: "First Envoy",
  virtues: { courage: 12, spirit: 11, grace: 11 },
  affinitySources: {
    envoyRank: 18,
    pactArts: { courage: 0, spirit: 0, grace: 0 },
    fables: { shewolf: null, wasteBear: null },
  },
  equipment: {
    helm: "helm-arbearers-mask",
    talisman: "talisman-wyldings-hilt",
    mainHand: "weapon-farilwyd",
    offHand: "weapon-precklies",
  },
  pact: { itemId: "pact-orengall", artAllocation: {} },
  combatArts: Object.fromEntries(
    ["weapon-farilwyd", "weapon-precklies"].flatMap((itemId) => {
      const artName = weaponCatalogue.find((weapon) => weapon.id === itemId)?.combatArt;
      return artName && artName !== "Unreleased" ? [[artName, {}]] : [];
    }),
  ),
  weaponEnhancements: {
    mainHand: { rune: null, totems: [null, null, null, null] },
    offHand: { rune: null, totems: [null, null, null, null] },
  },
};
const catalogue = {
  armor: armorCatalogue,
  talismans: talismanCatalogue,
  weapons: weaponCatalogue,
  pacts: pactCatalogue,
  runes: runeCatalogue,
  totems: totemCatalogue,
};
const mainWeapon = weaponCatalogue.find(
  (weapon) => weapon.id === build.equipment.mainHand,
)!;
const compatibleRune = runeCatalogue.find(
  (rune) => rune.weaponArt === mainWeapon.combatArt,
)!;

describe("build serialization", () => {
  it("round trips a build", () => {
    expect(deserializeBuild(serializeBuild(build), catalogue)).toEqual({
      ok: true,
      sourceSchemaVersion: 5,
      build,
      warnings: [],
    });
  });

  it("shares Combat Art configs for equipped Arts only", () => {
    const inactiveArt = combatArtCatalogue.find(
      (art) => !(art.name in build.combatArts),
    );
    expect(inactiveArt).toBeDefined();
    const result = deserializeBuild(
      serializeBuild({
        ...build,
        combatArts: {
          ...build.combatArts,
          [inactiveArt!.name]: {
            [inactiveArt!.nodes[0].id]: 1,
          },
        },
      }),
      catalogue,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.build.combatArts).toEqual(build.combatArts);
      expect(result.warnings).toEqual([]);
    }
  });

  it("rejects malformed data", () => {
    expect(deserializeBuild("not-valid-data", catalogue).ok).toBe(false);
  });

  it("rejects unsupported schema versions", () => {
    const unsupported = Buffer.from(
      JSON.stringify({ ...build, schemaVersion: 6 }),
    ).toString("base64url");
    expect(deserializeBuild(unsupported, catalogue)).toEqual({
      ok: false,
      error: "This build uses an unsupported schema version.",
    });
  });

  it("ignores unknown item ids with a warning", () => {
    const encoded = Buffer.from(
      JSON.stringify({
        ...build,
        equipment: { helm: "helm-not-real" },
        combatArts: {},
      }),
    ).toString("base64url");
    const result = deserializeBuild(encoded, catalogue);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.build.equipment).toEqual({});
      expect(result.warnings).toHaveLength(1);
    }
  });

  it("rejects malformed local storage data", () => {
    expect(parseStoredBuild("{", catalogue)).toEqual({
      ok: false,
      error: "Saved build data is malformed.",
    });
  });

  it("migrates version 1 builds without a Talisman", () => {
    const legacy = Buffer.from(
      JSON.stringify({
        ...build,
        schemaVersion: 1,
        equipment: { helm: "helm-arbearers-mask" },
      }),
    ).toString("base64url");
    const result = deserializeBuild(legacy, catalogue);

    expect(result).toEqual({
      ok: true,
      sourceSchemaVersion: 1,
      build: {
        ...build,
        equipment: { helm: "helm-arbearers-mask" },
        pact: { itemId: null, artAllocation: {} },
        combatArts: {},
      },
      warnings: [
        "Legacy build upgraded to include a Talisman slot and affinity sources.",
      ],
    });
  });

  it("migrates version 2 builds by inferring Envoy Rank from their pool", () => {
    const legacy = Buffer.from(
      JSON.stringify({
        schemaVersion: 2,
        name: build.name,
        virtues: { courage: 15, spirit: 10, grace: 9 },
        equipment: build.equipment,
      }),
    ).toString("base64url");
    const result = deserializeBuild(legacy, catalogue);

    expect(result).toEqual({
      ok: true,
      sourceSchemaVersion: 2,
      build: {
        ...build,
        virtues: { courage: 15, spirit: 10, grace: 9 },
        pact: { itemId: null, artAllocation: {} },
        affinitySources: {
          envoyRank: 18,
          pactArts: { courage: 0, spirit: 0, grace: 0 },
          fables: { shewolf: null, wasteBear: null },
        },
      },
      warnings: [
        "Saved build upgraded with affinity sources inferred from its Virtue pool.",
      ],
    });
  });

  it("migrates version 3 builds with empty Pact and enhancement state", () => {
    const legacy = Buffer.from(
      JSON.stringify({
        schemaVersion: 3,
        name: build.name,
        virtues: build.virtues,
        affinitySources: build.affinitySources,
        equipment: build.equipment,
      }),
    ).toString("base64url");
    const result = deserializeBuild(legacy, catalogue);

    expect(result).toEqual({
      ok: true,
      sourceSchemaVersion: 3,
      build: {
        ...build,
        pact: { itemId: null, artAllocation: {} },
        weaponEnhancements: {
          mainHand: { rune: null, totems: [null, null, null, null] },
          offHand: { rune: null, totems: [null, null, null, null] },
        },
      },
      warnings: [
        "Saved build upgraded with Pact, Rune, and Totem configuration.",
      ],
    });
  });

  it("migrates version 4 builds with direct Art defaults", () => {
    const legacyEnhancements: SoulframeBuild["weaponEnhancements"] = {
      ...build.weaponEnhancements,
      mainHand: {
        ...build.weaponEnhancements.mainHand,
        rune: { itemId: compatibleRune.id, rank: 2 },
      },
    };
    const legacy = Buffer.from(
      JSON.stringify({
        schemaVersion: 4,
        name: build.name,
        virtues: build.virtues,
        affinitySources: build.affinitySources,
        equipment: build.equipment,
        pact: { itemId: "pact-orengall", rank: 30 },
        weaponEnhancements: legacyEnhancements,
      }),
    ).toString("base64url");
    const result = deserializeBuild(legacy, catalogue);

    expect(result).toEqual({
      ok: true,
      sourceSchemaVersion: 4,
      build: { ...build, weaponEnhancements: legacyEnhancements },
      warnings: [
        "Saved build upgraded with direct Pact and Combat Art configuration.",
      ],
    });
  });

  it("translates nonzero version 4 Pact Art ranks to exact active-Pact node ids", () => {
    const legacyAffinitySources = {
      ...build.affinitySources,
      pactArts: { courage: 2 as const, spirit: 1 as const, grace: 0 as const },
    };
    const legacy = Buffer.from(
      JSON.stringify({
        schemaVersion: 4,
        name: build.name,
        virtues: build.virtues,
        affinitySources: legacyAffinitySources,
        equipment: build.equipment,
        pact: { itemId: "pact-orengall", rank: 30 },
        weaponEnhancements: build.weaponEnhancements,
      }),
    ).toString("base64url");

    expect(deserializeBuild(legacy, catalogue)).toEqual({
      ok: true,
      sourceSchemaVersion: 4,
      build: {
        ...build,
        affinitySources: legacyAffinitySources,
        pact: {
          itemId: "pact-orengall",
          artAllocation: {
            "pact-art-courage": 2,
            "pact-art-spirit": 1,
          },
        },
      },
      warnings: [
        "Saved build upgraded with direct Pact and Combat Art configuration.",
      ],
    });
  });

  it("preserves and warns about version 4 Pact Art bonuses without an exact Pact", () => {
    const legacyAffinitySources = {
      ...build.affinitySources,
      pactArts: { courage: 1 as const, spirit: 0 as const, grace: 0 as const },
    };
    const legacy = Buffer.from(
      JSON.stringify({
        schemaVersion: 4,
        name: build.name,
        virtues: build.virtues,
        affinitySources: legacyAffinitySources,
        equipment: build.equipment,
        pact: { itemId: null, rank: 30 },
        weaponEnhancements: build.weaponEnhancements,
      }),
    ).toString("base64url");

    expect(deserializeBuild(legacy, catalogue)).toEqual({
      ok: true,
      sourceSchemaVersion: 4,
      build: {
        ...build,
        affinitySources: legacyAffinitySources,
        pact: { itemId: null, artAllocation: {} },
      },
      warnings: [
        "Saved build upgraded with direct Pact and Combat Art configuration.",
        "Legacy Pact Art Virtue bonuses were preserved but could not be attached to an exact Pact.",
      ],
    });
  });

  it.each([3, 4] as const)(
    "keeps version %s compatibility-only Pact Art bonuses through a v5 round trip",
    (schemaVersion) => {
      const legacyPactArts = {
        courage: 2 as const,
        spirit: 1 as const,
        grace: 0 as const,
      };
      const legacy = Buffer.from(
        JSON.stringify({
          schemaVersion,
          name: build.name,
          virtues: build.virtues,
          affinitySources: {
            ...build.affinitySources,
            pactArts: legacyPactArts,
          },
          equipment: build.equipment,
          ...(schemaVersion === 4
            ? {
                pact: { itemId: null, rank: 30 },
                weaponEnhancements: build.weaponEnhancements,
              }
            : {}),
        }),
      ).toString("base64url");
      const migrated = deserializeBuild(legacy, catalogue);

      expect(migrated.ok).toBe(true);
      if (!migrated.ok) return;
      expect(migrated.build.pact).toEqual({
        itemId: null,
        artAllocation: {},
      });
      expect(migrated.build.affinitySources.pactArts).toEqual(legacyPactArts);

      const persisted = deserializeBuild(
        serializeBuild(migrated.build),
        catalogue,
      );
      expect(persisted).toEqual({
        ok: true,
        sourceSchemaVersion: 5,
        build: migrated.build,
        warnings: [],
      });
    },
  );

  it("normalizes a version 5 allocation to base points plus Envoy Rank", () => {
    const encoded = Buffer.from(
      JSON.stringify({
        ...build,
        virtues: { courage: 10, spirit: 10, grace: 10 },
        affinitySources: { ...build.affinitySources, envoyRank: 18 },
      }),
    ).toString("base64url");
    const result = deserializeBuild(encoded, catalogue);

    expect(result).toEqual({
      ok: true,
      sourceSchemaVersion: 5,
      build: {
        ...build,
        virtues: { courage: 12, spirit: 11, grace: 11 },
      },
      warnings: [
        "Virtue allocation was normalized to its 16 base points plus Envoy Rank.",
      ],
    });
  });

  it("caps builds saved before the current Envoy Rank maximum", () => {
    const encoded = Buffer.from(
      JSON.stringify({
        ...build,
        virtues: { courage: 12, spirit: 12, grace: 12 },
        affinitySources: { ...build.affinitySources, envoyRank: 20 },
      }),
    ).toString("base64url");
    const result = deserializeBuild(encoded, catalogue);

    expect(result).toEqual({
      ok: true,
      sourceSchemaVersion: 5,
      build,
      warnings: [
        "Envoy Rank was capped at the current maximum of 18.",
        "Virtue allocation was normalized to its 16 base points plus Envoy Rank.",
      ],
    });
  });
});
