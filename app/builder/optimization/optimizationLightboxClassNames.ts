import { MOBILE_HEADER_MENU_SURFACE_CLASS_NAME } from "@/app/components/mobileFullscreenOverlayClassNames";

type OptimizationLightboxElement =
  | "backdrop"
  | "dialog"
  | "frame"
  | "header"
  | "headerCopy"
  | "eyebrow"
  | "eyebrowIcon"
  | "title"
  | "description"
  | "close"
  | "closeIcon"
  | "body"
  | "summary"
  | "affinityGrid"
  | "affinityCard"
  | "affinityCopy"
  | "label"
  | "metricLabel"
  | "value"
  | "valueArrow"
  | "recommendedValue"
  | "metrics"
  | "metricCard"
  | "metricDelta"
  | "armorSection"
  | "armorSectionHeader"
  | "armorSectionHeading"
  | "armorSectionIntro"
  | "armorCount"
  | "armorGrid"
  | "armorCard"
  | "armorArt"
  | "armorArtIndex"
  | "armorArtwork"
  | "armorCopy"
  | "armorSlot"
  | "armorName"
  | "armorChange"
  | "armorStats"
  | "armorStatsLabel"
  | "armorStatsValues"
  | "armorStatsArrow"
  | "footer"
  | "footerCopy"
  | "footerActions"
  | "actionIcon";

