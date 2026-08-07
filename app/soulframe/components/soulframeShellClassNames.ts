export const SOULFRAME_SHELL_CLASS_NAMES = {
  root: "min-h-screen",
  header:
    "fixed inset-x-0 top-0 z-80 flex h-20 items-center border-b border-line/70 bg-surface/95 px-4 shadow-panel backdrop-blur-xl max-tablet:h-mobile-header max-tablet:px-safe-inline max-tablet:pt-mobile-safe-top",
  headerInner:
    "mx-auto flex h-full w-full max-w-420 min-w-0 items-center gap-3 max-tablet:gap-1.5",
  headerPortalLayer: "contents",
  menuTrigger:
    "group hidden size-11 flex-none cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 text-gold transition-colors hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:inline-flex motion-reduce:transition-none",
  headerIcon:
    "pointer-events-none size-5.5 transition-transform group-active:scale-95 motion-reduce:transition-none",
  brand:
    "flex w-43.5 flex-none items-center no-underline max-tablet:w-27 max-narrow:w-23",
  brandWordmark: "block h-auto w-full",
  gameContext:
    "ml-2 border-l border-line-bright/40 pl-4 font-sans text-2xs font-bold uppercase tracking-[0.18em] text-ink-soft max-tablet:hidden",
  utilities: "ml-auto flex flex-none items-center gap-1",
  utilityButton:
    "group relative inline-flex size-11 flex-none cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 text-gold transition-colors hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus aria-disabled:cursor-default aria-disabled:text-ink-faint/65 motion-reduce:transition-none",
  utilityButtonActive: "text-gold-bright shadow-focus",
  utilityIcon: "size-5.5",
  alertBadge:
    "absolute top-0 right-0 inline-flex min-h-4.5 min-w-4.5 items-center justify-center bg-danger px-1 font-sans text-3xs font-bold leading-none tabular-nums text-night shadow-control",
  content:
    "min-h-screen pt-20 pl-16 max-tablet:pt-mobile-header max-tablet:pl-0",
  rail:
    "fixed top-20 bottom-0 left-0 z-50 flex w-16 flex-col items-center overflow-visible border-r border-line/70 bg-surface-deep/95 py-3 shadow-panel max-tablet:hidden",
  railGroup:
    "flex w-full flex-col items-center gap-1 border-b border-line/55 px-2 pb-3 not-first:pt-3 last:border-b-0",
  railItem:
    "group relative inline-flex size-11 items-center justify-center border-0 bg-transparent p-0 text-ink-soft transition-colors hover:bg-surface-raised hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus aria-disabled:cursor-default aria-disabled:text-ink-faint/45 motion-reduce:transition-none",
  railItemActive:
    "bg-surface-raised text-gold-bright shadow-inset-accent",
  railIcon: "size-5",
  railTooltip:
    "pointer-events-none absolute left-[calc(100%+0.75rem)] z-90 hidden w-max max-w-52 border border-line-bright/50 bg-surface-raised px-2.5 py-1.5 text-left font-sans text-2xs font-bold uppercase tracking-wider text-ink shadow-panel group-hover:block group-focus-visible:block",
  railTooltipMeta:
    "mt-0.5 block text-[9px] tracking-widest text-gold",
  drawerOverlay:
    "fixed inset-0 z-[90] bg-scrim backdrop-blur-md data-[state=open]:animate-fade-up data-[state=closed]:animate-mobile-overlay-surface-out motion-reduce:animate-none",
  drawer:
    "inset-0 z-[100] h-dvh w-full bg-surface-overlay bg-aura-gold pb-safe-bottom shadow-overlay backdrop-blur-xl data-[state=open]:animate-mobile-overlay-surface-in data-[state=closed]:pointer-events-none data-[state=closed]:animate-mobile-overlay-surface-out tablet:hidden motion-reduce:animate-none",
  drawerHeader:
    "flex min-h-15 items-center justify-between border-b border-line/60 px-safe-inline",
  drawerTitle:
    "font-display text-xl font-normal uppercase tracking-wider text-gold-bright text-shadow-value",
  drawerClose:
    "inline-flex size-11 cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 text-gold hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus",
  drawerBody:
    "min-h-0 flex-1 overflow-y-auto overscroll-contain px-safe-inline py-3",
  drawerGroup:
    "border-b border-line/55 py-3 last:border-b-0",
  drawerGroupTitle:
    "mb-2 px-2 font-sans text-2xs font-bold uppercase tracking-[0.18em] text-gold",
  drawerItem:
    "flex min-h-12 w-full items-center gap-3 border-0 bg-transparent px-2 text-left font-sans text-sm font-bold text-ink no-underline transition-colors hover:bg-surface-raised hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus aria-disabled:cursor-default aria-disabled:text-ink-faint motion-reduce:transition-none",
  drawerItemActive: "bg-surface-raised text-gold-bright shadow-inset-accent",
  drawerItemIcon: "size-5 flex-none",
  drawerItemLabel: "min-w-0 flex-1",
  comingSoon:
    "flex-none font-sans text-[9px] font-bold uppercase tracking-widest text-gold/80",
} as const;
