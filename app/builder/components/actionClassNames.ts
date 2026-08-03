type ActionButtonVariant =
  | "baseQuiet"
  | "basePrimary"
  | "pickerQuiet"
  | "pickerPrimary"
  | "headerQuiet"
  | "headerPrimary"
  | "optimizationQuiet"
  | "optimizationPrimary";

export const ACTION_BUTTON_CLASS_NAMES = {
  baseQuiet:
    "inline-flex min-h-11 cursor-pointer items-center justify-center border border-line bg-transparent px-3.75 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft transition-colors duration-150 ease-out enabled:hover:border-line-bright enabled:hover:text-ink disabled:cursor-default disabled:opacity-55 motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-focus",
  basePrimary:
    "inline-flex min-h-11 cursor-pointer items-center justify-center border border-gold bg-gold px-3.75 font-sans text-xs font-bold uppercase tracking-wider text-night transition-colors duration-150 ease-out enabled:hover:bg-gold-bright disabled:cursor-default disabled:opacity-55 motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-focus",
  pickerQuiet:
    "inline-flex min-h-11 cursor-pointer items-center justify-center border border-line bg-transparent px-3.75 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft transition-colors duration-150 ease-out enabled:hover:border-line-bright enabled:hover:text-ink disabled:cursor-default disabled:opacity-55 motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-focus",
  pickerPrimary:
    "inline-flex min-h-11 cursor-pointer items-center justify-center border border-gold bg-gold px-3.75 font-sans text-xs font-bold uppercase tracking-wider text-night transition-colors duration-150 ease-out enabled:hover:bg-gold-bright disabled:cursor-default disabled:opacity-55 motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-focus",
  headerQuiet:
    "inline-flex min-h-11 cursor-pointer items-center justify-center border border-line bg-transparent px-3.75 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft transition-colors duration-150 ease-out enabled:hover:border-line-bright enabled:hover:text-ink disabled:cursor-default disabled:opacity-55 compact-desktop:max-wide-desktop:min-h-10 compact-desktop:max-wide-desktop:px-2.75 max-tablet:hidden max-tablet:min-h-11 max-tablet:gap-1.5 max-tablet:px-2.75 max-tablet:text-xs motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-focus",
  headerPrimary:
    "inline-flex min-h-11 cursor-pointer items-center justify-center border border-gold bg-gold px-3.75 font-sans text-xs font-bold uppercase tracking-wider text-night transition-colors duration-150 ease-out enabled:hover:bg-gold-bright disabled:cursor-default disabled:opacity-55 compact-desktop:max-wide-desktop:min-h-10 compact-desktop:max-wide-desktop:px-2.75 max-tablet:hidden motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-focus",
  optimizationQuiet:
    "inline-flex min-h-11 cursor-pointer items-center justify-center border border-line-bright/45 bg-surface-deep/60 px-4 text-center font-sans text-xs leading-tight font-bold uppercase tracking-wider text-ink-soft shadow-control transition-colors duration-150 ease-out enabled:hover:border-line-bright enabled:hover:bg-surface-raised enabled:hover:text-ink disabled:cursor-default disabled:opacity-45 focus-visible:outline-none focus-visible:shadow-focus max-mobile-wide:px-2.5 max-mobile-wide:text-2xs motion-reduce:transition-none",
  optimizationPrimary:
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 border border-gold-bright/60 bg-gold px-4 text-center font-sans text-xs leading-tight font-bold uppercase tracking-wider text-night shadow-control transition-colors duration-150 ease-out enabled:hover:border-gold-bright enabled:hover:bg-gold-bright disabled:cursor-default disabled:border-line-bright/25 disabled:bg-surface-raised disabled:text-ink-faint disabled:opacity-70 focus-visible:outline-none focus-visible:shadow-focus max-mobile-wide:px-2.5 max-mobile-wide:text-2xs motion-reduce:transition-none",
} as const satisfies Record<ActionButtonVariant, string>;

type CopyBuildElement = "icon" | "longLabel" | "shortLabel";

export const COPY_BUILD_CLASS_NAMES = {
  icon: "hidden size-3.75 max-tablet:block",
  longLabel: "max-tablet:hidden",
  shortLabel: "hidden max-tablet:block max-narrow:hidden",
} as const satisfies Record<CopyBuildElement, string>;
