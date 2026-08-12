import type { VirtueId } from "@/src/domain/types";

export type WeaponLoadoutLayout = "default" | "inline" | "publisher";
export type LoadoutActivity = "inactive" | "active";
export type LoadoutSegmentState =
  | "inactiveEmptyUnlocked"
  | "inactiveEmptyLocked"
  | "inactiveFilledUnlocked"
  | "inactiveFilledLocked"
  | "activeEmptyUnlocked"
  | "activeEmptyLocked"
  | "activeFilledUnlocked"
  | "activeFilledLocked";
export type LoadoutArtState =
  | "inactiveNeutral"
  | "inactiveCourage"
  | "inactiveSpirit"
  | "inactiveGrace"
  | "activeNeutral"
  | "activeCourage"
  | "activeSpirit"
  | "activeGrace";

type LoadoutElement = "activeGlow" | "connectorIcon";
type CopyKind = "primary" | "totem";

export function getLoadoutSegmentState(
  isActive: boolean,
  isFilled: boolean,
  isLocked: boolean,
): LoadoutSegmentState {
  if (isActive) {
    if (isFilled) {
      return isLocked ? "activeFilledLocked" : "activeFilledUnlocked";
    }
    return isLocked ? "activeEmptyLocked" : "activeEmptyUnlocked";
  }
  if (isFilled) {
    return isLocked ? "inactiveFilledLocked" : "inactiveFilledUnlocked";
  }
  return isLocked ? "inactiveEmptyLocked" : "inactiveEmptyUnlocked";
}

export function getLoadoutArtState(
  isActive: boolean,
  virtue: VirtueId | null,
): LoadoutArtState {
  if (isActive) {
    if (virtue === "courage") return "activeCourage";
    if (virtue === "spirit") return "activeSpirit";
    if (virtue === "grace") return "activeGrace";
    return "activeNeutral";
  }
  if (virtue === "courage") return "inactiveCourage";
  if (virtue === "spirit") return "inactiveSpirit";
  if (virtue === "grace") return "inactiveGrace";
  return "inactiveNeutral";
}

export const WEAPON_LOADOUT_ROOT_CLASS_NAMES = {
  default:
    "border-y border-frame-line/38 bg-hud-track px-6 pt-2.5 pb-3 shadow-loadout-card",
  inline:
    "col-span-8 min-w-0 border-0 bg-transparent p-0 max-tablet:col-span-full max-tablet:row-start-2 max-tablet:w-full max-tablet:overflow-visible",
  publisher: "min-w-0 border-0 bg-transparent p-0",
} as const satisfies Record<WeaponLoadoutLayout, string>;

export const WEAPON_LOADOUT_TRACK_CLASS_NAMES = {
  default:
    "grid min-w-0 grid-cols-weapon-loadout items-stretch gap-1.5 max-tablet:flex max-tablet:overflow-x-auto max-tablet:pb-1",
  inline:
    "flex w-full min-w-0 items-center gap-1 max-tablet:grid max-tablet:grid-cols-6 max-tablet:gap-1",
  publisher:
    "grid w-full min-w-0 grid-cols-6 items-stretch gap-1 mobile-wide:grid-cols-3 tablet:grid-cols-5",
} as const satisfies Record<WeaponLoadoutLayout, string>;

export const LOADOUT_HUD_CONNECTOR_CLASS_NAMES = {
  default:
    "flex flex-none basis-4 items-center justify-center text-frame-line/55",
  inline:
    "flex grow-0 shrink-0 basis-2.75 items-center justify-center text-frame-line/55 max-tablet:hidden",
  publisher: "hidden",
} as const satisfies Record<WeaponLoadoutLayout, string>;

export const LOADOUT_HUD_TOTEMS_CLASS_NAMES = {
  default:
    "grid min-w-0 grid-cols-4 gap-1.25",
  inline:
    "grid flex-none grid-cols-4 gap-1.25 max-tablet:col-span-4 max-tablet:grid-cols-4 max-tablet:gap-1",
  publisher:
    "col-span-4 grid min-w-0 grid-cols-4 gap-1 mobile-wide:col-span-2 mobile-wide:grid-cols-2 tablet:col-span-4 tablet:grid-cols-4",
} as const satisfies Record<WeaponLoadoutLayout, string>;

