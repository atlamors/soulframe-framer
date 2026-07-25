import { describe, expect, it } from "vitest";
import { armorCatalogue } from "../data/catalogue";
import {
  deserializeBuild,
  parseStoredBuild,
  serializeBuild,
} from "./serialization";
import type { SoulframeBuild } from "./types";

const build: SoulframeBuild = {
  schemaVersion: 1,
  name: "First Envoy",
  virtues: { courage: 12, spirit: 12, grace: 12 },
  equipment: { helm: "helm-arbearers-mask" },
};

describe("build serialization", () => {
  it("round trips a build", () => {
    expect(deserializeBuild(serializeBuild(build), armorCatalogue)).toEqual({
      ok: true,
      build,
      warnings: [],
    });
  });

  it("rejects malformed data", () => {
    expect(deserializeBuild("not-valid-data", armorCatalogue).ok).toBe(false);
  });

  it("rejects unsupported schema versions", () => {
    const unsupported = Buffer.from(
      JSON.stringify({ ...build, schemaVersion: 2 }),
    ).toString("base64url");
    expect(deserializeBuild(unsupported, armorCatalogue)).toEqual({
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
    const result = deserializeBuild(encoded, armorCatalogue);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.build.equipment).toEqual({});
      expect(result.warnings).toHaveLength(1);
    }
  });

  it("rejects malformed local storage data", () => {
    expect(parseStoredBuild("{", armorCatalogue)).toEqual({
      ok: false,
      error: "Saved build data is malformed.",
    });
  });
});
