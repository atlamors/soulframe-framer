import type { VirtueId } from "@/src/domain/types";

type TotemSlotVirtue = VirtueId | "neutral";
type TotemSlotState = "active" | "inactive";
type TotemSlotAvailability = "locked" | "unlocked";

export const WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES = {
  compatibility: "mb-2 flex flex-col border-b border-frame-line/30 px-1 pb-3",
  compatibilityLabel:
    "text-xs font-bold uppercase tracking-wider text-ink-faint",
  compatibilityValue:
    "font-display text-xl font-normal text-gold-pale text-shadow-display",
  description:
    "my-4.5 text-sm font-medium leading-relaxed text-ink-soft",
  rankRow:
    "flex min-h-13 items-center justify-between border border-frame-line/40 bg-picker-detail px-3 py-2 shadow-picker-row",
  rankLabel:
    "text-xs font-bold uppercase tracking-wide text-ink-soft",
  rankButtons: "flex gap-1",
  rankButton: {
    active:
      "flex size-9 cursor-pointer items-center justify-center border border-gold-bright bg-control-hover font-sans font-bold text-gold-bright shadow-control-active focus-visible:outline-none focus-visible:shadow-focus max-tablet:size-11",
    inactive:
      "flex size-9 cursor-pointer items-center justify-center border border-frame-line/40 bg-surface-deep font-sans font-bold text-ink-faint shadow-control hover:border-gold hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:size-11",
  },
  effectCard:
    "mt-3.5 flex flex-col border border-frame-line/25 border-l-2 border-l-gold bg-picker-detail px-4 py-3 shadow-picker-row",
  effectLabel:
    "text-xs font-bold uppercase tracking-wide text-gold",
  effectValue:
    "mt-1 text-sm font-bold leading-snug",
  effectDetail:
    "mt-1.5 text-xs font-semibold text-ink-faint",
  totemTabs: "mb-3 grid grid-cols-4 gap-1.25 border-b border-frame-line/25 pb-3",
  totemSlotMarker:
    "absolute -top-0.5 right-1.25 text-lg text-verdant",
  filterRow: "my-2.5 grid grid-cols-2 gap-1.5",
  filterSelect:
    "min-h-9 w-full min-w-0 cursor-pointer border border-frame-line/50 bg-control py-0 pr-7 pl-2.5 font-sans text-xs font-bold text-ink shadow-control hover:border-gold focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11 max-tablet:text-base",
  configGrid: "grid grid-cols-3 gap-2 max-tablet:grid-cols-1",
  configLabel:
    "flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-faint",
  configSelect:
    "min-h-9 cursor-pointer border border-frame-line/50 bg-control py-0 pr-7 pl-2.5 font-sans text-xs font-bold text-ink shadow-control hover:border-gold focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11 max-tablet:text-base",
  totemSlot: {
    active: {
      courage: {
        locked:
          "relative flex min-h-9 w-full cursor-not-allowed items-center justify-center border border-ember bg-surface-deep font-sans font-bold text-ember opacity-30 shadow-control-active max-tablet:min-h-11",
        unlocked:
          "relative flex min-h-9 w-full cursor-pointer items-center justify-center border border-ember bg-picker-row-selected font-sans font-bold text-ember shadow-control-active focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
      },
      spirit: {
        locked:
          "relative flex min-h-9 w-full cursor-not-allowed items-center justify-center border border-aether bg-surface-deep font-sans font-bold text-aether opacity-30 shadow-control-active max-tablet:min-h-11",
        unlocked:
          "relative flex min-h-9 w-full cursor-pointer items-center justify-center border border-aether bg-picker-row-selected font-sans font-bold text-aether shadow-control-active focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
      },
      grace: {
        locked:
          "relative flex min-h-9 w-full cursor-not-allowed items-center justify-center border border-verdant bg-surface-deep font-sans font-bold text-verdant opacity-30 shadow-control-active max-tablet:min-h-11",
        unlocked:
          "relative flex min-h-9 w-full cursor-pointer items-center justify-center border border-verdant bg-picker-row-selected font-sans font-bold text-verdant shadow-control-active focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
      },
      neutral: {
        locked:
          "relative flex min-h-9 w-full cursor-not-allowed items-center justify-center border border-gold-bright bg-surface-deep font-sans font-bold text-gold-bright opacity-30 shadow-control-active max-tablet:min-h-11",
        unlocked:
          "relative flex min-h-9 w-full cursor-pointer items-center justify-center border border-gold-bright bg-picker-row-selected font-sans font-bold text-gold-bright shadow-control-active focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
      },
    },
    inactive: {
      courage: {
        locked:
          "relative flex min-h-9 w-full cursor-not-allowed items-center justify-center border border-ember/45 bg-surface-deep font-sans font-bold text-ember opacity-30 max-tablet:min-h-11",
        unlocked:
          "relative flex min-h-9 w-full cursor-pointer items-center justify-center border border-ember/65 bg-surface-deep font-sans font-bold text-ember shadow-control hover:bg-picker-row-hover focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
      },
      spirit: {
        locked:
          "relative flex min-h-9 w-full cursor-not-allowed items-center justify-center border border-aether/45 bg-surface-deep font-sans font-bold text-aether opacity-30 max-tablet:min-h-11",
        unlocked:
          "relative flex min-h-9 w-full cursor-pointer items-center justify-center border border-aether/65 bg-surface-deep font-sans font-bold text-aether shadow-control hover:bg-picker-row-hover focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
      },
      grace: {
        locked:
          "relative flex min-h-9 w-full cursor-not-allowed items-center justify-center border border-verdant/45 bg-surface-deep font-sans font-bold text-verdant opacity-30 max-tablet:min-h-11",
        unlocked:
          "relative flex min-h-9 w-full cursor-pointer items-center justify-center border border-verdant/65 bg-surface-deep font-sans font-bold text-verdant shadow-control hover:bg-picker-row-hover focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
      },
      neutral: {
        locked:
          "relative flex min-h-9 w-full cursor-not-allowed items-center justify-center border border-frame-line/30 bg-surface-deep font-sans font-bold text-ink-faint opacity-30 max-tablet:min-h-11",
        unlocked:
          "relative flex min-h-9 w-full cursor-pointer items-center justify-center border border-frame-line/40 bg-surface-deep font-sans font-bold text-ink-faint shadow-control hover:border-gold hover:bg-picker-row-hover hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
      },
    },
  } as const satisfies Record<
    TotemSlotState,
    Record<TotemSlotVirtue, Record<TotemSlotAvailability, string>>
  >,
} as const satisfies Record<string, unknown>;
