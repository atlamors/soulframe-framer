import { describe, expect, it } from "vitest";
import { BUILD_SCHEMA_VERSION } from "../serialization";
import {
  BuildPlannerArtifactCodecError,
  SOULFRAME_BUILD_PLANNER_ARTIFACT_CODEC,
} from "./soulframe-codec";

const STORED_V5_PAYLOAD = {
  schemaVersion: 5,
  name: "Stored Frame",
  virtues: { courage: 12, spirit: 11, grace: 11 },
  affinitySources: {
    envoyRank: 18,
    pactArts: { courage: 0, spirit: 0, grace: 0 },
    fables: { shewolf: null, wasteBear: null },
  },
  equipment: {},
  pact: { itemId: null, artAllocation: {} },
  combatArts: {},
  weaponEnhancements: {
    mainHand: { rune: null, totems: [null, null, null, null] },
    offHand: { rune: null, totems: [null, null, null, null] },
  },
};

describe("Soulframe artifact codec", () => {
  it("canonicalizes stored schema-v5 Frames to the current schema", () => {
    expect(
      SOULFRAME_BUILD_PLANNER_ARTIFACT_CODEC.canonicalize(STORED_V5_PAYLOAD),
    ).toMatchObject({
      schemaVersion: BUILD_SCHEMA_VERSION,
      weaponEnhancements: {
        mainHand: { craftwork: "Stock", tempers: [], joineryId: null },
        offHand: { craftwork: "Stock", tempers: [], joineryId: null },
      },
    });
  });

  it("does not widen stored artifact acceptance to older legacy schemas", () => {
    expect(() =>
      SOULFRAME_BUILD_PLANNER_ARTIFACT_CODEC.canonicalize({
        ...STORED_V5_PAYLOAD,
        schemaVersion: 4,
      }),
    ).toThrow(BuildPlannerArtifactCodecError);
  });
});