const LOADOUT_HUD_WEAPON_DEFAULT_INACTIVE_CLASS_NAME =
  "relative flex min-h-15 min-w-0 cursor-pointer items-center gap-2 overflow-visible rounded-full border border-frame-line/22 bg-surface-deep/25 px-2 py-1.25 text-left text-ink transition-colors duration-150 ease-out hover:border-frame-line/45 hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_WEAPON_DEFAULT_ACTIVE_CLASS_NAME =
  "relative flex min-h-15 min-w-0 cursor-pointer items-center gap-2 overflow-visible rounded-full border border-frame-line-bright/48 bg-gold/7 px-2 py-1.25 text-left text-gold-pale shadow-control-active transition-colors duration-150 ease-out hover:border-frame-line-bright/70 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_WEAPON_INLINE_INACTIVE_CLASS_NAME =
  "relative flex min-h-13.5 w-max min-w-0 max-w-47.5 grow-0 shrink basis-auto cursor-pointer items-center gap-3 overflow-visible bg-transparent px-1.5 py-1 text-left text-ink transition-colors duration-150 ease-out hover:text-gold-pale disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 max-tablet:min-h-11 max-tablet:w-full max-tablet:max-w-none max-tablet:justify-center max-tablet:p-0.5 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_WEAPON_INLINE_ACTIVE_CLASS_NAME =
  "relative flex min-h-13.5 w-max min-w-0 max-w-47.5 grow-0 shrink basis-auto cursor-pointer items-center gap-3 overflow-visible bg-transparent px-1.5 py-1 text-left text-gold-pale transition-colors duration-150 ease-out hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 max-tablet:min-h-11 max-tablet:w-full max-tablet:max-w-none max-tablet:justify-center max-tablet:p-0.5 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_WEAPON_PUBLISHER_INACTIVE_CLASS_NAME =
  "relative col-span-1 flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-center overflow-visible bg-transparent p-0.5 text-left text-ink transition-colors duration-150 ease-out hover:text-gold-pale disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 mobile-wide:col-span-3 mobile-wide:min-h-18 mobile-wide:justify-start mobile-wide:gap-3 mobile-wide:rounded-sm mobile-wide:border mobile-wide:border-line/40 mobile-wide:bg-control/35 mobile-wide:px-3 mobile-wide:py-2 mobile-wide:hover:border-line-bright/55 mobile-wide:hover:bg-surface-raised/65 tablet:col-span-5 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_WEAPON_PUBLISHER_ACTIVE_CLASS_NAME =
  "relative col-span-1 flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-center overflow-visible bg-transparent p-0.5 text-left text-gold-pale transition-colors duration-150 ease-out hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 mobile-wide:col-span-3 mobile-wide:min-h-18 mobile-wide:justify-start mobile-wide:gap-3 mobile-wide:rounded-sm mobile-wide:border mobile-wide:border-gold/55 mobile-wide:bg-gold/7 mobile-wide:px-3 mobile-wide:py-2 mobile-wide:shadow-control-active mobile-wide:hover:border-gold-bright/70 tablet:col-span-5 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";

export const LOADOUT_HUD_WEAPON_SEGMENT_CLASS_NAMES = {
  default: {
    inactive: LOADOUT_HUD_WEAPON_DEFAULT_INACTIVE_CLASS_NAME,
    active: LOADOUT_HUD_WEAPON_DEFAULT_ACTIVE_CLASS_NAME,
  },
  inline: {
    inactive: LOADOUT_HUD_WEAPON_INLINE_INACTIVE_CLASS_NAME,
    active: LOADOUT_HUD_WEAPON_INLINE_ACTIVE_CLASS_NAME,
  },
  publisher: {
    inactive: LOADOUT_HUD_WEAPON_PUBLISHER_INACTIVE_CLASS_NAME,
    active: LOADOUT_HUD_WEAPON_PUBLISHER_ACTIVE_CLASS_NAME,
  },
} as const satisfies Record<
  WeaponLoadoutLayout,
  Record<LoadoutActivity, string>
>;

