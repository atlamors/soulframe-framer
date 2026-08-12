type PickerLayoutElement =
  | "backdrop"
  | "panel"
  | "panelContent"
  | "headerDefault"
  | "headerWeapon"
  | "headerTitleDefault"
  | "headerTitleWeapon"
  | "headerCopy"
  | "body"
  | "bodyDetail"
  | "catalogueColumn"
  | "itemList"
  | "itemRowDefault"
  | "itemRowCandidate"
  | "itemMark"
  | "itemCopy"
  | "itemName"
  | "itemMeta"
  | "itemSide"
  | "itemTotal"
  | "equippedChip"
  | "talismanModifiers"
  | "comparisonColumn"
  | "comparisonHeading"
  | "candidateArt"
  | "comparisonCopy"
  | "comparisonTitle"
  | "comparisonMeta"
  | "externalLink"
  | "externalLinkIcon"
  | "actions"
  | "empty"
  | "emptyTitle";

export const PICKER_LAYOUT_CLASS_NAMES = {
  backdrop:
    "fixed inset-x-0 top-14 bottom-0 z-30 flex items-stretch justify-end bg-scrim compact-desktop:pl-16 wide-desktop:pl-0 max-tablet:inset-x-0 max-tablet:top-mobile-header max-tablet:bottom-0 max-tablet:z-50",
  panel:
    "relative isolate flex w-full max-w-overlay-lg flex-col border-l border-frame-line/70 bg-picker-panel shadow-picker-panel animate-slide-in motion-reduce:animate-none tablet:max-compact-desktop:w-full max-tablet:h-full max-tablet:max-h-full max-tablet:w-screen max-tablet:overflow-hidden max-tablet:border-l-0",
  panelContent: "relative z-10 flex min-h-0 flex-1 flex-col",
  headerDefault:
    "flex min-h-20 items-center justify-between border-b border-frame-line/35 bg-picker-header px-6 py-4 shadow-control max-tablet:min-h-17 max-tablet:flex-none max-tablet:px-4 max-tablet:pt-safe-top max-tablet:pb-2.5",
  headerWeapon:
    "grid min-h-20 grid-cols-12 items-center gap-4 border-b border-frame-line/35 bg-picker-header px-6 py-2.5 shadow-control [&>[data-dialog-close]]:col-start-12 [&>[data-dialog-close]]:justify-self-end tablet:max-compact-desktop:gap-2.5 max-tablet:min-h-28 max-tablet:flex-none max-tablet:grid-cols-2 max-tablet:gap-x-2.5 max-tablet:gap-y-2 max-tablet:px-3 max-tablet:pt-safe-top max-tablet:pb-2 max-tablet:[&>[data-dialog-close]]:col-start-2 max-tablet:[&>[data-dialog-close]]:row-start-1",
  headerTitleDefault:
    "m-0 font-display text-2xl font-normal text-gold-pale text-shadow-display max-tablet:text-xl",
  headerTitleWeapon:
    "col-span-3 m-0 whitespace-nowrap font-display text-2xl font-normal text-gold-pale text-shadow-display max-tablet:col-span-1 max-tablet:col-start-1 max-tablet:row-start-1 max-tablet:text-xl",
  headerCopy: "min-w-0 flex-1",
  body:
    "grid min-h-0 flex-1 grid-cols-picker max-tablet:flex max-tablet:flex-col max-tablet:overscroll-contain max-tablet:overflow-x-hidden max-tablet:overflow-y-auto",
  bodyDetail:
    "grid min-h-0 flex-1 grid-cols-picker-detail max-tablet:flex max-tablet:flex-col max-tablet:overscroll-contain max-tablet:overflow-x-hidden max-tablet:overflow-y-auto",
  catalogueColumn:
    "flex min-h-0 min-w-0 flex-col border-r border-frame-line/30 bg-picker-catalogue p-5 max-tablet:max-h-picker-catalogue-mobile max-tablet:flex-none max-tablet:border-r-0 max-tablet:border-b max-tablet:border-frame-line/30 max-tablet:p-3.5",
  itemList:
    "flex min-h-0 flex-1 flex-col overflow-y-auto pt-2.5",
  itemRowDefault:
    "relative flex min-h-19 w-full cursor-pointer items-center gap-2.5 border border-x-transparent border-t-transparent border-b-frame-line/20 bg-transparent px-2 py-2 text-left shadow-picker-row transition-colors duration-150 hover:border-frame-line/40 hover:bg-picker-row-hover focus-visible:z-10 focus-visible:border-gold focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  itemRowCandidate:
    "relative z-0 flex min-h-19 w-full cursor-pointer items-center gap-2.5 border border-gold/55 bg-picker-row-selected px-2 py-2 text-left shadow-picker-row-active transition-colors duration-150 hover:border-gold-bright/70 hover:bg-picker-row-selected focus-visible:z-10 focus-visible:border-gold-bright focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  itemMark:
    "flex size-15 shrink-0 items-center justify-center overflow-hidden border border-frame-line/30 bg-aura-gold shadow-picker-art",
  itemCopy: "flex min-w-0 flex-1 flex-col gap-1",
  itemName:
    "truncate font-display text-base font-normal leading-tight text-ink",
  itemMeta:
    "truncate font-sans text-xs text-ink-faint uppercase",
  itemSide: "flex shrink-0 flex-col items-end",
  itemTotal:
    "max-w-22 truncate font-display text-base text-gold-pale lining-nums tabular-nums text-shadow-value",
  equippedChip:
    "mt-1 border border-verdant/40 bg-surface-deep px-1.5 py-0.5 font-sans text-2xs font-bold tracking-widest text-verdant uppercase",
  talismanModifiers:
    "truncate font-sans text-xs font-semibold text-ink-faint uppercase",
  comparisonColumn:
    "flex min-h-0 min-w-0 flex-col overflow-y-auto bg-picker-detail px-overlay-gutter pt-overlay-gutter max-tablet:min-h-0 max-tablet:flex-none max-tablet:overflow-visible max-tablet:px-4 max-tablet:pt-6",
  comparisonHeading:
    "flex items-center gap-4.5",
  candidateArt:
    "flex size-32 shrink-0 items-center justify-center overflow-hidden border border-frame-line/35 bg-aura-gold shadow-picker-art max-tablet:size-26",
  comparisonCopy: "flex min-w-0 flex-col items-start",
  comparisonTitle:
    "m-0 font-display text-heading font-normal leading-tight text-gold-pale text-shadow-display",
  comparisonMeta:
    "mt-2 mb-0 font-sans text-xs tracking-wider text-ink-faint uppercase",
  externalLink:
    "inline-flex min-h-8.5 items-center gap-1 border border-frame-line/45 bg-surface-deep px-2 font-sans text-xs font-semibold uppercase tracking-wide text-gold no-underline shadow-control hover:border-gold hover:bg-control-hover hover:text-gold-bright focus-visible:border-gold focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
  externalLinkIcon:
    "size-3 stroke-2",
  actions:
    "sticky bottom-0 z-20 mt-auto flex min-h-27 items-end justify-between bg-fade-bottom -mx-overlay-gutter px-overlay-gutter pt-14 pb-2 max-tablet:min-h-27 max-tablet:-mx-4 max-tablet:px-4 max-tablet:pt-10 max-tablet:pb-safe-bottom",
  empty:
    "flex min-h-42.5 flex-1 items-center justify-center text-center text-ink-faint",
  emptyTitle:
    "font-display text-sm font-normal",
} as const satisfies Record<PickerLayoutElement, string>;
