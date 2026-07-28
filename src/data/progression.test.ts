import { describe, expect, it } from "vitest";
import { MAX_ENVOY_RANK } from "../domain/affinity";
import generatedProgression from "./progression.generated.json";
import { progression, progressionSource } from "./progression";

describe("Avakot progression data", () => {
  it("maps the current maximum Mastery to a selectable Envoy Rank", () => {
    expect(progression).toEqual({
      maximumMastery: 18.8,
      maximumEnvoyRank: 18,
      asOf: "Preludes 15",
      scope: "Paragon Founders",
    });
    expect(MAX_ENVOY_RANK).toBe(progression.maximumEnvoyRank);
  });

  it("retains source revision metadata", () => {
    expect(progressionSource).toMatchObject({
      publisher: "Avakot",
      pageUrl: "https://wiki.avakot.org/Mastery",
      revisionId: 47350,
    });
    expect(generatedProgression.schemaVersion).toBe(1);
  });
});
