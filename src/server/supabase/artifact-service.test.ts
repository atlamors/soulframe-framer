import { describe, expect, it, vi } from "vitest";
import { BUILD_SCHEMA_VERSION } from "../../domain/serialization";
import { ArtifactDataError, mapArtifact } from "./artifact-service";

vi.mock("server-only", () => ({}));

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

const STORED_ROW = {
  id: "artifact-1",
  owner_id: "owner-1",
  game_id: "soulframe",
  name: "Stored Frame",
  schema_version: 5,
  payload: STORED_V5_PAYLOAD,
  created_at: "2026-08-13T00:00:00.000Z",
  updated_at: "2026-08-13T00:00:00.000Z",
};

describe("Supabase artifact row mapping", () => {
  it("canonicalizes a stored schema-v5 Frame to the current schema", () => {
    const artifact = mapArtifact(STORED_ROW);

    expect(artifact.schemaVersion).toBe(BUILD_SCHEMA_VERSION);
    expect(artifact.payload).toMatchObject({
      schemaVersion: BUILD_SCHEMA_VERSION,
      weaponEnhancements: {
        mainHand: { craftwork: "Stock", tempers: [], joineryId: null },
        offHand: { craftwork: "Stock", tempers: [], joineryId: null },
      },
    });
  });

  it("rejects a row whose schema column and payload disagree", () => {
    expect(() =>
      mapArtifact({
        ...STORED_ROW,
        payload: { ...STORED_V5_PAYLOAD, schemaVersion: BUILD_SCHEMA_VERSION },
      }),
    ).toThrow(ArtifactDataError);
  });
});
