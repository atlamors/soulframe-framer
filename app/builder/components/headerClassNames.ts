type HeaderElement =
  | "contextBar"
  | "contextBarMobileSuppressed"
  | "mobileMenuLayer"
  | "frameActionsGroup"
  | "frameActions"
  | "frameActionsLabel"
  | "frameActionsName"
  | "frameActionsChevron"
  | "frameActionsChevronOpen";
export type BuildNameControlAppearance = "drawer" | "header" | "statSheet";
export type BuildNameEditingState = "default" | "editing";

export const HEADER_CLASS_NAMES = {
  contextBar:
    "relative z-40 grid min-h-18 grid-cols-12 items-center gap-6 border-b border-line/40 compact-desktop:min-h-14 max-tablet:min-h-12 max-tablet:grid-cols-1 max-tablet:gap-0 max-tablet:px-1.5",
  contextBarMobileSuppressed: "max-tablet:hidden",
  mobileMenuLayer: "contents",
  frameActionsGroup:
    "col-span-3 col-start-10 flex min-w-0 items-center justify-self-end gap-2 compact-desktop:col-span-5 compact-desktop:col-start-8 max-tablet:col-span-1 max-tablet:col-start-1 max-tablet:w-full max-tablet:justify-self-stretch",
  frameActions:
    "group inline-flex min-h-11 max-w-80 min-w-0 flex-1 items-center border border-line-bright/40 bg-surface-deep/45 px-3 text-left shadow-control transition-colors hover:border-frame-line/70 hover:bg-surface-raised focus-visible:outline-none focus-visible:shadow-focus max-tablet:max-w-none max-tablet:border-x-0 max-tablet:border-y-0 max-tablet:bg-transparent max-tablet:px-2 max-tablet:shadow-none motion-reduce:transition-none",
  frameActionsLabel:
    "mr-2 flex-none font-sans text-2xs font-bold uppercase tracking-[0.18em] text-gold",
  frameActionsName:
    "min-w-0 flex-1 truncate font-display text-base font-normal leading-none text-ink text-shadow-value",
  frameActionsChevron:
    "ml-2 size-4.5 flex-none text-gold transition-transform duration-150 ease-out motion-reduce:transition-none",
  frameActionsChevronOpen: "rotate-180",
} as const satisfies Record<HeaderElement, string>;

export const BUILD_NAME_CONTROL_CLASS_NAMES = {
  header: {
    default:
      "col-span-6 col-start-4 flex w-full max-w-130 min-w-0 items-center justify-self-center gap-0 [--build-name-frame-cap:24px] compact-desktop:hidden max-tablet:hidden max-tablet:[--build-name-frame-cap:22px] max-narrow:[--build-name-frame-cap:20px]",
    editing:
      "col-span-6 col-start-4 flex w-full max-w-130 min-w-0 items-center justify-self-center gap-0 [--build-name-frame-cap:24px] compact-desktop:hidden max-tablet:hidden max-tablet:[--build-name-frame-cap:22px] max-narrow:[--build-name-frame-cap:20px]",
  },
  drawer: {
    default:
      "flex w-full min-w-0 flex-1 items-center gap-0 [--build-name-frame-cap:18px]",
    editing:
      "flex w-full min-w-0 flex-1 items-center gap-0 [--build-name-frame-cap:18px]",
  },
  statSheet: {
    default:
      "relative z-30 hidden w-full min-w-0 items-center compact-desktop:flex",
    editing:
      "relative z-30 hidden w-full min-w-0 items-center compact-desktop:flex",
  },
} as const satisfies Record<
  BuildNameControlAppearance,
  Record<BuildNameEditingState, string>
>;

export const BUILD_NAME_FRAME_CLASS_NAMES = {
  header: {
    default:
      "relative z-20 flex h-14.5 min-h-14.5 min-w-0 flex-1 items-center overflow-visible px-7.75 compact-desktop:max-wide-desktop:h-13.5 compact-desktop:max-wide-desktop:min-h-13.5 max-tablet:h-13.5 max-tablet:min-h-13.5 max-tablet:px-6 max-narrow:h-12 max-narrow:min-h-12 max-narrow:px-5.5",
    editing:
      "relative z-20 flex h-14.5 min-h-14.5 min-w-0 flex-1 items-center overflow-visible px-7.75 compact-desktop:max-wide-desktop:h-13.5 compact-desktop:max-wide-desktop:min-h-13.5 max-tablet:h-13.5 max-tablet:min-h-13.5 max-tablet:px-6 max-narrow:h-12 max-narrow:min-h-12 max-narrow:px-5.5",
  },
  drawer: {
    default:
      "relative z-20 flex h-11 min-h-11 min-w-0 flex-1 items-center overflow-visible px-5",
    editing:
      "relative z-20 flex h-11 min-h-11 min-w-0 flex-1 items-center overflow-visible px-5",
  },
  statSheet: {
    default: "m-0 flex min-w-0 flex-1 items-center overflow-hidden",
    editing: "m-0 flex min-w-0 flex-1 items-center overflow-hidden",
  },
} as const satisfies Record<
  BuildNameControlAppearance,
  Record<BuildNameEditingState, string>
