export type ArmorArtworkAppearance = "default" | "optimization";
export type TalismanArtworkAppearance = "default";
export type WeaponArtworkAppearance =
  | "default"
  | "equipment"
  | "hud"
  | "hudInline";

export const ARMOR_ARTWORK_CLASS_NAMES = {
  default:
    "block h-full w-full object-contain p-0.5 drop-shadow-art-strong saturate-90 contrast-110",
  optimization:
    "block size-28 object-contain p-0.5 drop-shadow-art-strong saturate-90 contrast-110 max-tablet:size-25",
} as const satisfies Record<ArmorArtworkAppearance, string>;

export const TALISMAN_ARTWORK_CLASS_NAMES = {
  default:
    "block h-full w-full object-contain p-0.5 drop-shadow-art-strong saturate-95 contrast-110",
} as const satisfies Record<TalismanArtworkAppearance, string>;

export const WEAPON_ARTWORK_CLASS_NAMES = {
  default:
    "block h-full w-full scale-110 object-contain p-0 drop-shadow-art-strong saturate-95 contrast-110",
  equipment:
    "block h-full w-full scale-110 object-contain p-0 drop-shadow-art-strong saturate-95 contrast-110 max-tablet:scale-125",
  hud:
    "block size-11 origin-center scale-150 object-contain p-0 drop-shadow-art-strong saturate-95 contrast-110",
  hudInline:
    "block size-10 origin-center scale-150 object-contain p-0 drop-shadow-art-strong saturate-95 contrast-110 max-tablet:size-9",
} as const satisfies Record<WeaponArtworkAppearance, string>;

export const ARTWORK_FALLBACK_CLASS_NAME =
  "flex h-full w-full items-center justify-center font-display text-lg text-gold/45 text-shadow-value";

type HudSupportingImageAppearance = "default" | "inline";

export const HUD_SUPPORTING_IMAGE_CLASS_NAMES = {
  default: "size-10.5 object-contain drop-shadow-art",
  inline:
    "size-9.5 object-contain drop-shadow-art max-tablet:size-9",
} as const satisfies Record<HudSupportingImageAppearance, string>;