const LOADOUT_HUD_RUNE_DEFAULT_INACTIVE_CLASS_NAME =
  "relative flex min-h-15 min-w-0 cursor-pointer items-center gap-2 overflow-visible rounded-full border border-frame-line/22 bg-surface-deep/25 px-2 py-1.25 text-left text-ink transition-colors duration-150 ease-out hover:border-frame-line/45 hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_RUNE_DEFAULT_ACTIVE_CLASS_NAME =
  "relative flex min-h-15 min-w-0 cursor-pointer items-center gap-2 overflow-visible rounded-full border border-frame-line-bright/48 bg-gold/7 px-2 py-1.25 text-left text-gold-pale shadow-control-active transition-colors duration-150 ease-out hover:border-frame-line-bright/70 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_RUNE_INLINE_INACTIVE_CLASS_NAME =
  "relative flex min-h-13.5 w-max min-w-0 max-w-36.25 grow-0 shrink basis-auto cursor-pointer items-center gap-3 overflow-visible bg-transparent px-1.5 py-1 text-left text-ink transition-colors duration-150 ease-out hover:text-gold-pale disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 max-tablet:min-h-11 max-tablet:w-full max-tablet:max-w-none max-tablet:justify-center max-tablet:p-0.5 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_RUNE_INLINE_ACTIVE_CLASS_NAME =
  "relative flex min-h-13.5 w-max min-w-0 max-w-36.25 grow-0 shrink basis-auto cursor-pointer items-center gap-3 overflow-visible bg-transparent px-1.5 py-1 text-left text-gold-pale transition-colors duration-150 ease-out hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 max-tablet:min-h-11 max-tablet:w-full max-tablet:max-w-none max-tablet:justify-center max-tablet:p-0.5 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_RUNE_PUBLISHER_INACTIVE_CLASS_NAME =
  "relative flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-center overflow-visible bg-transparent p-0.5 text-left text-ink transition-colors duration-150 ease-out hover:text-gold-pale disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 mobile-wide:rounded-sm mobile-wide:border mobile-wide:border-line/30 mobile-wide:bg-surface-deep/45 mobile-wide:hover:border-line-bright/50 mobile-wide:hover:bg-surface-raised/65 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_RUNE_PUBLISHER_ACTIVE_CLASS_NAME =
  "relative flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-center overflow-visible bg-transparent p-0.5 text-left text-gold-pale transition-colors duration-150 ease-out hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 mobile-wide:rounded-sm mobile-wide:border mobile-wide:border-gold/50 mobile-wide:bg-gold/7 mobile-wide:shadow-control-active mobile-wide:hover:border-gold-bright/70 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";

export const LOADOUT_HUD_RUNE_SEGMENT_CLASS_NAMES = {
  default: {
    inactiveEmptyUnlocked: LOADOUT_HUD_RUNE_DEFAULT_INACTIVE_CLASS_NAME,
    inactiveEmptyLocked: LOADOUT_HUD_RUNE_DEFAULT_INACTIVE_CLASS_NAME,
    inactiveFilledUnlocked: LOADOUT_HUD_RUNE_DEFAULT_INACTIVE_CLASS_NAME,
    inactiveFilledLocked: LOADOUT_HUD_RUNE_DEFAULT_INACTIVE_CLASS_NAME,
    activeEmptyUnlocked: LOADOUT_HUD_RUNE_DEFAULT_ACTIVE_CLASS_NAME,
    activeEmptyLocked: LOADOUT_HUD_RUNE_DEFAULT_ACTIVE_CLASS_NAME,
    activeFilledUnlocked: LOADOUT_HUD_RUNE_DEFAULT_ACTIVE_CLASS_NAME,
    activeFilledLocked: LOADOUT_HUD_RUNE_DEFAULT_ACTIVE_CLASS_NAME,
  },
  inline: {
    inactiveEmptyUnlocked: LOADOUT_HUD_RUNE_INLINE_INACTIVE_CLASS_NAME,
    inactiveEmptyLocked: LOADOUT_HUD_RUNE_INLINE_INACTIVE_CLASS_NAME,
    inactiveFilledUnlocked: LOADOUT_HUD_RUNE_INLINE_INACTIVE_CLASS_NAME,
    inactiveFilledLocked: LOADOUT_HUD_RUNE_INLINE_INACTIVE_CLASS_NAME,
    activeEmptyUnlocked: LOADOUT_HUD_RUNE_INLINE_ACTIVE_CLASS_NAME,
    activeEmptyLocked: LOADOUT_HUD_RUNE_INLINE_ACTIVE_CLASS_NAME,
    activeFilledUnlocked: LOADOUT_HUD_RUNE_INLINE_ACTIVE_CLASS_NAME,
    activeFilledLocked: LOADOUT_HUD_RUNE_INLINE_ACTIVE_CLASS_NAME,
  },
  publisher: {
    inactiveEmptyUnlocked: LOADOUT_HUD_RUNE_PUBLISHER_INACTIVE_CLASS_NAME,
    inactiveEmptyLocked: LOADOUT_HUD_RUNE_PUBLISHER_INACTIVE_CLASS_NAME,
    inactiveFilledUnlocked: LOADOUT_HUD_RUNE_PUBLISHER_INACTIVE_CLASS_NAME,
    inactiveFilledLocked: LOADOUT_HUD_RUNE_PUBLISHER_INACTIVE_CLASS_NAME,
    activeEmptyUnlocked: LOADOUT_HUD_RUNE_PUBLISHER_ACTIVE_CLASS_NAME,
    activeEmptyLocked: LOADOUT_HUD_RUNE_PUBLISHER_ACTIVE_CLASS_NAME,
    activeFilledUnlocked: LOADOUT_HUD_RUNE_PUBLISHER_ACTIVE_CLASS_NAME,
    activeFilledLocked: LOADOUT_HUD_RUNE_PUBLISHER_ACTIVE_CLASS_NAME,
  },
} as const satisfies Record<
  WeaponLoadoutLayout,
  Record<LoadoutSegmentState, string>
