type TemperPickerPanelElement =
  | "capacityBand"
  | "capacityHeading"
  | "capacityCopy"
  | "capacityLabel"
  | "capacityValue"
  | "capacityStatus"
  | "craftworkControl"
  | "craftworkLabel"
  | "craftworkSelect"
  | "slotList"
  | "slotItem"
  | "occupiedSlot"
  | "occupiedImage"
  | "slotNumber"
  | "emptySlot"
  | "emptySlotMark"
  | "weaponContext"
  | "weaponContextLabel"
  | "weaponContextValue"
  | "weaponContextMeta"
  | "occurrenceChip"
  | "description"
  | "statList"
  | "statCard"
  | "statHeading"
  | "statStacks"
  | "statRow"
  | "statCount"
  | "statValue"
  | "statNote"
  | "emptyCopy";

export const TEMPER_PICKER_PANEL_CLASS_NAMES = {
  capacityBand:
    "flex-none border-b border-frame-line/35 bg-picker-detail px-5 py-3 shadow-control max-tablet:px-3.5",
  capacityHeading:
    "flex items-end justify-between gap-4 max-mobile-wide:items-stretch max-mobile-wide:flex-col max-mobile-wide:gap-2.5",
  capacityCopy: "flex min-w-0 flex-col",
  capacityLabel:
    "font-sans text-xs font-bold uppercase tracking-wider text-gold",
  capacityValue:
    "mt-0.5 font-display text-lg font-normal text-gold-pale text-shadow-display",
  capacityStatus:
    "mt-0.5 font-sans text-xs font-semibold text-ink-faint lining-nums tabular-nums",
  craftworkControl:
    "flex min-w-40 flex-col gap-1 max-mobile-wide:min-w-0 max-mobile-wide:w-full",
  craftworkLabel:
    "font-sans text-2xs font-bold uppercase tracking-wider text-ink-faint",
  craftworkSelect:
    "min-h-11 w-full cursor-pointer border border-frame-line/50 bg-surface bg-control px-2.5 font-sans text-xs font-bold text-ink shadow-control hover:border-gold hover:bg-control-hover focus-visible:border-gold focus-visible:outline-none focus-visible:shadow-focus max-tablet:text-base",
  slotList: "mt-3 flex flex-wrap gap-1.5",
  slotItem: "flex size-12 flex-none",
  occupiedSlot:
    "group relative flex size-12 cursor-pointer items-center justify-center overflow-hidden border border-gold/60 bg-picker-row-selected shadow-picker-row-active transition-colors duration-150 hover:border-ember hover:bg-picker-row-hover focus-visible:z-10 focus-visible:border-gold-bright focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  occupiedImage:
    "size-9 object-contain transition-opacity duration-150 group-hover:opacity-65 motion-reduce:transition-none",
  slotNumber:
    "absolute right-0 bottom-0 flex size-4 items-center justify-center bg-night/85 font-sans text-2xs font-bold text-gold-bright lining-nums tabular-nums",
  emptySlot:
    "relative flex size-12 items-center justify-center border border-frame-line/35 bg-surface-deep shadow-control",
  emptySlotMark:
    "font-display text-base font-normal text-ink-faint/55 lining-nums tabular-nums",
  weaponContext:
    "mb-2 flex flex-col border-b border-frame-line/30 px-1 pb-3",
  weaponContextLabel:
    "text-xs font-bold uppercase tracking-wider text-ink-faint",
  weaponContextValue:
    "font-display text-xl font-normal text-gold-pale text-shadow-display",
  weaponContextMeta:
    "mt-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft",
  occurrenceChip:
    "ml-auto flex-none border border-verdant/40 bg-surface-deep px-1.5 py-0.5 font-sans text-2xs font-bold uppercase tracking-widest text-verdant lining-nums tabular-nums",
  description:
    "my-4.5 text-sm font-medium leading-relaxed text-ink-soft",
  statList: "flex flex-col gap-2.5",
  statCard:
    "border border-frame-line/25 border-l-2 border-l-gold bg-picker-detail px-4 py-3 shadow-picker-row",
  statHeading:
    "font-sans text-xs font-bold uppercase tracking-wide text-gold",
  statStacks: "mt-2 grid grid-cols-2 gap-2 max-mobile-wide:grid-cols-1",
  statRow:
    "flex min-h-11 items-center gap-2 border border-frame-line/25 bg-surface-deep px-2.5",
  statCount:
    "flex size-6 flex-none items-center justify-center border border-frame-line/35 font-sans text-xs font-bold text-gold-bright",
  statValue: "text-xs font-semibold leading-snug text-ink-soft",
  statNote: "mt-2 block text-xs font-medium leading-relaxed text-ink-faint",
  emptyCopy:
    "flex flex-col items-center gap-1 text-center text-sm font-medium leading-relaxed text-ink-faint",
} as const satisfies Record<TemperPickerPanelElement, string>;