>;

const BUILD_NAME_FRAME_ART_CLASS_NAME =
  "pointer-events-none absolute inset-0 z-0 block border border-solid border-transparent [border-image-slice:29_24_29_24_fill] [border-image-width:50%_var(--build-name-frame-cap)] [border-image-repeat:repeat_stretch]";

export const BUILD_NAME_FRAME_ART_CLASS_NAMES = {
  default: `${BUILD_NAME_FRAME_ART_CLASS_NAME} [border-image-source:url('/login-frame/input-frame-neutral.svg?v=6')]`,
  editing: `${BUILD_NAME_FRAME_ART_CLASS_NAME} [border-image-source:url('/login-frame/input-frame-focused.svg?v=6')]`,
} as const satisfies Record<BuildNameEditingState, string>;

export const BUILD_NAME_ORNAMENT_SOURCES = {
  default: {
    left: "/login-frame/leaf-left.svg?v=2",
    right: "/login-frame/leaf-right.svg?v=2",
  },
  editing: {
    left: "/login-frame/leaf-focused.svg?v=1",
    right: "/login-frame/leaf-focused-right.svg?v=1",
  },
} as const satisfies Record<
  BuildNameEditingState,
  Record<"left" | "right", string>
>;

const BUILD_NAME_ORNAMENT_CLASS_NAME =
  "pointer-events-none absolute inset-y-0 z-1 my-auto block select-none";

export const BUILD_NAME_ORNAMENT_CLASS_NAMES = {
  header: {
    left: `${BUILD_NAME_ORNAMENT_CLASS_NAME} -left-1 h-5 w-6.25`,
    right: `${BUILD_NAME_ORNAMENT_CLASS_NAME} -right-1 h-5 w-6.25`,
  },
  drawer: {
    left: `${BUILD_NAME_ORNAMENT_CLASS_NAME} -left-1 h-4 w-5`,
    right: `${BUILD_NAME_ORNAMENT_CLASS_NAME} -right-1 h-4 w-5`,
  },
  statSheet: {
    left: "hidden",
    right: "hidden",
  },
} as const satisfies Record<
  BuildNameControlAppearance,
  Record<"left" | "right", string>
>;

export const BUILD_NAME_INPUT_CLASS_NAMES = {
  header:
    "relative z-10 w-full min-w-0 appearance-none rounded-none border-0 bg-transparent px-2.25 pb-px text-center font-display text-heading leading-none text-gold-bright caret-gold-bright shadow-none text-shadow-display outline-none focus:outline-none focus-visible:outline-none max-tablet:text-left",
  drawer:
    "relative z-10 w-full min-w-0 appearance-none rounded-none border-0 bg-transparent px-1.5 pb-px text-left font-display text-base leading-none text-gold-bright caret-gold-bright shadow-none text-shadow-display outline-none focus:outline-none focus-visible:outline-none",
  statSheet:
    "relative z-10 w-full min-w-0 appearance-none overflow-hidden text-ellipsis whitespace-nowrap rounded-none border-0 bg-transparent p-0 font-display text-xl font-normal uppercase leading-tight tracking-[0.14em] text-stat-sheet-on-dark-gold-bright caret-stat-sheet-on-dark-gold-bright shadow-none text-shadow-value outline-none [&::selection]:bg-[#071426] [&::selection]:text-stat-sheet-on-dark-gold-pale focus:outline-none focus-visible:outline-none compact-desktop:max-wide-desktop:text-base compact-desktop:max-wide-desktop:tracking-[0.1em]",
} as const satisfies Record<BuildNameControlAppearance, string>;