>;

const LOADOUT_HUD_TOTEM_DEFAULT_INACTIVE_CLASS_NAME =
  "relative flex min-h-15 min-w-0 cursor-pointer items-center gap-1 overflow-hidden rounded-full border border-frame-line/20 bg-surface-deep/22 px-1 py-1.25 text-left text-ink transition-colors duration-150 ease-out hover:border-frame-line/45 hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_TOTEM_DEFAULT_ACTIVE_CLASS_NAME =
  "relative flex min-h-15 min-w-0 cursor-pointer items-center gap-1 overflow-hidden rounded-full border border-frame-line-bright/45 bg-gold/7 px-1 py-1.25 text-left text-gold-pale shadow-control-active transition-colors duration-150 ease-out hover:border-frame-line-bright/70 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_TOTEM_INLINE_INACTIVE_CLASS_NAME =
  "relative flex aspect-square min-h-0 w-11.5 cursor-pointer items-center justify-center justify-self-center overflow-visible bg-transparent p-0.75 text-left text-ink transition-colors duration-150 ease-out hover:text-gold-pale disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 max-tablet:w-10.5 max-tablet:p-0.5 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_TOTEM_INLINE_ACTIVE_CLASS_NAME =
  "relative flex aspect-square min-h-0 w-11.5 cursor-pointer items-center justify-center justify-self-center overflow-visible bg-transparent p-0.75 text-left text-gold-pale transition-colors duration-150 ease-out hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 max-tablet:w-10.5 max-tablet:p-0.5 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_TOTEM_PUBLISHER_INACTIVE_CLASS_NAME =
  "relative flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-center overflow-visible bg-transparent p-0.5 text-left text-ink transition-colors duration-150 ease-out hover:text-gold-pale disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 mobile-wide:rounded-sm mobile-wide:border mobile-wide:border-line/30 mobile-wide:bg-surface-deep/45 mobile-wide:hover:border-line-bright/50 mobile-wide:hover:bg-surface-raised/65 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";
const LOADOUT_HUD_TOTEM_PUBLISHER_ACTIVE_CLASS_NAME =
  "relative flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-center overflow-visible bg-transparent p-0.5 text-left text-gold-pale transition-colors duration-150 ease-out hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-45 mobile-wide:rounded-sm mobile-wide:border mobile-wide:border-gold/50 mobile-wide:bg-gold/7 mobile-wide:shadow-control-active mobile-wide:hover:border-gold-bright/70 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";

