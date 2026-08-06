import type { ArmorSlot, VirtueId } from "@/src/domain/types";

export type EquipmentSlotPosition =
  | ArmorSlot
  | "talisman"
  | "weapon-1"
  | "weapon-2";
export type EquipmentSlotVisualState = "default" | "active";
export type EquipmentSlotFillState = "empty" | "filled";

export const EQUIPMENT_SLOT_CLASS_NAMES = {
  helm: {
    default:
      "group group/equipment relative z-10 col-start-1 row-start-2 flex min-h-24 w-full cursor-pointer items-center justify-self-start gap-2.75 border border-transparent bg-surface-deep/65 px-2.5 py-2 text-left text-ink shadow-control transition-colors duration-150 ease-out hover:bg-surface-raised aria-expanded:bg-surface-raised aria-expanded:shadow-loadout-card-active compact-desktop:max-wide-desktop:min-h-22 compact-desktop:max-wide-desktop:gap-1.75 compact-desktop:max-wide-desktop:px-2 compact-desktop:max-wide-desktop:py-1.5 tablet:max-compact-desktop:order-2 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-1 max-tablet:row-start-2 max-tablet:grid max-tablet:min-h-20.5 max-tablet:w-full max-tablet:max-w-none max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:items-center max-tablet:gap-1.25 max-tablet:px-1.5 max-tablet:py-1.25 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
    active:
      "group group/equipment relative z-10 col-start-1 row-start-2 flex min-h-24 w-full cursor-pointer items-center justify-self-start gap-2.75 border border-transparent bg-surface-raised px-2.5 py-2 text-left text-ink shadow-loadout-card-active transition-colors duration-150 ease-out compact-desktop:max-wide-desktop:min-h-22 compact-desktop:max-wide-desktop:gap-1.75 compact-desktop:max-wide-desktop:px-2 compact-desktop:max-wide-desktop:py-1.5 tablet:max-compact-desktop:order-2 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-1 max-tablet:row-start-2 max-tablet:grid max-tablet:min-h-20.5 max-tablet:w-full max-tablet:max-w-none max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:items-center max-tablet:gap-1.25 max-tablet:px-1.5 max-tablet:py-1.25 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  },
  cuirass: {
    default:
      "group group/equipment relative z-10 col-start-1 row-start-3 flex min-h-24 w-full cursor-pointer items-center justify-self-start gap-2.75 border border-transparent bg-surface-deep/65 px-2.5 py-2 text-left text-ink shadow-control transition-colors duration-150 ease-out hover:bg-surface-raised aria-expanded:bg-surface-raised aria-expanded:shadow-loadout-card-active compact-desktop:max-wide-desktop:min-h-22 compact-desktop:max-wide-desktop:gap-1.75 compact-desktop:max-wide-desktop:px-2 compact-desktop:max-wide-desktop:py-1.5 tablet:max-compact-desktop:order-3 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-1 max-tablet:row-start-3 max-tablet:grid max-tablet:min-h-20.5 max-tablet:w-full max-tablet:max-w-none max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:items-center max-tablet:gap-1.25 max-tablet:px-1.5 max-tablet:py-1.25 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
    active:
      "group group/equipment relative z-10 col-start-1 row-start-3 flex min-h-24 w-full cursor-pointer items-center justify-self-start gap-2.75 border border-transparent bg-surface-raised px-2.5 py-2 text-left text-ink shadow-loadout-card-active transition-colors duration-150 ease-out compact-desktop:max-wide-desktop:min-h-22 compact-desktop:max-wide-desktop:gap-1.75 compact-desktop:max-wide-desktop:px-2 compact-desktop:max-wide-desktop:py-1.5 tablet:max-compact-desktop:order-3 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-1 max-tablet:row-start-3 max-tablet:grid max-tablet:min-h-20.5 max-tablet:w-full max-tablet:max-w-none max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:items-center max-tablet:gap-1.25 max-tablet:px-1.5 max-tablet:py-1.25 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  },
  leggings: {
    default:
      "group group/equipment relative z-10 col-start-1 row-start-4 flex min-h-24 w-full cursor-pointer items-center justify-self-start gap-2.75 border border-transparent bg-surface-deep/65 px-2.5 py-2 text-left text-ink shadow-control transition-colors duration-150 ease-out hover:bg-surface-raised aria-expanded:bg-surface-raised aria-expanded:shadow-loadout-card-active compact-desktop:max-wide-desktop:min-h-22 compact-desktop:max-wide-desktop:gap-1.75 compact-desktop:max-wide-desktop:px-2 compact-desktop:max-wide-desktop:py-1.5 tablet:max-compact-desktop:order-4 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-1 max-tablet:row-start-4 max-tablet:grid max-tablet:min-h-20.5 max-tablet:w-full max-tablet:max-w-none max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:items-center max-tablet:gap-1.25 max-tablet:px-1.5 max-tablet:py-1.25 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
    active:
      "group group/equipment relative z-10 col-start-1 row-start-4 flex min-h-24 w-full cursor-pointer items-center justify-self-start gap-2.75 border border-transparent bg-surface-raised px-2.5 py-2 text-left text-ink shadow-loadout-card-active transition-colors duration-150 ease-out compact-desktop:max-wide-desktop:min-h-22 compact-desktop:max-wide-desktop:gap-1.75 compact-desktop:max-wide-desktop:px-2 compact-desktop:max-wide-desktop:py-1.5 tablet:max-compact-desktop:order-4 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-1 max-tablet:row-start-4 max-tablet:grid max-tablet:min-h-20.5 max-tablet:w-full max-tablet:max-w-none max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:items-center max-tablet:gap-1.25 max-tablet:px-1.5 max-tablet:py-1.25 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  },
  talisman: {
    default:
      "group group/equipment relative z-10 col-start-2 row-start-2 flex min-h-24 w-full cursor-pointer items-center justify-self-end gap-2.75 border border-transparent bg-surface-deep/65 px-2.5 py-2 text-left text-ink shadow-control transition-colors duration-150 ease-out hover:bg-surface-raised aria-expanded:bg-surface-raised aria-expanded:shadow-loadout-card-active compact-desktop:max-wide-desktop:min-h-22 compact-desktop:max-wide-desktop:gap-1.75 compact-desktop:max-wide-desktop:px-2 compact-desktop:max-wide-desktop:py-1.5 tablet:max-compact-desktop:order-5 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-2 max-tablet:row-start-2 max-tablet:grid max-tablet:min-h-20.5 max-tablet:w-full max-tablet:max-w-none max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:items-center max-tablet:gap-1.25 max-tablet:px-1.5 max-tablet:py-1.25 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
    active:
      "group group/equipment relative z-10 col-start-2 row-start-2 flex min-h-24 w-full cursor-pointer items-center justify-self-end gap-2.75 border border-transparent bg-surface-raised px-2.5 py-2 text-left text-ink shadow-loadout-card-active transition-colors duration-150 ease-out compact-desktop:max-wide-desktop:min-h-22 compact-desktop:max-wide-desktop:gap-1.75 compact-desktop:max-wide-desktop:px-2 compact-desktop:max-wide-desktop:py-1.5 tablet:max-compact-desktop:order-5 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-2 max-tablet:row-start-2 max-tablet:grid max-tablet:min-h-20.5 max-tablet:w-full max-tablet:max-w-none max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:items-center max-tablet:gap-1.25 max-tablet:px-1.5 max-tablet:py-1.25 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  },
  "weapon-1": {
    default:
      "group group/equipment relative z-10 col-start-2 row-start-3 flex min-h-24 w-full cursor-pointer flex-col items-center justify-self-end gap-0 border border-transparent bg-surface-deep/65 p-0 text-left text-ink shadow-control transition-colors duration-150 ease-out hover:bg-surface-raised aria-expanded:bg-surface-raised aria-expanded:shadow-loadout-card-active compact-desktop:max-wide-desktop:min-h-22 tablet:max-compact-desktop:order-6 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-2 max-tablet:row-start-3 max-tablet:min-h-0 max-tablet:w-full max-tablet:max-w-none max-tablet:gap-0 max-tablet:p-0 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
    active:
      "group group/equipment relative z-10 col-start-2 row-start-3 flex min-h-24 w-full cursor-pointer flex-col items-center justify-self-end gap-0 border border-transparent bg-surface-raised p-0 text-left text-ink shadow-loadout-card-active transition-colors duration-150 ease-out compact-desktop:max-wide-desktop:min-h-22 tablet:max-compact-desktop:order-6 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-2 max-tablet:row-start-3 max-tablet:min-h-0 max-tablet:w-full max-tablet:max-w-none max-tablet:gap-0 max-tablet:p-0 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  },
  "weapon-2": {
    default:
      "group group/equipment relative z-10 col-start-2 row-start-4 flex min-h-24 w-full cursor-pointer flex-col items-center justify-self-end gap-0 border border-transparent bg-surface-deep/65 p-0 text-left text-ink shadow-control transition-colors duration-150 ease-out hover:bg-surface-raised aria-expanded:bg-surface-raised aria-expanded:shadow-loadout-card-active compact-desktop:max-wide-desktop:min-h-22 tablet:max-compact-desktop:order-7 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-2 max-tablet:row-start-4 max-tablet:min-h-0 max-tablet:w-full max-tablet:max-w-none max-tablet:gap-0 max-tablet:p-0 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
    active:
      "group group/equipment relative z-10 col-start-2 row-start-4 flex min-h-24 w-full cursor-pointer flex-col items-center justify-self-end gap-0 border border-transparent bg-surface-raised p-0 text-left text-ink shadow-loadout-card-active transition-colors duration-150 ease-out compact-desktop:max-wide-desktop:min-h-22 tablet:max-compact-desktop:order-7 tablet:max-compact-desktop:max-w-none max-tablet:inset-auto max-tablet:col-start-2 max-tablet:row-start-4 max-tablet:min-h-0 max-tablet:w-full max-tablet:max-w-none max-tablet:gap-0 max-tablet:p-0 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  },
} as const satisfies Record<
  EquipmentSlotPosition,
  Record<EquipmentSlotVisualState, string>
>;

type EquipmentSlotArtKind = "standard" | "weapon";

export const EQUIPMENT_SLOT_ART_CLASS_NAMES = {
  standard: {
    empty:
      "flex size-19.5 flex-none items-center justify-center overflow-hidden bg-aura-gold compact-desktop:max-wide-desktop:size-16 max-tablet:size-14.5",
    filled:
      "flex size-19.5 flex-none items-center justify-center overflow-hidden bg-aura-gold compact-desktop:max-wide-desktop:size-16 max-tablet:size-14.5",
  },
  weapon: {
    empty:
      "flex size-19.5 flex-none items-center justify-center overflow-hidden bg-aura-gold compact-desktop:max-wide-desktop:size-16 max-tablet:size-14.5 max-tablet:overflow-visible max-tablet:bg-transparent",
    filled:
      "flex size-19.5 flex-none items-center justify-center overflow-hidden bg-aura-gold compact-desktop:max-wide-desktop:size-16 max-tablet:size-14.5 max-tablet:overflow-visible max-tablet:bg-transparent",
  },
} as const satisfies Record<
  EquipmentSlotArtKind,
  Record<EquipmentSlotFillState, string>
>;

export const EQUIPMENT_SLOT_COPY_CLASS_NAME =
  "flex min-w-0 flex-1 flex-col max-tablet:grid max-tablet:grid-cols-[minmax(0,1fr)_auto] max-tablet:grid-rows-[auto_auto] max-tablet:items-center max-tablet:gap-x-0.5";

export const EQUIPMENT_SLOT_LABEL_CLASS_NAME =
  "mb-1 font-sans text-xs font-bold uppercase leading-none tracking-widest text-gold max-tablet:col-start-1 max-tablet:row-start-1 max-tablet:mb-0.75 max-tablet:overflow-hidden max-tablet:text-ellipsis max-tablet:whitespace-nowrap max-tablet:text-3xs max-tablet:tracking-wide";

export const EQUIPMENT_SLOT_NAME_CLASS_NAME =
  "overflow-hidden text-ellipsis whitespace-nowrap font-display text-base font-normal leading-tight text-ink text-shadow-value compact-desktop:max-wide-desktop:text-sm max-tablet:col-start-1 max-tablet:row-start-2 max-tablet:text-xs";

export const EQUIPMENT_SLOT_DEFENSE_STATS_CLASS_NAME =
  "mt-1.5 grid grid-cols-3 gap-1.5 pt-1.25 compact-desktop:max-wide-desktop:gap-1 max-tablet:col-start-2 max-tablet:row-span-2 max-tablet:row-start-1 max-tablet:mt-0 max-tablet:grid-cols-1 max-tablet:gap-0.25 max-tablet:pt-0";

export const EQUIPMENT_SLOT_DEFENSE_STAT_CLASS_NAME =
  "flex min-w-0 items-center gap-0.75 text-ink-soft max-tablet:flex-row max-tablet:justify-end max-tablet:gap-0.5";

export const EQUIPMENT_SLOT_DEFENSE_ICON_CLASS_NAME =
  "size-4 flex-none object-contain saturate-75 brightness-110 max-tablet:size-3.25";

export const EQUIPMENT_SLOT_DEFENSE_VALUE_CLASS_NAME =
  "font-display text-sm font-normal leading-none lining-nums tabular-nums text-gold-pale text-shadow-value max-tablet:text-xs";

export const EQUIPMENT_SLOT_TALISMAN_SUMMARY_CLASS_NAME =
  "flex flex-wrap items-center justify-end gap-1.5 font-sans text-xs font-semibold leading-snug text-gold-pale max-tablet:flex-row max-tablet:gap-1 max-tablet:text-xs max-tablet:leading-none";

export const EQUIPMENT_SLOT_TALISMAN_STAT_CLASS_NAME =
  "inline-flex items-center gap-0.75 font-display text-sm font-normal leading-none lining-nums tabular-nums text-gold-pale max-tablet:gap-0.5 max-tablet:text-xs";

export const EQUIPMENT_SLOT_TALISMAN_STAT_ICON_FRAME_CLASS_NAME =
  "inline-flex size-5 items-center justify-center rounded-full border border-frame-line/35 bg-surface-deep/55 max-tablet:size-4";

export const EQUIPMENT_SLOT_TALISMAN_STAT_ICON_CLASS_NAME =
  "size-3.5 object-contain saturate-125 brightness-125 drop-shadow-sm max-tablet:size-3";

export const EQUIPMENT_SLOT_TALISMAN_STAT_FALLBACK_CLASS_NAME =
  "inline-flex size-5 items-center justify-center rounded-full border border-frame-line/35 bg-surface-deep/55 font-sans text-3xs font-bold text-ink-soft max-tablet:size-4";

export const EQUIPMENT_SLOT_TALISMAN_STAT_VALUE_CLASS_NAME =
  "font-display font-normal leading-none text-inherit";

export const EQUIPMENT_SLOT_STANDARD_BOTTOM_PADDING_CLASS_NAME =
  "pb-9.5 compact-desktop:max-wide-desktop:pb-8 max-tablet:pb-8";

export const EQUIPMENT_SLOT_STANDARD_FOOTER_CLASS_NAMES = {
  requirement:
    "absolute inset-x-0 bottom-0 flex min-h-8.5 items-center justify-start px-2 py-1 compact-desktop:max-wide-desktop:min-h-7 compact-desktop:max-wide-desktop:px-1.5 compact-desktop:max-wide-desktop:py-0.75 max-tablet:min-h-8 max-tablet:px-2 max-tablet:py-1",
  talisman:
    "absolute inset-x-0 bottom-0 flex min-h-8.5 items-center justify-end px-2 py-1 compact-desktop:max-wide-desktop:min-h-7 compact-desktop:max-wide-desktop:px-1.5 compact-desktop:max-wide-desktop:py-0.75 max-tablet:min-h-8 max-tablet:px-2 max-tablet:py-1",
} as const satisfies Record<"requirement" | "talisman", string>;

export const EQUIPMENT_SLOT_REQUIREMENT_EMPTY_CLASS_NAME =
  "font-sans text-xs font-semibold text-ink-faint";

export const EQUIPMENT_SLOT_WEAPON_MAIN_CLASS_NAME =
  "flex min-h-18 w-full cursor-pointer items-center gap-2.75 border-0 bg-transparent pt-1.75 pr-2.25 pb-0.75 pl-2.25 text-left text-inherit transition-colors duration-150 ease-out hover:bg-gold/5 compact-desktop:flex-1 compact-desktop:max-wide-desktop:min-h-14.5 compact-desktop:max-wide-desktop:gap-1.75 compact-desktop:max-wide-desktop:pt-1 compact-desktop:max-wide-desktop:pr-1.5 compact-desktop:max-wide-desktop:pb-0.5 compact-desktop:max-wide-desktop:pl-1.5 max-tablet:grid max-tablet:min-h-14.5 max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:items-center max-tablet:gap-1.25 max-tablet:overflow-visible max-tablet:px-1.25 max-tablet:py-0.75 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";

export const EQUIPMENT_SLOT_WEAPON_SUMMARY_DEFAULT_CLASS_NAME =
  "mt-1 font-sans text-xs font-semibold leading-snug text-ink-soft max-tablet:hidden";

export const EQUIPMENT_SLOT_WEAPON_SUMMARY_MOBILE_CLASS_NAME =
  "hidden font-sans font-medium text-ink-soft max-tablet:col-start-2 max-tablet:row-span-2 max-tablet:row-start-1 max-tablet:flex max-tablet:flex-col max-tablet:items-end max-tablet:gap-0.25 max-tablet:whitespace-nowrap max-tablet:text-right max-tablet:text-2xs max-tablet:leading-tight";

export const EQUIPMENT_SLOT_ENCHANTMENT_STRIP_CLASS_NAME =
  "relative flex min-h-8.5 w-full items-center justify-end gap-1 pt-0.75 pr-2 pb-1.25 pl-2 compact-desktop:max-wide-desktop:min-h-7 compact-desktop:max-wide-desktop:pt-0.5 compact-desktop:max-wide-desktop:pr-1.5 compact-desktop:max-wide-desktop:pb-1 compact-desktop:max-wide-desktop:pl-1.5 max-tablet:min-h-8 max-tablet:justify-end max-tablet:gap-1 max-tablet:px-2 max-tablet:py-1";

export const EQUIPMENT_SLOT_ENCHANTMENT_REQUIREMENT_CLASS_NAME =
  "absolute top-1/2 left-1 z-10 inline-flex max-w-[calc(100%-8.5rem)] -translate-y-1/2 cursor-pointer appearance-none items-center overflow-hidden border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:left-0.75 max-tablet:left-0.75 max-tablet:max-w-[calc(100%-8rem)] max-narrow:top-0 max-narrow:-translate-y-full";

type EnchantmentSocketKind = "rune" | "totem";
type EnchantmentSocketVirtue = VirtueId | "neutral";
type EnchantmentSocketLockState = "unlocked" | "locked";

export const ENCHANTMENT_SOCKET_CLASS_NAMES = {
  rune: {
    neutral: {
      unlocked:
        "mr-0.75 flex size-7.75 cursor-pointer items-center justify-center border border-frame-line/42 bg-surface-deep/70 p-0 text-ink-faint shadow-control transition-colors duration-150 ease-out hover:border-frame-line-bright/80 hover:bg-gold/8 hover:text-gold-bright focus-visible:border-frame-line-bright focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-7 max-tablet:size-6.75 motion-reduce:transition-none",
      locked:
        "mr-0.75 flex size-7.75 cursor-not-allowed items-center justify-center border border-frame-line/30 bg-surface-deep/70 p-0 text-ink-faint opacity-35 shadow-control focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-7 max-tablet:size-6.75",
    },
    courage: {
      unlocked:
        "mr-0.75 flex size-7.75 cursor-pointer items-center justify-center border border-ember/80 bg-surface-deep/70 p-0 text-ink-faint shadow-control transition-colors duration-150 ease-out hover:border-ember hover:bg-ember/8 hover:text-gold-bright focus-visible:border-ember focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-7 max-tablet:size-6.75 motion-reduce:transition-none",
      locked:
        "mr-0.75 flex size-7.75 cursor-not-allowed items-center justify-center border border-ember/55 bg-surface-deep/70 p-0 text-ink-faint opacity-35 shadow-control focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-7 max-tablet:size-6.75",
    },
    spirit: {
      unlocked:
        "mr-0.75 flex size-7.75 cursor-pointer items-center justify-center border border-aether/80 bg-surface-deep/70 p-0 text-ink-faint shadow-control transition-colors duration-150 ease-out hover:border-aether hover:bg-aether/8 hover:text-gold-bright focus-visible:border-aether focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-7 max-tablet:size-6.75 motion-reduce:transition-none",
      locked:
        "mr-0.75 flex size-7.75 cursor-not-allowed items-center justify-center border border-aether/55 bg-surface-deep/70 p-0 text-ink-faint opacity-35 shadow-control focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-7 max-tablet:size-6.75",
    },
    grace: {
      unlocked:
        "mr-0.75 flex size-7.75 cursor-pointer items-center justify-center border border-verdant/80 bg-surface-deep/70 p-0 text-ink-faint shadow-control transition-colors duration-150 ease-out hover:border-verdant hover:bg-verdant/8 hover:text-gold-bright focus-visible:border-verdant focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-7 max-tablet:size-6.75 motion-reduce:transition-none",
      locked:
        "mr-0.75 flex size-7.75 cursor-not-allowed items-center justify-center border border-verdant/55 bg-surface-deep/70 p-0 text-ink-faint opacity-35 shadow-control focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-7 max-tablet:size-6.75",
    },
  },
  totem: {
    neutral: {
      unlocked:
        "flex size-6.75 cursor-pointer items-center justify-center border border-frame-line/42 bg-surface-deep/70 p-0 text-ink-faint shadow-control transition-colors duration-150 ease-out hover:border-frame-line-bright/80 hover:bg-gold/8 hover:text-gold-bright focus-visible:border-frame-line-bright focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-6 max-tablet:size-6 motion-reduce:transition-none",
      locked:
        "flex size-6.75 cursor-not-allowed items-center justify-center border border-frame-line/30 bg-surface-deep/70 p-0 text-ink-faint opacity-35 shadow-control focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-6 max-tablet:size-6",
    },
    courage: {
      unlocked:
        "flex size-6.75 cursor-pointer items-center justify-center border border-ember/80 bg-surface-deep/70 p-0 text-ink-faint shadow-control transition-colors duration-150 ease-out hover:border-ember hover:bg-ember/8 hover:text-gold-bright focus-visible:border-ember focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-6 max-tablet:size-6 motion-reduce:transition-none",
      locked:
        "flex size-6.75 cursor-not-allowed items-center justify-center border border-ember/55 bg-surface-deep/70 p-0 text-ink-faint opacity-35 shadow-control focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-6 max-tablet:size-6",
    },
    spirit: {
      unlocked:
        "flex size-6.75 cursor-pointer items-center justify-center border border-aether/80 bg-surface-deep/70 p-0 text-ink-faint shadow-control transition-colors duration-150 ease-out hover:border-aether hover:bg-aether/8 hover:text-gold-bright focus-visible:border-aether focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-6 max-tablet:size-6 motion-reduce:transition-none",
      locked:
        "flex size-6.75 cursor-not-allowed items-center justify-center border border-aether/55 bg-surface-deep/70 p-0 text-ink-faint opacity-35 shadow-control focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-6 max-tablet:size-6",
    },
    grace: {
      unlocked:
        "flex size-6.75 cursor-pointer items-center justify-center border border-verdant/80 bg-surface-deep/70 p-0 text-ink-faint shadow-control transition-colors duration-150 ease-out hover:border-verdant hover:bg-verdant/8 hover:text-gold-bright focus-visible:border-verdant focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-6 max-tablet:size-6 motion-reduce:transition-none",
      locked:
        "flex size-6.75 cursor-not-allowed items-center justify-center border border-verdant/55 bg-surface-deep/70 p-0 text-ink-faint opacity-35 shadow-control focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:size-6 max-tablet:size-6",
    },
  },
} as const satisfies Record<
  EnchantmentSocketKind,
  Record<
    EnchantmentSocketVirtue,
    Record<EnchantmentSocketLockState, string>
  >
>;

export const ENCHANTMENT_SOCKET_IMAGE_CLASS_NAMES = {
  rune: {
    empty: "pointer-events-none size-6.25 object-contain drop-shadow-art",
    filled:
      "pointer-events-none size-6.25 object-contain drop-shadow-art",
  },
  totem: {
    empty: "pointer-events-none size-6.25 object-contain drop-shadow-art",
    filled:
      "pointer-events-none size-6.25 object-contain drop-shadow-art",
  },
} as const satisfies Record<
  EnchantmentSocketKind,
  Record<EquipmentSlotFillState, string>
>;

export const ENCHANTMENT_SOCKET_FALLBACK_CLASS_NAMES = {
  rune: {
    empty: "pointer-events-none text-inherit",
    filled: "pointer-events-none text-inherit",
  },
  totem: {
    empty: "pointer-events-none text-inherit",
    filled: "pointer-events-none text-inherit",
  },
} as const satisfies Record<
  EnchantmentSocketKind,
  Record<EquipmentSlotFillState, string>
>;
