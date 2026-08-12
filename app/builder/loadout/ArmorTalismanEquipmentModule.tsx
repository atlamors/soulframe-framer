"use client";

import { armorById } from "@/src/data/catalogue";
import { talismanById } from "@/src/data/talismans";
import {
  ARMOR_SLOTS,
  type BuildCalculation,
  type SoulframeBuild,
} from "@/src/domain/types";
import type { ArmorTalismanSlot } from "@/src/domain/armor-talisman-equipment";
import {
  EquipmentSlot as BuilderEquipmentSlot,
  TalismanEquipmentSlot as BuilderTalismanEquipmentSlot,
} from "./EquipmentSlots";
import { ItemPicker as BuilderArmorPicker } from "../pickers/armor/ArmorPicker";
import { TalismanPicker as BuilderTalismanPicker } from "../pickers/talisman/TalismanPicker";

export {
  isArmorTalismanSlot,
  updateArmorTalismanEquipment,
} from "@/src/domain/armor-talisman-equipment";
export type { ArmorTalismanSlot } from "@/src/domain/armor-talisman-equipment";

export function ArmorTalismanEquipmentModule({
  build,
  calculation,
  activeSlot,
  onActiveSlotChange,
  onClosePicker,
  onEquipmentChange,
}: {
  build: SoulframeBuild;
  calculation: BuildCalculation;
  activeSlot: ArmorTalismanSlot | undefined;
  onActiveSlotChange: (slot: ArmorTalismanSlot) => void;
  onClosePicker: () => void;
  onEquipmentChange: (
    slot: ArmorTalismanSlot,
    itemId: string | undefined,
  ) => void;
}) {
  const commitAndClose = (
    slot: ArmorTalismanSlot,
    itemId: string | undefined,
  ) => {
    onEquipmentChange(slot, itemId);
    onClosePicker();
  };

  return (
    <>
      {ARMOR_SLOTS.map((slot) => {
        const itemId = build.equipment[slot];
        const item = itemId ? armorById.get(itemId) : undefined;
        const contribution = calculation.items.find(
          (entry) => entry.itemId === itemId,
        );
        return (
          <BuilderEquipmentSlot
            key={slot}
            slot={slot}
            item={item}
            contribution={contribution}
            virtues={calculation.effectiveVirtues}
            isActive={activeSlot === slot}
            onOpen={() => onActiveSlotChange(slot)}
          />
        );
      })}

      <BuilderTalismanEquipmentSlot
        item={
          build.equipment.talisman
            ? talismanById.get(build.equipment.talisman)
            : undefined
        }
        isActive={activeSlot === "talisman"}
        onOpen={() => onActiveSlotChange("talisman")}
      />

      {activeSlot && activeSlot !== "talisman" ? (
        <BuilderArmorPicker
          slot={activeSlot}
          build={build}
          onClose={onClosePicker}
          onEquip={(itemId) => commitAndClose(activeSlot, itemId)}
          onUnequip={() => commitAndClose(activeSlot, undefined)}
        />
      ) : null}

      {activeSlot === "talisman" ? (
        <BuilderTalismanPicker
          build={build}
          onClose={onClosePicker}
          onEquip={(itemId) => commitAndClose("talisman", itemId)}
          onUnequip={() => commitAndClose("talisman", undefined)}
        />
      ) : null}
    </>
  );
}
