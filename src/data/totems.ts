import generatedTotems from "./totems.generated.json";
import type { Totem } from "../domain/types";

export const totemCatalogue = generatedTotems.items as Totem[];
export const totemById = new Map(totemCatalogue.map((item) => [item.id, item]));
