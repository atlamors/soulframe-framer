import type { VirtueId } from "@/src/domain/types";

export const ITEM_DETAILS_CLASS_NAMES = {
  armorOverview: "mt-6.5 border border-frame-line/40 bg-picker-detail pt-3 pb-3 shadow-picker-row",
  armorOverviewHeader: "flex justify-between border-b border-frame-line/20 px-3 pb-2 font-sans text-xs font-semibold uppercase tracking-wide text-gold",
  armorOverviewGrid: "grid grid-cols-3 max-tablet:grid-cols-1",
  armorStatLabel: "truncate font-sans text-xs font-semibold leading-tight uppercase tracking-wide text-ink-soft max-tablet:col-start-1 max-tablet:row-start-1",
  armorStatValue: "flex min-h-9 items-center gap-2 max-tablet:col-start-1 max-tablet:row-start-2",
  armorStatValueNumber: "font-display text-xl font-normal leading-tight lining-nums tabular-nums text-gold-pale text-shadow-value",
  armorStatMeta: "whitespace-nowrap font-sans text-xs font-medium not-italic leading-tight tracking-wide text-ink-soft max-tablet:col-start-1 max-tablet:row-start-3",
  armorPipStrip: "mt-1 flex min-h-5 items-center gap-1 max-tablet:col-start-2 max-tablet:row-start-1 max-tablet:row-span-3 max-tablet:justify-end max-tablet:mt-0",
  armorPipImage: "size-3.5 object-contain",
  armorNoPips: "font-display text-ink-faint",
  armorOverviewTotal: "mt-3 flex items-center justify-between border-t border-frame-line/30 bg-picker-header px-3 pt-3 pb-0.5",
  armorOverviewPrimaryTotal: "flex flex-row items-baseline gap-2.5",
  armorOverviewChangeTotal: "flex flex-col gap-0.5 text-right",
  armorOverviewTotalLabel: "font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft",
  armorOverviewTotalValue: "font-display text-2xl font-normal leading-none lining-nums tabular-nums text-gold-pale text-shadow-value",
  dropSection: "mt-6.5",
  dropSectionHeader: "mb-2 flex items-baseline justify-between",
  dropSectionTitle: "m-0 font-display text-heading font-normal tracking-wide text-gold-pale text-shadow-display",
  dropSectionMeta: "font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft",
  dropTable: "grid grid-cols-drop-sources overflow-hidden border border-frame-line/30 bg-surface-overlay shadow-picker-row",
  dropCell: "flex self-stretch items-center justify-center text-center font-sans text-xs font-medium leading-normal text-ink-soft max-tablet:min-w-0",
  dropDetailCell: "flex self-stretch flex-col items-center justify-center text-center font-sans text-xs font-medium leading-normal text-ink-soft max-tablet:min-w-0",
  dropDetailNote: "mt-0.5 font-sans text-xs font-medium text-ink-faint",
  dropSourceExternalCell: "relative inline-flex min-w-0 w-fit items-center gap-1 font-sans text-xs font-medium leading-normal text-ink-soft max-tablet:w-full",
  dropSourceLink: "inline-flex min-h-7.5 items-center gap-1 text-gold no-underline hover:text-gold-bright focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
  dropSourceLinkIcon: "size-3 stroke-2",
  dropLocationUnmapped: "font-sans text-xs text-ink-faint",
  dropTooltip: "fixed left-(--item-drop-tooltip-left) top-(--item-drop-tooltip-top) z-70 w-80 animate-tooltip-in border border-frame-line/60 bg-picker-popover p-3 shadow-popover backdrop-blur-xl motion-reduce:animate-none",
  dropTooltipHeader: "flex items-start justify-between gap-2",
  dropTooltipEyebrow: "font-sans text-2xs font-bold uppercase tracking-widest text-ink-faint",
  dropTooltipTitle: "font-display text-lg text-gold-pale",
  dropMapCanvas: "absolute left-(--item-drop-map-canvas-left) top-(--item-drop-map-canvas-top) size-(--item-drop-map-canvas-size)",
  dropMapImage: "object-fill",
  dropMapPin: "absolute left-(--item-drop-map-pin-x) top-(--item-drop-map-pin-y) z-20 size-8.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold-bright bg-surface-overlay shadow-pin drop-shadow-pin",
  dropTooltipHint: "mt-2 font-sans text-2xs uppercase tracking-wide text-ink-faint",
  dropLightboxBackdrop: "fixed inset-0 z-60 grid place-items-center bg-scrim p-4 backdrop-blur-xl",
  dropLightbox: "flex max-h-overlay-max w-full max-w-overlay-md flex-col border border-frame-line/70 bg-picker-panel shadow-overlay animate-fade-up motion-reduce:animate-none",
  dropLightboxHeader: "flex items-start justify-between gap-3 border-b border-frame-line/30 bg-picker-header px-4 py-3",
  dropLightboxHeadingGroup: "flex flex-col gap-0.5",
  dropLightboxEyebrow: "font-sans text-2xs font-bold uppercase tracking-widest text-ink-faint",
  dropLightboxTitle: "font-display text-xl text-gold-pale text-shadow-display",
  dropLightboxClose: "flex size-10 cursor-pointer items-center justify-center border border-frame-line/45 bg-control text-ink-soft shadow-control hover:border-gold hover:bg-control-hover hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:size-11",
  dropLightboxFooter: "flex items-center justify-between gap-3 border-t border-frame-line/30 bg-picker-header px-4 py-3 max-mobile-wide:flex-col max-mobile-wide:items-stretch",
  dropLightboxFooterDetails: "flex min-w-0 flex-col gap-1",
  dropLightboxCoordinates: "font-sans text-xs text-ink-soft",
  dropLightboxSourceLink: "inline-flex min-h-7.5 items-center gap-1 font-sans text-xs text-gold hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
  dropLightboxSourceLinkIcon: "size-3 stroke-2",
  dropMapPages: "flex gap-1",
  dropMapPagesPlaceholder: "block",
  dropEmpty: "font-sans text-sm text-ink-faint",
  itemStatTable: "mt-4 overflow-x-auto border border-frame-line/30 bg-surface-overlay shadow-picker-row",
  itemStatHead: "grid min-h-9 min-w-150 grid-cols-item-stats items-center gap-2 border-b border-frame-line/25 bg-picker-header px-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-faint max-tablet:grid-cols-item-stats-mobile",
  itemStatHeadName: "text-left",
  itemStatRow: "grid min-h-16 min-w-150 grid-cols-item-stats items-center gap-2 border-t border-frame-line/20 px-2 text-right transition-colors duration-150 hover:bg-picker-row-hover motion-reduce:transition-none max-tablet:grid-cols-item-stats-mobile",
  itemStatValue: "font-sans text-sm font-medium lining-nums tabular-nums",
  itemStatName: "flex min-w-0 items-center gap-2 text-left font-sans text-sm font-medium lining-nums tabular-nums",
  itemStatNameLabel: "flex flex-col gap-1 text-sm",
} as const;

