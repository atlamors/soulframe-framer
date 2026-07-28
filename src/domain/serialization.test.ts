import { describe, expect, it } from "vitest";
import { armorCatalogue } from "../data/catalogue";
import { talismanCatalogue } from "../data/talismans";
import { weaponCatalogue } from "../data/weapons";
import {
  deserializeBuild,
  parseStoredBuild,
  serializeBuild,
} from "./serialization";
import type { SoulframeBuild } from "./types";

const build: SoulframeBuild = {
  schemaVersion: 3,
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
};
const catalogue = {
  armor: armorCatalogue,
  talismans: talismanCatalogue,
  weapons: weaponCatalogue,
};

describe("build serialization", () => {
  it("round trips a build", () => {
    expect(deserializeBuild(serializeBuild(build), catalogue)).toEqual({
      ok: true,
      build,
      warnings: [],
    });
  });

  it("rejects malformed data", () => {
    expect(deserializeBuild("not-valid-data", catalogue).ok).toBe(false);
  });

  it("rejects unsupported schema versions", () => {
    const unsupported = Buffer.from(
      JSON.stringify({ ...build, schemaVersion: 4 }),
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
      build: {
        ...build,
        equipment: { helm: "helm-arbearers-mask" },
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
      build: {
        ...build,
        virtues: { courage: 15, spirit: 10, grace: 9 },
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

  it("normalizes a version 3 allocation to base points plus Envoy Rank", () => {
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
      build,
      warnings: [
        "Envoy Rank was capped at the current maximum of 18.",
        "Virtue allocation was normalized to its 16 base points plus Envoy Rank.",
      ],
    });
  });
});
