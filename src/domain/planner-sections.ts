import { combatArtByName } from "../data/arts";
import { pactById } from "../data/pacts";
import { runeById } from "../data/runes";
import { weaponById } from "../data/weapons";
import { getAllocatableAffinity } from "./affinity";
import {
  createDefaultPactArtAllocation,
  getPactVirtueArtRanks,
  normalizeActiveCombatArtAllocations,
  normalizeCombatArtAllocation,
  normalizePactArtAllocation,
} from "./arts";
import {
  createEmptyWeaponEnhancements,
  normalizeWeaponEnhancements,
} from "./enchantments";
import type {
  AffinitySources,
  ArtAllocation,
  SoulframeBuild,
  VirtueValues,
  WeaponEnhancements,
  WeaponHandSlot,
} from "./types";
import { distributeVirtueTotal } from "./virtue-alignment";

function activeCombatArtNames(build: SoulframeBuild) {
  return [...new Set((["mainHand", "offHand"] as const).flatMap((slot) => {
    const id = build.equipment[slot];
    const name = id ? weaponById.get(id)?.combatArt : undefined;
    return name && combatArtByName.has(name) ? [name] : [];
  }))];
}

export function updatePlannerWeapon(
  build: SoulframeBuild,
  slot: WeaponHandSlot,
  itemId: string | undefined,
): SoulframeBuild {
  const equipment = { ...build.equipment };
  if (itemId) equipment[slot] = itemId;
  else delete equipment[slot];
  const weapon = itemId ? weaponById.get(itemId) : undefined;
  const next = {
    ...build,
    equipment,
    weaponEnhancements: {
      ...build.weaponEnhancements,
      [slot]: itemId
        ? normalizeWeaponEnhancements(build.weaponEnhancements[slot], weapon, runeById).value
        : createEmptyWeaponEnhancements(),
    },
  };
  return {
    ...next,
    combatArts: normalizeActiveCombatArtAllocations(
      build.combatArts,
      activeCombatArtNames(next),
    ).value,
  };
}

export function updatePlannerWeaponEnhancements(
  build: SoulframeBuild,
  slot: WeaponHandSlot,
  enhancements: WeaponEnhancements,
): SoulframeBuild {
  const id = build.equipment[slot];
  const weapon = id ? weaponById.get(id) : undefined;
  return {
    ...build,
    weaponEnhancements: {
      ...build.weaponEnhancements,
      [slot]: normalizeWeaponEnhancements(enhancements, weapon, runeById).value,
    },
  };
}

export function updatePlannerCombatArt(
  build: SoulframeBuild,
  artName: string,
  allocation: ArtAllocation,
): SoulframeBuild {
  if (!activeCombatArtNames(build).includes(artName)) return build;
  return {
    ...build,
    combatArts: {
      ...build.combatArts,
      [artName]: normalizeCombatArtAllocation(artName, allocation).value,
    },
  };
}

export function updatePlannerPact(
  build: SoulframeBuild,
  pactId: string | null,
  allocation?: ArtAllocation,
): SoulframeBuild {
  const pact = pactId ? pactById.get(pactId) : undefined;
  const artAllocation = pact
    ? normalizePactArtAllocation(
        pact,
        allocation ?? createDefaultPactArtAllocation(pact),
      ).value
    : {};
  return {
    ...build,
    pact: { itemId: pact?.id ?? null, artAllocation },
    affinitySources: {
      ...build.affinitySources,
      pactArts: getPactVirtueArtRanks(pact?.id ?? null, artAllocation),
    },
  };
}

export function updatePlannerVirtues(build: SoulframeBuild, virtues: VirtueValues) {
  return { ...build, virtues };
}

export function updatePlannerAffinitySources(
  build: SoulframeBuild,
  sources: AffinitySources,
): SoulframeBuild {
  const affinitySources = {
    ...sources,
    pactArts: getPactVirtueArtRanks(build.pact.itemId, build.pact.artAllocation),
  };
  return {
    ...build,
    affinitySources,
    virtues: distributeVirtueTotal(getAllocatableAffinity(affinitySources), build.virtues),
  };
}
