import { describe, expect, it } from "vitest";
import { joineryCatalogue } from "../data/joineries";
import { temperById, temperCatalogue } from "../data/tempers";
import { releasedWeaponCatalogue } from "../data/weapons";
import {
  CRAFTWORK_TEMPER_RANGES,
  getCraftworkTemperRange,
  getCraftworkTemperStatus,
  getEffectiveWeaponAttunement,
  getEquippedTemperEffects,
  getEquippedTemperNumericalModifiers,
  getJoineryPipApplication,
  getPromotedCraftworkTier,
  getTemperCompatibilityReasons,
  isJoineryCompatible,
  isTemperCompatible,
  normalizeWeaponConfigurationSelections,
  resolveValidWeaponJoinery,
} from "./weapon-configuration";

describe("weapon configuration rules", () => {
  it("exposes the approved Craftwork Temper ranges", () => {
    expect(CRAFTWORK_TEMPER_RANGES).toEqual({
      Stock: { minimum: 0, maximum: 1 },
      Military: { minimum: 1, maximum: 3 },
      Officer: { minimum: 2, maximum: 4 },
      Noble: { minimum: 3, maximum: 5 },
      Sovereign: { minimum: 4, maximum: 6 },
      Legendary: { minimum: 5, maximum: 8 },
    });
    expect(getCraftworkTemperRange("Legendary").maximum).toBe(8);
  });

  it("distinguishes an editable below-minimum setup from a capacity violation", () => {
    expect(getCraftworkTemperStatus("Legendary", 3)).toEqual({
      used: 3,
      minimum: 5,
      maximum: 8,
      missing: 2,
      remaining: 5,
      complete: false,
      withinCapacity: true,
    });
    expect(getCraftworkTemperStatus("Legendary", 5).complete).toBe(true);
    expect(getCraftworkTemperStatus("Legendary", 9)).toMatchObject({
      complete: false,
      withinCapacity: false,
      remaining: 0,
    });
  });

  it("promotes upward to the first tier that fits without auto-demoting", () => {
    expect(getPromotedCraftworkTier("Stock", 2)).toBe("Military");
    expect(getPromotedCraftworkTier("Military", 4)).toBe("Officer");
    expect(getPromotedCraftworkTier("Noble", 1)).toBe("Noble");
    expect(getPromotedCraftworkTier("Sovereign", 7)).toBe("Legendary");
    expect(getPromotedCraftworkTier("Legendary", 9)).toBeNull();
  });

  it("requires both Temper Origin and weapon-type compatibility", () => {
    const weapon = releasedWeaponCatalogue.find(
      (candidate) => candidate.id === "weapon-avex",
    )!;
    const compatible = temperCatalogue.find((temper) =>
      isTemperCompatible(temper, weapon),
    )!;
    const incompatible = temperCatalogue.find(
      (temper) => !temper.isPlaceholder && !isTemperCompatible(temper, weapon),
    )!;
    const placeholder = temperCatalogue.find((temper) => temper.isPlaceholder)!;

    expect(compatible).toBeDefined();
    expect(isTemperCompatible(compatible, weapon)).toBe(true);
    expect(isTemperCompatible(incompatible, weapon)).toBe(false);
    expect(isTemperCompatible(placeholder, weapon)).toBe(false);
  });

  it("collapses equipped Temper duplicates and selects their matching stack values", () => {
    const temper = temperById.get("Aftershock")!;

    expect(
      getEquippedTemperEffects(
        [temper.id, temper.id, temper.id, "unknown-temper"],
        temperById,
      ),
    ).toEqual(
      temper.stats.map((stat, index) => ({
        id: `${temper.id}-${stat.effectId}-${index}`,
        effectId: stat.effectId,
        temperId: temper.id,
        temperName: temper.name,
        occurrences: 2,
        text: stat.effect.replaceAll("$1", stat.stacks.double),
        numericalModifier: null,
      })),
    );
    expect(getEquippedTemperEffects([temper.id], temperById)).toEqual(
      temper.stats.map((stat, index) => ({
        id: `${temper.id}-${stat.effectId}-${index}`,
        effectId: stat.effectId,
        temperId: temper.id,
        temperName: temper.name,
        occurrences: 1,
        text: stat.effect.replaceAll("$1", stat.stacks.single),
        numericalModifier: null,
      })),
    );
  });

  it("resolves only confirmed source-backed Temper numerical modifiers", () => {
    expect(
      getEquippedTemperNumericalModifiers(
        ["Swooning Blow", "Sullying Force"],
        temperById,
      ),
    ).toEqual({ staggerDamage: 12, smiteChancePercentagePoints: 3 });
    expect(
      getEquippedTemperNumericalModifiers(
        [
          "Swooning Blow",
          "Swooning Blow",
          "Sullying Force",
          "Sullying Force",
        ],
        temperById,
      ),
    ).toEqual({ staggerDamage: 24, smiteChancePercentagePoints: 6 });
    expect(
      getEquippedTemperNumericalModifiers(
        ["Aftershock", "unknown-temper"],
        temperById,
      ),
    ).toEqual({ staggerDamage: 0, smiteChancePercentagePoints: 0 });

    const swooningBlow = temperById.get("Swooning Blow")!;
    const unparseableSource = new Map(temperById);
    unparseableSource.set(swooningBlow.id, {
      ...swooningBlow,
      stats: swooningBlow.stats.map((stat) => ({
        ...stat,
        stacks: { ...stat.stacks, single: "Unknown" },
      })),
    });
    expect(
      getEquippedTemperNumericalModifiers([swooningBlow.id], unparseableSource),
    ).toEqual({ staggerDamage: 0, smiteChancePercentagePoints: 0 });
  });

  it("reports Origin and weapon-type incompatibility independently", () => {
    const weapon = releasedWeaponCatalogue.find(
      (candidate) => candidate.id === "weapon-avex",
    )!;
    const base = temperCatalogue.find(
      (temper) =>
        !temper.isPlaceholder &&
        temper.origin === "Universal" &&
        temper.compatibility === "All Weapons",
    )!;

    expect(
      getTemperCompatibilityReasons(
        { ...base, origin: "Cassid", compatibility: "All Weapons" },
        weapon,
      ),
    ).toEqual(["origin"]);
    expect(
      getTemperCompatibilityReasons(
        { ...base, origin: "Universal", compatibility: "Melee" },
        weapon,
      ),
    ).toEqual(["weapon-type"]);
    expect(
      getTemperCompatibilityReasons(
        { ...base, origin: "Cassid", compatibility: "Melee" },
        weapon,
      ),
    ).toEqual(["origin", "weapon-type"]);
  });

  it("preserves ordered slot usage while enforcing capacity and double-stack limits", () => {
    const weapon = releasedWeaponCatalogue.find(
      (candidate) => candidate.id === "weapon-avex",
    )!;
    const [first, second] = temperCatalogue.filter((temper) =>
      isTemperCompatible(temper, weapon),
    );
    const result = normalizeWeaponConfigurationSelections({
      craftwork: "Noble",
      tempers: [first.id, first.id, first.id, second.id],
      joineryId: null,
      weapon,
      temperById: new Map(temperCatalogue.map((temper) => [temper.id, temper])),
      joineryById: new Map(joineryCatalogue.map((joinery) => [joinery.id, joinery])),
    });

    expect(result.value.tempers).toEqual([first.id, first.id, second.id]);
    expect(result.reasons).toContain("temper-duplicate-limit");

    const stock = normalizeWeaponConfigurationSelections({
      craftwork: "Stock",
      tempers: [first.id, second.id],
      joineryId: null,
      weapon,
      temperById: new Map(temperCatalogue.map((temper) => [temper.id, temper])),
    });
    expect(stock.value.tempers).toEqual([first.id]);
    expect(stock.reasons).toContain("temper-capacity");
  });

  it("applies source-preserved Joinery weapon-type compatibility", () => {
    const weapon = releasedWeaponCatalogue.find(
      (candidate) => candidate.id === "weapon-avex",
    )!;
    const compatible = joineryCatalogue.filter((joinery) =>
      isJoineryCompatible(joinery, weapon),
    );
    const incompatible = joineryCatalogue.filter(
      (joinery) => !isJoineryCompatible(joinery, weapon),
    );

    expect([...new Set(compatible.map((joinery) => joinery.family))]).toEqual([
      "Gildaur",
      "Quicksilver",
    ]);
    expect(compatible).toHaveLength(15);
    expect(incompatible.some((joinery) => joinery.family === "Feybalt")).toBe(
      true,
    );
  });

  it("adds Joinery attunement only to its source-preserved Virtue", () => {
    const joinery = joineryCatalogue[0];
    const nativeAttunement = { courage: 2, spirit: 3, grace: 4 };

    expect(getEffectiveWeaponAttunement(nativeAttunement, joinery)).toEqual({
      ...nativeAttunement,
      [joinery.virtue]:
        nativeAttunement[joinery.virtue] + joinery.attunementPips,
    });
  });

  it("reports granted, applied, and wasted Joinery pips at the five-pip cap", () => {
    const joinery = {
      ...joineryCatalogue[0],
      virtue: "grace" as const,
      attunementPips: 3 as const,
    };

    expect(
      getJoineryPipApplication(
        { courage: 2, spirit: 3, grace: 4 },
        joinery,
      ),
    ).toEqual({
      virtue: "grace",
      native: 4,
      effective: 5,
      granted: 3,
      applied: 1,
      wasted: 2,
    });
    expect(
      getJoineryPipApplication(
        { courage: 2, spirit: 3, grace: 1 },
        joinery,
      ),
    ).toMatchObject({ effective: 4, applied: 3, wasted: 0 });
  });

  it("wastes every Joinery pip when its native Virtue already meets the cap", () => {
    const joinery = {
      ...joineryCatalogue[0],
      virtue: "courage" as const,
      attunementPips: 2 as const,
    };

    expect(
      getJoineryPipApplication(
        { courage: 7, spirit: 1, grace: 2 },
        joinery,
      ),
    ).toMatchObject({ native: 7, effective: 5, applied: 0, wasted: 2 });
    expect(
      getEffectiveWeaponAttunement(
        { courage: 7, spirit: 1, grace: 2 },
        joinery,
      ),
    ).toEqual({ courage: 5, spirit: 1, grace: 2 });
  });

  it("preserves the native attunement object and every native Virtue value", () => {
    const joinery = joineryCatalogue[0];
    const nativeAttunement = { courage: 5, spirit: 1, grace: 2 };
    const snapshot = { ...nativeAttunement };

    const effective = getEffectiveWeaponAttunement(nativeAttunement, joinery);

    expect(nativeAttunement).toEqual(snapshot);
    expect(effective).not.toBe(nativeAttunement);
    for (const virtue of ["courage", "spirit", "grace"] as const) {
      if (virtue !== joinery.virtue) {
        expect(effective[virtue]).toBe(nativeAttunement[virtue]);
      }
    }
  });

  it("returns an unchanged copy when no Joinery is equipped", () => {
    const nativeAttunement = { courage: 1, spirit: 0, grace: 2 };
    const effective = getEffectiveWeaponAttunement(nativeAttunement);

    expect(effective).toEqual(nativeAttunement);
    expect(effective).not.toBe(nativeAttunement);
  });

  it("hard-caps every visible effective Attunement Virtue at five pips", () => {
    const joinery = joineryCatalogue.find(
      (candidate) =>
        candidate.virtue === "grace" && candidate.attunementPips === 3,
    )!;

    expect(
      getEffectiveWeaponAttunement(
        { courage: 7, spirit: 5, grace: 4 },
        joinery,
      ),
    ).toEqual({ courage: 5, spirit: 5, grace: 5 });
  });

  it("resolves only known Joineries compatible with the exact weapon", () => {
    const weapon = releasedWeaponCatalogue.find(
      (candidate) => candidate.id === "weapon-avex",
    )!;
    const compatible = joineryCatalogue.find((joinery) =>
      isJoineryCompatible(joinery, weapon),
    )!;
    const incompatible = joineryCatalogue.find(
      (joinery) => !isJoineryCompatible(joinery, weapon),
    )!;
    const catalogue = new Map(
      joineryCatalogue.map((joinery) => [joinery.id, joinery]),
    );

    expect(resolveValidWeaponJoinery(compatible.id, weapon, catalogue)).toBe(
      compatible,
    );
    expect(
      resolveValidWeaponJoinery(incompatible.id, weapon, catalogue),
    ).toBeUndefined();
    expect(
      resolveValidWeaponJoinery("unknown-joinery", weapon, catalogue),
    ).toBeUndefined();
    expect(
      resolveValidWeaponJoinery(compatible.id, undefined, catalogue),
    ).toBeUndefined();
  });
});
