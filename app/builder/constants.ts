import { MAX_ENVOY_RANK } from "@/src/domain/affinity";
import { BUILD_SCHEMA_VERSION } from "@/src/domain/serialization";
import { weaponById } from "@/src/data/weapons";
import type {
  ArmorSlot,
  DefenseId,
  SoulframeBuild,
  VirtueId,
  WeaponHandSlot,
} from "@/src/domain/types";

const DEFAULT_EQUIPMENT: SoulframeBuild["equipment"] = {
  helm: "helm-arbearers-mask",
  cuirass: "cuirass-arbearers-pauncher",
  leggings: "leggings-arbearers-braes",
  talisman: "talisman-prelude-honour",
  mainHand: "weapon-farilwyd",
  offHand: "weapon-precklies",
};

export const DEFAULT_BUILD: SoulframeBuild = {
  schemaVersion: BUILD_SCHEMA_VERSION,
  name: "First Envoy",
  virtues: { courage: 12, spirit: 11, grace: 11 },
  affinitySources: {
    envoyRank: 18,
    pactArts: { courage: 0, spirit: 0, grace: 0 },
    fables: { shewolf: null, wasteBear: null },
  },
  equipment: DEFAULT_EQUIPMENT,
  pact: {
    itemId: "pact-orengall",
    artAllocation: {},
  },
  combatArts: Object.fromEntries(
    (["mainHand", "offHand"] as const).flatMap((slot) => {
      const itemId = DEFAULT_EQUIPMENT[slot];
      const artName = itemId ? weaponById.get(itemId)?.combatArt : undefined;
      return artName && artName !== "Unreleased" ? [[artName, {}]] : [];
    }),
  ),
  weaponEnhancements: {
    mainHand: {
      rune: null,
      totems: [null, null, null, null],
      craftwork: "Stock",
      tempers: [],
      joineryId: null,
    },
    offHand: {
      rune: null,
      totems: [null, null, null, null],
      craftwork: "Stock",
      tempers: [],
      joineryId: null,
    },
  },
};

export const virtueMeta: Record<
  VirtueId,
  { label: string; icon: string }
> = {
  courage: {
    label: "Courage",
    icon: "/icons/courage.png",
  },
  spirit: {
    label: "Spirit",
    icon: "/icons/spirit.png",
  },
  grace: {
    label: "Grace",
    icon: "/icons/grace.png",
  },
};

export const defenseMeta: Record<
  DefenseId,
  { label: string; shortLabel: string; icon: string }
> = {
  physicalDefense: {
    label: "Physical Defense",
    shortLabel: "Physical",
    icon: "/icons/physical-defense.png",
  },
  magickDefense: {
    label: "Magick Defense",
    shortLabel: "Magick",
    icon: "/icons/magick-defense.png",
  },
  stabilityIncrease: {
    label: "Stability Increase",
    shortLabel: "Stability",
    icon: "/icons/stability-increase.png",
  },
};

export const ENVOY_RANK_OPTIONS = Array.from(
  { length: MAX_ENVOY_RANK + 1 },
  (_, rank) => rank,
);

export const slotMeta: Record<
  ArmorSlot,
  { label: string; index: string; prompt: string }
> = {
  helm: { label: "Helm", index: "I", prompt: "Frame the crown" },
  cuirass: { label: "Cuirass", index: "II", prompt: "Frame the core" },
  leggings: { label: "Leggings", index: "III", prompt: "Frame the stride" },
};

export const weaponSlotMeta: Record<
  WeaponHandSlot,
  { label: string; index: string; prompt: string }
> = {
  mainHand: { label: "Weapon", index: "I", prompt: "Choose weapon" },
  offHand: { label: "Sidearm", index: "II", prompt: "Choose sidearm" },
};

export const TRIQUETRA_VIEWBOX_SIZE = 512;
export const TRIQUETRA_BOUNDS = {
  top: { x: 256, y: 42 },
  courage: { x: 32, y: 448 },
  grace: { x: 480, y: 448 },
} as const;
export const TRIQUETRA_PATH = `
  M 252 24 L 262 26 L 276 40 L 276 44 L 288 52 L 316 98 L 310 130
  L 318 144 L 334 146 L 344 188 L 346 226 L 342 226 L 336 240
  L 342 254 L 390 284 L 400 296 L 406 298 L 406 306 L 412 316
  L 410 328 L 414 332 L 422 332 L 430 342 L 446 340 L 448 346
  L 454 348 L 458 364 L 468 378 L 492 396 L 492 410 L 498 412
  L 510 442 L 508 458 L 460 468 L 402 468 L 378 464 L 356 456
  L 346 456 L 342 450 L 332 448 L 312 438 L 306 430 L 278 418
  L 262 418 L 258 406 L 252 414 L 244 412 L 230 422 L 224 434
  L 220 434 L 216 440 L 148 464 L 114 470 L 64 470 L 20 464
  L 16 460 L 2 458 L 2 440 L 8 432 L 12 416 L 26 412 L 30 406
  L 32 392 L 36 392 L 40 382 L 50 374 L 54 350 L 62 346 L 64 338
  L 76 326 L 80 326 L 84 318 L 102 310 L 108 298 L 122 288
  L 122 284 L 134 280 L 138 272 L 148 270 L 164 258 L 166 230
  L 170 230 L 166 226 L 170 178 L 180 156 L 188 148 L 188 140
  L 196 136 L 196 100 L 214 68 L 222 64 L 226 52 L 252 24 Z
`;
