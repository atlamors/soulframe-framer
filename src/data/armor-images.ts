import generatedArmorImages from "./armor-images.generated.json";
import type { ArmorSlot } from "../domain/types";

export interface ArmorImageAsset {
  itemId: string;
  name: string;
  slot: ArmorSlot;
  pageUrl: string;
  fileName: string;
  imageUrl: string;
  descriptionUrl: string;
  mimeType: string;
  width: number;
  height: number;
  bytes: number;
  sha1: string;
}

export const armorImages = generatedArmorImages.items as ArmorImageAsset[];

export const armorImageById = new Map(
  armorImages.map((image) => [image.itemId, image]),
);
