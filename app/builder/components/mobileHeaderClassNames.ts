import {
  MOBILE_FULLSCREEN_OVERLAY_CLASS_NAMES,
  MOBILE_HEADER_MENU_SURFACE_CLASS_NAME,
} from "@/app/components/mobileFullscreenOverlayClassNames";

export type MobileHeaderVisibilityState =
  | "drawerOpen"
  | "hidden"
  | "visible"
  | "suppressed";

export const MOBILE_HEADER_SENTINEL_CLASS_NAME =
  "pointer-events-none relative -mb-px h-px w-full";

export const MOBILE_HEADER_CLASS_NAMES = {
  hidden:
    "hidden max-tablet:fixed max-tablet:inset-x-0 max-tablet:top-0 max-tablet:z-55 max-tablet:flex max-tablet:h-mobile-header max-tablet:translate-y-2 max-tablet:items-end max-tablet:bg-surface max-tablet:bg-none max-tablet:pt-mobile-safe-top max-tablet:opacity-0 max-tablet:pointer-events-none max-tablet:shadow-panel max-tablet:transition max-tablet:duration-200 max-tablet:ease-out motion-reduce:transition-none",
  visible:
    "hidden max-tablet:fixed max-tablet:inset-x-0 max-tablet:top-0 max-tablet:z-55 max-tablet:flex max-tablet:h-mobile-header max-tablet:translate-y-0 max-tablet:items-end max-tablet:bg-surface max-tablet:bg-none max-tablet:pt-mobile-safe-top max-tablet:opacity-100 max-tablet:visible max-tablet:pointer-events-auto max-tablet:shadow-panel max-tablet:transition max-tablet:duration-200 max-tablet:ease-out motion-reduce:transition-none",
  drawerOpen:
    "hidden max-tablet:fixed max-tablet:inset-x-0 max-tablet:top-0 max-tablet:z-55 max-tablet:flex max-tablet:h-mobile-header max-tablet:translate-y-0 max-tablet:items-end max-tablet:bg-surface max-tablet:bg-none max-tablet:pt-mobile-safe-top max-tablet:opacity-100 max-tablet:visible max-tablet:pointer-events-auto max-tablet:shadow-panel max-tablet:transition max-tablet:duration-200 max-tablet:ease-out motion-reduce:transition-none",
  suppressed: "hidden",
} as const satisfies Record<MobileHeaderVisibilityState, string>;

export const MOBILE_HEADER_INNER_CLASS_NAME =
  "flex h-13 w-full min-w-0 items-center gap-2 px-safe-inline";

export const MOBILE_HEADER_BRAND_CLASS_NAME =
  "flex w-19 flex-none items-center no-underline";

export const MOBILE_HEADER_WORDMARK_CLASS_NAME = "block h-auto w-full";

export const MOBILE_HEADER_BUILD_NAME_CLASS_NAME =
  "min-w-0 flex-1 truncate font-display text-base leading-none text-ink text-shadow-value";

export const MOBILE_HEADER_ALERT_TRIGGER_CLASS_NAME =
  "pointer-events-auto relative inline-flex size-11 flex-none cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 text-gold shadow-none outline-none transition-colors hover:text-gold-bright focus-visible:shadow-focus motion-reduce:transition-none";

export const MOBILE_HEADER_ALERT_ICON_CLASS_NAME = "size-5.5";

export const MOBILE_HEADER_ALERT_BADGE_CLASS_NAME =
  "absolute top-0 right-0 inline-flex min-h-4.5 min-w-4.5 items-center justify-center bg-danger px-1 font-sans text-3xs font-bold leading-none tabular-nums text-night shadow-control";

export const MOBILE_HEADER_MENU_TRIGGER_CLASS_NAME =
  "group pointer-events-auto inline-flex size-11 flex-none cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none focus-visible:outline-none";

export const MOBILE_TOP_HEADER_MENU_TRIGGER_CLASS_NAME =
  "group pointer-events-auto inline-flex size-11 flex-none cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none focus-visible:outline-none";

export const MOBILE_HEADER_MENU_ICON_CLASS_NAME =
  "pointer-events-none block size-10 object-contain transition duration-150 ease-out group-hover:brightness-110 group-focus-visible:brightness-125 group-active:scale-95 motion-reduce:transition-none";

export const MOBILE_TOP_HEADER_MENU_ICON_FRAME_CLASS_NAME =
  "pointer-events-none relative block size-10";

export const MOBILE_TOP_HEADER_MENU_SHELL_CLASS_NAME =
  "absolute inset-0 block size-full object-contain transition group-hover:brightness-110 group-focus-visible:brightness-125 group-active:scale-95 motion-reduce:transition-none";

export const MOBILE_TOP_HEADER_MENU_GLYPH_CLASS_NAME =
  "absolute inset-0 drop-shadow-menu-glyph-outline";

export const MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAME =
  "absolute top-1/2 left-1/2 origin-center bg-gold transition-all duration-200 ease-out motion-reduce:transition-none";

