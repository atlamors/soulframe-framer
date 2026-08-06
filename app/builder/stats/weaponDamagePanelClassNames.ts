import type { MobileStatsState } from "../components/mobileWorkspaceClassNames";

type WeaponDamageLabelVariant = "default" | "charged";
type WeaponDamageBonusState = "empty" | "visible";

export const WEAPON_DAMAGE_PANEL_CLASS_NAMES = {
  collapsed:
    "relative w-full min-h-36 [--color-ink:var(--color-stat-sheet-on-dark)] [--color-ink-soft:var(--color-stat-sheet-on-dark-soft)] [--color-ink-faint:var(--color-stat-sheet-on-dark-faint)] [--color-gold-bright:var(--color-stat-sheet-on-dark-gold-bright)] [--color-gold-pale:var(--color-stat-sheet-on-dark-gold-pale)] [--color-line:var(--color-stat-sheet-on-dark-line)] [--color-line-bright:var(--color-stat-sheet-on-dark-line-bright)] [--color-frame-line:var(--color-stat-sheet-on-dark-frame)] [--color-frame-line-bright:var(--color-stat-sheet-on-dark-frame-bright)] max-tablet:m-0 max-tablet:grid max-tablet:min-h-0 max-tablet:min-w-0 max-tablet:grid-cols-[minmax(0,1fr)_auto] max-tablet:items-center max-tablet:gap-1 compact-desktop:bg-[image:var(--background-image-stat-sheet-divider)] compact-desktop:bg-[length:100%_6px] compact-desktop:bg-top compact-desktop:bg-no-repeat compact-desktop:pt-1.5 compact-desktop:max-wide-desktop:min-h-32",
  expanded:
    "relative w-full min-h-36 [--color-ink:var(--color-stat-sheet-on-dark)] [--color-ink-soft:var(--color-stat-sheet-on-dark-soft)] [--color-ink-faint:var(--color-stat-sheet-on-dark-faint)] [--color-gold-bright:var(--color-stat-sheet-on-dark-gold-bright)] [--color-gold-pale:var(--color-stat-sheet-on-dark-gold-pale)] [--color-line:var(--color-stat-sheet-on-dark-line)] [--color-line-bright:var(--color-stat-sheet-on-dark-line-bright)] [--color-frame-line:var(--color-stat-sheet-on-dark-frame)] [--color-frame-line-bright:var(--color-stat-sheet-on-dark-frame-bright)] max-tablet:m-0 max-tablet:min-h-0 max-tablet:bg-[image:var(--background-image-stat-sheet-divider)] max-tablet:bg-[length:100%_6px] max-tablet:bg-top max-tablet:bg-no-repeat max-tablet:py-6 compact-desktop:bg-[image:var(--background-image-stat-sheet-divider)] compact-desktop:bg-[length:100%_6px] compact-desktop:bg-top compact-desktop:bg-no-repeat compact-desktop:pt-1.5 compact-desktop:max-wide-desktop:min-h-32",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_HEADER_CLASS_NAMES = {
  collapsed:
    "relative z-10 grid min-h-14 grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] content-center items-center gap-x-2 pl-4.25 max-tablet:flex max-tablet:h-5 max-tablet:min-h-0 max-tablet:items-center max-tablet:bg-transparent max-tablet:p-0 compact-desktop:max-wide-desktop:min-h-12.5",
  expanded:
    "relative z-10 grid min-h-14 grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] content-center items-center gap-x-2 pl-4.25 max-tablet:min-h-10 max-tablet:bg-transparent max-tablet:bg-none max-tablet:p-0 max-tablet:pb-1 compact-desktop:max-wide-desktop:min-h-12.5",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_HAND_CLASS_NAMES = {
  collapsed:
    "col-start-1 row-start-1 block font-sans text-xs font-bold uppercase leading-none tracking-widest text-gold max-tablet:m-0 max-tablet:max-w-overlay-sm max-tablet:overflow-hidden max-tablet:whitespace-nowrap max-tablet:text-2xs max-tablet:tracking-wider",
  expanded:
    "col-start-1 row-start-1 block font-sans text-xs font-bold uppercase leading-none tracking-widest text-gold max-tablet:mb-0.75 max-tablet:text-2xs",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_HAND_TEXT_CLASS_NAMES = {
  desktop: "max-tablet:hidden",
  mobile: "hidden max-tablet:inline",
} as const;

export const WEAPON_DAMAGE_NAME_CLASS_NAMES = {
  collapsed:
    "col-start-1 row-start-2 block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-display text-xl font-normal uppercase leading-none tracking-wider text-gold-pale text-shadow-display max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
  expanded:
    "col-start-1 row-start-2 block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-display text-xl font-normal uppercase leading-none tracking-wider text-gold-pale text-shadow-display max-tablet:text-mobile-stat-name max-tablet:tracking-wide",
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
    "col-start-2 row-span-2 row-start-1 flex flex-col items-center justify-center self-center justify-self-end max-tablet:pointer-events-none max-tablet:absolute max-tablet:top-0 max-tablet:right-0 max-tablet:opacity-0",
  expanded:
    "col-start-2 row-span-2 row-start-1 flex flex-col items-center justify-center self-center justify-self-end",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_RANK_STARS_CLASS_NAMES = {
  collapsed:
    "whitespace-nowrap text-center font-display text-2xs tracking-tighter text-gold-bright max-tablet:text-2xs",
  expanded:
    "whitespace-nowrap text-center font-display text-2xs tracking-tighter text-gold-bright max-tablet:text-2xs",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_RANK_VALUE_CLASS_NAMES = {
  collapsed:
    "pt-0.5 text-center font-display text-xl font-normal leading-none text-gold-bright text-shadow-display max-tablet:text-sm",
  expanded:
    "pt-0.5 text-center font-display text-xl font-normal leading-none text-gold-bright text-shadow-display max-tablet:text-sm",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_STATS_CLASS_NAMES = {
  collapsed:
    "relative z-10 grid gap-0 pt-2 pb-2.25 pl-4.25 antialiased max-tablet:flex max-tablet:min-w-0 max-tablet:items-center max-tablet:justify-end max-tablet:p-0 compact-desktop:max-wide-desktop:pt-1.5 compact-desktop:max-wide-desktop:pb-1.75",
  expanded:
    "relative z-10 grid gap-0 pt-2 pb-2.25 pl-4.25 antialiased max-tablet:grid-cols-2 max-tablet:gap-x-9 max-tablet:gap-y-0.75 max-tablet:p-0 max-tablet:pt-1 compact-desktop:max-wide-desktop:pt-1.5 compact-desktop:max-wide-desktop:pb-1.75",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_ROW_CLASS_NAMES = {
  collapsed:
    "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-1.75 py-0.75 leading-none max-tablet:min-w-0 max-tablet:border-b-0 max-tablet:py-0",
  expanded:
    "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-1.75 py-0.75 leading-none max-tablet:min-w-0 max-tablet:grid-cols-2 max-tablet:gap-x-1 max-tablet:gap-y-0.5 max-tablet:border-b-0 max-tablet:py-0",
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

export const WEAPON_DAMAGE_RESULT_CLASS_NAMES = {
  collapsed:
    "col-start-2 flex items-baseline justify-end gap-1.5 max-tablet:contents",
  expanded:
    "col-start-2 flex items-baseline justify-end gap-1.5 max-tablet:col-start-2 max-tablet:row-start-1 max-tablet:flex max-tablet:items-baseline max-tablet:justify-end max-tablet:gap-1.5",
} as const satisfies Record<MobileStatsState, string>;

export const WEAPON_DAMAGE_LABEL_CLASS_NAMES = {
  collapsed: {
    default:
      "overflow-hidden text-ellipsis whitespace-nowrap font-display text-lg text-ink-soft max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
    charged:
      "overflow-hidden text-ellipsis whitespace-nowrap font-display text-lg text-ink-soft max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
  },
  expanded: {
    default:
      "overflow-hidden text-ellipsis whitespace-nowrap font-display text-lg text-ink-soft max-tablet:font-sans max-tablet:text-xs max-tablet:font-medium max-tablet:leading-tight max-tablet:text-ink-soft",
    charged:
      "overflow-hidden text-ellipsis whitespace-nowrap font-display text-lg text-ink-soft max-tablet:font-sans max-tablet:text-2xs max-tablet:font-medium max-tablet:leading-tight max-tablet:text-ink-soft",
  },
} as const satisfies Record<
  MobileStatsState,
  Record<WeaponDamageLabelVariant, string>
>;

export const WEAPON_DAMAGE_BONUS_CLASS_NAMES = {
  collapsed: {
    empty:
      "hidden font-display text-base not-italic text-stat-sheet-damage-bonus",
    visible:
      "font-display text-base not-italic text-stat-sheet-damage-bonus max-tablet:pointer-events-none max-tablet:absolute max-tablet:opacity-0",
  },
  expanded: {
    empty:
      "hidden font-display text-base not-italic text-stat-sheet-damage-bonus max-tablet:text-2xs",
    visible:
      "whitespace-nowrap font-display text-base not-italic text-stat-sheet-damage-bonus max-tablet:text-right max-tablet:text-sm",
  },
} as const satisfies Record<
  MobileStatsState,
  Record<WeaponDamageBonusState, string>
>;

export const WEAPON_DAMAGE_VALUE_CLASS_NAMES = {
  collapsed:
    "text-right font-display text-lg font-normal lining-nums tabular-nums text-gold-pale max-tablet:min-w-0 max-tablet:overflow-hidden max-tablet:text-ellipsis max-tablet:whitespace-nowrap max-tablet:text-base",
  expanded:
    "whitespace-nowrap text-right font-display text-lg font-normal lining-nums tabular-nums text-gold-pale max-tablet:text-base",
} as const satisfies Record<MobileStatsState, string>;
