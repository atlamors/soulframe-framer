import { describe, expect, it } from "vitest";
import { joineryCatalogue } from "@/src/data/joineries";
import { weaponCatalogue } from "@/src/data/weapons";
import type { VirtueId, Weapon } from "@/src/domain/types";
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

function getJoinery(virtue: VirtueId, attunementPips = 1) {
  const joinery = joineryCatalogue.find(
    (item) =>
      item.virtue === virtue &&
      item.attunementPips === attunementPips &&
      item.compatibility.scope === "all",
  );
  if (!joinery) throw new Error(`Missing ${virtue} Joinery fixture`);
  return joinery;
}

function withDamageRules(
  item: Weapon,
  overrides: {
    attunement?: Weapon["attunement"];
    requirements?: Weapon["requirements"];
    level30?: Weapon["stats"]["level30"];
    damageCaps?: Weapon["stats"]["damageCaps"];
  },
): Weapon {
  return {
    ...item,
    attunement: overrides.attunement ?? item.attunement,
    requirements: overrides.requirements ?? item.requirements,
    stats: {
      ...item.stats,
      level30: overrides.level30 ?? item.stats.level30,
      damageCaps: overrides.damageCaps ?? item.stats.damageCaps,
    },
  };
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
      staggerBonus: undefined,
      smite: { bonus: undefined, percent: 5, display: "1 in 20" },
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

  it("preserves Seathorn low and mid no-Joinery rounding", () => {
    const seathorn = getWeapon("Seathorn");

    expect(
      getWeaponDamage(seathorn, {
        courage: 20,
        spirit: 18,
        grace: 7,
      }),
    ).toMatchObject({
      requirementMet: true,
      primary: { bonus: 36 },
      secondary: { key: "fullChargedCast", bonus: 36 },
    });
    expect(
      getWeaponDamage(seathorn, {
        courage: 20,
        spirit: 19,
        grace: 7,
      }),
    ).toMatchObject({
      requirementMet: true,
      primary: { bonus: 38 },
      secondary: { key: "fullChargedCast", bonus: 38 },
    });
  });

  it("applies bounded natural Grace without letting Joinery create it", () => {
    const precklies = getWeapon("Precklies");
    const graceJoinery = getJoinery("grace");
    const virtues = { courage: 0, spirit: 0, grace: 10 };
    const weapon = (grace: number) =>
      withDamageRules(precklies, {
        attunement: { courage: 0, spirit: 0, grace },
        requirements: noVirtues,
        level30: { attack: 100 },
        damageCaps: { lightAttack: 1000 },
      });

    expect(
      getWeaponDamage(weapon(0), virtues, graceJoinery).primary.bonus,
    ).toBe(5);
    expect(
      getWeaponDamage(weapon(4), virtues, graceJoinery).primary.bonus,
    ).toBe(25);
    expect(getWeaponDamage(weapon(4), virtues).primary.bonus).toBe(23);
    expect(getWeaponDamage(weapon(5), virtues).primary.bonus).toBe(25);
  });

  it("adds Joinery to only its virtue and caps effective pips at five", () => {
    const weapon = withDamageRules(getWeapon("Precklies"), {
      attunement: { courage: 4, spirit: 1, grace: 0 },
      requirements: noVirtues,
      level30: { attack: 100 },
      damageCaps: { lightAttack: 1000 },
    });
    const courageJoinery = getJoinery("courage", 3);

    expect(
      getWeaponDamage(weapon, { courage: 10, spirit: 2, grace: 0 }).primary
        .bonus,
    ).toBe(21);
    expect(
      getWeaponDamage(
        weapon,
        { courage: 10, spirit: 2, grace: 0 },
        courageJoinery,
      ).primary.bonus,
    ).toBe(26);
  });

  it("gates all attunement bonuses on native requirements", () => {
    const weapon = withDamageRules(getWeapon("Precklies"), {
      requirements: { courage: 99, spirit: 0, grace: 0 },
    });
    const damage = getWeaponDamage(
      weapon,
      { courage: 98, spirit: 99, grace: 99 },
      getJoinery("grace"),
    );

    expect(damage.requirementMet).toBe(false);
    expect(damage.primary.bonus).toBe(0);
    expect(damage.secondary.bonus).toBe(0);
  });

  it("caps primary and secondary components against exact catalogue totals", () => {
    const highVirtues = { courage: 999, spirit: 999, grace: 999 };
    const precklies = getWeapon("Precklies");
    const avex = getWeapon("Avex");
    const seathorn = getWeapon("Seathorn");

    expect(getWeaponDamage(precklies, highVirtues)).toMatchObject({
      primary: { base: 79, bonus: 31, total: 110 },
      secondary: { key: "chargedAttack", base: 156, bonus: 108, total: 264 },
    });
    expect(getWeaponDamage(avex, highVirtues)).toMatchObject({
      primary: { base: 93, bonus: 68, total: 161 },
      secondary: { key: "chargedShot", base: 161, bonus: 168, total: 329 },
    });
    expect(getWeaponDamage(seathorn, highVirtues)).toMatchObject({
      primary: { base: 92, bonus: 66, total: 158 },
      secondary: {
        key: "fullChargedCast",
        base: 246,
        bonus: 297,
        total: 543,
      },
    });
  });

  it("uses only Farilwyd's authorized level-zero cap fallback", () => {
    expect(
      getWeaponDamage(getWeapon("Farilwyd"), {
        courage: 999,
        spirit: 999,
        grace: 999,
      }),
    ).toMatchObject({
      primary: { base: 122, bonus: 102, total: 224 },
      secondary: {
        key: "chargedAttack",
        base: 190,
        bonus: 204,
        total: 394,
      },
    });
  });

  it("preserves exact throw and perfect-throw total caps", () => {
    const source = getWeapon("Precklies");
    const highVirtues = { courage: 999, spirit: 999, grace: 999 };
    const secondaryWeapon = (
      key: "throw" | "perfectThrow",
      totalCap: number,
    ) =>
      withDamageRules(source, {
        attunement: { courage: 1, spirit: 0, grace: 0 },
        requirements: noVirtues,
        level30: { attack: 100, [key]: 150 },
        damageCaps: { lightAttack: 200, [key]: totalCap },
      });

    expect(
      getWeaponDamage(secondaryWeapon("throw", 180), highVirtues).secondary,
    ).toMatchObject({ key: "throw", bonus: 30, total: 180 });
    expect(
      getWeaponDamage(secondaryWeapon("perfectThrow", 190), highVirtues)
        .secondary,
    ).toMatchObject({ key: "perfectThrow", bonus: 40, total: 190 });
  });

  it("adds Craftwork damage to light and representative actions without changing Stock", () => {
    const gathannan = getWeapon("Gathannan");

    expect(getWeaponDamage(gathannan, noVirtues)).toMatchObject({
      primary: { base: 123, bonus: 0, total: 123 },
      secondary: { base: 192, bonus: 0, total: 192 },
      stagger: 112,
    });
    expect(
      getWeaponDamage(gathannan, noVirtues, undefined, "Officer"),
    ).toMatchObject({
      primary: { base: 131, bonus: 0, total: 131 },
      secondary: { base: 208, bonus: 0, total: 208 },
      stagger: 112,
    });
  });

  it("halves Craftwork damage for Dual Blades and preserves the Rostrum exception", () => {
    expect(
      getWeaponDamage(getWeapon("Rivt-II"), noVirtues, undefined, "Military"),
    ).toMatchObject({
      primary: { base: 55 },
      secondary: { base: 83 },
    });
    expect(
      getWeaponDamage(getWeapon("Clivers"), noVirtues, undefined, "Military"),
    ).toMatchObject({
      primary: { base: 54 },
      secondary: { base: 81 },
    });
    expect(
      getWeaponDamage(getWeapon("Rostrum"), noVirtues, undefined, "Military"),
    ).toMatchObject({
      primary: { base: 99 },
      secondary: { base: 144 },
    });
  });

  it("scales exact attunement components with Craftwork action damage", () => {
    expect(
      getWeaponDamage(
        getWeapon("Gathannan"),
        { courage: 999, spirit: 999, grace: 999 },
        undefined,
        "Legendary",
      ),
    ).toMatchObject({
      primary: { base: 143, bonus: 134, total: 277 },
      secondary: { base: 232, bonus: 267, total: 499 },
    });
  });

  it("preserves Farilwyd fallback scaling under Craftwork", () => {
    expect(
      getWeaponDamage(
        getWeapon("Farilwyd"),
        { courage: 999, spirit: 999, grace: 999 },
        undefined,
        "Military",
      ),
    ).toMatchObject({
      primary: { base: 126, bonus: 108, total: 234 },
      secondary: { base: 198, bonus: 216, total: 414 },
    });
  });

  it("adds only confirmed single and double Temper stacks to Stagger and Smite chance", () => {
    const farilwyd = getWeapon("Farilwyd");
    const single = getWeaponDamage(
      farilwyd,
      noVirtues,
      undefined,
      "Stock",
      ["Swooning Blow", "Sullying Force"],
    );
    const double = getWeaponDamage(
      farilwyd,
      noVirtues,
      undefined,
      "Stock",
      [
        "Swooning Blow",
        "Swooning Blow",
        "Sullying Force",
        "Sullying Force",
      ],
    );

    expect(single).toMatchObject({
      stagger: 124,
      staggerBonus: 12,
      smite: { bonus: 3, percent: 8, display: "8%" },
    });
    expect(double).toMatchObject({
      stagger: 136,
      staggerBonus: 24,
      smite: { bonus: 6, percent: 11, display: "11%" },
    });
  });

  it("keeps unrelated Temper effects and unsupplied weapon paths unmodified", () => {
    const farilwyd = getWeapon("Farilwyd");
    const unrelated = getWeaponDamage(
      farilwyd,
      noVirtues,
      undefined,
      "Stock",
      ["Aftershock"],
    );
    const current = getWeaponDamage(
      farilwyd,
      noVirtues,
      undefined,
      "Stock",
      ["Swooning Blow", "Sullying Force"],
    );
    const otherHand = getWeaponDamage(farilwyd, noVirtues);

    expect(unrelated).toMatchObject({
      stagger: 112,
      staggerBonus: undefined,
      smite: { bonus: undefined, percent: 5, display: "1 in 20" },
    });
    expect(current.stagger).toBe(124);
    expect(current.smite.percent).toBe(8);
    expect(otherHand.stagger).toBe(112);
    expect(otherHand.smite).toEqual({
      bonus: undefined,
      percent: 5,
      display: "1 in 20",
    });
  });

  it("formats confirmed Temper bonuses in damage rows", () => {
    const rows = getWeaponDamageRows(
      getWeapon("Farilwyd"),
      noVirtues,
      undefined,
      "Stock",
      ["Swooning Blow", "Sullying Force"],
    );

    expect(rows.find((row) => row.id === "stagger")).toEqual({
      id: "stagger",
      label: "Stagger",
      bonus: 12,
      value: 124,
    });
    expect(rows.find((row) => row.id === "smite")).toEqual({
      id: "smite",
      label: "Smite",
      bonus: "3%",
      value: "8%",
    });
  });

  it("uses zero only for an empty Rank-30 Stagger with Swooning Blow", () => {
    const weapon = getWeapon("Coiled Dawn");

    expect(getWeaponDamage(weapon, noVirtues)).toMatchObject({
      stagger: undefined,
      staggerBonus: undefined,
    });
    expect(
      getWeaponDamage(weapon, noVirtues, undefined, "Stock", ["Aftershock"]),
    ).toMatchObject({ stagger: undefined, staggerBonus: undefined });
    expect(
      getWeaponDamage(weapon, noVirtues, undefined, "Stock", [
        "Swooning Blow",
      ]),
    ).toMatchObject({ stagger: 12, staggerBonus: 12 });
    expect(
      getWeaponDamage(weapon, noVirtues, undefined, "Stock", [
        "Swooning Blow",
        "Swooning Blow",
      ]),
    ).toMatchObject({ stagger: 24, staggerBonus: 24 });
    expect(
      getWeaponDamageRows(weapon, noVirtues, undefined, "Stock", [
        "Swooning Blow",
        "Swooning Blow",
      ]).find((row) => row.id === "stagger"),
    ).toEqual({ id: "stagger", label: "Stagger", bonus: 24, value: 24 });
  });

  it("uses zero only for an empty source Smite field with Sullying Force", () => {
    const weapon = getWeapon("Coiled Dawn");
    const unknownSource = {
      ...weapon,
      stats: {
        ...weapon.stats,
        smite: { ...weapon.stats.smite, display: "Unknown" },
      },
    };

    expect(getWeaponDamage(weapon, noVirtues).smite).toEqual({
      bonus: undefined,
      percent: undefined,
      display: undefined,
    });
    expect(
      getWeaponDamage(weapon, noVirtues, undefined, "Stock", [
        "Sullying Force",
      ]).smite,
    ).toEqual({ bonus: 3, percent: 3, display: "3%" });
    expect(
      getWeaponDamage(unknownSource, noVirtues, undefined, "Stock", [
        "Sullying Force",
      ]).smite,
    ).toEqual({ bonus: undefined, percent: undefined, display: "Unknown" });
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
