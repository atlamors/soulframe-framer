import type { MobileStatsState } from "../components/mobileWorkspaceClassNames";

export const ACTIVE_EFFECTS_AVAILABILITY_CLASS_NAMES = {
  empty: "max-tablet:hidden",
  populated: "",
} as const;

export const ACTIVE_EFFECTS_CLASS_NAMES = {
  collapsed:
    "group relative z-10 isolate mt-3.5 border border-frame-line/32 shadow-control open:z-40 max-tablet:hidden tablet:max-compact-desktop:col-span-7 tablet:max-compact-desktop:col-start-6 tablet:max-compact-desktop:row-start-5 tablet:max-compact-desktop:mx-2.5 tablet:max-compact-desktop:self-start",
  expanded:
    "group relative z-10 isolate mt-3.5 border border-frame-line/38 shadow-control open:z-40 max-tablet:order-last max-tablet:mt-1.5 max-tablet:w-full max-tablet:rounded-sm max-tablet:border max-tablet:border-frame-line/38 max-tablet:bg-transparent max-tablet:shadow-none tablet:max-compact-desktop:col-span-7 tablet:max-compact-desktop:col-start-6 tablet:max-compact-desktop:row-start-5 tablet:max-compact-desktop:mx-2.5 tablet:max-compact-desktop:self-start",
} as const satisfies Record<MobileStatsState, string>;

export const ACTIVE_EFFECTS_SUMMARY_CLASS_NAMES = {
  collapsed:
    "flex min-h-10.5 cursor-pointer appearance-none list-none items-center gap-2 px-2.75 py-2 focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-10 max-tablet:flex-col max-tablet:items-center max-tablet:justify-center max-tablet:gap-0.25 max-tablet:bg-transparent max-tablet:p-0 max-tablet:pointer-events-none",
  expanded:
    "flex min-h-10.5 cursor-pointer appearance-none list-none items-center gap-2 px-2.75 py-2 transition-colors duration-150 ease-out hover:bg-gold/7 focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11 max-tablet:border max-tablet:border-frame-line/24 motion-reduce:transition-none",
} as const satisfies Record<MobileStatsState, string>;

export const ACTIVE_EFFECTS_LABEL_CLASS_NAMES = {
  collapsed:
    "min-w-0 flex-1 font-sans text-xs font-bold uppercase tracking-wide text-ink-soft max-tablet:max-w-5.5 max-tablet:overflow-hidden max-tablet:whitespace-nowrap max-tablet:text-2xs max-tablet:tracking-wider max-tablet:text-gold",
  expanded:
    "min-w-0 flex-1 font-sans text-xs font-bold uppercase tracking-wide text-ink-soft",
} as const satisfies Record<MobileStatsState, string>;

export const ACTIVE_EFFECTS_COUNT_CLASS_NAMES = {
  collapsed:
    "flex size-5.5 flex-none items-center justify-center border border-frame-line/28 bg-gold/10 font-display text-xs text-gold-pale max-tablet:h-auto max-tablet:min-h-0 max-tablet:w-auto max-tablet:border-0 max-tablet:bg-transparent",
  expanded:
    "flex size-5.5 flex-none items-center justify-center border border-frame-line/28 bg-gold/10 font-display text-xs text-gold-pale max-tablet:rounded-full",
} as const satisfies Record<MobileStatsState, string>;

export const ACTIVE_EFFECTS_DISCLOSURE_CLASS_NAMES = {
  collapsed:
    "size-3.75 flex-none text-gold transition-transform duration-150 ease-out group-open:rotate-180 max-tablet:hidden motion-reduce:transition-none",
  expanded:
    "size-3.75 flex-none text-gold transition-transform duration-150 ease-out group-open:rotate-180 motion-reduce:transition-none",
} as const satisfies Record<MobileStatsState, string>;

export const ACTIVE_EFFECTS_CONTENT_CLASS_NAMES = {
  collapsed:
    "absolute inset-x-[-1px] bottom-[calc(100%+0.25rem)] z-50 max-h-[min(70dvh,28rem)] overflow-y-auto border border-frame-line/38 bg-stat-sheet-desktop-body px-2.75 pt-1.25 pb-2.5 shadow-popover animate-fade-up max-tablet:hidden max-tablet:max-h-[min(64dvh,25rem)] motion-reduce:animate-none",
  expanded:
    "absolute inset-x-[-1px] bottom-[calc(100%+0.25rem)] z-50 max-h-[min(70dvh,28rem)] overflow-y-auto border border-frame-line/38 bg-stat-sheet-desktop-body px-2.75 pt-1.25 pb-2.5 shadow-popover animate-fade-up max-tablet:max-h-[min(64dvh,25rem)] motion-reduce:animate-none",
} as const satisfies Record<MobileStatsState, string>;

export const ACTIVE_EFFECTS_ROW_CLASS_NAMES = {
  collapsed:
    "mt-1.75 mb-0 flex flex-col border-b border-frame-line/12 pb-1.75 last:border-b-0 last:pb-0 max-tablet:hidden",
  expanded:
    "mt-1.75 mb-0 flex flex-col border-b border-frame-line/12 pb-1.75 last:border-b-0 last:pb-0",
} as const satisfies Record<MobileStatsState, string>;

export const ACTIVE_EFFECTS_SOURCE_CLASS_NAMES = {
  collapsed:
    "font-sans text-2xs font-bold uppercase tracking-wide text-gold max-tablet:hidden",
  expanded:
    "font-sans text-2xs font-bold uppercase tracking-wide text-gold",
} as const satisfies Record<MobileStatsState, string>;

export const ACTIVE_EFFECTS_TEXT_CLASS_NAMES = {
  collapsed:
    "font-sans text-counter font-semibold leading-snug text-ink-soft max-tablet:hidden",
  expanded:
    "font-sans text-counter font-semibold leading-snug text-ink-soft",
} as const satisfies Record<MobileStatsState, string>;

export const ACTIVE_EFFECTS_EMPTY_CLASS_NAMES = {
  collapsed:
    "absolute inset-x-[-1px] bottom-[calc(100%+0.25rem)] z-50 m-0 max-h-[min(70dvh,28rem)] overflow-y-auto border border-frame-line/38 bg-stat-sheet-desktop-body px-2.75 py-2.5 font-sans text-counter font-semibold leading-snug text-ink-faint shadow-popover animate-fade-up max-tablet:hidden max-tablet:max-h-[min(64dvh,25rem)] motion-reduce:animate-none",
  expanded:
    "absolute inset-x-[-1px] bottom-[calc(100%+0.25rem)] z-50 m-0 max-h-[min(70dvh,28rem)] overflow-y-auto border border-frame-line/38 bg-stat-sheet-desktop-body px-2.75 py-2.5 font-sans text-counter font-semibold leading-snug text-ink-faint shadow-popover animate-fade-up max-tablet:max-h-[min(64dvh,25rem)] motion-reduce:animate-none",
} as const satisfies Record<MobileStatsState, string>;
