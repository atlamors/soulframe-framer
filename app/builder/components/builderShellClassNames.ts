type WorkspaceHeadingAppearance = "alignment" | "statsTitle" | "damageTitle";

export const BUILDER_SHELL_CLASS_NAMES = {
  app:
    "relative isolate mx-auto min-h-screen max-w-420 overflow-hidden px-16 max-tablet:bg-surface max-tablet:bg-none max-tablet:px-3 tablet:max-compact-desktop:px-3 compact-desktop:max-wide-desktop:px-7",
  workspace:
    "relative mt-6 grid min-h-170 grid-cols-12 border-y border-line bg-surface max-tablet:mt-mobile-header max-tablet:flex max-tablet:min-h-0 max-tablet:flex-col max-tablet:border-0 max-tablet:bg-transparent max-tablet:bg-none tablet:max-compact-desktop:mt-4 tablet:max-compact-desktop:min-h-0 tablet:max-compact-desktop:items-start compact-desktop:max-wide-desktop:mt-4 compact-desktop:max-wide-desktop:min-h-160",
  desktopContents: "contents",
  desktopHidden: "hidden",
  alignmentRail:
    "relative z-10 col-span-3 col-start-1 row-start-1 min-w-0 border-r border-line px-7.5 py-7 max-tablet:grid max-tablet:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] max-tablet:gap-x-2.25 max-tablet:border-r-0 max-tablet:border-b max-tablet:px-2 max-tablet:py-5 tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-1 tablet:max-compact-desktop:border-r tablet:max-compact-desktop:border-b tablet:max-compact-desktop:px-3.5 compact-desktop:max-wide-desktop:px-3.5 compact-desktop:max-wide-desktop:py-4.5",
  statsRail:
    "relative z-10 col-span-3 col-start-10 row-start-1 min-w-0 border-l border-line px-7.5 py-7 tablet:max-compact-desktop:block tablet:max-compact-desktop:flex-1 tablet:max-compact-desktop:border-l-0 tablet:max-compact-desktop:px-3.5 tablet:max-compact-desktop:py-4 compact-desktop:max-wide-desktop:px-3.5 compact-desktop:max-wide-desktop:py-4.5",
  statSheetSurface:
    "contents max-tablet:flex max-tablet:flex-col compact-desktop:-mx-2 compact-desktop:block compact-desktop:border-y compact-desktop:border-frame-line/28 compact-desktop:bg-stat-sheet compact-desktop:px-2 compact-desktop:py-2.5 compact-desktop:shadow-loadout-card",
  workspaceHeadingLabel:
    "font-sans text-xs font-bold uppercase tracking-wider text-ink-soft",
  workspaceHeadingMeta:
    "font-sans text-2xs font-bold uppercase tracking-widest text-gold",
  loadoutStage:
    "relative col-span-6 col-start-4 row-start-1 grid min-h-0 grid-cols-2 grid-rows-[auto_repeat(3,minmax(0,1fr))] gap-4 overflow-visible px-3 py-3 max-tablet:grid max-tablet:min-h-0 max-tablet:w-full max-tablet:grid-cols-2 max-tablet:grid-rows-none max-tablet:content-start max-tablet:gap-1.5 max-tablet:overflow-visible max-tablet:px-1.5 max-tablet:pt-2 max-tablet:pb-2.5 tablet:max-compact-desktop:col-span-7 tablet:max-compact-desktop:col-start-6 tablet:max-compact-desktop:row-start-1 tablet:max-compact-desktop:row-span-4 tablet:max-compact-desktop:flex tablet:max-compact-desktop:min-h-0 tablet:max-compact-desktop:flex-col tablet:max-compact-desktop:gap-2 tablet:max-compact-desktop:border-l tablet:max-compact-desktop:border-line tablet:max-compact-desktop:px-2.5 tablet:max-compact-desktop:pt-2.5 tablet:max-compact-desktop:pb-2 compact-desktop:max-wide-desktop:px-2 compact-desktop:max-wide-desktop:py-2",
  loadoutOptimization:
    "relative z-10 col-span-full col-start-1 row-start-5 mx-auto w-full max-w-72.5 max-tablet:relative max-tablet:inset-auto max-tablet:col-span-full max-tablet:row-start-5 max-tablet:w-full max-tablet:max-w-none tablet:max-compact-desktop:order-8 tablet:max-compact-desktop:max-w-none compact-desktop:max-wide-desktop:max-w-62.5",
  optimizationTrigger:
    "inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1.75 whitespace-nowrap border border-frame-line/42 bg-control px-3.5 font-sans text-xs font-bold uppercase tracking-wider text-gold-bright shadow-control transition-colors duration-150 ease-out hover:border-frame-line-bright/75 hover:bg-control-hover hover:text-ink focus-visible:border-frame-line-bright/75 focus-visible:bg-control-hover focus-visible:text-ink focus-visible:outline-none focus-visible:shadow-focus max-tablet:px-2 max-tablet:text-2xs max-tablet:tracking-wide max-tablet:whitespace-normal compact-desktop:max-wide-desktop:px-2.25 compact-desktop:max-wide-desktop:text-2xs motion-reduce:transition-none",
  optimizationTriggerIcon: "size-4",
  defenseHud:
    "relative mx-auto mt-0.5 mb-5 aspect-4/3 w-full max-w-72.5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-1 tablet:max-compact-desktop:mb-0 compact-desktop:max-wide-desktop:mt-0 compact-desktop:max-wide-desktop:mb-3.5 compact-desktop:max-wide-desktop:max-w-57.5",
  buildDamage:
    "mt-3 tablet:max-compact-desktop:col-start-2 tablet:max-compact-desktop:row-start-1 tablet:max-compact-desktop:mt-0 compact-desktop:max-wide-desktop:mt-0",
  buildDamagePanels:
    "grid gap-3.5 tablet:max-compact-desktop:grid-cols-2 compact-desktop:max-wide-desktop:grid-cols-1 compact-desktop:max-wide-desktop:gap-2.5",
  buildRequirementWarning:
    "mb-3.5 flex flex-col gap-1 border-l-2 border-danger py-2 pl-2.5 font-sans tablet:max-compact-desktop:col-span-full",
  secondaryModifiers:
    "mt-3 flex gap-6.5 border-t border-line pt-4.5 tablet:max-compact-desktop:col-span-full compact-desktop:max-wide-desktop:mt-2.5 compact-desktop:max-wide-desktop:gap-4 compact-desktop:max-wide-desktop:pt-3",
  footer: "flex min-h-13 items-center justify-end",
} as const;

