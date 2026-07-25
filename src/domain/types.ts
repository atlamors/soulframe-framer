export const VIRTUE_IDS = ["courage", "spirit", "grace"] as const;
export const DEFENSE_IDS = [
  "physicalDefense",
  "magickDefense",
  "stabilityIncrease",
] as const;
export const ARMOR_SLOTS = ["helm", "cuirass", "leggings"] as const;

export type VirtueId = (typeof VIRTUE_IDS)[number];
export type DefenseId = (typeof DEFENSE_IDS)[number];
export type ArmorSlot = (typeof ARMOR_SLOTS)[number];

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

export interface SoulframeBuild {
  schemaVersion: 1;
  name: string;
  virtues: VirtueValues;
  equipment: Partial<Record<ArmorSlot, string>>;
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

export interface BuildCalculation {
  defenses: Record<DefenseId, number>;
  total: number;
  items: ItemContribution[];
  warnings: string[];
}