export const LOADOUT_HUD_TOTEM_SEGMENT_CLASS_NAMES = {
  default: {
    inactiveEmptyUnlocked: LOADOUT_HUD_TOTEM_DEFAULT_INACTIVE_CLASS_NAME,
    inactiveEmptyLocked: LOADOUT_HUD_TOTEM_DEFAULT_INACTIVE_CLASS_NAME,
    inactiveFilledUnlocked: LOADOUT_HUD_TOTEM_DEFAULT_INACTIVE_CLASS_NAME,
    inactiveFilledLocked: LOADOUT_HUD_TOTEM_DEFAULT_INACTIVE_CLASS_NAME,
    activeEmptyUnlocked: LOADOUT_HUD_TOTEM_DEFAULT_ACTIVE_CLASS_NAME,
    activeEmptyLocked: LOADOUT_HUD_TOTEM_DEFAULT_ACTIVE_CLASS_NAME,
    activeFilledUnlocked: LOADOUT_HUD_TOTEM_DEFAULT_ACTIVE_CLASS_NAME,
    activeFilledLocked: LOADOUT_HUD_TOTEM_DEFAULT_ACTIVE_CLASS_NAME,
  },
  inline: {
    inactiveEmptyUnlocked: LOADOUT_HUD_TOTEM_INLINE_INACTIVE_CLASS_NAME,
    inactiveEmptyLocked: LOADOUT_HUD_TOTEM_INLINE_INACTIVE_CLASS_NAME,
    inactiveFilledUnlocked: LOADOUT_HUD_TOTEM_INLINE_INACTIVE_CLASS_NAME,
    inactiveFilledLocked: LOADOUT_HUD_TOTEM_INLINE_INACTIVE_CLASS_NAME,
    activeEmptyUnlocked: LOADOUT_HUD_TOTEM_INLINE_ACTIVE_CLASS_NAME,
    activeEmptyLocked: LOADOUT_HUD_TOTEM_INLINE_ACTIVE_CLASS_NAME,
    activeFilledUnlocked: LOADOUT_HUD_TOTEM_INLINE_ACTIVE_CLASS_NAME,
    activeFilledLocked: LOADOUT_HUD_TOTEM_INLINE_ACTIVE_CLASS_NAME,
  },
  publisher: {
    inactiveEmptyUnlocked: LOADOUT_HUD_TOTEM_PUBLISHER_INACTIVE_CLASS_NAME,
    inactiveEmptyLocked: LOADOUT_HUD_TOTEM_PUBLISHER_INACTIVE_CLASS_NAME,
    inactiveFilledUnlocked: LOADOUT_HUD_TOTEM_PUBLISHER_INACTIVE_CLASS_NAME,
    inactiveFilledLocked: LOADOUT_HUD_TOTEM_PUBLISHER_INACTIVE_CLASS_NAME,
    activeEmptyUnlocked: LOADOUT_HUD_TOTEM_PUBLISHER_ACTIVE_CLASS_NAME,
    activeEmptyLocked: LOADOUT_HUD_TOTEM_PUBLISHER_ACTIVE_CLASS_NAME,
    activeFilledUnlocked: LOADOUT_HUD_TOTEM_PUBLISHER_ACTIVE_CLASS_NAME,
    activeFilledLocked: LOADOUT_HUD_TOTEM_PUBLISHER_ACTIVE_CLASS_NAME,
  },
} as const satisfies Record<
  WeaponLoadoutLayout,
  Record<LoadoutSegmentState, string>
>;

const LOADOUT_HUD_ART_DEFAULT_WEAPON_INACTIVE_CLASS_NAME =
  "flex size-11 basis-11 items-center justify-center overflow-visible rounded-full border border-frame-line/38 bg-aura-gold font-display text-gold shadow-control";
const LOADOUT_HUD_ART_DEFAULT_WEAPON_ACTIVE_CLASS_NAME =
  "relative isolate flex size-11 basis-11 items-center justify-center overflow-visible rounded-full border border-frame-line-bright/65 bg-aura-gold font-display text-gold-pale shadow-control-active";
const LOADOUT_HUD_ART_INLINE_WEAPON_INACTIVE_CLASS_NAME =
  "flex size-10 basis-10 items-center justify-center overflow-visible rounded-full border border-frame-line/35 bg-aura-gold font-display text-gold shadow-control max-tablet:size-9";
const LOADOUT_HUD_ART_INLINE_WEAPON_ACTIVE_CLASS_NAME =
  "relative isolate flex size-10 basis-10 items-center justify-center overflow-visible rounded-full border border-frame-line-bright/62 bg-aura-gold font-display text-gold-pale shadow-control-active max-tablet:size-9";
