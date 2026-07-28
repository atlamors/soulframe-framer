import generatedWeapons from "./weapons.generated.json";
import type { Weapon } from "../domain/types";

export const weaponCatalogue = generatedWeapons.items as Weapon[];

export const weaponById = new Map(
  weaponCatalogue.map((item) => [item.id, item]),
);

export const releasedWeaponCatalogue = weaponCatalogue.filter(
  (item) => !item.isUpcoming,
);
