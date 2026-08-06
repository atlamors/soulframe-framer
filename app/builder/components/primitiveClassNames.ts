type StatIconVariant = "small" | "regular" | "large" | "armorStat";

export const STAT_ICON_CLASS_NAMES = {
  small:
    "inline-flex size-6 flex-none items-center justify-center rounded-full border border-frame-line/38 bg-surface-deep/55 shadow-control",
  regular:
    "inline-flex size-8.75 flex-none items-center justify-center rounded-full border border-frame-line/38 bg-surface-deep/55 shadow-control",
  large:
    "inline-flex size-10 flex-none items-center justify-center rounded-full border border-frame-line/38 bg-surface-deep/55 shadow-control",
  armorStat:
    "inline-flex size-8.75 flex-none items-center justify-center rounded-full border border-frame-line-bright/45 bg-surface-deep/55 shadow-control",
} as const satisfies Record<StatIconVariant, string>;

export const STAT_ICON_IMAGE_CLASS_NAME =
  "block size-3/4 object-contain saturate-75 brightness-110";

type RequirementBadgePlacement =
  | "default"
  | "dense"
  | "detail"
  | "heading";

export const REQUIREMENT_BADGE_CLASS_NAMES = {
  default:
    "mt-1.25 inline-flex w-fit flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sans text-xs font-semibold text-ink-faint",
  dense:
    "inline-flex w-fit flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sans text-xs font-semibold text-ink-faint max-tablet:text-2xs",
  detail:
    "inline-flex w-fit flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sans text-xs font-semibold leading-tight text-ink-faint",
  heading:
    "inline-flex min-h-7 w-fit flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sans text-xs font-semibold text-ink-faint",
} as const satisfies Record<RequirementBadgePlacement, string>;

export const REQUIREMENT_BADGE_SEGMENT_CLASS_NAMES = {
  met: "inline-flex items-center gap-1 text-ink-faint",
  unmet: "inline-flex items-center gap-1 text-danger",
} as const satisfies Record<"met" | "unmet", string>;

export const REQUIREMENT_BADGE_ICON_CLASS_NAME =
  "size-3.5";

export const REQUIREMENT_BADGE_UNMET_LABEL_CLASS_NAME =
  "inline-flex items-center gap-1 not-italic text-danger";

type DeltaTone = "positive" | "negative" | "neutral";

export const DELTA_CLASS_NAMES = {
  positive: "text-verdant!",
  negative: "text-danger!",
  neutral: "text-ink-faint!",
} as const satisfies Record<DeltaTone, string>;
