import generatedTempers from "./tempers.generated.json";
import type { Temper } from "../domain/types";

export const temperCatalogue = generatedTempers.items as Temper[];

export const temperById = new Map(
  temperCatalogue.map((temper) => [temper.id, temper]),
);
