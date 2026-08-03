type IconButtonContext = "default" | "optimization" | "weaponPicker";

export const ICON_BUTTON_CLASS_NAMES = {
  default:
    "flex size-11 cursor-pointer items-center justify-center border-0 bg-transparent font-display text-3xl text-ink-soft hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus",
  optimization:
    "flex size-11 flex-none cursor-pointer items-center justify-center border border-line-bright/40 bg-surface-deep/75 bg-aura-gold p-0 text-ink-soft shadow-control transition-colors duration-150 ease-out hover:border-line-bright hover:bg-surface-raised hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  weaponPicker:
    "flex size-11 cursor-pointer items-center justify-center border-0 bg-transparent font-display text-3xl text-ink-soft hover:text-gold-bright max-tablet:col-start-2 max-tablet:row-start-1 focus-visible:outline-none focus-visible:shadow-focus",
} as const satisfies Record<IconButtonContext, string>;