export const MOBILE_TOP_HEADER_MENU_STROKE_CLASS_NAMES = {
  topClosed:
    "h-0.75 w-5 -translate-x-1/2 -translate-y-2 rotate-1 opacity-100",
  topOpen:
    "h-0.75 w-5.5 -translate-x-1/2 -translate-y-1/2 rotate-45 opacity-100",
  middleClosed:
    "h-0.75 w-5 -translate-x-1/2 -translate-y-1/2 -rotate-1 opacity-100",
  middleOpen:
    "h-0.75 w-4.5 -translate-x-1/2 -translate-y-1/2 scale-x-0 opacity-0",
  bottomClosed:
    "h-0.75 w-5 -translate-x-1/2 translate-y-1 rotate-1 opacity-100",
  bottomOpen:
    "h-0.75 w-5.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 opacity-100",
} as const;

export const MOBILE_DRAWER_OVERLAY_CLASS_NAME =
  `${MOBILE_FULLSCREEN_OVERLAY_CLASS_NAMES.overlay} max-tablet:z-0`;

export const MOBILE_DRAWER_CONTENT_CLASS_NAME =
  `${MOBILE_HEADER_MENU_SURFACE_CLASS_NAME} max-tablet:inset-0 max-tablet:z-10 max-tablet:h-dvh max-tablet:w-full max-tablet:pt-mobile-header max-tablet:pb-safe-bottom max-tablet:data-[state=open]:animate-mobile-overlay-surface-in max-tablet:data-[state=closed]:pointer-events-none max-tablet:data-[state=closed]:animate-mobile-overlay-surface-out tablet:top-14 tablet:right-0 tablet:bottom-0 tablet:w-112 tablet:border-l tablet:border-frame-line/60 tablet:bg-surface-overlay tablet:bg-aura-gold tablet:shadow-overlay tablet:backdrop-blur-xl tablet:data-[state=open]:animate-slide-in tablet:data-[state=closed]:pointer-events-none motion-reduce:animate-none`;

export const MOBILE_DRAWER_ACCESSIBLE_LABEL_CLASS_NAME = "sr-only";

export const MOBILE_DRAWER_DESKTOP_CLOSE_CLASS_NAME =
  "flex h-13 flex-none items-center justify-between border-b border-line/55 px-safe-inline tablet:absolute tablet:top-1 tablet:right-2 tablet:z-20 tablet:h-auto tablet:border-0 tablet:p-0";

export const MOBILE_DRAWER_TITLE_CLASS_NAME =
  "font-sans text-2xs font-bold uppercase tracking-widest text-gold tablet:hidden";

export const MOBILE_DRAWER_BUILD_HEADING_CLASS_NAME =
  "mb-2.5 font-sans text-2xs font-bold uppercase tracking-widest text-gold";

export const MOBILE_DRAWER_BUILD_ROW_CLASS_NAME =
  "flex min-h-11 min-w-0 items-center gap-2.5";

export const MOBILE_DRAWER_BODY_CLASS_NAME =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain";

export const MOBILE_DRAWER_SECTION_CLASS_NAME =
  "border-b border-line/55 px-safe-inline py-4 last:border-b-0 tablet:px-6 tablet:py-5";

export const MOBILE_DRAWER_SECTION_HEADING_CLASS_NAME =
  "mb-2.5 font-sans text-2xs font-bold uppercase tracking-widest text-gold";

export const MOBILE_DRAWER_ACTION_ROW_CLASS_NAME =
  "mt-3 flex flex-wrap gap-2";

export const MOBILE_DRAWER_QUIET_BUTTON_CLASS_NAME =
  "inline-flex min-h-11 cursor-pointer touch-manipulation items-center justify-center gap-1.5 border border-line-bright/45 bg-surface-deep/55 px-3 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft shadow-control transition-colors duration-150 ease-out hover:border-line-bright hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";

export const MOBILE_DRAWER_PRIMARY_BUTTON_CLASS_NAME =
  "inline-flex min-h-11 cursor-pointer touch-manipulation items-center justify-center gap-1.5 border border-gold-bright/60 bg-gold px-3 font-sans text-xs font-bold uppercase tracking-wider text-night shadow-control transition-colors duration-150 ease-out hover:border-gold-bright hover:bg-gold-bright focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";

export const MOBILE_DRAWER_DANGER_BUTTON_CLASS_NAME =
  "inline-flex min-h-11 cursor-pointer touch-manipulation items-center justify-center border border-danger/70 bg-surface-deep/55 px-3 font-sans text-xs font-bold uppercase tracking-wider text-danger shadow-control transition-colors duration-150 ease-out hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none";

export const MOBILE_DRAWER_BUTTON_ICON_CLASS_NAME = "size-4";

export const MOBILE_DRAWER_RESOURCE_LIST_CLASS_NAME =
  "flex flex-col border-y border-line/45";

export const MOBILE_DRAWER_RESOURCE_LINK_CLASS_NAME =
  "flex min-h-11 items-center justify-between border-b border-line/45 px-2 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft no-underline last:border-b-0 hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus";

export const MOBILE_DRAWER_RESET_CONFIRM_CLASS_NAME =
  "border-l-2 border-danger bg-surface-deep/45 px-2.5 py-2.5";

export const MOBILE_DRAWER_RESET_COPY_CLASS_NAME =
  "m-0 font-sans text-xs font-semibold leading-snug text-ink-soft";
