import type { VirtueId } from "@/src/domain/types";

type PactAbilityKind = VirtueId | "passive";
type PactAbilityAvailability = "locked" | "unlocked";

export const PACT_PICKER_CLASS_NAMES = {
  kicker:
    "mb-1 block font-sans text-xs font-bold uppercase tracking-widest text-gold",
  description:
    "my-4.5 max-w-prose text-sm font-medium text-ink-soft leading-relaxed",
  rankControl:
    "flex min-h-13 items-center justify-between border border-frame-line/40 bg-picker-detail px-3 py-2 shadow-picker-row",
  rankLabel:
    "font-sans text-xs font-bold uppercase tracking-wide text-ink-soft",
  rankSelect:
    "min-h-9 cursor-pointer border border-frame-line/55 bg-control py-0 pr-7 pl-2.5 font-sans text-xs font-bold text-ink shadow-control hover:border-gold focus-visible:outline-none focus-visible:shadow-focus max-tablet:min-h-11 max-tablet:text-base",
  abilitySection: "mt-4.5",
  abilityHeader:
    "flex items-baseline justify-between border-b border-frame-line/35 pb-2",
  abilityHeading:
    "font-sans text-xs font-bold uppercase tracking-wider text-gold",
  abilityRank:
    "font-sans text-xs font-bold text-ink-faint",
  abilityGrid: "mt-2 grid gap-2",
  abilityArt:
    "flex size-12 shrink-0 items-center justify-center overflow-hidden border border-frame-line/25 bg-surface-deep shadow-picker-art",
  abilityImage: "size-12 object-contain",
  abilityCopy: "min-w-0 flex-1",
  abilityMeta:
    "block font-sans text-xs font-bold uppercase tracking-wider text-ink-faint",
  abilityName:
    "mt-0.5 block font-display text-lg font-normal leading-tight text-ink",
  abilityDescription:
    "mt-1 text-xs font-semibold leading-snug text-ink-faint",
} as const;

export const PACT_PICKER_ABILITY_CLASS_NAMES = {
  courage: {
    unlocked:
      "flex items-start gap-2.5 border border-frame-line/20 border-l-2 border-l-ember bg-picker-detail px-2.5 py-2 shadow-picker-row",
    locked:
      "flex items-start gap-2.5 border border-frame-line/15 border-l-2 border-l-ember bg-picker-detail px-2.5 py-2 opacity-50 saturate-50",
  },
  spirit: {
    unlocked:
      "flex items-start gap-2.5 border border-frame-line/20 border-l-2 border-l-aether bg-picker-detail px-2.5 py-2 shadow-picker-row",
    locked:
      "flex items-start gap-2.5 border border-frame-line/15 border-l-2 border-l-aether bg-picker-detail px-2.5 py-2 opacity-50 saturate-50",
  },
  grace: {
    unlocked:
      "flex items-start gap-2.5 border border-frame-line/20 border-l-2 border-l-verdant bg-picker-detail px-2.5 py-2 shadow-picker-row",
    locked:
      "flex items-start gap-2.5 border border-frame-line/15 border-l-2 border-l-verdant bg-picker-detail px-2.5 py-2 opacity-50 saturate-50",
  },
  passive: {
    unlocked:
      "flex items-start gap-2.5 border border-frame-line/20 border-l-2 border-l-gold bg-picker-detail px-2.5 py-2 shadow-picker-row",
    locked:
      "flex items-start gap-2.5 border border-frame-line/15 border-l-2 border-l-gold bg-picker-detail px-2.5 py-2 opacity-50 saturate-50",
  },
} as const satisfies Record<
  PactAbilityKind,
  Record<PactAbilityAvailability, string>
>;
