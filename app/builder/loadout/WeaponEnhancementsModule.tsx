"use client";
import { WEAPON_HAND_SLOTS, type ArtAllocation, type SoulframeBuild, type WeaponEnhancements, type WeaponHandSlot } from "@/src/domain/types";
import { CombatArtsSummary } from "../arts/CombatArtsSummary";
import { WeaponEnhancementPicker } from "../pickers/weapon/WeaponEnhancementPicker";
import { WeaponPicker } from "../pickers/weapon/WeaponPicker";
import { WeaponLoadoutHud } from "./WeaponLoadoutHud";
import type { WeaponPlannerTab } from "./WeaponEquipmentModule";
export type { WeaponPlannerTab } from "./WeaponEquipmentModule";

export function WeaponEnhancementsModule({ build, activeSlot, activeTab, selectedTotemSlot, showOverview = false, showArtSummary = false, overviewPresentation = "default", onOpen, onClose, onWeaponChange, onEnhancementsChange, onArtAllocationChange }: {
  build: SoulframeBuild; activeSlot?: WeaponHandSlot; activeTab: WeaponPlannerTab; selectedTotemSlot: number; showOverview?: boolean; showArtSummary?: boolean; overviewPresentation?: "default" | "publisher";
  onOpen: (slot: WeaponHandSlot, tab: WeaponPlannerTab, totemSlot?: number) => void; onClose: () => void;
  onWeaponChange?: (slot: WeaponHandSlot, itemId?: string) => void;
  onEnhancementsChange: (slot: WeaponHandSlot, value: WeaponEnhancements) => void; onArtAllocationChange: (name: string, value: ArtAllocation) => void;
}) {
  return <>{showOverview ? overviewPresentation === "publisher" ? (
    <div className="grid min-w-0 grid-cols-1 gap-2 mobile-wide:grid-cols-2">
      {WEAPON_HAND_SLOTS.map((slot) => <WeaponLoadoutHud key={slot} slot={slot} build={build}
        active={activeSlot === slot ? activeTab : "weapon"} activeTotemSlot={selectedTotemSlot} inline presentation="publisher"
        onNavigate={(tab, index) => onOpen(slot, tab, index)} />)}
    </div>
  ) : (["offHand", "mainHand"] as const).map((slot) => <WeaponLoadoutHud key={slot} slot={slot} build={build}
    active={activeSlot === slot ? activeTab : "weapon"} activeTotemSlot={selectedTotemSlot} inline
    onNavigate={(tab, index) => onOpen(slot, tab, index)} />) : null}
    {showArtSummary ? <CombatArtsSummary build={build} onSelect={(slot) => onOpen(slot, "arts")} /> : null}
    {activeSlot && activeTab === "weapon" && onWeaponChange ? <WeaponPicker slot={activeSlot} build={build} onClose={onClose}
      onConfigure={(tab, index) => onOpen(activeSlot, tab, index)}
      onEquip={(id) => onWeaponChange(activeSlot, id)}
      onUnequip={() => { onWeaponChange(activeSlot); onClose(); }} /> : null}
    {activeSlot && activeTab !== "weapon" ? <WeaponEnhancementPicker slot={activeSlot} tab={activeTab} selectedTotemSlot={selectedTotemSlot}
      build={build} onClose={onClose} onTabChange={(tab, index) => onOpen(activeSlot, tab, index)}
      onChange={(value) => onEnhancementsChange(activeSlot, value)} onArtAllocationChange={onArtAllocationChange}
      onResetArtAllocation={(name) => onArtAllocationChange(name, {})} /> : null}</>;
}