export const ARMOR_BASE_STAT_CLASS_NAMES = {
  default: "flex min-w-0 flex-col gap-1 border-r border-frame-line/20 px-3 py-1 max-tablet:grid max-tablet:grid-cols-2 max-tablet:gap-x-2.5 max-tablet:gap-y-0.75 max-tablet:border-r-0 max-tablet:border-b max-tablet:border-frame-line/20 max-tablet:px-3 max-tablet:py-2",
  last: "flex min-w-0 flex-col gap-1 px-3 py-1 max-tablet:grid max-tablet:grid-cols-2 max-tablet:gap-x-2.5 max-tablet:gap-y-0.75 max-tablet:px-3 max-tablet:py-2",
} as const;

export const ARMOR_PIP_CLASS_NAMES = {
  courage: "inline-flex size-5 items-center justify-center rounded-full border border-ember/60 bg-surface shadow-inset-accent",
  spirit: "inline-flex size-5 items-center justify-center rounded-full border border-aether/60 bg-surface shadow-inset-accent",
  grace: "inline-flex size-5 items-center justify-center rounded-full border border-verdant/60 bg-surface shadow-inset-accent",
} as const satisfies Record<VirtueId, string>;

export const ARMOR_OVERVIEW_DELTA_CLASS_NAMES = {
  positive: "font-display text-2xl leading-none lining-nums tabular-nums text-verdant",
  negative: "font-display text-2xl leading-none lining-nums tabular-nums text-danger",
  neutral: "font-display text-2xl leading-none lining-nums tabular-nums text-ink-faint",
} as const;

export const ITEM_STAT_DELTA_CLASS_NAMES = {
  positive: "font-sans text-sm font-medium lining-nums tabular-nums text-verdant",
  negative: "font-sans text-sm font-medium lining-nums tabular-nums text-danger",
  neutral: "font-sans text-sm font-medium lining-nums tabular-nums text-ink-faint",
} as const;

