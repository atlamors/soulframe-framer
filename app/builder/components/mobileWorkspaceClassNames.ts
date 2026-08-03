export type MobileAffinityState =
  | "flow"
  | "stickyCollapsed"
  | "stickyExpanded";
export type MobileStatsState = "collapsed" | "expanded";
type MobileVisibilityState = "hidden" | "visible";

export const MOBILE_WORKSPACE_SCRIM_CLASS_NAMES = {
  hidden:
    "hidden max-tablet:fixed max-tablet:inset-0 max-tablet:z-40 max-tablet:block max-tablet:border-0 max-tablet:bg-surface-overlay max-tablet:p-0 max-tablet:opacity-0 max-tablet:pointer-events-none max-tablet:transition-opacity max-tablet:duration-250 max-tablet:ease-linear motion-reduce:transition-none",
  visible:
    "hidden max-tablet:fixed max-tablet:inset-0 max-tablet:z-40 max-tablet:block max-tablet:border-0 max-tablet:bg-surface-overlay max-tablet:p-0 max-tablet:opacity-100 max-tablet:pointer-events-auto max-tablet:visible max-tablet:transition-opacity max-tablet:duration-250 max-tablet:ease-linear max-tablet:delay-0 motion-reduce:transition-none",
} as const satisfies Record<MobileVisibilityState, string>;

export const MOBILE_AFFINITY_SECTION_CLASS_NAMES = {
  flow: "contents max-tablet:relative max-tablet:block",
  stickyCollapsed:
    "contents max-tablet:relative max-tablet:block max-tablet:min-h-mobile-affinity-panel",
  stickyExpanded:
    "contents max-tablet:relative max-tablet:block max-tablet:min-h-mobile-affinity-panel",
} as const satisfies Record<MobileAffinityState, string>;

export const MOBILE_AFFINITY_TRIGGER_CLASS_NAMES = {
  flow:
    "hidden max-tablet:fixed max-tablet:inset-x-3 max-tablet:top-mobile-header max-tablet:z-50 max-tablet:grid max-tablet:h-11 max-tablet:grid-cols-3 max-tablet:items-center max-tablet:border max-tablet:border-line/50 max-tablet:bg-surface max-tablet:bg-control max-tablet:px-2.5 max-tablet:text-left max-tablet:text-ink-soft max-tablet:opacity-0 max-tablet:pointer-events-none max-tablet:invisible max-tablet:-translate-y-2 max-tablet:shadow-panel max-tablet:transition-colors max-tablet:duration-300 max-tablet:ease-linear max-tablet:delay-300 motion-reduce:transition-none",
  stickyCollapsed:
    "hidden max-tablet:fixed max-tablet:inset-x-0 max-tablet:top-mobile-header max-tablet:z-50 max-tablet:flex max-tablet:h-11 max-tablet:items-center max-tablet:gap-2 max-tablet:border max-tablet:border-line/50 max-tablet:bg-surface max-tablet:bg-control max-tablet:px-safe-inline max-tablet:text-left max-tablet:text-ink-soft max-tablet:opacity-100 max-tablet:pointer-events-auto max-tablet:visible max-tablet:translate-y-0 max-tablet:shadow-panel max-tablet:transition-colors max-tablet:duration-300 max-tablet:ease-linear max-tablet:delay-0 motion-reduce:transition-none",
  stickyExpanded:
    "hidden max-tablet:fixed max-tablet:inset-x-0 max-tablet:top-mobile-header max-tablet:z-50 max-tablet:flex max-tablet:h-11 max-tablet:items-center max-tablet:gap-2 max-tablet:border max-tablet:border-line/50 max-tablet:bg-surface max-tablet:bg-control max-tablet:px-safe-inline max-tablet:text-left max-tablet:text-gold-bright max-tablet:opacity-100 max-tablet:pointer-events-auto max-tablet:visible max-tablet:translate-y-0 max-tablet:shadow-inset-accent max-tablet:transition-colors max-tablet:duration-300 max-tablet:ease-linear max-tablet:delay-0 motion-reduce:transition-none",
} as const satisfies Record<MobileAffinityState, string>;

export const MOBILE_AFFINITY_TRIGGER_LABEL_CLASS_NAME =
  "flex-none font-sans text-2xs font-bold uppercase tracking-widest";

