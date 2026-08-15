import type { VirtueId } from "@/src/domain/types";

type JoineryPickerPanelElement =
  | "currentBand"
  | "currentLayout"
  | "currentSelection"
  | "currentArt"
  | "currentImage"
  | "currentCopy"
  | "currentLabel"
  | "currentName"
  | "currentMeta"
  | "currentWaste"
  | "weaponContext"
  | "weaponContextLabel"
  | "weaponContextValue"
  | "weaponContextMeta"
  | "familyGroup"
  | "familyHeading"
  | "familyName"
  | "familyCount"
  | "itemAttunement"
  | "itemPips"
  | "itemMeta"
  | "itemWaste"
  | "comparisonSection"
  | "comparisonTitle"
  | "comparisonGrid"
  | "snapshotPrevious"
  | "snapshotCurrent"
  | "snapshotLabel"
  | "snapshotName"
  | "snapshotAttunement"
  | "snapshotMeta"
  | "snapshotPips"
  | "snapshotWaste"
  | "description"
  | "emptyCopy"
  | "detailEnd";

export const JOINERY_PICKER_PANEL_CLASS_NAMES = {
  currentBand:
    "flex-none border-b border-frame-line/35 bg-picker-detail px-5 py-3 shadow-control max-tablet:px-3.5",
  currentLayout:
    "flex min-h-16 items-center justify-between gap-4 max-mobile-wide:items-stretch max-mobile-wide:flex-col max-mobile-wide:gap-3",
  currentSelection: "flex min-w-0 items-center gap-3",
  currentArt:
    "flex size-15 flex-none items-center justify-center overflow-hidden border border-gold/45 bg-aura-gold shadow-picker-art",
  currentImage: "size-12 object-contain drop-shadow-art-strong",
  currentCopy: "flex min-w-0 flex-col",
  currentLabel:
    "font-sans text-2xs font-bold uppercase tracking-wider text-gold",
  currentName:
    "truncate font-display text-xl font-normal leading-tight text-gold-pale text-shadow-display",
  currentMeta:
    "mt-0.5 truncate font-sans text-xs font-semibold text-ink-soft",
  currentWaste:
    "mt-1 max-w-full font-sans text-2xs font-bold leading-tight text-ember",
  weaponContext:
    "mb-2 flex flex-col border-b border-frame-line/30 px-1 pb-3",
  weaponContextLabel:
    "text-xs font-bold uppercase tracking-wider text-ink-faint",
  weaponContextValue:
    "font-display text-xl font-normal text-gold-pale text-shadow-display",
  weaponContextMeta:
    "mt-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft",
  familyGroup: "flex flex-col",
  familyHeading:
    "sticky top-0 z-10 flex min-h-8 items-center justify-between border-y border-frame-line/30 bg-picker-catalogue px-2 py-1 shadow-control",
  familyName:
    "font-sans text-xs font-bold uppercase tracking-widest text-gold-bright",
  familyCount:
    "font-sans text-2xs font-semibold uppercase tracking-wide text-ink-faint lining-nums tabular-nums",
  itemAttunement:
    "flex items-center gap-1.5 font-display text-base font-normal leading-tight text-ink",
  itemPips: "inline-flex flex-none gap-0.5",
  itemMeta:
    "truncate font-sans text-xs font-semibold uppercase tracking-wide text-ink-faint",
  itemWaste:
    "font-sans text-2xs font-bold leading-tight text-ember",
  comparisonSection: "mt-5 border-t border-frame-line/30 pt-4",
  comparisonTitle:
    "mb-2 font-sans text-xs font-bold uppercase tracking-wider text-gold",
  comparisonGrid: "grid grid-cols-2 gap-2 max-mobile-wide:grid-cols-1",
  snapshotPrevious:
    "flex min-h-31 flex-col border border-frame-line/30 bg-surface-deep px-3 py-3 shadow-control",
  snapshotCurrent:
    "flex min-h-31 flex-col border border-gold/55 border-l-2 border-l-gold bg-picker-row-selected px-3 py-3 shadow-picker-row-active",
  snapshotLabel:
    "font-sans text-2xs font-bold uppercase tracking-wider text-ink-faint",
  snapshotName:
    "mt-1 truncate font-display text-base font-normal text-gold-pale",
  snapshotAttunement:
    "mt-2 font-sans text-sm font-bold leading-snug text-ink",
  snapshotMeta:
    "mt-auto pt-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-faint",
  snapshotPips: "mt-1 flex gap-1",
  snapshotWaste:
    "mt-2 font-sans text-2xs font-bold leading-tight text-ember",
  description: "my-4.5 text-sm font-medium leading-relaxed text-ink-soft",
  emptyCopy:
    "flex flex-col items-center gap-1 text-center text-sm font-medium leading-relaxed text-ink-faint",
  detailEnd: "pb-6 max-tablet:pb-safe-bottom",
} as const satisfies Record<JoineryPickerPanelElement, string>;

export const JOINERY_PIP_CLASS_NAMES = {
  courage: "text-ember",
  spirit: "text-aether",
  grace: "text-verdant",
} as const satisfies Record<VirtueId, string>;
