export const SOULFRAME_SHELL_CLASS_NAMES = {
  root: "min-h-screen",
  header:
    "fixed inset-x-0 top-0 z-80 flex h-14 items-center bg-chrome px-3 max-tablet:h-mobile-header max-tablet:px-safe-inline max-tablet:pt-mobile-safe-top",
  headerInner:
    "flex h-full w-full min-w-0 items-center gap-2 max-tablet:gap-1.5",
  headerPortalLayer: "contents",
  chromeJoint:
    "pointer-events-none fixed top-14 left-16 z-40 size-4 overflow-hidden max-tablet:hidden",
  chromeJointCircle:
    "absolute top-0 left-0 size-8 rounded-full bg-transparent [box-shadow:0_0_0_1rem_var(--color-chrome)]",
  menuTrigger:
    "group hidden size-11 flex-none cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 text-gold transition-colors hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:inline-flex motion-reduce:transition-none",
  headerIcon:
    "pointer-events-none size-5.5 transition-transform group-active:scale-95 motion-reduce:transition-none",
  brand:
    "flex w-30 flex-none items-center no-underline max-tablet:w-27 max-narrow:w-23",
  brandWordmark: "block h-auto w-full",
  gameContext:
    "ml-1 border-l border-line-bright/40 pl-3 font-sans text-2xs font-bold uppercase tracking-[0.18em] text-ink-soft max-tablet:hidden",
  utilities: "ml-auto flex flex-none items-center gap-1",
  externalUtilityGroup:
    "mr-0.5 flex flex-none items-center border-r border-line-bright/40 pr-1.5",
  utilityButton:
    "group relative inline-flex size-10 flex-none cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 text-gold transition-colors hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus aria-disabled:cursor-default aria-disabled:text-ink-faint/65 motion-reduce:transition-none",
  utilityButtonActive: "text-gold-bright shadow-focus",
  utilityIcon: "size-5.5",
  alertBadge:
    "absolute top-0 right-0 inline-flex min-h-4.5 min-w-4.5 items-center justify-center bg-danger px-1 font-sans text-3xs font-bold leading-none tabular-nums text-night shadow-control",
  content:
    "min-h-screen pt-14 pl-16 max-tablet:pt-mobile-header max-tablet:pl-0",
  rail:
    "group/rail fixed top-14 bottom-0 left-0 z-50 flex w-16 flex-col items-stretch overflow-x-hidden overflow-y-auto bg-chrome py-3 transition-[width] duration-200 hover:w-56 focus-within:w-56 max-tablet:hidden motion-reduce:transition-none",
  railGroup:
    "flex w-full flex-none flex-col items-stretch gap-1 border-b border-line/55 px-2.5 pb-3 not-first:pt-3 last:border-b-0",
  railItem:
    "group relative inline-flex min-h-11 w-full items-center gap-3 overflow-visible rounded-2xl border-0 bg-transparent px-3 text-ink-soft transition-colors hover:bg-surface-raised hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus aria-disabled:cursor-default aria-disabled:text-ink-faint/45 motion-reduce:transition-none",
  railItemActive:
    "!bg-surface-raised !text-gold-bright before:absolute before:top-1 before:bottom-1 before:-left-2.5 before:w-0.5 before:bg-gold before:content-['']",
  railIcon: "size-5 flex-none",
  railLabel:
    "min-w-0 flex-1 whitespace-nowrap text-left font-sans text-xs font-bold uppercase tracking-wider opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 motion-reduce:transition-none",
  railItemMeta:
    "ml-auto flex-none whitespace-nowrap font-sans text-[9px] font-bold uppercase tracking-widest text-gold/80 opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 motion-reduce:transition-none",
  drawerOverlay:
    "fixed inset-x-0 top-mobile-header bottom-0 z-60 bg-scrim backdrop-blur-md data-[state=open]:animate-fade-up data-[state=closed]:animate-mobile-overlay-surface-out motion-reduce:animate-none",
  drawer:
    "inset-x-0 top-mobile-header bottom-0 z-70 h-auto w-full bg-surface-overlay bg-aura-gold pb-safe-bottom shadow-overlay backdrop-blur-xl data-[state=open]:animate-mobile-overlay-surface-in data-[state=closed]:pointer-events-none data-[state=closed]:animate-mobile-overlay-surface-out tablet:hidden motion-reduce:animate-none",
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