export const WORKSPACE_HEADING_CLASS_NAMES = {
  alignment:
    "mb-4.5 flex items-baseline justify-between max-tablet:col-span-full compact-desktop:max-wide-desktop:mb-3",
  statsTitle:
    "mb-4.5 flex items-baseline justify-between tablet:max-compact-desktop:hidden compact-desktop:max-wide-desktop:mb-3",
  damageTitle:
    "mb-2.5 flex items-baseline justify-between tablet:max-compact-desktop:hidden compact-desktop:max-wide-desktop:mb-3",
} as const satisfies Record<WorkspaceHeadingAppearance, string>;

export const DEFENSE_HUD_CLASS_NAMES = {
  plaque:
    "absolute top-1/10 bottom-1/12 left-0 grid w-8/15 grid-rows-3 py-2 pr-8 pl-2",
  stat:
    "relative z-10 grid min-w-0 grid-cols-2 items-center gap-2.25",
  statImage:
    "h-auto w-full pointer-events-none select-none sepia saturate-125 brightness-150 drop-shadow-sm",
  statValue:
    "font-display text-heading font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-value",
  crest:
    "pointer-events-none absolute top-0 -right-0 z-10 h-full w-3/5 select-none",
  layer:
    "pointer-events-none absolute inset-0 size-full select-none object-contain",
  total:
    "absolute top-1/2 left-1/2 max-w-2/3 -translate-x-1/2 -translate-y-1/2 overflow-hidden text-clip whitespace-nowrap text-center font-display text-display font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-display",
} as const;

export const DEFENSE_PLAQUE_DECORATION_CLASS_NAME =
  "pointer-events-none absolute inset-0 block size-full";

export const DEFENSE_TOTAL_PREFIX_CLASS_NAMES = {
  collapsed:
    "hidden max-tablet:inline max-tablet:font-sans max-tablet:text-2xs max-tablet:font-bold max-tablet:tracking-wider max-tablet:text-gold",
  expanded: "hidden",
} as const;

export const BUILD_REQUIREMENT_CLASS_NAMES = {
  title:
    "font-sans text-xs font-bold uppercase tracking-wide text-danger",
  detail:
    "font-sans text-xs font-semibold leading-snug text-ink-soft",
} as const;

export const SECONDARY_MODIFIER_CLASS_NAMES = {
  item: "flex flex-col",
  label:
    "font-sans text-xs font-bold uppercase tracking-wider text-ink-soft",
  value:
    "font-display text-xl font-normal text-gold-pale text-shadow-value",
} as const;

export const FOOTER_CLASS_NAMES = {
  root:
    "flex min-h-13 items-center justify-end max-tablet:hidden",
  link:
    "font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft no-underline hover:text-gold-bright",
} as const;