export const MOBILE_AFFINITY_TRIGGER_SUMMARY_CLASS_NAME =
  "ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 text-ink-faint";

export const MOBILE_AFFINITY_TRIGGER_SUMMARY_ITEM_CLASS_NAME =
  "inline-flex min-w-0 items-center gap-0.5 whitespace-nowrap font-display text-sm leading-none font-normal lining-nums tabular-nums text-gold-bright";

export const MOBILE_AFFINITY_TRIGGER_ICON_CLASS_NAMES = {
  flow:
    "size-3.75 flex-none transition-transform duration-300 ease-spring motion-reduce:transition-none",
  stickyCollapsed:
    "size-3.75 flex-none transition-transform duration-300 ease-spring motion-reduce:transition-none",
  stickyExpanded:
    "size-3.75 flex-none rotate-180 transition-transform duration-300 ease-spring motion-reduce:transition-none",
} as const satisfies Record<MobileAffinityState, string>;

export const MOBILE_AFFINITY_PANEL_CLASS_NAMES = {
  flow: "contents max-tablet:block",
  stickyCollapsed:
    "contents max-tablet:fixed max-tablet:inset-x-0 max-tablet:top-mobile-header max-tablet:bottom-mobile-affinity-bottom max-tablet:mt-11 max-tablet:z-50 max-tablet:block max-tablet:max-h-0 max-tablet:origin-top max-tablet:-translate-y-2.5 max-tablet:scale-y-95 max-tablet:overflow-x-hidden max-tablet:overflow-y-auto max-tablet:overscroll-contain max-tablet:border max-tablet:border-line/50 max-tablet:bg-surface max-tablet:bg-aura-gold max-tablet:opacity-0 max-tablet:pointer-events-none max-tablet:invisible max-tablet:shadow-panel max-tablet:transition-all max-tablet:duration-300 max-tablet:ease-linear max-tablet:delay-300 motion-reduce:transition-none",
  stickyExpanded:
    "contents max-tablet:fixed max-tablet:inset-x-0 max-tablet:top-mobile-header max-tablet:bottom-mobile-affinity-bottom max-tablet:mt-11 max-tablet:z-50 max-tablet:block max-tablet:origin-top max-tablet:translate-y-0 max-tablet:scale-y-100 max-tablet:overflow-x-hidden max-tablet:overflow-y-auto max-tablet:overscroll-contain max-tablet:border max-tablet:border-line/50 max-tablet:bg-surface max-tablet:bg-aura-gold max-tablet:opacity-100 max-tablet:pointer-events-auto max-tablet:visible max-tablet:shadow-panel max-tablet:transition-all max-tablet:duration-300 max-tablet:ease-linear max-tablet:delay-0 motion-reduce:transition-none",
} as const satisfies Record<MobileAffinityState, string>;

export const MOBILE_AFFINITY_HEADING_CLASS_NAMES = {
  flow:
    "mb-4.5 flex items-baseline justify-between max-tablet:col-span-full compact-desktop:max-wide-desktop:mb-3",
  stickyCollapsed:
    "mb-4.5 flex items-baseline justify-between max-tablet:hidden compact-desktop:max-wide-desktop:mb-3",
  stickyExpanded:
    "mb-4.5 flex items-baseline justify-between max-tablet:hidden compact-desktop:max-wide-desktop:mb-3",
} as const satisfies Record<MobileAffinityState, string>;

export const MOBILE_AFFINITY_SENTINEL_CLASS_NAME =
  "hidden max-tablet:pointer-events-none max-tablet:absolute max-tablet:bottom-12.5 max-tablet:left-0 max-tablet:block max-tablet:size-px";

