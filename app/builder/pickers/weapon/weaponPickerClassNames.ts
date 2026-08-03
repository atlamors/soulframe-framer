type WeaponPickerClassName =
  | "statTable"
  | "statHead"
  | "statRow"
  | "statLabel"
  | "statValue"
  | "description";

export const WEAPON_PICKER_CLASS_NAMES = {
  statTable: "mt-0 border border-frame-line/30 bg-surface-overlay shadow-picker-row",
  statHead:
    "flex min-h-9 items-center gap-3 border-b border-frame-line/25 bg-picker-header px-3 font-sans text-xs font-semibold uppercase tracking-wide text-ink-faint",
  statRow:
    "flex min-h-11 items-center gap-3 border-t border-frame-line/20 px-3 transition-colors duration-150 hover:bg-picker-row-hover motion-reduce:transition-none",
  statLabel:
    "flex-1 font-sans text-sm font-medium text-ink-soft",
  statValue:
    "w-17.5 text-right font-sans text-sm font-semibold text-gold-pale tabular-nums",
  description:
    "mt-4 border-l-2 border-frame-line/45 bg-surface-overlay px-3 py-2.5 font-display text-sm leading-relaxed text-ink-soft",
} as const satisfies Record<WeaponPickerClassName, string>;
