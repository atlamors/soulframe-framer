import generatedTalismans from "./talismans.generated.json";
import type { Talisman } from "../domain/types";

export const talismanCatalogue = generatedTalismans.items as Talisman[];

export const talismanById = new Map(
  talismanCatalogue.map((item) => [item.id, item]),
);
