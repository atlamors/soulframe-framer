import generatedCatalogue from "./armor-catalogue.generated.json";
import generatedRequirements from "./armor-requirements.generated.json";
import type { ArmorItem } from "../domain/types";

const requirementByItemId = new Map(
  generatedRequirements.items.map((item) => [item.itemId, item]),
);

export const armorCatalogue = generatedCatalogue.map((item) => {
  const requirement = requirementByItemId.get(item.id);
  if (!requirement) {
    throw new Error(`Missing armor requirement record for ${item.id}`);
  }

  return {
    ...item,
    requirement: requirement.requirement,
    rarity: requirement.rarity,
    armorSet: requirement.armorSet,
  };
}) as ArmorItem[];

export const armorById = new Map(
  armorCatalogue.map((item) => [item.id, item]),
);
