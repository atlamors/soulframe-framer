import generatedCatalogue from "./armor-catalogue.generated.json";
import type { ArmorItem } from "../domain/types";

export const armorCatalogue = generatedCatalogue as ArmorItem[];

export const armorById = new Map(
  armorCatalogue.map((item) => [item.id, item]),
);
