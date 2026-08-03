type MobileDefenseLabelState = "collapsed" | "expanded";

export const SCREEN_READER_ONLY_CLASS_NAME = "sr-only";

export const MOBILE_DEFENSE_LABEL_CLASS_NAMES = {
  collapsed:
    "sr-only max-tablet:not-sr-only max-tablet:max-w-overlay-sm max-tablet:overflow-hidden max-tablet:whitespace-nowrap max-tablet:font-sans max-tablet:text-2xs max-tablet:font-bold max-tablet:text-ink-faint",
  expanded: "sr-only",
} as const satisfies Record<MobileDefenseLabelState, string>;

export const MOBILE_DEFENSE_SHORT_LABEL_CLASS_NAMES = {
  collapsed: "sr-only",
  expanded: "sr-only",
} as const satisfies Record<MobileDefenseLabelState, string>;
