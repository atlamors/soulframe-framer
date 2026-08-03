import type { MobileStatsState } from "../components/mobileWorkspaceClassNames";

type WeaponDamageLabelVariant = "default" | "charged";
type WeaponDamageBonusState = "empty" | "visible";

export const WEAPON_DAMAGE_PANEL_CLASS_NAMES = {
  collapsed:
    "relative mr-5.25 min-h-36 max-tablet:m-0 max-tablet:grid max-tablet:min-h-0 max-tablet:min-w-0 max-tablet:grid-cols-[minmax(0,1fr)_auto] max-tablet:items-center max-tablet:gap-1 compact-desktop:max-wide-desktop:mr-4.5 compact-desktop:max-wide-desktop:min-h-32",
  expanded:
    "relative mr-5.25 min-h-36 max-tablet:m-0 max-tablet:min-h-0 max-tablet:w-full compact-desktop:max-wide-desktop:mr-4.5 compact-desktop:max-wide-desktop:min-h-32",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_SURFACE_CLASS_NAMES = {
  collapsed:
    "pointer-events-none absolute inset-0 size-full transition-all duration-300 ease-out max-tablet:opacity-0 motion-reduce:transition-none",
  expanded:
    "pointer-events-none absolute inset-0 size-full transition-all duration-300 ease-out max-tablet:hidden motion-reduce:transition-none",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_DIVIDER_CLASS_NAMES = {
  collapsed:
    "pointer-events-none absolute top-10.75 left-1/12 right-1/12 h-1.75 transition-all duration-300 ease-out max-tablet:top-8.5 max-tablet:opacity-0 compact-desktop:max-wide-desktop:top-9.75 motion-reduce:transition-none",
  expanded:
    "pointer-events-none absolute top-10.75 left-1/12 right-1/12 h-1.75 transition-all duration-300 ease-out max-tablet:hidden compact-desktop:max-wide-desktop:top-9.75 motion-reduce:transition-none",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_DIVIDER_GRAPHIC_CLASS_NAME = "block size-full";

export const WEAPON_DAMAGE_HEADER_CLASS_NAMES = {
  collapsed:
    "relative z-10 h-11.75 bg-aura-gold pt-1.75 pr-12.5 pb-1.25 pl-4.25 max-tablet:flex max-tablet:h-5 max-tablet:items-center max-tablet:bg-transparent max-tablet:p-0 compact-desktop:max-wide-desktop:h-10.75 compact-desktop:max-wide-desktop:pt-1.5",
  expanded:
    "relative z-10 h-11.75 bg-aura-gold pt-1.75 pr-12.5 pb-1.25 pl-4.25 max-tablet:h-auto max-tablet:min-h-10 max-tablet:bg-transparent max-tablet:bg-none max-tablet:pt-0 max-tablet:pr-8 max-tablet:pb-1 max-tablet:pl-0 compact-desktop:max-wide-desktop:h-10.75 compact-desktop:max-wide-desktop:pt-1.5",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_FILIGREE_CLASS_NAMES = {
  collapsed:
    "pointer-events-none absolute -top-6.25 -left-5.75 -z-10 h-auto w-37.5 object-contain object-left-top opacity-60 max-tablet:-top-2.25 max-tablet:-left-3 max-tablet:w-24 max-tablet:opacity-0",
  expanded:
    "pointer-events-none absolute -top-6.25 -left-5.75 -z-10 h-auto w-37.5 object-contain object-left-top opacity-60 max-tablet:-top-2.25 max-tablet:-left-3 max-tablet:w-24",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_HAND_CLASS_NAMES = {
  collapsed:
    "mb-1 block font-sans text-xs font-bold uppercase leading-none tracking-widest text-gold max-tablet:m-0 max-tablet:max-w-overlay-sm max-tablet:overflow-hidden max-tablet:whitespace-nowrap max-tablet:text-2xs max-tablet:tracking-wider",
  expanded:
    "mb-1 block font-sans text-xs font-bold uppercase leading-none tracking-widest text-gold max-tablet:mb-0.75 max-tablet:text-2xs",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_HAND_TEXT_CLASS_NAMES = {
  desktop: "max-tablet:hidden",
  mobile: "hidden max-tablet:inline",
} as const;

export const WEAPON_DAMAGE_NAME_CLASS_NAMES = {
  collapsed:
    "block overflow-hidden text-ellipsis whitespace-nowrap font-display text-xl font-normal uppercase leading-none tracking-wider text-gold-pale text-shadow-display max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
  expanded:
    "block overflow-hidden text-ellipsis whitespace-nowrap font-display text-xl font-normal uppercase leading-none tracking-wider text-gold-pale text-shadow-display max-tablet:text-mobile-stat-name max-tablet:tracking-wide",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_INITIAL_CLASS_NAMES = {
  label: "max-tablet:text-label",
  name: "max-tablet:text-mobile-stat-name-initial",
} as const;

export const WEAPON_DAMAGE_LABEL_TEXT_CLASS_NAMES = {
  desktop: "max-tablet:hidden",
  mobile: "hidden max-tablet:inline",
} as const;

export const WEAPON_DAMAGE_RANK_CLASS_NAMES = {
  collapsed:
    "absolute top-2.25 -right-6.25 flex size-14 items-center justify-center rounded-full bg-damage-rank shadow-damage-rank max-tablet:pointer-events-none max-tablet:top-0 max-tablet:right-0 max-tablet:size-8 max-tablet:rounded-none max-tablet:bg-transparent max-tablet:bg-none max-tablet:opacity-0 max-tablet:shadow-none compact-desktop:max-wide-desktop:-right-5.5 compact-desktop:max-wide-desktop:size-12.5",
  expanded:
    "absolute top-2.25 -right-6.25 flex size-14 items-center justify-center rounded-full bg-damage-rank shadow-damage-rank max-tablet:top-0 max-tablet:right-0 max-tablet:size-8 max-tablet:rounded-none max-tablet:bg-transparent max-tablet:bg-none max-tablet:shadow-none compact-desktop:max-wide-desktop:-right-5.5 compact-desktop:max-wide-desktop:size-12.5",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_RANK_STARS_CLASS_NAMES = {
  collapsed:
    "absolute -top-0.25 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-2xs tracking-tighter text-gold-bright max-tablet:-top-0.5 max-tablet:text-2xs",
  expanded:
    "absolute -top-0.25 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-2xs tracking-tighter text-gold-bright max-tablet:-top-0.5 max-tablet:text-2xs",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_RANK_VALUE_CLASS_NAMES = {
  collapsed:
    "pt-0.5 font-display text-xl font-normal leading-none text-gold-bright text-shadow-display max-tablet:text-sm",
  expanded:
    "pt-0.5 font-display text-xl font-normal leading-none text-gold-bright text-shadow-display max-tablet:text-sm",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_STATS_CLASS_NAMES = {
  collapsed:
    "relative z-10 grid gap-0 pt-2 pr-4.25 pb-2.25 pl-4.25 max-tablet:flex max-tablet:min-w-0 max-tablet:items-center max-tablet:justify-end max-tablet:p-0 compact-desktop:max-wide-desktop:pt-1.5 compact-desktop:max-wide-desktop:pb-1.75",
  expanded:
    "relative z-10 grid gap-0 pt-2 pr-4.25 pb-2.25 pl-4.25 max-tablet:grid-cols-2 max-tablet:gap-x-9 max-tablet:gap-y-0.75 max-tablet:p-0 max-tablet:pt-1 compact-desktop:max-wide-desktop:pt-1.5 compact-desktop:max-wide-desktop:pb-1.75",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_ROW_CLASS_NAMES = {
  collapsed:
    "grid grid-cols-3 items-baseline gap-1.75 border-b border-frame-line/12 py-0.75 leading-none last:border-b-0 max-tablet:min-w-0 max-tablet:border-b-0 max-tablet:py-0",
  expanded:
    "grid grid-cols-3 items-baseline gap-1.75 border-b border-frame-line/12 py-0.75 leading-none last:border-b-0 max-tablet:min-w-0 max-tablet:grid-cols-2 max-tablet:grid-rows-2 max-tablet:gap-x-1 max-tablet:gap-y-0.5 max-tablet:border-b-0 max-tablet:py-0",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_PRIMARY_ROW_CLASS_NAMES = {
  collapsed:
    "max-tablet:flex max-tablet:items-baseline max-tablet:justify-end",
  expanded: "",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_SECONDARY_ROW_CLASS_NAMES = {
  collapsed:
    "max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
  expanded: "max-tablet:opacity-100",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_LABEL_CLASS_NAMES = {
  collapsed: {
    default:
      "overflow-hidden text-ellipsis whitespace-nowrap font-display text-base text-shadow-value text-ink-soft compact-desktop:max-wide-desktop:text-sm max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
    charged:
      "overflow-hidden text-ellipsis whitespace-nowrap font-display text-base text-shadow-value text-ink-soft compact-desktop:max-wide-desktop:text-sm max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
  },
  expanded: {
    default:
      "overflow-hidden text-ellipsis whitespace-nowrap font-display text-base text-shadow-value text-ink-soft compact-desktop:max-wide-desktop:text-sm max-tablet:font-sans max-tablet:text-xs max-tablet:font-medium max-tablet:leading-tight max-tablet:text-ink-soft",
    charged:
      "overflow-hidden text-ellipsis whitespace-nowrap font-display text-base text-shadow-value text-ink-soft compact-desktop:max-wide-desktop:text-sm max-tablet:font-sans max-tablet:text-xs max-tablet:font-medium max-tablet:leading-tight max-tablet:text-ink-soft",
  },
} as const satisfies Record<
  MobileStatsState,
  Record<WeaponDamageLabelVariant, string>
>;

export const WEAPON_DAMAGE_BONUS_CLASS_NAMES = {
  collapsed: {
    empty:
      "hidden font-display text-xs not-italic text-gold-bright",
    visible:
      "font-display text-xs not-italic text-gold-bright max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
  },
  expanded: {
    empty:
      "hidden font-display text-xs not-italic text-gold-bright max-tablet:text-2xs",
    visible:
      "whitespace-nowrap font-display text-xs not-italic text-gold-bright max-tablet:col-start-2 max-tablet:row-start-2 max-tablet:text-right max-tablet:text-counter",
  },
} as const satisfies Record<
  MobileStatsState,
  Record<WeaponDamageBonusState, string>
>;

export const WEAPON_DAMAGE_VALUE_CLASS_NAMES = {
  collapsed:
    "text-right font-display text-base font-normal lining-nums tabular-nums text-gold-pale text-shadow-value compact-desktop:max-wide-desktop:text-sm max-tablet:min-w-0 max-tablet:overflow-hidden max-tablet:text-ellipsis max-tablet:whitespace-nowrap max-tablet:text-base",
  expanded:
    "whitespace-nowrap text-right font-display text-base font-normal lining-nums tabular-nums text-gold-pale text-shadow-value compact-desktop:max-wide-desktop:text-sm max-tablet:col-start-2 max-tablet:row-start-1 max-tablet:text-base",
} as const satisfies Record<MobileStatsState, string>;