export const BUILD_NAME_DISPLAY_CLASS_NAMES = {
  header:
    "relative z-10 block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2.25 pb-px text-center font-display text-heading leading-none text-ink text-shadow-display max-tablet:text-left",
  drawer:
    "relative z-10 block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-1.5 pb-px text-left font-display text-base leading-none text-ink text-shadow-display",
  statSheet:
    "relative z-10 block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-display text-xl font-normal uppercase leading-tight tracking-[0.14em] text-stat-sheet-header-title text-shadow-value compact-desktop:max-wide-desktop:text-base compact-desktop:max-wide-desktop:tracking-[0.1em]",
} as const satisfies Record<BuildNameControlAppearance, string>;

export const BUILD_NAME_EDIT_CLASS_NAMES = {
  header: {
    default:
      "group relative z-10 -ml-2.5 flex h-14.5 w-17.5 flex-none cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 shadow-none focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-3 compact-desktop:max-wide-desktop:h-13.5 compact-desktop:max-wide-desktop:w-16.5 max-tablet:h-13.5 max-tablet:w-16.5 max-narrow:h-12 max-narrow:w-15",
    editing:
      "group relative z-10 -ml-2.5 flex h-14.5 w-17.5 flex-none cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 shadow-none focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-3 compact-desktop:max-wide-desktop:h-13.5 compact-desktop:max-wide-desktop:w-16.5 max-tablet:h-13.5 max-tablet:w-16.5 max-narrow:h-12 max-narrow:w-15",
  },
  drawer: {
    default:
      "group relative z-10 -ml-1.5 flex h-11 w-13.5 flex-none cursor-pointer touch-manipulation appearance-none items-center justify-center border-0 bg-transparent p-0 shadow-none focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-3",
    editing:
      "group relative z-10 -ml-1.5 flex h-11 w-13.5 flex-none cursor-pointer touch-manipulation appearance-none items-center justify-center border-0 bg-transparent p-0 shadow-none focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-3",
  },
  statSheet: {
    default:
      "group relative z-10 inline-flex size-11 translate-x-[11px] flex-none cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 text-stat-sheet-on-dark-gold/70 transition-colors duration-150 ease-out hover:text-stat-sheet-on-dark-gold-bright focus-visible:text-stat-sheet-on-dark-gold-bright focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
    editing:
      "group relative z-10 inline-flex size-11 translate-x-[11px] flex-none cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 text-stat-sheet-on-dark-gold-bright transition-colors duration-150 ease-out hover:text-stat-sheet-on-dark-gold-bright focus-visible:text-stat-sheet-on-dark-gold-bright focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  },
} as const satisfies Record<
  BuildNameControlAppearance,
  Record<BuildNameEditingState, string>
>;

export const BUILD_NAME_EDIT_FRAME_CLASS_NAMES = {
  header:
    "pointer-events-none absolute inset-0 z-0 block size-full select-none",
  drawer:
    "pointer-events-none absolute inset-0 z-0 block size-full select-none",
  statSheet:
    "pointer-events-none absolute inset-0 z-0 m-auto size-10 select-none",
} as const satisfies Record<BuildNameControlAppearance, string>;

export const BUILD_NAME_EDIT_FRAME_SOURCES = {
  default: "/login-frame/edit-slot-frame-neutral.svg?v=1",
  editing: "/login-frame/edit-slot-frame-focused.svg?v=1",
} as const satisfies Record<BuildNameEditingState, string>;

export const STAT_SHEET_BUILD_NAME_EDIT_VISUAL_CLASS_NAME =
  "pointer-events-none relative block size-10 flex-none translate-x-0.75 scale-[0.8]";

export const BUILD_NAME_EDIT_IMAGE_CLASS_NAMES = {
  header:
    "pointer-events-none absolute top-1/2 left-1/2 z-10 -ml-0.75 -mt-2.5 block h-16 w-13.5 -translate-x-1/2 -translate-y-1/2 saturate-110 drop-shadow-art compact-desktop:max-wide-desktop:h-15 compact-desktop:max-wide-desktop:w-12.5 max-tablet:h-15 max-tablet:w-12.5 max-narrow:h-14 max-narrow:w-11.75",
  drawer:
    "pointer-events-none absolute top-1/2 left-1/2 z-10 -ml-0.75 -mt-2.5 block h-15 w-12.5 -translate-x-1/2 -translate-y-1/2 saturate-110 drop-shadow-art",
  statSheet:
    "pointer-events-none relative z-10 h-10 w-8.25 translate-x-[0.5px] -translate-y-1.5 select-none object-contain saturate-110 drop-shadow-art",
} as const satisfies Record<BuildNameControlAppearance, string>;
