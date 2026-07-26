import { describe, expect, it } from "vitest";
import { armorCatalogue } from "../data/catalogue";
import { talismanCatalogue } from "../data/talismans";
import {
  deserializeBuild,
  parseStoredBuild,
  serializeBuild,
} from "./serialization";
import type { SoulframeBuild } from "./types";

const build: SoulframeBuild = {
  schemaVersion: 2,
  name: "First Envoy",
  virtues: { courage: 12, spirit: 12, grace: 12 },
  equipment: {
    helm: "helm-arbearers-mask",
    talisman: "talisman-wyldings-hilt",
  },
};
const catalogue = { armor: armorCatalogue, talismans: talismanCatalogue };

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
      JSON.stringify({ ...build, schemaVersion: 3 }),
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
      warnings: ["Legacy build upgraded to include a Talisman slot."],
    });
  });
});
