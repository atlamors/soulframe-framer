import generatedJoineries from "./joineries.generated.json";
import type { Joinery } from "../domain/types";

export const joineryCatalogue = generatedJoineries.items as Joinery[];

export const joineryById = new Map(
  joineryCatalogue.map((joinery) => [joinery.id, joinery]),
);
