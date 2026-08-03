import { describe, expect, it } from "vitest";
import { getChargedWeaponStat } from "./weapon-damage";

describe("Rank 30 weapon damage availability", () => {
  it("does not synthesize a charged attack when secondary data is absent", () => {
    expect(getChargedWeaponStat({ attack: 100 })).toEqual({
      key: "chargedAttack",
      label: "Charged Attack",
      value: undefined,
    });
  });
});
