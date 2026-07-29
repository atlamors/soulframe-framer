import generatedPacts from "./pacts.generated.json";
import type { Pact, PactAbility } from "../domain/types";

export const pactCatalogue = generatedPacts.items as Pact[];
export const pactAbilityCatalogue = generatedPacts.abilities as PactAbility[];

export const pactById = new Map(pactCatalogue.map((item) => [item.id, item]));
export const pactAbilityById = new Map(
  pactAbilityCatalogue.map((item) => [item.id, item]),
);
