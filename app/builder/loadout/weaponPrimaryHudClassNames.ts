type WeaponPrimaryElement =
  | "root"
  | "header"
  | "grid"
  | "statLabel"
  | "value"
  | "statBonus"
  | "valueStrong"
  | "meta"
  | "metaLabel"
  | "attunementEnhanced"
  | "attunementRows"
  | "attunementBase"
  | "attunementEffective"
  | "attunementRowLabel"
  | "attunementSource"
  | "attunementWaste";
type WeaponPrimaryStatPosition = "default" | "last";

export const WEAPON_PRIMARY_CLASS_NAMES = {
  root:
    "mt-6.5 border-y border-frame-line/38 bg-weapon-primary pt-2.75 pb-3 shadow-loadout-card",
  header:
    "border-b border-frame-line/18 px-3 pt-0 pb-2.25 font-sans text-xs font-bold uppercase tracking-widest text-ink-soft",
  grid: "grid grid-cols-1 pt-2",
  statLabel:
    "truncate font-display text-xl leading-tight font-normal text-ink max-tablet:text-lg",
  value:
    "flex items-baseline justify-end gap-2.25 lining-nums tabular-nums",
  statBonus:
    "font-display text-xl leading-tight font-normal not-italic text-gold text-shadow-value max-tablet:text-lg",
  valueStrong:
    "font-display text-xl leading-tight font-normal text-gold-pale text-shadow-value max-tablet:text-lg",
  meta:
    "mt-2.5 grid grid-cols-2 gap-3 border-t border-frame-line/32 px-3 pt-3 pb-0",
  metaLabel:
    "font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft",
  attunementEnhanced:
    "flex min-w-0 flex-col gap-1.25 max-tablet:col-span-2",
  attunementRows: "grid min-w-0 gap-1.25",
  attunementBase:
    "flex min-w-0 flex-col gap-0.75 border border-frame-line/25 bg-surface-deep/45 px-2 py-1.5 opacity-60",
  attunementEffective:
    "flex min-w-0 flex-col gap-0.75 border border-gold/50 border-l-2 border-l-gold bg-picker-row-selected px-2 py-1.5 shadow-picker-row-active",
  attunementRowLabel:
    "font-sans text-2xs font-bold uppercase tracking-wider text-ink-faint",
  attunementSource:
    "truncate font-sans text-2xs font-bold uppercase tracking-wider text-gold-bright",
  attunementWaste:
    "max-w-full font-sans text-2xs font-bold leading-tight text-ember",
} as const satisfies Record<WeaponPrimaryElement, string>;

export const WEAPON_PRIMARY_STAT_CLASS_NAMES = {
  default:
    "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 px-3 py-0.75",
  last:
    "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 px-3 py-0.75",
} as const satisfies Record<WeaponPrimaryStatPosition, string>;

export const WEAPON_PRIMARY_META_ROW_CLASS_NAMES = {
  default:
    "flex min-w-0 flex-col gap-1.25",
} as const;