const LOADOUT_HUD_ART_PUBLISHER_WEAPON_INACTIVE_CLASS_NAME =
  "flex size-9 basis-9 items-center justify-center overflow-visible rounded-full border border-frame-line/35 bg-aura-gold font-display text-gold shadow-control mobile-wide:size-13 mobile-wide:basis-13";
const LOADOUT_HUD_ART_PUBLISHER_WEAPON_ACTIVE_CLASS_NAME =
  "relative isolate flex size-9 basis-9 items-center justify-center overflow-visible rounded-full border border-frame-line-bright/62 bg-aura-gold font-display text-gold-pale shadow-control-active mobile-wide:size-13 mobile-wide:basis-13";

const LOADOUT_HUD_ART_DEFAULT_NEUTRAL_CLASS_NAME =
  "flex size-10.5 items-center justify-center overflow-visible rounded-full border border-frame-line/35 bg-surface-deep/55 bg-aura-gold font-display text-gold shadow-control";
const LOADOUT_HUD_ART_DEFAULT_COURAGE_CLASS_NAME =
  "flex size-10.5 items-center justify-center overflow-visible rounded-full border border-ember/75 bg-surface-deep/55 bg-aura-gold font-display text-gold shadow-control";
const LOADOUT_HUD_ART_DEFAULT_SPIRIT_CLASS_NAME =
  "flex size-10.5 items-center justify-center overflow-visible rounded-full border border-aether/75 bg-surface-deep/55 bg-aura-gold font-display text-gold shadow-control";
const LOADOUT_HUD_ART_DEFAULT_GRACE_CLASS_NAME =
  "flex size-10.5 items-center justify-center overflow-visible rounded-full border border-verdant/75 bg-surface-deep/55 bg-aura-gold font-display text-gold shadow-control";
const LOADOUT_HUD_ART_DEFAULT_ACTIVE_NEUTRAL_CLASS_NAME =
  "relative isolate flex size-10.5 items-center justify-center overflow-visible rounded-full border border-frame-line-bright/65 bg-surface-deep/55 bg-aura-gold font-display text-gold-pale shadow-control-active";
const LOADOUT_HUD_ART_DEFAULT_ACTIVE_COURAGE_CLASS_NAME =
  "relative isolate flex size-10.5 items-center justify-center overflow-visible rounded-full border border-ember bg-surface-deep/55 bg-aura-gold font-display text-gold-pale shadow-control-active";
const LOADOUT_HUD_ART_DEFAULT_ACTIVE_SPIRIT_CLASS_NAME =
  "relative isolate flex size-10.5 items-center justify-center overflow-visible rounded-full border border-aether bg-surface-deep/55 bg-aura-gold font-display text-gold-pale shadow-control-active";
const LOADOUT_HUD_ART_DEFAULT_ACTIVE_GRACE_CLASS_NAME =
  "relative isolate flex size-10.5 items-center justify-center overflow-visible rounded-full border border-verdant bg-surface-deep/55 bg-aura-gold font-display text-gold-pale shadow-control-active";

const LOADOUT_HUD_ART_INLINE_NEUTRAL_CLASS_NAME =
  "flex size-9.5 items-center justify-center overflow-visible rounded-full border border-frame-line/35 bg-surface-deep/55 bg-aura-gold font-display text-gold shadow-control max-tablet:size-9";
const LOADOUT_HUD_ART_INLINE_COURAGE_CLASS_NAME =
  "flex size-9.5 items-center justify-center overflow-visible rounded-full border border-ember/75 bg-surface-deep/55 bg-aura-gold font-display text-gold shadow-control max-tablet:size-9";
const LOADOUT_HUD_ART_INLINE_SPIRIT_CLASS_NAME =
  "flex size-9.5 items-center justify-center overflow-visible rounded-full border border-aether/75 bg-surface-deep/55 bg-aura-gold font-display text-gold shadow-control max-tablet:size-9";
const LOADOUT_HUD_ART_INLINE_GRACE_CLASS_NAME =
  "flex size-9.5 items-center justify-center overflow-visible rounded-full border border-verdant/75 bg-surface-deep/55 bg-aura-gold font-display text-gold shadow-control max-tablet:size-9";