export const DROP_ROW_CLASS_NAMES = {
  body: "col-span-full grid min-h-11 grid-cols-subgrid items-start gap-2.5 border-t border-frame-line/20 px-4 py-2.5 transition-colors duration-150 hover:bg-picker-row-hover motion-reduce:transition-none max-tablet:gap-2",
  head: "col-span-full grid min-h-8 grid-cols-subgrid items-start gap-2.5 bg-picker-header px-4 py-2 uppercase max-tablet:gap-2",
} as const;

export const DROP_HEAD_CELL_CLASS_NAMES = {
  first: "text-left font-sans text-xs font-semibold leading-normal uppercase tracking-wide text-ink-soft max-tablet:min-w-0",
  other: "flex self-stretch items-center justify-center text-center font-sans text-xs font-semibold leading-normal uppercase tracking-wide text-ink-soft max-tablet:min-w-0",
} as const;

export type DropLocationCellAppearance = "sourceMapped" | "sourceUnmapped" | "locationMapped" | "locationUnmapped";
export const DROP_LOCATION_CELL_CLASS_NAMES = {
  sourceMapped: "relative inline-flex min-w-0 w-fit items-center gap-1 font-sans text-xs font-medium leading-normal text-ink-soft max-tablet:w-full",
  sourceUnmapped: "relative inline-flex min-w-0 w-fit items-center gap-1 font-sans text-xs font-medium leading-normal text-ink-soft max-tablet:w-full",
  locationMapped: "relative inline-flex min-w-0 w-full self-stretch items-center justify-center gap-1 font-sans text-xs font-medium leading-normal text-ink-soft",
  locationUnmapped: "relative inline-flex min-w-0 w-full self-stretch items-center justify-center gap-1 font-sans text-xs font-medium leading-normal text-ink-soft",
} as const;

export const DROP_LOCATION_TRIGGER_CLASS_NAMES = {
  sourceInactive: "relative -my-1 inline-flex size-8.5 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-frame-line/45 bg-control p-0 text-gold shadow-control hover:border-gold hover:bg-control-hover focus-visible:outline-none focus-visible:shadow-focus max-tablet:size-11",
  sourceActive: "relative -my-1 inline-flex size-8.5 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gold bg-control-hover p-0 text-gold-bright shadow-control-active focus-visible:outline-none focus-visible:shadow-focus max-tablet:size-11",
  locationInactive: "group/drop-location inline-flex min-h-7.5 max-w-full min-w-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-left font-sans text-xs font-semibold leading-normal text-gold hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11 max-tablet:min-w-11",
  locationActive: "group/drop-location inline-flex min-h-7.5 max-w-full min-w-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-left font-sans text-xs font-semibold leading-normal text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11 max-tablet:min-w-11",
} as const;

export const DROP_LOCATION_MARKER_CLASS_NAMES = {
  inactive: "relative size-8.5 shrink-0 overflow-hidden rounded-full border border-frame-line/45 bg-control shadow-control group-hover/drop-location:border-gold group-hover/drop-location:bg-control-hover max-tablet:size-10",
  active: "relative size-8.5 shrink-0 overflow-hidden rounded-full border border-gold bg-control-hover shadow-control-active max-tablet:size-10",
} as const;
export const DROP_LOCATION_TRIGGER_IMAGE_CLASS_NAME = "object-contain";
export const DROP_MARKER_IMAGE_CLASS_NAMES = { trigger: "object-contain p-1", pin: "object-contain p-1" } as const;
export type LocalMapAppearance = "tooltip" | "lightbox";
export const LOCAL_MAP_FRAME_CLASS_NAMES = {
  tooltip: "relative aspect-square overflow-hidden border border-frame-line/45 bg-frame shadow-picker-art",
  lightbox: "relative aspect-square w-full max-w-overlay-sm self-center overflow-hidden border border-frame-line/45 bg-frame shadow-picker-art",
} as const;
export const DROP_MAP_PAGE_CLASS_NAMES = {
  inactive: "inline-flex size-7.5 cursor-pointer items-center justify-center border border-frame-line/40 bg-surface-deep p-0 font-sans text-xs text-ink-faint hover:border-gold hover:bg-control-hover hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:size-11",
  active: "inline-flex size-7.5 cursor-pointer items-center justify-center border border-gold bg-control-hover p-0 font-sans text-xs text-gold-bright shadow-control-active focus-visible:outline-none focus-visible:shadow-focus max-tablet:size-11",
} as const;
