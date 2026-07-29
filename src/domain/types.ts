export const VIRTUE_IDS = ["courage", "spirit", "grace"] as const;
export const DEFENSE_IDS = [
  "physicalDefense",
  "magickDefense",
  "stabilityIncrease",
] as const;
export const ARMOR_SLOTS = ["helm", "cuirass", "leggings"] as const;
export const WEAPON_HAND_SLOTS = ["mainHand", "offHand"] as const;
export const EQUIPMENT_SLOTS = [
  ...ARMOR_SLOTS,
  "talisman",
  ...WEAPON_HAND_SLOTS,
] as const;

export type VirtueId = (typeof VIRTUE_IDS)[number];
export type DefenseId = (typeof DEFENSE_IDS)[number];
export type ArmorSlot = (typeof ARMOR_SLOTS)[number];
export type WeaponHandSlot = (typeof WEAPON_HAND_SLOTS)[number];
export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

export type VirtueValues = Record<VirtueId, number>;
export type PactArtRank = 0 | 1 | 2 | 3;
export type EnhancementRank = 0 | 1 | 2 | 3;

export interface AffinitySources {
  envoyRank: number;
  pactArts: Record<VirtueId, PactArtRank>;
  fables: {
    shewolf: VirtueId | null;
    wasteBear: VirtueId | null;
  };
}

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
  rarity: string;
  armorSet: string;
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

export interface WeaponLevelStats {
  attack?: number;
  chargedAttack?: number;
  chargedShot?: number;
  fullChargedCast?: number;
  orbit?: number;
  perfectThrow?: number;
  stagger?: number;
  throw?: number;
}

export interface WeaponDamageCaps {
  lightAttack?: number;
  chargedHeavyAttack?: number;
  chargedShotAttack?: number;
  throw?: number;
  perfectThrow?: number;
}

export interface Weapon {
  id: string;
  name: string;
  dataStatus: "verified" | "partial";
  description: string;
  slot: WeaponHandSlot;
  sourceSlot: "Weapon" | "Sidearm";
  rarity: string;
  combatArt: string;
  damageType: string;
  origin: string;
  requirements: VirtueValues;
  attunement: VirtueValues;
  imageFile: string;
  tags: string[];
  isUpcoming: boolean;
  introduced: string;
  lastUpdated: string;
  sellable: string;
  stats: {
    smite: {
      display: string;
      numerator: number | null;
      denominator: number | null;
      percent: number | null;
    };
    arrowHail: number | null;
    virtueAttuneCap: number | null;
    level0: WeaponLevelStats;
    level30: WeaponLevelStats;
    damageCaps: WeaponDamageCaps;
  };
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

export interface CatalogueImage {
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

export interface PactAbility {
  id: string;
  name: string;
  pact: string;
  assignedVirtue: VirtueId | null;
  description: string;
  effect: string;
  iconFile: string;
  imageFile: string;
  unlockLevel: number | null;
  cooldown: number | null;
  cooldownType: string;
  types: string[];
  image: CatalogueImage | null;
  artImage: CatalogueImage | null;
}

export interface Pact {
  id: string;
  name: string;
  basePact: string;
  variant: "normal" | "wyld";
  description: string;
  iconFile: string;
  abilityIds: string[];
  virtueOrder: VirtueId[];
  introduced: string;
  pageUrl: string;
  image: CatalogueImage | null;
}

export interface RuneStat {
  effect: string;
  ranks: string[];
}

export interface Rune {
  id: string;
  name: string;
  description: string;
  functionality: string;
  maxRankDescription: string;
  weaponArt: string;
  addedSlot: VirtueId | null;
  iconFile: string;
  internalId: string;
  rarity: string;
  introduced: string;
  tags: string[];
  stats: RuneStat[];
  pageUrl: string;
  image: CatalogueImage | null;
}

export interface Totem {
  id: string;
  name: string;
  animal: string;
  enhances: string;
  description: string;
  effect: string;
  iconFile: string;
  rankValues: Array<Array<number | null>>;
  gripRankValues: Array<Array<number | null>>;
  hasUnknownGripValues: boolean;
  pageUrl: string;
  image: CatalogueImage | null;
}

export interface RankedEnhancement {
  itemId: string;
  rank: EnhancementRank;
}

export interface TotemSelection extends RankedEnhancement {
  virtue: VirtueId;
  variant: "universal" | "combatArt";
}

export interface WeaponEnhancements {
  rune: RankedEnhancement | null;
  totems: [
    TotemSelection | null,
    TotemSelection | null,
    TotemSelection | null,
    TotemSelection | null,
  ];
}

export interface SoulframeBuild {
  schemaVersion: 4;
  name: string;
  virtues: VirtueValues;
  affinitySources: AffinitySources;
  equipment: Partial<Record<EquipmentSlot, string>>;
  pact: {
    itemId: string | null;
    rank: number;
  };
  weaponEnhancements: Record<WeaponHandSlot, WeaponEnhancements>;
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
  sourceVirtues: VirtueValues;
  bonusVirtues: VirtueValues;
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