export const MOBILE_STATS_DOCK_CLASS_NAMES = {
  collapsed:
    "contents max-tablet:fixed max-tablet:inset-x-0 max-tablet:bottom-0 max-tablet:z-50 max-tablet:flex max-tablet:h-18 max-tablet:flex-col max-tablet:overflow-hidden max-tablet:border-0 max-tablet:bg-surface max-tablet:pb-safe-bottom max-tablet:shadow-panel tablet:max-compact-desktop:contents",
  expanded:
    "contents max-tablet:fixed max-tablet:inset-x-0 max-tablet:bottom-0 max-tablet:z-50 max-tablet:flex max-tablet:h-[var(--mobile-stats-expanded-height)] max-tablet:max-h-[calc(100dvh_-_var(--spacing-mobile-header))] max-tablet:flex-col max-tablet:overflow-hidden max-tablet:border-0 max-tablet:bg-surface max-tablet:shadow-panel tablet:max-compact-desktop:contents",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_TRIGGER_CLASS_NAMES = {
  collapsed:
    "group hidden outline-none max-tablet:pointer-events-auto max-tablet:absolute max-tablet:inset-x-0 max-tablet:top-0 max-tablet:z-30 max-tablet:block max-tablet:h-full max-tablet:w-full max-tablet:touch-manipulation max-tablet:border-0 max-tablet:bg-transparent max-tablet:p-0",
  expanded:
    "group hidden outline-none max-tablet:pointer-events-auto max-tablet:absolute max-tablet:inset-0 max-tablet:z-30 max-tablet:block max-tablet:size-full max-tablet:touch-manipulation max-tablet:border-0 max-tablet:bg-transparent max-tablet:p-0",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_SUMMARY_CLASS_NAMES = {
  collapsed:
    "contents max-tablet:relative max-tablet:grid max-tablet:min-h-13.5 max-tablet:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] max-tablet:items-center max-tablet:gap-1 max-tablet:pr-10",
  expanded:
    "contents max-tablet:relative max-tablet:block",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_TRIGGER_ICON_SHELL_CLASS_NAMES = {
  collapsed:
    "pointer-events-none absolute top-1/2 right-0 flex size-10 -translate-y-1/2 items-center justify-center group-focus-visible:shadow-focus",
  expanded:
    "pointer-events-none absolute top-1 right-0 flex size-10 items-center justify-center group-focus-visible:shadow-focus",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_TRIGGER_ICON_CLASS_NAMES = {
  collapsed:
    "pointer-events-none relative z-10 block h-auto w-3.5 saturate-125 drop-shadow-art",
  expanded:
    "pointer-events-none relative z-10 block h-auto w-3.5 rotate-180 saturate-125 drop-shadow-art",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_PANEL_CLASS_NAMES = {
  collapsed:
    "contents max-tablet:pointer-events-none max-tablet:relative max-tablet:flex max-tablet:min-h-0 max-tablet:flex-1 max-tablet:overflow-hidden tablet:max-compact-desktop:contents",
  expanded:
    "contents max-tablet:pointer-events-auto max-tablet:relative max-tablet:z-10 max-tablet:flex max-tablet:min-h-0 max-tablet:flex-1 max-tablet:overflow-x-hidden max-tablet:overflow-y-auto max-tablet:overscroll-contain tablet:max-compact-desktop:contents",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_RAIL_CLASS_NAMES = {
  collapsed:
    "relative z-10 col-span-3 col-start-10 row-start-1 min-w-0 border-l border-line px-7.5 py-7 max-tablet:block max-tablet:min-w-0 max-tablet:w-full max-tablet:flex-none max-tablet:overflow-hidden max-tablet:border-l-0 max-tablet:px-safe-inline max-tablet:py-0 tablet:max-compact-desktop:contents compact-desktop:max-wide-desktop:px-3.5 compact-desktop:max-wide-desktop:py-4.5",
  expanded:
    "relative z-10 col-span-3 col-start-10 row-start-1 min-w-0 border-l border-line px-7.5 py-7 max-tablet:block max-tablet:min-w-0 max-tablet:w-full max-tablet:flex-none max-tablet:overflow-visible max-tablet:border-l-0 max-tablet:px-safe-inline max-tablet:pt-2.5 max-tablet:pb-safe-bottom tablet:max-compact-desktop:contents compact-desktop:max-wide-desktop:px-3.5 compact-desktop:max-wide-desktop:py-4.5",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_HEADING_CLASS_NAMES = {
  collapsed:
    "mb-4.5 flex items-baseline justify-between max-tablet:hidden tablet:max-compact-desktop:hidden compact-desktop:max-wide-desktop:mb-3",
  expanded:
    "mb-4.5 flex items-baseline justify-between max-tablet:hidden tablet:max-compact-desktop:hidden compact-desktop:max-wide-desktop:mb-3",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_HUD_CLASS_NAMES = {
  collapsed:
    "relative mx-auto mt-0.5 mb-5 aspect-defense-hud w-full max-w-72.5 max-tablet:col-start-1 max-tablet:row-start-1 max-tablet:m-0 max-tablet:flex max-tablet:h-13.5 max-tablet:w-full max-tablet:max-w-none max-tablet:items-center max-tablet:justify-center tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-2 tablet:max-compact-desktop:mb-2.5 tablet:max-compact-desktop:justify-self-center compact-desktop:max-wide-desktop:mt-0 compact-desktop:max-wide-desktop:mb-3.5 compact-desktop:max-wide-desktop:max-w-57.5",
  expanded:
    "relative mx-auto mt-0.5 mb-5 aspect-defense-hud w-full max-w-72.5 max-tablet:mt-0 max-tablet:mb-2 max-tablet:grid max-tablet:aspect-auto max-tablet:min-h-16 max-tablet:w-full max-tablet:max-w-none max-tablet:grid-cols-5 max-tablet:items-center max-tablet:gap-1.5 max-tablet:px-2 max-tablet:py-1.5 tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-2 tablet:max-compact-desktop:mb-2.5 tablet:max-compact-desktop:justify-self-center compact-desktop:max-wide-desktop:mt-0 compact-desktop:max-wide-desktop:mb-3.5 compact-desktop:max-wide-desktop:max-w-57.5",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_CREST_CLASS_NAMES = {
  collapsed:
    "pointer-events-none absolute top-0 -right-0 z-10 h-full w-3/5 select-none max-tablet:relative max-tablet:top-auto max-tablet:right-auto max-tablet:block max-tablet:h-10 max-tablet:w-9",
  expanded:
    "pointer-events-none absolute top-0 -right-0 z-10 h-full w-3/5 select-none max-tablet:relative max-tablet:top-auto max-tablet:right-auto max-tablet:col-start-1 max-tablet:row-start-1 max-tablet:h-14 max-tablet:w-12.5 max-tablet:justify-self-center",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_LAYER_CLASS_NAMES = {
  collapsed:
    "pointer-events-none absolute inset-0 size-full select-none object-contain",
  expanded:
    "pointer-events-none absolute inset-0 size-full select-none object-contain",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_FILIGREE_CLASS_NAMES = {
  collapsed: "max-tablet:opacity-0",
  expanded: "max-tablet:opacity-100",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_TOTAL_CLASS_NAMES = {
  collapsed:
    "absolute top-1/2 left-1/2 max-w-2/3 -translate-x-1/2 -translate-y-1/2 overflow-hidden text-clip whitespace-nowrap text-center font-display text-display font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-display max-tablet:text-xl",
  expanded:
    "absolute top-1/2 left-1/2 max-w-2/3 -translate-x-1/2 -translate-y-1/2 overflow-hidden text-clip whitespace-nowrap text-center font-display text-display font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-display max-tablet:text-xl",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_TOTAL_LABEL_CLASS_NAMES = {
  collapsed:
    "hidden max-tablet:pointer-events-none max-tablet:absolute max-tablet:block max-tablet:opacity-0",
  expanded:
    "hidden max-tablet:absolute max-tablet:top-0 max-tablet:left-1/2 max-tablet:z-20 max-tablet:block max-tablet:-translate-x-1/2 max-tablet:whitespace-nowrap max-tablet:font-sans max-tablet:text-xs max-tablet:font-bold max-tablet:uppercase max-tablet:tracking-wider max-tablet:text-gold",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_PLAQUE_CLASS_NAMES = {
  collapsed:
    "absolute top-1/10 bottom-1/12 left-0 grid w-8/15 grid-rows-3 py-2 pr-8 pl-2 max-tablet:contents",
  expanded:
    "absolute top-1/10 bottom-1/12 left-0 grid w-8/15 grid-rows-3 py-2 pr-8 pl-2 max-tablet:contents",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_PLAQUE_DECORATION_CLASS_NAMES = {
  collapsed:
    "pointer-events-none absolute inset-0 block size-full max-tablet:hidden",
  expanded:
    "pointer-events-none absolute inset-0 block size-full max-tablet:hidden",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_STAT_CLASS_NAMES = {
  collapsed:
    "relative z-10 grid min-w-0 grid-cols-2 items-center gap-2.25 max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
  expanded:
    "relative z-10 grid min-w-0 grid-cols-2 items-center gap-2.25 max-tablet:flex max-tablet:flex-col max-tablet:justify-center max-tablet:gap-1 max-tablet:leading-none",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_STAT_IMAGE_CLASS_NAMES = {
  collapsed:
    "h-auto w-full pointer-events-none select-none sepia saturate-125 brightness-150 drop-shadow-sm max-tablet:w-6",
  expanded:
    "h-auto w-full pointer-events-none select-none sepia saturate-125 brightness-150 drop-shadow-sm max-tablet:w-6",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_STAT_VALUE_CLASS_NAMES = {
  collapsed:
    "font-display text-heading font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-value max-tablet:text-2xs max-tablet:leading-none",
  expanded:
    "font-display text-heading font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-value max-tablet:text-base",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_BUILD_DAMAGE_CLASS_NAMES = {
  collapsed:
    "mt-3 max-tablet:col-span-2 max-tablet:col-start-2 max-tablet:row-start-1 max-tablet:m-0 max-tablet:min-w-0 max-tablet:border-l max-tablet:border-line/30 max-tablet:pl-1.5 tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-4 tablet:max-compact-desktop:mt-2 tablet:max-compact-desktop:px-3.5 compact-desktop:max-wide-desktop:mt-0",
  expanded:
    "mt-3 max-tablet:mt-1 max-tablet:w-full tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-4 tablet:max-compact-desktop:mt-2 tablet:max-compact-desktop:px-3.5 compact-desktop:max-wide-desktop:mt-0",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_BUILD_DAMAGE_HEADING_CLASS_NAMES = {
  collapsed:
    "mb-2.5 flex items-baseline justify-between max-tablet:hidden tablet:max-compact-desktop:hidden compact-desktop:max-wide-desktop:mb-3",
  expanded:
    "mb-2.5 flex items-baseline justify-between max-tablet:hidden tablet:max-compact-desktop:hidden compact-desktop:max-wide-desktop:mb-3",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_BUILD_DAMAGE_PANELS_CLASS_NAMES = {
  collapsed:
    "grid gap-3.5 max-tablet:m-0 max-tablet:grid max-tablet:max-w-none max-tablet:grid-cols-2 max-tablet:gap-0.5 tablet:max-compact-desktop:grid-cols-1 tablet:max-compact-desktop:gap-2 compact-desktop:max-wide-desktop:grid-cols-1 compact-desktop:max-wide-desktop:gap-2.5",
  expanded:
    "grid gap-3.5 max-tablet:grid max-tablet:w-full max-tablet:grid-cols-1 max-tablet:gap-2 tablet:max-compact-desktop:grid-cols-1 tablet:max-compact-desktop:gap-2 compact-desktop:max-wide-desktop:grid-cols-1 compact-desktop:max-wide-desktop:gap-2.5",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_BUILD_REQUIREMENT_CLASS_NAMES = {
  collapsed:
    "mb-3.5 flex flex-col gap-1 border-l-2 border-danger py-2 pl-2.5 font-sans max-tablet:hidden tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-3 tablet:max-compact-desktop:mx-3.5",
  expanded:
    "mb-3.5 flex flex-col gap-1 border-l-2 border-danger py-2 pl-2.5 font-sans max-tablet:hidden tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-3 tablet:max-compact-desktop:mx-3.5",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_SECONDARY_MODIFIERS_CLASS_NAMES = {
  collapsed:
    "mt-3 flex gap-6.5 border-t border-line pt-4.5 max-tablet:hidden tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-5 tablet:max-compact-desktop:mx-3.5 compact-desktop:max-wide-desktop:mt-2.5 compact-desktop:max-wide-desktop:gap-4 compact-desktop:max-wide-desktop:pt-3",
  expanded:
    "mt-3 flex gap-6.5 border-t border-line pt-4.5 max-tablet:mt-1.5 max-tablet:gap-4 max-tablet:pt-2 tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-5 tablet:max-compact-desktop:mx-3.5 compact-desktop:max-wide-desktop:mt-2.5 compact-desktop:max-wide-desktop:gap-4 compact-desktop:max-wide-desktop:pt-3",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_ACTIVE_EFFECTS_CLASS_NAMES = {
  collapsed:
    "group mt-3.5 border border-line-bright/20 max-tablet:hidden tablet:max-compact-desktop:col-span-7 tablet:max-compact-desktop:col-start-6 tablet:max-compact-desktop:row-start-5 tablet:max-compact-desktop:mx-2.5 tablet:max-compact-desktop:self-start",
  expanded:
    "group mt-3.5 border border-line-bright/20 max-tablet:mt-1.5 max-tablet:w-full tablet:max-compact-desktop:col-span-7 tablet:max-compact-desktop:col-start-6 tablet:max-compact-desktop:row-start-5 tablet:max-compact-desktop:mx-2.5 tablet:max-compact-desktop:self-start",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_ACTIVE_EFFECTS_SUMMARY_CLASS_NAMES = {
  collapsed:
    "flex min-h-10.5 cursor-pointer appearance-none list-none items-center gap-2 px-2.75 py-2 focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-10 max-tablet:flex-col max-tablet:items-center max-tablet:justify-center max-tablet:gap-0.25 max-tablet:p-0 max-tablet:pointer-events-none",
  expanded:
    "flex min-h-10.5 cursor-pointer appearance-none list-none items-center gap-2 px-2.75 py-2 focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_ACTIVE_EFFECTS_LABEL_CLASS_NAMES = {
  collapsed:
    "min-w-0 flex-1 text-xs font-bold text-ink-soft max-tablet:max-w-5.5 max-tablet:overflow-hidden max-tablet:whitespace-nowrap max-tablet:font-sans max-tablet:text-2xs max-tablet:tracking-wider max-tablet:text-gold",
  expanded:
    "min-w-0 flex-1 text-xs font-bold text-ink-soft",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_ACTIVE_EFFECTS_COUNT_CLASS_NAMES = {
  collapsed:
    "flex size-5.5 flex-none items-center justify-center bg-surface-raised/15 text-2xs text-gold-bright max-tablet:h-auto max-tablet:min-h-0 max-tablet:w-auto max-tablet:bg-transparent max-tablet:text-xs",
  expanded:
    "flex size-5.5 flex-none items-center justify-center bg-surface-raised/15 text-2xs text-gold-bright",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_ACTIVE_EFFECTS_DISCLOSURE_CLASS_NAMES = {
  collapsed:
    "size-3.75 flex-none text-ink-faint transition-transform duration-150 ease-out group-open:rotate-180 max-tablet:hidden motion-reduce:transition-none",
  expanded:
    "size-3.75 flex-none text-ink-faint transition-transform duration-150 ease-out group-open:rotate-180 motion-reduce:transition-none",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_ACTIVE_EFFECTS_CONTENT_CLASS_NAMES = {
  collapsed:
    "border-t border-line-bright/20 px-2.75 pt-1.25 pb-2.5 max-tablet:hidden",
  expanded:
    "border-t border-line-bright/20 px-2.75 pt-1.25 pb-2.5",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_ACTIVE_EFFECTS_ROW_CLASS_NAMES = {
  collapsed: "mt-1.75 mb-0 flex flex-col max-tablet:hidden",
  expanded: "mt-1.75 mb-0 flex flex-col",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_ACTIVE_EFFECTS_SOURCE_CLASS_NAMES = {
  collapsed:
    "text-2xs font-bold text-gold max-tablet:hidden",
  expanded:
    "text-2xs font-bold text-gold",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_ACTIVE_EFFECTS_TEXT_CLASS_NAMES = {
  collapsed:
    "text-2xs font-semibold leading-snug text-ink-faint max-tablet:hidden",
  expanded:
    "text-2xs font-semibold leading-snug text-ink-faint",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_ACTIVE_EFFECTS_EMPTY_CLASS_NAMES = {
  collapsed:
    "m-0 border-t border-line-bright/20 px-2.75 py-2.5 text-2xs font-semibold leading-snug text-ink-faint max-tablet:hidden",
  expanded:
    "m-0 border-t border-line-bright/20 px-2.75 py-2.5 text-2xs font-semibold leading-snug text-ink-faint",
} as const satisfies Record<MobileStatsState, string>;
