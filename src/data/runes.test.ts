import { describe, expect, it } from "vitest";
import { getRuneDisplayName } from "./runes";

describe("getRuneDisplayName", () => {
  it("removes a trailing weapon-art qualifier from the displayed name", () => {
    expect(
      getRuneDisplayName({
        name: "Everflame (Heavy)",
        weaponArt: "Heavy",
      }),
    ).toBe("Everflame");
  });

  it("preserves names without a matching weapon-art qualifier", () => {
    expect(
      getRuneDisplayName({
        name: "Emberaught",
        weaponArt: "Short Blade",
      }),
    ).toBe("Emberaught");
  });
});
