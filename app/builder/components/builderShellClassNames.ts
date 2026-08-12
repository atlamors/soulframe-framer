type WorkspaceHeadingAppearance = "alignment" | "statsTitle" | "damageTitle";

export const BUILDER_SHELL_CLASS_NAMES = {
  app:
    "relative isolate min-h-[calc(100vh_-_3.5rem)] w-full overflow-hidden px-16 max-tablet:min-h-[calc(100dvh_-_var(--spacing-mobile-header))] max-tablet:px-3 tablet:max-compact-desktop:px-3 compact-desktop:max-wide-desktop:px-7",
  workspace:
    "relative mt-6 grid min-h-170 grid-cols-12 compact-desktop:grid-cols-[3fr_5.5fr_3.5fr] max-tablet:mt-0 max-tablet:flex max-tablet:min-h-0 max-tablet:flex-col tablet:max-compact-desktop:mt-4 tablet:max-compact-desktop:min-h-0 tablet:max-compact-desktop:items-start compact-desktop:max-wide-desktop:mt-4 compact-desktop:max-wide-desktop:min-h-160",
  mainRegion:
    "contents compact-desktop:col-span-2 compact-desktop:col-start-1 compact-desktop:row-start-1 compact-desktop:grid compact-desktop:min-w-0 compact-desktop:self-stretch compact-desktop:grid-cols-[3fr_5.5fr] compact-desktop:grid-rows-[auto_1fr_auto_auto] compact-desktop:pb-4.5",
  desktopContents: "contents",
  desktopHidden: "hidden",
  alignmentRail:
    "relative z-10 col-span-3 col-start-1 row-start-1 min-w-0 px-7.5 py-7 compact-desktop:col-span-1 compact-desktop:col-start-1 max-tablet:grid max-tablet:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] max-tablet:gap-x-2.25 max-tablet:px-2 max-tablet:py-5 tablet:max-compact-desktop:col-span-5 tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-1 tablet:max-compact-desktop:px-3.5 compact-desktop:max-wide-desktop:px-3.5 compact-desktop:max-wide-desktop:py-4.5",
  statsRail:
    "relative z-10 col-span-3 col-start-10 row-start-1 min-w-0 px-7.5 py-7 compact-desktop:col-span-1 compact-desktop:col-start-3 tablet:max-compact-desktop:block tablet:max-compact-desktop:flex-1 tablet:max-compact-desktop:px-3.5 tablet:max-compact-desktop:py-4 compact-desktop:max-wide-desktop:px-3.5 compact-desktop:max-wide-desktop:py-4.5",
  statSheetSurface:
    "group/stat-sheet contents max-tablet:flex max-tablet:flex-col max-tablet:transition-colors max-tablet:[transition-duration:320ms] max-tablet:ease-linear max-tablet:data-[mobile-state=expanded]:relative max-tablet:data-[mobile-state=expanded]:isolate max-tablet:data-[mobile-state=expanded]:bg-stat-sheet-desktop-body motion-reduce:max-tablet:transition-none max-tablet:data-[mobile-state=expanded]:[--color-ink:var(--color-stat-sheet-on-dark)] max-tablet:data-[mobile-state=expanded]:[--color-ink-soft:var(--color-stat-sheet-on-dark-soft)] max-tablet:data-[mobile-state=expanded]:[--color-ink-faint:var(--color-stat-sheet-on-dark-faint)] max-tablet:data-[mobile-state=expanded]:[--color-gold:var(--color-stat-sheet-on-dark-gold)] max-tablet:data-[mobile-state=expanded]:[--color-gold-bright:var(--color-stat-sheet-on-dark-gold-bright)] max-tablet:data-[mobile-state=expanded]:[--color-gold-pale:var(--color-stat-sheet-on-dark-gold-pale)] max-tablet:data-[mobile-state=expanded]:[--color-line:var(--color-stat-sheet-on-dark-line)] max-tablet:data-[mobile-state=expanded]:[--color-line-bright:var(--color-stat-sheet-on-dark-line-bright)] max-tablet:data-[mobile-state=expanded]:[--color-frame-line:var(--color-stat-sheet-on-dark-frame)] max-tablet:data-[mobile-state=expanded]:[--color-frame-line-bright:var(--color-stat-sheet-on-dark-frame-bright)] compact-desktop:relative compact-desktop:isolate compact-desktop:-mx-2 compact-desktop:block compact-desktop:bg-stat-sheet-desktop-body compact-desktop:px-4 compact-desktop:py-4 compact-desktop:shadow-loadout-card",
  statSheetHeaderFloral:
    "pointer-events-none absolute inset-0 z-0 bg-stat-sheet-header-pattern opacity-[0.26] [mask-image:var(--background-image-stat-sheet-header-floral)] [mask-mode:luminance] [mask-position:center] [mask-repeat:repeat] [mask-size:36rem_36rem] max-tablet:opacity-[0.05] max-tablet:[mask-size:32rem_32rem]",
  statSheetHeaderOverlay:
    "pointer-events-none absolute inset-0 z-10 bg-stat-sheet-header-overlay max-tablet:hidden",
  statSheetHeaderVine:
    "pointer-events-none absolute top-0 left-0 z-20 h-auto w-[75.6%] max-w-none -translate-x-[9.64%] -translate-y-[17.02%] select-none object-contain object-left-top max-tablet:hidden",
  statSheetMobileDockVine:
    "pointer-events-none absolute top-0 left-0 z-20 hidden h-auto w-[67.8%] max-w-none -translate-x-[9.64%] -translate-y-[17.02%] select-none object-contain object-left-top max-tablet:block tablet:hidden",
  statSheetBottomRightVine:
    "pointer-events-none absolute right-0 bottom-0 hidden h-auto w-[52%] max-w-none translate-x-[calc(14.83%_+_0.75px)] translate-y-[calc(13.24%_+_0.75px)] rotate-180 select-none object-contain max-tablet:-z-10 max-tablet:w-[43.2%] max-tablet:translate-x-[calc(14.83%_+_9.25px)] max-tablet:translate-y-[calc(13.24%_+_6.75px)] max-tablet:opacity-70 max-tablet:group-data-[mobile-state=expanded]/stat-sheet:block compact-desktop:-z-10 compact-desktop:block compact-desktop:max-wide-desktop:w-[48%]",
  statSheetBuildName:
    "relative z-30 w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-display text-xl font-normal uppercase leading-tight tracking-[0.14em] text-stat-sheet-header-title text-shadow-value max-tablet:text-base max-tablet:tracking-[0.1em] compact-desktop:max-wide-desktop:text-base compact-desktop:max-wide-desktop:tracking-[0.1em]",
  workspaceHeadingLabel:
    "font-sans text-xs font-bold uppercase tracking-wider text-ink-soft",
  workspaceHeadingMeta:
    "font-sans text-2xs font-bold uppercase tracking-widest text-gold",
  loadoutStage:
    "relative col-span-6 col-start-4 row-start-1 grid min-h-0 grid-cols-2 grid-rows-[auto_repeat(3,auto)] content-start gap-4 overflow-visible px-3 py-3 compact-desktop:col-span-1 compact-desktop:col-start-2 max-tablet:grid max-tablet:min-h-0 max-tablet:w-full max-tablet:grid-cols-2 max-tablet:grid-rows-none max-tablet:content-start max-tablet:gap-1.5 max-tablet:overflow-visible max-tablet:px-1.5 max-tablet:pt-2 max-tablet:pb-2.5 tablet:max-compact-desktop:col-span-7 tablet:max-compact-desktop:col-start-6 tablet:max-compact-desktop:row-start-1 tablet:max-compact-desktop:row-span-4 tablet:max-compact-desktop:flex tablet:max-compact-desktop:min-h-0 tablet:max-compact-desktop:flex-col tablet:max-compact-desktop:gap-2 tablet:max-compact-desktop:px-2.5 tablet:max-compact-desktop:pt-2.5 tablet:max-compact-desktop:pb-2 compact-desktop:max-wide-desktop:px-2 compact-desktop:max-wide-desktop:py-2",
  loadoutOptimization:
    "relative z-10 col-span-full col-start-1 row-start-5 mx-auto w-full max-w-72.5 max-tablet:relative max-tablet:inset-auto max-tablet:col-span-full max-tablet:row-start-5 max-tablet:w-full max-tablet:max-w-none tablet:max-compact-desktop:order-8 tablet:max-compact-desktop:max-w-none compact-desktop:max-wide-desktop:max-w-62.5",
  optimizationTrigger:
    "inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1.75 whitespace-nowrap border border-frame-line/42 bg-control px-3.5 font-sans text-xs font-bold uppercase tracking-wider text-gold-bright shadow-control transition-colors duration-150 ease-out hover:border-frame-line-bright/75 hover:bg-control-hover hover:text-ink focus-visible:border-frame-line-bright/75 focus-visible:bg-control-hover focus-visible:text-ink focus-visible:outline-none focus-visible:shadow-focus max-tablet:px-2 max-tablet:text-2xs max-tablet:tracking-wide max-tablet:whitespace-normal compact-desktop:max-wide-desktop:px-2.25 compact-desktop:max-wide-desktop:text-2xs motion-reduce:transition-none",
  optimizationTriggerIcon: "size-4",
  defenseHud:
    "relative mx-auto mt-0.5 mb-5 aspect-4/3 w-full max-w-72.5 [--color-ink:var(--color-stat-sheet-on-dark)] [--color-ink-soft:var(--color-stat-sheet-on-dark-soft)] [--color-ink-faint:var(--color-stat-sheet-on-dark-faint)] [--color-gold:var(--color-stat-sheet-on-dark-gold)] [--color-gold-bright:var(--color-stat-sheet-on-dark-gold-bright)] [--color-gold-pale:var(--color-stat-sheet-on-dark-gold-pale)] tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-1 tablet:max-compact-desktop:mb-0 compact-desktop:max-wide-desktop:mt-0 compact-desktop:max-wide-desktop:mb-3.5 compact-desktop:max-wide-desktop:max-w-57.5",
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

export const SECONDARY_MODIFIER_CLASS_NAMES = {
  item: "flex flex-col",
  label:
    "font-sans text-xs font-bold uppercase tracking-wider text-ink-soft",
  value:
    "font-display text-xl font-normal text-gold-pale text-shadow-value",
} as const;

export const FOOTER_CLASS_NAMES = {
  root:
    "col-span-9 col-start-1 row-start-3 mx-auto flex min-h-10 w-full max-w-182 items-center justify-end bg-[image:var(--background-image-stat-sheet-divider)] bg-[length:100%_6px] bg-top bg-no-repeat wide-desktop:max-w-242.5 max-tablet:hidden tablet:max-compact-desktop:col-span-full tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-7 compact-desktop:col-span-2 compact-desktop:col-start-1 compact-desktop:row-start-4 compact-desktop:mx-0 compact-desktop:mr-3.25 compact-desktop:ml-auto compact-desktop:w-[calc(100%_-_1.625rem)]",
  link:
    "font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft no-underline hover:text-gold-bright",
} as const;
