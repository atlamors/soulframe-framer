"use client";
import { weaponById } from "@/src/data/weapons";
import type { BuildCalculation, SoulframeBuild, WeaponHandSlot } from "@/src/domain/types";
import { WeaponEquipmentSlot } from "./EquipmentSlots";
import { WeaponPicker } from "../pickers/weapon/WeaponPicker";

export type WeaponPlannerTab =
  | "weapon"
  | "arts"
  | "rune"
  | "totems"
  | "tempers"
  | "joinery";
export function WeaponEquipmentModule({ build, calculation, activeSlot, activeTab, showEnhancements = true, onOpen, onConfigure, onClose, onWeaponChange }: {
  build: SoulframeBuild; calculation: BuildCalculation; activeSlot?: WeaponHandSlot; activeTab: WeaponPlannerTab;
  showEnhancements?: boolean;
  onOpen: (slot: WeaponHandSlot, tab: WeaponPlannerTab, totemSlot?: number) => void; onConfigure: (tab: WeaponPlannerTab, totemSlot?: number) => void;
  onClose: () => void; onWeaponChange: (slot: WeaponHandSlot, itemId?: string) => void;
}) {
  return <>{(["offHand", "mainHand"] as const).map((slot) => <WeaponEquipmentSlot key={slot} slot={slot}
    item={build.equipment[slot] ? weaponById.get(build.equipment[slot]!) : undefined}
    enhancements={build.weaponEnhancements[slot]} virtues={calculation.effectiveVirtues} isActive={activeSlot === slot}
    showEnhancements={showEnhancements}
    onOpenWeapon={() => onOpen(slot, "weapon")} onOpenRune={() => onOpen(slot, "rune")}
    onOpenTotem={(index) => onOpen(slot, "totems", index)} />)}
    {activeSlot && activeTab === "weapon" ? <WeaponPicker slot={activeSlot} build={build} onClose={onClose}
      onConfigure={onConfigure} onEquip={(id) => onWeaponChange(activeSlot, id)} onUnequip={() => onWeaponChange(activeSlot)} /> : null}</>;
}
