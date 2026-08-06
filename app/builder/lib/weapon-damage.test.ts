import { describe, expect, it } from "vitest";
import { weaponCatalogue } from "@/src/data/weapons";
import {
  getChargedWeaponStat,
  getWeaponDamage,
  getWeaponDamageRows,
} from "./weapon-damage";

const noVirtues = { courage: 0, spirit: 0, grace: 0 };

function getWeapon(name: string) {
  const weapon = weaponCatalogue.find((item) => item.name === name);
  if (!weapon) throw new Error(`Missing weapon test fixture: ${name}`);
  return weapon;
}

describe("Rank 30 weapon damage availability", () => {
  it("does not synthesize a charged attack when secondary data is absent", () => {
    expect(getChargedWeaponStat({ attack: 100 })).toEqual({
      key: "chargedAttack",
      label: "Charged Attack",
      value: undefined,
    });
  });

  it("uses the authorized Farilwyd fallback for missing rank 30 values", () => {
    const farilwyd = getWeapon("Farilwyd");

    expect(farilwyd.stats.level30).toEqual({});
    expect(
      getWeaponDamage(farilwyd, { courage: 12, spirit: 0, grace: 10 }),
    ).toEqual({
      requirementMet: true,
      primary: { base: 122, bonus: 31, total: 153 },
      secondary: {
        key: "chargedAttack",
        label: "Charged Attack",
        base: 190,
        bonus: 62,
        total: 252,
      },
      stagger: 112,
    });
    expect(
      getWeaponDamageRows(farilwyd, {
        courage: 12,
        spirit: 0,
        grace: 10,
      }),
    ).toEqual([
      { id: "attack", label: "Attack", bonus: 31, value: 153 },
      {
        id: "charged",
        label: "Charged Attack",
        bonus: 62,
        value: 252,
      },
      { id: "stagger", label: "Stagger", bonus: undefined, value: 112 },
      { id: "smite", label: "Smite", bonus: undefined, value: "1 in 20" },
    ]);
  });

  it("retains numeric zero bonuses for an equipped weapon", () => {
    const rows = getWeaponDamageRows(getWeapon("Precklies"), noVirtues);

    expect(rows[0]).toMatchObject({
      id: "attack",
      bonus: 0,
      value: 79,
    });
    expect(rows[1]).toMatchObject({
      id: "charged",
      label: "Charged Attack",
      bonus: 0,
      value: 156,
    });
  });

  it("keeps empty-slot damage and bonuses unavailable", () => {
    expect(getWeaponDamageRows()).toEqual([
      { id: "attack", label: "Attack", bonus: undefined, value: undefined },
      {
        id: "charged",
        label: "Charged Attack",
        bonus: undefined,
        value: undefined,
      },
      { id: "stagger", label: "Stagger", bonus: undefined, value: undefined },
      { id: "smite", label: "Smite", bonus: undefined, value: undefined },
    ]);
  });
});
