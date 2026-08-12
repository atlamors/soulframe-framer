import {
  ARMOR_SLOTS,
  type ArmorSlot,
  type EquipmentSlot,
  type SoulframeBuild,
} from "./types";

export type ArmorTalismanSlot = ArmorSlot | "talisman";

export function isArmorTalismanSlot(
  slot: EquipmentSlot | undefined,
): slot is ArmorTalismanSlot {
  return (
    slot === "talisman" ||
    (slot !== undefined && ARMOR_SLOTS.includes(slot as ArmorSlot))
  );
}

export function updateArmorTalismanEquipment(
  build: SoulframeBuild,
  slot: ArmorTalismanSlot,
  itemId: string | undefined,
): SoulframeBuild {
  const equipment = { ...build.equipment };
  if (itemId === undefined) delete equipment[slot];
  else equipment[slot] = itemId;
  return { ...build, equipment };
}