const LOADOUT_HUD_ART_INLINE_ACTIVE_NEUTRAL_CLASS_NAME =
  "relative isolate flex size-9.5 items-center justify-center overflow-visible rounded-full border border-frame-line-bright/65 bg-surface-deep/55 bg-aura-gold font-display text-gold-pale shadow-control-active max-tablet:size-9";
const LOADOUT_HUD_ART_INLINE_ACTIVE_COURAGE_CLASS_NAME =
  "relative isolate flex size-9.5 items-center justify-center overflow-visible rounded-full border border-ember bg-surface-deep/55 bg-aura-gold font-display text-gold-pale shadow-control-active max-tablet:size-9";
const LOADOUT_HUD_ART_INLINE_ACTIVE_SPIRIT_CLASS_NAME =
  "relative isolate flex size-9.5 items-center justify-center overflow-visible rounded-full border border-aether bg-surface-deep/55 bg-aura-gold font-display text-gold-pale shadow-control-active max-tablet:size-9";
const LOADOUT_HUD_ART_INLINE_ACTIVE_GRACE_CLASS_NAME =
  "relative isolate flex size-9.5 items-center justify-center overflow-visible rounded-full border border-verdant bg-surface-deep/55 bg-aura-gold font-display text-gold-pale shadow-control-active max-tablet:size-9";

export const LOADOUT_HUD_ART_CLASS_NAMES = {
  default: {
    weapon: {
      inactive: LOADOUT_HUD_ART_DEFAULT_WEAPON_INACTIVE_CLASS_NAME,
      active: LOADOUT_HUD_ART_DEFAULT_WEAPON_ACTIVE_CLASS_NAME,
    },
    supporting: {
      inactiveNeutral: LOADOUT_HUD_ART_DEFAULT_NEUTRAL_CLASS_NAME,
      inactiveCourage: LOADOUT_HUD_ART_DEFAULT_COURAGE_CLASS_NAME,
      inactiveSpirit: LOADOUT_HUD_ART_DEFAULT_SPIRIT_CLASS_NAME,
      inactiveGrace: LOADOUT_HUD_ART_DEFAULT_GRACE_CLASS_NAME,
      activeNeutral: LOADOUT_HUD_ART_DEFAULT_ACTIVE_NEUTRAL_CLASS_NAME,
      activeCourage: LOADOUT_HUD_ART_DEFAULT_ACTIVE_COURAGE_CLASS_NAME,
      activeSpirit: LOADOUT_HUD_ART_DEFAULT_ACTIVE_SPIRIT_CLASS_NAME,
      activeGrace: LOADOUT_HUD_ART_DEFAULT_ACTIVE_GRACE_CLASS_NAME,
    },
  },
  inline: {
    weapon: {
      inactive: LOADOUT_HUD_ART_INLINE_WEAPON_INACTIVE_CLASS_NAME,
      active: LOADOUT_HUD_ART_INLINE_WEAPON_ACTIVE_CLASS_NAME,
    },
    supporting: {
      inactiveNeutral: LOADOUT_HUD_ART_INLINE_NEUTRAL_CLASS_NAME,
      inactiveCourage: LOADOUT_HUD_ART_INLINE_COURAGE_CLASS_NAME,
      inactiveSpirit: LOADOUT_HUD_ART_INLINE_SPIRIT_CLASS_NAME,
      inactiveGrace: LOADOUT_HUD_ART_INLINE_GRACE_CLASS_NAME,
      activeNeutral: LOADOUT_HUD_ART_INLINE_ACTIVE_NEUTRAL_CLASS_NAME,
      activeCourage: LOADOUT_HUD_ART_INLINE_ACTIVE_COURAGE_CLASS_NAME,
      activeSpirit: LOADOUT_HUD_ART_INLINE_ACTIVE_SPIRIT_CLASS_NAME,
      activeGrace: LOADOUT_HUD_ART_INLINE_ACTIVE_GRACE_CLASS_NAME,
    },
  },
  publisher: {
    weapon: {
      inactive: LOADOUT_HUD_ART_PUBLISHER_WEAPON_INACTIVE_CLASS_NAME,
      active: LOADOUT_HUD_ART_PUBLISHER_WEAPON_ACTIVE_CLASS_NAME,
    },
    supporting: {
      inactiveNeutral: LOADOUT_HUD_ART_INLINE_NEUTRAL_CLASS_NAME,
      inactiveCourage: LOADOUT_HUD_ART_INLINE_COURAGE_CLASS_NAME,
      inactiveSpirit: LOADOUT_HUD_ART_INLINE_SPIRIT_CLASS_NAME,
      inactiveGrace: LOADOUT_HUD_ART_INLINE_GRACE_CLASS_NAME,
      activeNeutral: LOADOUT_HUD_ART_INLINE_ACTIVE_NEUTRAL_CLASS_NAME,
      activeCourage: LOADOUT_HUD_ART_INLINE_ACTIVE_COURAGE_CLASS_NAME,
      activeSpirit: LOADOUT_HUD_ART_INLINE_ACTIVE_SPIRIT_CLASS_NAME,
      activeGrace: LOADOUT_HUD_ART_INLINE_ACTIVE_GRACE_CLASS_NAME,
    },
  },
} as const satisfies Record<
  WeaponLoadoutLayout,
  {
    weapon: Record<LoadoutActivity, string>;
    supporting: Record<LoadoutArtState, string>;
  }