export const OPTIMIZATION_LIGHTBOX_CLASS_NAMES = {
  backdrop:
    "fixed inset-0 z-60 flex items-center justify-center bg-surface-overlay p-6 backdrop-blur-md max-tablet:z-0 max-tablet:block max-tablet:bg-scrim max-tablet:p-0",
  dialog:
    `relative isolate flex max-h-215 w-full max-w-225 flex-col overflow-visible border border-line-bright bg-overlay animate-fade-up shadow-overlay max-tablet:fixed max-tablet:inset-0 max-tablet:z-10 max-tablet:h-dvh max-tablet:max-h-none max-tablet:max-w-none max-tablet:overflow-hidden max-tablet:border-0 ${MOBILE_HEADER_MENU_SURFACE_CLASS_NAME} max-tablet:pt-mobile-header max-tablet:pb-safe-bottom max-tablet:animate-mobile-overlay-surface-in motion-reduce:animate-none`,
  frame:
    "pointer-events-none absolute inset-0 z-10 max-tablet:hidden",
  header:
    "relative z-1 flex flex-none items-start justify-between gap-4 border-b border-line bg-surface/35 px-7 pt-6 pb-5 shadow-control max-tablet:px-4 max-tablet:pt-4.5 max-tablet:pb-4 max-mobile-wide:px-3.5",
  headerCopy: "min-w-0",
  eyebrow:
    "inline-flex items-center gap-1.5 font-sans text-2xs font-bold uppercase tracking-widest text-gold",
  eyebrowIcon: "size-3.5",
  title:
    "mt-2 font-display text-3xl leading-none font-normal text-ink text-shadow-value max-tablet:text-2xl",
  description:
    "mt-2 max-w-150 font-sans text-sm leading-relaxed font-medium text-ink-soft max-mobile-wide:text-xs",
  close: "max-tablet:hidden",
  closeIcon: "size-5 stroke-1",
  body:
    "relative z-1 min-h-0 flex-1 overflow-y-auto overscroll-contain",
  summary:
    "grid gap-4.5 px-7 py-5.5 max-tablet:p-4 max-mobile-wide:px-3.5",
  affinityGrid:
    "grid grid-cols-3 gap-2 max-mobile-wide:grid-cols-1",
  affinityCard:
    "flex min-w-0 items-center gap-2.25 border border-line-bright/35 bg-surface-deep/70 bg-aura-gold px-3 py-2.5 shadow-control",
  affinityCopy: "flex min-w-0 flex-col gap-0.5",
  label:
    "font-sans text-xs font-bold uppercase tracking-wider text-ink-soft",
  metricLabel:
    "col-span-full font-sans text-xs font-bold uppercase tracking-wider text-ink-soft",
  value:
    "flex items-center gap-1.5 font-display text-2xl leading-none font-normal lining-nums tabular-nums text-ink-soft tablet:max-compact-desktop:text-xl",
  valueArrow: "size-3.5 text-ink-faint",
  recommendedValue: "font-normal text-gold-bright",
  metrics:
    "grid grid-cols-2 gap-2.5 max-mobile-wide:grid-cols-1",
  metricCard:
    "grid min-w-0 grid-cols-2 border border-line-bright/25 border-l-2 border-l-gold/65 bg-frame px-3.5 py-2.5 shadow-control",
  metricDelta:
    "self-end pb-px text-right font-sans text-xs font-bold not-italic text-verdant",
  armorSection:
    "border-t border-line/70 pt-4.5",
  armorSectionHeader:
    "flex items-end justify-between gap-4 px-7 pb-3.5 max-tablet:px-4 max-mobile-wide:items-start max-mobile-wide:px-3.5",
  armorSectionHeading:
    "font-sans text-xs font-bold uppercase tracking-wider text-gold",
  armorSectionIntro:
    "mt-1 font-sans text-xs font-medium text-ink-faint",
  armorCount:
    "flex-none border border-line-bright/30 bg-surface-deep/60 px-2 py-1 font-sans text-2xs font-bold uppercase tracking-wider text-ink-soft shadow-control",
  armorGrid:
    "grid grid-cols-3 gap-2.5 px-7 pb-6 max-tablet:grid-cols-1 max-tablet:px-4 max-tablet:pb-4.5 max-mobile-wide:gap-2 max-mobile-wide:px-3.5",
  armorCard:
    "relative isolate flex min-w-0 flex-col overflow-hidden border border-line-bright/35 bg-frame shadow-control max-tablet:min-h-33 max-tablet:flex-row",
  armorArt:
    "relative flex h-29.5 flex-none items-center justify-center overflow-hidden bg-surface-deep bg-aura-gold max-tablet:h-auto max-tablet:w-28 max-mobile-wide:w-24",
  armorArtIndex:
    "pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 font-display text-5xl leading-none text-gold opacity-15",
  armorArtwork:
    "relative z-1 flex size-full items-center justify-center",
  armorCopy:
    "flex min-w-0 flex-1 flex-col border-t border-line-bright/20 bg-surface/20 p-3 max-tablet:border-t-0 max-tablet:border-l max-tablet:border-line-bright/20",
  armorSlot:
    "font-sans text-2xs font-bold uppercase tracking-wider text-gold",
  armorName:
    "mt-0.75 overflow-hidden text-ellipsis whitespace-nowrap font-display text-lg leading-tight font-normal text-ink tablet:max-compact-desktop:text-base max-tablet:text-base",
  armorChange:
    "mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-2xs font-semibold text-ink-faint",
  armorStats:
    "mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-line/60 pt-2",
  armorStatsLabel:
    "w-full font-sans text-2xs font-bold uppercase tracking-wider text-ink-faint",
  armorStatsValues:
    "flex items-center gap-1.5 font-display text-lg leading-none lining-nums tabular-nums text-ink-soft",
  armorStatsArrow: "size-3.25 text-ink-faint",
  footer:
    "relative z-1 flex flex-none items-center justify-between gap-4.5 border-t border-line bg-surface/65 bg-aura-gold px-7 pt-4.5 pb-5.5 shadow-control max-tablet:flex-col max-tablet:items-stretch max-tablet:p-4 max-mobile-wide:px-3.5",
  footerCopy:
    "m-0 max-w-105 font-sans text-sm leading-relaxed font-medium text-ink-soft max-mobile-wide:text-xs",
  footerActions:
    "flex flex-none gap-2 max-tablet:grid max-tablet:grid-cols-2",
  actionIcon: "size-3.5 flex-none",
} as const satisfies Record<OptimizationLightboxElement, string>;

type OptimizationCompatibility = "compatible" | "incompatible";

export const OPTIMIZATION_COMPATIBILITY_CLASS_NAMES = {
  compatible:
    "mt-auto overflow-hidden text-ellipsis whitespace-nowrap pt-2 font-sans text-2xs font-bold uppercase tracking-wide text-verdant",
  incompatible:
    "mt-auto overflow-hidden text-ellipsis whitespace-nowrap pt-2 font-sans text-2xs font-bold uppercase tracking-wide text-danger",
} as const satisfies Record<OptimizationCompatibility, string>;

type OptimizationDeltaTone = "positive" | "neutral";

export const OPTIMIZATION_DELTA_CLASS_NAMES = {
  positive:
    "ml-auto font-sans text-2xs font-bold not-italic text-verdant",
  neutral:
    "ml-auto font-sans text-2xs font-bold not-italic text-ink-faint",
} as const satisfies Record<OptimizationDeltaTone, string>;
