import generatedWeaponDrops from "./weapon-drops.generated.json";

export interface WeaponDropSource {
  tableId: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
  quantity: string;
  fragment: boolean;
  level: string;
  note: string;
}

export interface WeaponDropRecord {
  itemId: string;
  name: string;
  sources: WeaponDropSource[];
}

export const weaponDrops =
  generatedWeaponDrops.items as WeaponDropRecord[];

export const weaponDropById = new Map(
  weaponDrops.map((record) => [record.itemId, record]),
);