>;

export const LOADOUT_HUD_CLASS_NAMES = {
  activeGlow:
    "pointer-events-none absolute top-1/2 left-1/2 -z-1 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/55 blur-md",
  connectorIcon: "size-3.5 stroke-1.5",
} as const satisfies Record<LoadoutElement, string>;

export const LOADOUT_HUD_COPY_CLASS_NAMES = {
  default: {
    primary: "flex min-w-0 flex-1 flex-col",
    totem: "flex min-w-0 flex-1 flex-col",
  },
  inline: {
    primary: "flex min-w-0 flex-1 flex-col max-tablet:hidden",
    totem: "hidden",
  },
  publisher: {
    primary: "hidden min-w-0 flex-1 flex-col mobile-wide:flex",
    totem: "hidden",
  },
} as const satisfies Record<
  WeaponLoadoutLayout,
  Record<CopyKind, string>
>;

export const LOADOUT_HUD_COPY_LABEL_CLASS_NAMES = {
  inactive:
    "font-sans text-2xs leading-none font-bold uppercase tracking-widest text-ink-faint",
  active:
    "font-sans text-2xs leading-none font-bold uppercase tracking-widest text-gold-bright",
} as const satisfies Record<LoadoutActivity, string>;

export const LOADOUT_HUD_COPY_STRONG_CLASS_NAMES = {
  default: {
    inactive:
      "mt-0.5 truncate font-display text-base leading-tight font-normal text-ink text-shadow-value",
    active:
      "mt-0.5 truncate font-display text-base leading-tight font-normal text-gold-pale text-shadow-value",
  },
  inline: {
    inactive:
      "mt-0.5 truncate font-display text-sm leading-tight font-normal text-ink text-shadow-value tablet:max-compact-desktop:text-xs",
    active:
      "mt-0.5 truncate font-display text-sm leading-tight font-normal text-gold-pale text-shadow-value tablet:max-compact-desktop:text-xs",
  },
  publisher: {
    inactive:
      "mt-0.5 truncate font-display text-lg leading-tight font-normal text-ink text-shadow-value",
    active:
      "mt-0.5 truncate font-display text-lg leading-tight font-normal text-gold-pale text-shadow-value",
  },
} as const satisfies Record<
  WeaponLoadoutLayout,
  Record<LoadoutActivity, string>
>;

export const LOADOUT_HUD_COPY_META_CLASS_NAMES = {
  default: {
    inactive:
      "mt-0.5 truncate font-sans text-2xs font-semibold not-italic tracking-wide text-ink-faint",
    active:
      "mt-0.5 truncate font-sans text-2xs font-semibold not-italic tracking-wide text-gold-bright",
  },
  inline: {
    inactive: "hidden",
    active: "hidden",
  },
  publisher: {
    inactive:
      "mt-0.5 truncate font-sans text-2xs font-semibold not-italic tracking-wide text-ink-faint",
    active:
      "mt-0.5 truncate font-sans text-2xs font-semibold not-italic tracking-wide text-gold-bright",
  },
} as const satisfies Record<
  WeaponLoadoutLayout,
  Record<LoadoutActivity, string>
>;

export const LOADOUT_HUD_PUBLISHER_SUPPORT_COPY_CLASS_NAME = "hidden";
