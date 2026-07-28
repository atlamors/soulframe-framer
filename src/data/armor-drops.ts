import generatedArmorDrops from "./armor-drops.generated.json";

export interface ArmorDropSource {
  tableId: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
  quantity: string;
  fragment: boolean;
  level: string;
  note: string;
}

export interface ArmorDropRecord {
  itemId: string;
  name: string;
  sources: ArmorDropSource[];
}

export const armorDrops = generatedArmorDrops.items as ArmorDropRecord[];

export const armorDropById = new Map(
  armorDrops.map((record) => [record.itemId, record]),
);
