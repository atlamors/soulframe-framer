import generatedRunes from "./runes.generated.json";
import type { Rune } from "../domain/types";

export const runeCatalogue = generatedRunes.items as Rune[];
export const runeById = new Map(runeCatalogue.map((item) => [item.id, item]));

export function getRuneDisplayName(
  rune: Pick<Rune, "name" | "weaponArt">,
): string {
  const compatibilitySuffix = ` (${rune.weaponArt})`;
  return rune.name.endsWith(compatibilitySuffix)
    ? rune.name.slice(0, -compatibilitySuffix.length)
    : rune.name;
}
