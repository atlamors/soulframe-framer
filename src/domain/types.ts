export const VIRTUE_IDS = ["courage", "spirit", "grace"] as const;
export const DEFENSE_IDS = [
  "physicalDefense",
  "magickDefense",
  "stabilityIncrease",
] as const;
export const ARMOR_SLOTS = ["helm", "cuirass", "leggings"] as const;
export const EQUIPMENT_SLOTS = [...ARMOR_SLOTS, "talisman"] as const;

export type VirtueId = (typeof VIRTUE_IDS)[number];
export type DefenseId = (typeof DEFENSE_IDS)[number];
export type ArmorSlot = (typeof ARMOR_SLOTS)[number];
export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

export type VirtueValues = Record<VirtueId, number>;

export interface DefenseProfile {
  base: number;
  pips: VirtueValues;
}

export interface ArmorRequirement {
  virtue: VirtueId;
  value: number;
}

export interface ArmorItem {
  id: string;
  name: string;
  slot: ArmorSlot;
  requirement: ArmorRequirement | null;
  defenses: Record<DefenseId, DefenseProfile>;
  provenance: {
    status: "verified";
    sourceSheet: string;
    sourceRow: number;
  };
}

export interface TalismanStats {
  virtues: VirtueValues;
  defenses: Record<DefenseId, number>;
  attack: number;
  stagger: number;
}

export interface Talisman {
  id: string;
  name: string;
  description: string;
  rarity: string;
  accessorySet: string;
  armorSet: string;
  tags: string[];
  imageFile: string;
  hasUnmodeledConditionalEffect: boolean;
  stats: TalismanStats;
  pageUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
  descriptionUrl: string;
  mimeType: string;
  width: number;
  height: number;
  thumbnailWidth: number;
  thumbnailHeight: number;
  bytes: number;
  sha1: string;
}

export interface SoulframeBuild {
  schemaVersion: 2;
  name: string;
  virtues: VirtueValues;
  equipment: Partial<Record<EquipmentSlot, string>>;
}

export interface DefenseContribution {
  base: number;
  scaling: number;
  total: number;
}

export interface ItemContribution {
  itemId: string;
  requirementMet: boolean;
  defenses: Record<DefenseId, DefenseContribution>;
  total: number;
}

export interface TalismanContribution {
  itemId: string;
  virtues: VirtueValues;
  defenses: Record<DefenseId, number>;
  attack: number;
  stagger: number;
  totalDefense: number;
  hasUnmodeledConditionalEffect: boolean;
}

export interface BuildCalculation {
  allocatedVirtues: VirtueValues;
  effectiveVirtues: VirtueValues;
  defenses: Record<DefenseId, number>;
  armorDefense: number;
  talismanDefense: number;
  total: number;
  items: ItemContribution[];
  talisman?: TalismanContribution;
  modifiers: {
    attack: number;
    stagger: number;
  };
  warnings: string[];
}
