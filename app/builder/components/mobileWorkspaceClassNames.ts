export type MobileAffinityState =
  | "flow"
  | "stickyCollapsed"
  | "stickyExpanded";
export type MobileStatsState = "collapsed" | "expanded";
type MobileStatsPresentationState =
  | "collapsed"
  | "opening"
  | "expanded"
  | "closing";
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
    "contents max-tablet:fixed max-tablet:isolate max-tablet:inset-x-0 max-tablet:bottom-0 max-tablet:z-50 max-tablet:flex max-tablet:h-[calc(5.5rem_+_env(safe-area-inset-bottom))] max-tablet:flex-col max-tablet:overflow-visible max-tablet:border-0 max-tablet:bg-stat-sheet max-tablet:shadow-panel max-tablet:before:pointer-events-none max-tablet:before:absolute max-tablet:before:inset-0 max-tablet:before:z-0 max-tablet:before:bg-stat-sheet max-tablet:before:opacity-100 max-tablet:before:transition-opacity max-tablet:before:[transition-duration:320ms] max-tablet:before:ease-linear max-tablet:before:content-[''] motion-reduce:before:transition-none max-tablet:[--color-ink:var(--color-stat-sheet-on-dark)] max-tablet:[--color-ink-soft:var(--color-stat-sheet-on-dark-soft)] max-tablet:[--color-ink-faint:var(--color-stat-sheet-on-dark-faint)] max-tablet:[--color-gold:var(--color-stat-sheet-on-dark-gold)] max-tablet:[--color-gold-bright:var(--color-stat-sheet-on-dark-gold-bright)] max-tablet:[--color-gold-pale:var(--color-stat-sheet-on-dark-gold-pale)] max-tablet:[--color-line:var(--color-stat-sheet-on-dark-line)] max-tablet:[--color-line-bright:var(--color-stat-sheet-on-dark-line-bright)] max-tablet:[--color-frame-line:var(--color-stat-sheet-on-dark-frame)] max-tablet:[--color-frame-line-bright:var(--color-stat-sheet-on-dark-frame-bright)] tablet:max-compact-desktop:contents",
  expanded:
    "contents max-tablet:fixed max-tablet:isolate max-tablet:inset-x-0 max-tablet:bottom-0 max-tablet:z-50 max-tablet:flex max-tablet:h-[var(--mobile-stats-expanded-height)] max-tablet:max-h-[calc(100dvh_-_var(--spacing-mobile-header))] max-tablet:flex-col max-tablet:overflow-visible max-tablet:border-0 max-tablet:bg-stat-sheet-desktop-body max-tablet:shadow-panel max-tablet:before:pointer-events-none max-tablet:before:absolute max-tablet:before:inset-0 max-tablet:before:z-0 max-tablet:before:bg-stat-sheet max-tablet:before:opacity-0 max-tablet:before:transition-opacity max-tablet:before:[transition-duration:320ms] max-tablet:before:ease-linear max-tablet:before:content-[''] max-tablet:data-[mobile-state=closing]:before:opacity-100 motion-reduce:before:transition-none max-tablet:[--color-ink:var(--color-stat-sheet-on-dark)] max-tablet:[--color-ink-soft:var(--color-stat-sheet-on-dark-soft)] max-tablet:[--color-ink-faint:var(--color-stat-sheet-on-dark-faint)] max-tablet:[--color-gold:var(--color-stat-sheet-on-dark-gold)] max-tablet:[--color-gold-bright:var(--color-stat-sheet-on-dark-gold-bright)] max-tablet:[--color-gold-pale:var(--color-stat-sheet-on-dark-gold-pale)] max-tablet:[--color-line:var(--color-stat-sheet-on-dark-line)] max-tablet:[--color-line-bright:var(--color-stat-sheet-on-dark-line-bright)] max-tablet:[--color-frame-line:var(--color-stat-sheet-on-dark-frame)] max-tablet:[--color-frame-line-bright:var(--color-stat-sheet-on-dark-frame-bright)] tablet:max-compact-desktop:contents",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_TRIGGER_CLASS_NAMES = {
  collapsed:
    "group hidden outline-none max-tablet:pointer-events-auto max-tablet:absolute max-tablet:inset-x-0 max-tablet:top-0 max-tablet:z-30 max-tablet:block max-tablet:h-full max-tablet:w-full max-tablet:touch-manipulation max-tablet:border-0 max-tablet:bg-transparent max-tablet:p-0",
  expanded:
    "group hidden outline-none max-tablet:pointer-events-auto max-tablet:absolute max-tablet:inset-x-0 max-tablet:-top-6 max-tablet:z-30 max-tablet:block max-tablet:h-11 max-tablet:w-full max-tablet:touch-manipulation max-tablet:border-0 max-tablet:bg-transparent max-tablet:p-0",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_SUMMARY_CLASS_NAMES = {
  collapsed:
    "contents max-tablet:relative max-tablet:block max-tablet:min-h-full max-tablet:pb-[env(safe-area-inset-bottom)]",
  expanded:
    "contents max-tablet:relative max-tablet:block",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_TRIGGER_ICON_SHELL_CLASS_NAMES = {
  collapsed:
    "pointer-events-none absolute top-5.5 right-3 flex size-10 -translate-y-1/2 items-center justify-center group-focus-visible:shadow-focus",
  expanded:
    "pointer-events-none absolute top-5.5 right-[0.9375rem] flex size-10 -translate-y-1/2 items-center justify-center group-focus-visible:shadow-focus",
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
    "contents max-tablet:pointer-events-auto max-tablet:relative max-tablet:z-10 max-tablet:flex max-tablet:min-h-0 max-tablet:flex-1 max-tablet:overflow-x-hidden max-tablet:overflow-y-auto max-tablet:overscroll-contain max-tablet:data-[mobile-state=opening]:overflow-y-hidden max-tablet:data-[mobile-state=closing]:overflow-y-hidden max-tablet:data-[active-build-effects-open=true]:overflow-y-hidden tablet:max-compact-desktop:contents",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_RAIL_CLASS_NAMES = {
  collapsed:
    "relative z-10 col-span-3 col-start-10 row-start-1 min-w-0 px-3.5 py-4.5 compact-desktop:col-span-1 compact-desktop:col-start-3 max-tablet:block max-tablet:h-full max-tablet:min-w-0 max-tablet:w-full max-tablet:flex-none max-tablet:overflow-hidden max-tablet:px-safe-inline max-tablet:py-0 max-tablet:[&>div]:h-full tablet:max-compact-desktop:contents compact-desktop:max-wide-desktop:px-3.5 compact-desktop:max-wide-desktop:py-4.5",
  expanded:
    "relative z-10 col-span-3 col-start-10 row-start-1 min-w-0 px-3.5 py-4.5 compact-desktop:col-span-1 compact-desktop:col-start-3 max-tablet:block max-tablet:min-w-0 max-tablet:w-full max-tablet:flex-none max-tablet:overflow-visible max-tablet:px-[max(var(--spacing-safe-inline),1.5rem)] max-tablet:pt-6 max-tablet:pb-safe-bottom tablet:max-compact-desktop:contents compact-desktop:max-wide-desktop:px-3.5 compact-desktop:max-wide-desktop:py-4.5",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_HEADING_CLASS_NAMES = {
  collapsed:
    "relative isolate -mx-6 -mt-6 mb-4 flex min-h-18 items-center overflow-visible bg-stat-sheet-header-base px-7 py-2 compact-desktop:-mx-4 compact-desktop:-mt-4 compact-desktop:mb-0 compact-desktop:after:pointer-events-none compact-desktop:after:absolute compact-desktop:after:inset-x-0 compact-desktop:after:bottom-0 compact-desktop:after:z-40 compact-desktop:after:h-1.5 compact-desktop:after:bg-[image:var(--background-image-stat-sheet-divider)] compact-desktop:after:bg-[length:100%_6px] compact-desktop:after:bg-bottom compact-desktop:after:bg-no-repeat compact-desktop:after:content-[''] max-tablet:pointer-events-none max-tablet:-mx-safe-inline max-tablet:mt-0 max-tablet:mb-0 max-tablet:flex max-tablet:min-h-11 max-tablet:overflow-hidden max-tablet:bg-stat-sheet-desktop-body max-tablet:px-6 max-tablet:py-1 tablet:max-compact-desktop:hidden compact-desktop:max-wide-desktop:px-6",
  expanded:
    "relative isolate -mx-6 -mt-6 mb-4 flex min-h-18 items-center overflow-visible bg-stat-sheet-header-base px-7 py-2 compact-desktop:-mx-4 compact-desktop:-mt-4 compact-desktop:mb-0 compact-desktop:after:pointer-events-none compact-desktop:after:absolute compact-desktop:after:inset-x-0 compact-desktop:after:bottom-0 compact-desktop:after:z-40 compact-desktop:after:h-1.5 compact-desktop:after:bg-[image:var(--background-image-stat-sheet-divider)] compact-desktop:after:bg-[length:100%_6px] compact-desktop:after:bg-bottom compact-desktop:after:bg-no-repeat compact-desktop:after:content-[''] max-tablet:flex max-tablet:min-h-11 max-tablet:bg-stat-sheet-desktop-body max-tablet:px-6 max-tablet:py-1 tablet:max-compact-desktop:hidden compact-desktop:max-wide-desktop:px-6",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_HEADING_DIVIDER_CLASS_NAME =
  "pointer-events-none absolute inset-x-0 bottom-0 z-40 hidden h-1.5 bg-[image:var(--background-image-stat-sheet-divider)] bg-[length:100%_6px] bg-bottom bg-no-repeat max-tablet:block";

export const MOBILE_STATS_TITLE_CLASS_NAMES = {
  collapsed: "hidden max-tablet:inline",
  expanded: "hidden max-tablet:inline",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_TITLE_HEADING_CLASS_NAMES = {
  collapsed: "max-tablet:block",
  expanded: "max-tablet:block",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_STATS_COMPACT_CLASS_NAMES = {
  collapsed:
    "hidden max-tablet:absolute max-tablet:inset-x-0 max-tablet:top-11 max-tablet:grid max-tablet:h-11 max-tablet:grid-cols-[minmax(7.5rem,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] max-tablet:items-stretch max-tablet:opacity-100 max-tablet:transition-opacity max-tablet:[transition-duration:320ms] max-tablet:ease-linear motion-reduce:transition-none",
  opening:
    "hidden max-tablet:pointer-events-none max-tablet:absolute max-tablet:inset-x-0 max-tablet:top-11 max-tablet:grid max-tablet:h-11 max-tablet:grid-cols-[minmax(7.5rem,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] max-tablet:items-stretch max-tablet:opacity-0 max-tablet:transition-opacity max-tablet:[transition-duration:320ms] max-tablet:ease-linear motion-reduce:transition-none",
  expanded:
    "hidden max-tablet:pointer-events-none max-tablet:absolute max-tablet:inset-x-0 max-tablet:top-11 max-tablet:grid max-tablet:h-11 max-tablet:grid-cols-[minmax(7.5rem,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] max-tablet:items-stretch max-tablet:opacity-0 max-tablet:transition-opacity max-tablet:[transition-duration:320ms] max-tablet:ease-linear motion-reduce:transition-none",
  closing:
    "hidden max-tablet:absolute max-tablet:inset-x-0 max-tablet:top-11 max-tablet:grid max-tablet:h-11 max-tablet:grid-cols-[minmax(7.5rem,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] max-tablet:items-stretch max-tablet:opacity-100 max-tablet:transition-opacity max-tablet:[transition-duration:320ms] max-tablet:ease-linear motion-reduce:transition-none",
} as const satisfies Record<MobileStatsPresentationState, string>;

export const MOBILE_STATS_EXPANDED_CONTENT_CLASS_NAMES = {
  collapsed: "contents max-tablet:hidden",
  opening:
    "contents max-tablet:[&>*]:opacity-100 max-tablet:[&>*]:transition-opacity max-tablet:[&>*]:[transition-duration:320ms] max-tablet:[&>*]:ease-linear motion-reduce:max-tablet:[&>*]:transition-none",
  expanded:
    "contents max-tablet:[&>*]:opacity-100 max-tablet:[&>*]:transition-opacity max-tablet:[&>*]:[transition-duration:320ms] max-tablet:[&>*]:ease-linear motion-reduce:max-tablet:[&>*]:transition-none",
  closing:
    "contents max-tablet:pointer-events-none max-tablet:[&>*]:opacity-0 max-tablet:[&>*]:transition-opacity max-tablet:[&>*]:[transition-duration:320ms] max-tablet:[&>*]:ease-linear motion-reduce:max-tablet:[&>*]:transition-none",
} as const satisfies Record<MobileStatsPresentationState, string>;

export const MOBILE_STATS_COMPACT_DEFENSE_CLASS_NAME =
  "relative flex min-w-0 items-center gap-1 border-r border-stat-sheet-on-dark-line/35 pr-1";

export const MOBILE_STATS_COMPACT_CREST_CLASS_NAME =
  "relative block h-10 w-9 flex-none";

export const MOBILE_STATS_COMPACT_CREST_LAYER_CLASS_NAME =
  "pointer-events-none absolute inset-0 size-full select-none object-contain";

export const MOBILE_STATS_COMPACT_TOTAL_CLASS_NAME =
  "absolute inset-0 flex items-center justify-center font-display text-sm font-normal leading-none lining-nums tabular-nums text-stat-sheet-on-dark-gold-bright text-shadow-value";

export const MOBILE_STATS_COMPACT_DEFENSE_VALUES_CLASS_NAME =
  "grid min-w-0 flex-1 grid-cols-3 items-center gap-0.5";

export const MOBILE_STATS_COMPACT_DEFENSE_ITEM_CLASS_NAME =
  "flex min-w-0 flex-col items-center justify-center gap-0.5 font-display text-2xs font-normal leading-none lining-nums tabular-nums text-stat-sheet-on-dark-gold-bright [&>img]:size-3 [&>img]:object-contain [&>img]:sepia [&>img]:brightness-150";

export const MOBILE_STATS_COMPACT_GROUP_CLASS_NAME =
  "flex min-w-0 flex-col justify-center border-r border-stat-sheet-on-dark-line/35 px-1.5 last:border-r-0";

export const MOBILE_STATS_COMPACT_GROUP_LABEL_CLASS_NAME =
  "truncate font-sans text-[0.5625rem] font-bold uppercase leading-none tracking-wide text-stat-sheet-on-dark-gold";

export const MOBILE_STATS_COMPACT_METRICS_CLASS_NAME =
  "mt-1 grid min-w-0 grid-cols-2 gap-1";

export const MOBILE_STATS_COMPACT_METRIC_CLASS_NAME =
  "flex min-w-0 items-baseline gap-0.5 whitespace-nowrap";

export const MOBILE_STATS_COMPACT_METRIC_LABEL_CLASS_NAME =
  "font-sans text-[0.5rem] font-bold uppercase leading-none text-stat-sheet-on-dark-faint";

export const MOBILE_STATS_COMPACT_METRIC_VALUE_CLASS_NAME =
  "min-w-0 truncate font-display text-xs font-normal leading-none lining-nums tabular-nums text-stat-sheet-on-dark-gold-bright";

export const MOBILE_DEFENSE_BACKDROP_CLASS_NAME =
  "contents max-tablet:group-data-[mobile-state=expanded]/stat-sheet:relative max-tablet:group-data-[mobile-state=expanded]/stat-sheet:isolate max-tablet:group-data-[mobile-state=expanded]/stat-sheet:-mx-6 max-tablet:group-data-[mobile-state=expanded]/stat-sheet:block max-tablet:group-data-[mobile-state=expanded]/stat-sheet:px-6 max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:pointer-events-none max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:absolute max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:inset-x-0 max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:-top-4 max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:-bottom-2 max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:z-0 max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:bg-stat-sheet-header-pattern max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:opacity-[0.05] max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:[mask-image:var(--background-image-stat-sheet-header-floral)] max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:[mask-mode:luminance] max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:[mask-position:center] max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:[mask-repeat:repeat] max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:[mask-size:32rem_32rem] max-tablet:group-data-[mobile-state=expanded]/stat-sheet:before:content-[''] compact-desktop:relative compact-desktop:isolate compact-desktop:-mx-4 compact-desktop:block compact-desktop:px-4 compact-desktop:pt-4 compact-desktop:pb-5 compact-desktop:before:pointer-events-none compact-desktop:before:absolute compact-desktop:before:inset-0 compact-desktop:before:z-0 compact-desktop:before:bg-stat-sheet-header-pattern compact-desktop:before:opacity-[0.05] compact-desktop:before:[mask-image:var(--background-image-stat-sheet-header-floral)] compact-desktop:before:[mask-mode:luminance] compact-desktop:before:[mask-position:center] compact-desktop:before:[mask-repeat:repeat] compact-desktop:before:[mask-size:32rem_32rem] compact-desktop:before:content-[''] compact-desktop:max-wide-desktop:pb-3.5";

export const MOBILE_DEFENSE_HUD_CLASS_NAMES = {
  collapsed:
    "relative mx-auto mt-0.5 mb-5 aspect-defense-hud w-full max-w-72.5 [--color-ink:var(--color-stat-sheet-on-dark)] [--color-ink-soft:var(--color-stat-sheet-on-dark-soft)] [--color-ink-faint:var(--color-stat-sheet-on-dark-faint)] [--color-gold:var(--color-stat-sheet-on-dark-gold)] [--color-gold-bright:var(--color-stat-sheet-on-dark-gold-bright)] [--color-gold-pale:var(--color-stat-sheet-on-dark-gold-pale)] compact-desktop:z-10 compact-desktop:mt-0 compact-desktop:mb-0 compact-desktop:h-36 compact-desktop:aspect-auto max-tablet:col-start-1 max-tablet:row-start-1 max-tablet:m-0 max-tablet:flex max-tablet:h-13.5 max-tablet:w-full max-tablet:max-w-none max-tablet:items-center max-tablet:justify-center tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-2 tablet:max-compact-desktop:mb-2.5 tablet:max-compact-desktop:justify-self-center",
  expanded:
    "relative mx-auto mt-0.5 mb-5 aspect-defense-hud w-full max-w-72.5 [--color-ink:var(--color-stat-sheet-on-dark)] [--color-ink-soft:var(--color-stat-sheet-on-dark-soft)] [--color-ink-faint:var(--color-stat-sheet-on-dark-faint)] [--color-gold:var(--color-stat-sheet-on-dark-gold)] [--color-gold-bright:var(--color-stat-sheet-on-dark-gold-bright)] [--color-gold-pale:var(--color-stat-sheet-on-dark-gold-pale)] compact-desktop:z-10 compact-desktop:mt-0 compact-desktop:mb-0 compact-desktop:h-36 compact-desktop:aspect-auto max-tablet:z-20 max-tablet:isolate max-tablet:mt-0 max-tablet:mb-2 max-tablet:grid max-tablet:aspect-auto max-tablet:min-h-20 max-tablet:w-full max-tablet:max-w-none max-tablet:grid-cols-5 max-tablet:items-center max-tablet:gap-1.5 max-tablet:px-2 max-tablet:py-1.5 tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-2 tablet:max-compact-desktop:mb-2.5 tablet:max-compact-desktop:justify-self-center",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_CREST_CLASS_NAMES = {
  collapsed:
    "pointer-events-none absolute top-0 -right-0 z-10 h-full w-3/5 select-none compact-desktop:right-auto compact-desktop:left-0 compact-desktop:w-[54%] max-tablet:relative max-tablet:top-auto max-tablet:right-auto max-tablet:block max-tablet:h-10 max-tablet:w-9",
  expanded:
    "pointer-events-none absolute top-0 -right-0 z-10 h-full w-3/5 select-none compact-desktop:right-auto compact-desktop:left-0 compact-desktop:w-[54%] max-tablet:relative max-tablet:top-auto max-tablet:right-auto max-tablet:col-span-2 max-tablet:col-start-1 max-tablet:row-start-1 max-tablet:h-20 max-tablet:w-18 max-tablet:justify-self-center",
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
    "absolute inset-0 flex items-center justify-center overflow-visible whitespace-nowrap text-center font-display text-display font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-display compact-desktop:isolate compact-desktop:text-[clamp(3.5rem,5.56vw,5rem)] compact-desktop:text-stat-sheet-damage-bonus compact-desktop:text-shadow-defense-total compact-desktop:before:absolute compact-desktop:before:top-1/2 compact-desktop:before:left-1/2 compact-desktop:before:-z-10 compact-desktop:before:h-[48%] compact-desktop:before:w-[78%] compact-desktop:before:-translate-x-1/2 compact-desktop:before:-translate-y-1/2 compact-desktop:before:bg-night compact-desktop:before:blur-[24px] compact-desktop:before:content-[''] max-tablet:text-xl",
  expanded:
    "absolute inset-0 flex items-center justify-center overflow-visible whitespace-nowrap text-center font-display text-display font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-display compact-desktop:isolate compact-desktop:text-[clamp(3.5rem,5.56vw,5rem)] compact-desktop:text-stat-sheet-damage-bonus compact-desktop:text-shadow-defense-total compact-desktop:before:absolute compact-desktop:before:top-1/2 compact-desktop:before:left-1/2 compact-desktop:before:-z-10 compact-desktop:before:h-[48%] compact-desktop:before:w-[78%] compact-desktop:before:-translate-x-1/2 compact-desktop:before:-translate-y-1/2 compact-desktop:before:bg-night compact-desktop:before:blur-[24px] compact-desktop:before:content-[''] max-tablet:text-xl",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_TOTAL_LABEL_CLASS_NAMES = {
  collapsed:
    "hidden max-tablet:pointer-events-none max-tablet:absolute max-tablet:block max-tablet:opacity-0",
  expanded:
    "hidden max-tablet:absolute max-tablet:top-0 max-tablet:left-1/2 max-tablet:z-20 max-tablet:block max-tablet:-translate-x-1/2 max-tablet:whitespace-nowrap max-tablet:font-sans max-tablet:text-xs max-tablet:font-bold max-tablet:uppercase max-tablet:tracking-wider max-tablet:text-gold",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_PLAQUE_CLASS_NAMES = {
  collapsed:
    "absolute top-1/10 right-0 bottom-1/12 grid w-[46%] grid-rows-3 py-2 pr-2 pl-0 compact-desktop:inset-y-0 compact-desktop:w-[42%] compact-desktop:grid-rows-[repeat(3,auto)] compact-desktop:content-center compact-desktop:gap-0.5 compact-desktop:py-0 max-tablet:contents tablet:max-compact-desktop:right-auto tablet:max-compact-desktop:left-0 tablet:max-compact-desktop:w-8/15 tablet:max-compact-desktop:pr-8 tablet:max-compact-desktop:pl-2",
  expanded:
    "absolute top-1/10 right-0 bottom-1/12 grid w-[46%] grid-rows-3 py-2 pr-2 pl-0 compact-desktop:inset-y-0 compact-desktop:w-[42%] compact-desktop:grid-rows-[repeat(3,auto)] compact-desktop:content-center compact-desktop:gap-0.5 compact-desktop:py-0 max-tablet:contents tablet:max-compact-desktop:right-auto tablet:max-compact-desktop:left-0 tablet:max-compact-desktop:w-8/15 tablet:max-compact-desktop:pr-8 tablet:max-compact-desktop:pl-2",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_PLAQUE_DECORATION_CLASS_NAMES = {
  collapsed:
    "pointer-events-none absolute inset-0 block size-full compact-desktop:hidden max-tablet:hidden",
  expanded:
    "pointer-events-none absolute inset-0 block size-full compact-desktop:hidden max-tablet:hidden",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_STAT_CLASS_NAMES = {
  collapsed:
    "group/defense-stat relative z-10 grid min-w-0 grid-cols-2 items-center gap-2.25 compact-desktop:grid-cols-[1.375rem_auto_1.75rem] compact-desktop:justify-start compact-desktop:gap-1 max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
  expanded:
    "group/defense-stat relative z-10 grid min-w-0 grid-cols-2 items-center gap-2.25 compact-desktop:grid-cols-[1.375rem_auto_1.75rem] compact-desktop:justify-start compact-desktop:gap-1 max-tablet:flex max-tablet:flex-col max-tablet:justify-center max-tablet:gap-1 max-tablet:leading-none",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_STAT_IMAGE_CLASS_NAMES = {
  collapsed:
    "h-auto w-full pointer-events-none select-none sepia saturate-125 brightness-150 drop-shadow-sm compact-desktop:size-5.5 compact-desktop:justify-self-center compact-desktop:object-contain max-tablet:w-6",
  expanded:
    "h-auto w-full pointer-events-none select-none sepia saturate-125 brightness-150 drop-shadow-sm compact-desktop:size-5.5 compact-desktop:justify-self-center compact-desktop:object-contain max-tablet:w-6",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_DEFENSE_STAT_INFO_CLASS_NAME =
  "ml-3 hidden size-4 cursor-help items-center justify-center rounded-full border border-stat-sheet-header-base bg-transparent font-display text-[0.5625rem] font-semibold italic leading-none text-stat-sheet-on-dark-gold transition-colors hover:border-stat-sheet-on-dark-gold hover:text-stat-sheet-on-dark-gold-bright focus-visible:border-stat-sheet-on-dark-gold-bright focus-visible:text-stat-sheet-on-dark-gold-bright focus-visible:outline-none focus-visible:shadow-focus compact-desktop:inline-flex max-tablet:absolute max-tablet:inset-0 max-tablet:z-30 max-tablet:m-0 max-tablet:inline-flex max-tablet:size-auto max-tablet:min-h-11 max-tablet:min-w-11 max-tablet:cursor-pointer max-tablet:border-transparent max-tablet:text-transparent max-tablet:hover:border-transparent max-tablet:hover:text-transparent max-tablet:focus-visible:border-transparent max-tablet:focus-visible:text-transparent motion-reduce:transition-none";

export const MOBILE_DEFENSE_STAT_INFO_GLYPH_CLASS_NAME =
  "pointer-events-none max-tablet:absolute max-tablet:top-0 max-tablet:right-0 max-tablet:flex max-tablet:size-4 max-tablet:items-center max-tablet:justify-center max-tablet:rounded-full max-tablet:border max-tablet:border-stat-sheet-on-dark-gold max-tablet:bg-stat-sheet-desktop-body max-tablet:text-[0.5625rem] max-tablet:text-stat-sheet-on-dark-gold-bright";

export const MOBILE_DEFENSE_STAT_CONTEXT_CLASS_NAME =
  "pointer-events-none fixed z-70 w-64 max-w-[calc(100vw-1.5rem)] animate-popover-in border border-stat-sheet-on-dark-line-bright/70 bg-stat-sheet px-3 py-2.5 text-left shadow-popover max-tablet:w-72 max-tablet:bg-stat-sheet-desktop-body motion-reduce:animate-none";

export const MOBILE_DEFENSE_STAT_CONTEXT_ACTIVE_CLASS_NAME =
  "opacity-100";

export const MOBILE_DEFENSE_STAT_CONTEXT_TITLE_CLASS_NAME =
  "block font-display text-base font-normal text-stat-sheet-on-dark-gold-bright";

export const MOBILE_DEFENSE_STAT_CONTEXT_COPY_CLASS_NAME =
  "mt-1 block font-sans text-2xs font-semibold leading-relaxed text-stat-sheet-on-dark-soft";

export const MOBILE_DEFENSE_STAT_VALUE_CLASS_NAMES = {
  collapsed:
    "font-display text-heading font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-value max-tablet:text-2xs max-tablet:leading-none",
  expanded:
    "font-display text-heading font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-value max-tablet:text-base",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_BUILD_DAMAGE_CLASS_NAMES = {
  collapsed:
    "mt-3 compact-desktop:mt-0 max-tablet:col-span-2 max-tablet:col-start-2 max-tablet:row-start-1 max-tablet:m-0 max-tablet:min-w-0 max-tablet:border-l max-tablet:border-line/30 max-tablet:pl-1.5 tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-4 tablet:max-compact-desktop:mt-2 tablet:max-compact-desktop:px-3.5",
  expanded:
    "mt-3 compact-desktop:mt-0 max-tablet:mt-1 max-tablet:w-full tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-4 tablet:max-compact-desktop:mt-2 tablet:max-compact-desktop:px-3.5",
} as const satisfies Record<MobileStatsState, string>;

export const MOBILE_BUILD_DAMAGE_PANELS_CLASS_NAMES = {
  collapsed:
    "grid gap-3.5 max-tablet:m-0 max-tablet:grid max-tablet:max-w-none max-tablet:grid-cols-2 max-tablet:gap-2.5 max-tablet:[&>*+*]:border-l max-tablet:[&>*+*]:border-line/30 max-tablet:[&>*+*]:pl-2.5 tablet:max-compact-desktop:grid-cols-1 tablet:max-compact-desktop:gap-2 compact-desktop:max-wide-desktop:grid-cols-1 compact-desktop:max-wide-desktop:gap-2.5",
  expanded:
    "grid gap-3.5 max-tablet:grid max-tablet:w-full max-tablet:grid-cols-1 max-tablet:gap-2 tablet:max-compact-desktop:grid-cols-1 tablet:max-compact-desktop:gap-2 compact-desktop:max-wide-desktop:grid-cols-1 compact-desktop:max-wide-desktop:gap-2.5",
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
