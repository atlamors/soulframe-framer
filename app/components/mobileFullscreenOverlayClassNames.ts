export const MOBILE_HEADER_MENU_SURFACE_CLASS_NAME =
  "max-tablet:bg-surface-overlay max-tablet:bg-aura-gold max-tablet:shadow-overlay max-tablet:backdrop-blur-xl";

export const MOBILE_FULLSCREEN_OVERLAY_CLASS_NAMES = {
  overlay:
    "fixed inset-0 z-60 bg-scrim backdrop-blur-md data-[state=open]:animate-fade-up max-tablet:data-[state=open]:animate-mobile-overlay-surface-in max-tablet:data-[state=closed]:animate-mobile-overlay-surface-out motion-reduce:animate-none",
  contentBase:
    "group fixed z-70 flex flex-col overflow-hidden outline-none",
  content:
    `inset-0 h-dvh w-full ${MOBILE_HEADER_MENU_SURFACE_CLASS_NAME} pt-mobile-safe-top pb-safe-bottom data-[state=open]:animate-mobile-overlay-surface-in data-[state=closed]:pointer-events-none data-[state=closed]:animate-mobile-overlay-surface-out motion-reduce:animate-none tablet:hidden`,
} as const;

export const MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES = {
  first:
    "will-change-transform max-tablet:group-data-[state=open]:animate-mobile-overlay-stage-first-in max-tablet:group-data-[state=closed]:animate-mobile-overlay-stage-out motion-reduce:animate-none motion-reduce:will-change-auto",
  second:
    "will-change-transform max-tablet:group-data-[state=open]:animate-mobile-overlay-stage-second-in max-tablet:group-data-[state=closed]:animate-mobile-overlay-stage-out motion-reduce:animate-none motion-reduce:will-change-auto",
  third:
    "will-change-transform max-tablet:group-data-[state=open]:animate-mobile-overlay-stage-third-in max-tablet:group-data-[state=closed]:animate-mobile-overlay-stage-out motion-reduce:animate-none motion-reduce:will-change-auto",
  fourth:
    "will-change-transform max-tablet:group-data-[state=open]:animate-mobile-overlay-stage-fourth-in max-tablet:group-data-[state=closed]:animate-mobile-overlay-stage-out motion-reduce:animate-none motion-reduce:will-change-auto",
} as const;
