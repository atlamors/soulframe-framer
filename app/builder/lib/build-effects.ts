import { getRuneDisplayName, runeById } from "@/src/data/runes";
import { totemById } from "@/src/data/totems";
import {
  formatTotemEffect,
  getTotemRankValues,
} from "@/src/domain/enchantments";
import { WEAPON_HAND_SLOTS } from "@/src/domain/types";
import type { SoulframeBuild } from "@/src/domain/types";
import { weaponSlotMeta } from "../constants";
import { pactById } from "@/src/data/pacts";
import {
  getAllocatedCombatArtEffects,
  getAllocatedPactArtEffects,
} from "@/src/domain/arts";

export function getActiveBuildEffects(build: SoulframeBuild) {
  const pact = build.pact.itemId ? pactById.get(build.pact.itemId) : undefined;
  const pactEffects = getAllocatedPactArtEffects(
    pact?.id ?? null,
    pact?.name ?? "Pact",
    build.pact.artAllocation,
  );
  const combatArtEffects = Object.entries(build.combatArts).flatMap(
    ([artName, allocation]) =>
      getAllocatedCombatArtEffects(artName, allocation),
  );
  const enhancementEffects = WEAPON_HAND_SLOTS.flatMap((slot) => {
    const label = weaponSlotMeta[slot].label;
    const enhancements = build.weaponEnhancements[slot];
    const rune = enhancements.rune
      ? runeById.get(enhancements.rune.itemId)
      : undefined;
    const runeEffects =
      rune && enhancements.rune
        ? rune.stats.map((stat) => ({
            id: `${slot}-${rune.id}-${stat.effect}`,
            source: `${label} · ${getRuneDisplayName(rune)}`,
            text: stat.effect.replaceAll(
              "$1",
              stat.ranks[enhancements.rune!.rank] ?? "Unknown",
            ),
          }))
        : [];
    const totemEffects = enhancements.totems.flatMap((selection, index) => {
      if (!selection) return [];
      const totem = totemById.get(selection.itemId);
      if (!totem) return [];
      const values = getTotemRankValues(
        selection,
        totem.rankValues,
        totem.gripRankValues,
      );
      return [
        {
          id: `${slot}-${index}-${totem.id}`,
          source: `${label} · ${totem.name}`,
          text: formatTotemEffect(totem.effect, values),
        },
      ];
    });
    return [...runeEffects, ...totemEffects];
  });
  return [...pactEffects, ...combatArtEffects, ...enhancementEffects];
}
