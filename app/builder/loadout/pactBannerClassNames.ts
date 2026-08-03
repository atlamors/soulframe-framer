import type { VirtueId } from "@/src/domain/types";

type PactBannerState = "default" | "active";
type PactBannerAbilityState = VirtueId | "passive";

export const PACT_BANNER_CLASS_NAMES = {
  default:
    "group relative z-10 col-span-full row-start-1 mx-auto grid min-h-21 w-full cursor-pointer grid-cols-pact-banner items-center gap-3 border border-frame-line/45 bg-loadout-card pt-1.75 pr-3.5 pb-1.75 pl-2 text-left text-ink shadow-loadout-card transition-colors duration-150 ease-out hover:border-frame-line-bright/70 hover:bg-loadout-card-hover aria-expanded:border-frame-line-bright/75 aria-expanded:bg-loadout-card-hover aria-expanded:shadow-loadout-card-active compact-desktop:max-wide-desktop:min-h-18 compact-desktop:max-wide-desktop:grid-cols-pact-banner-compact compact-desktop:max-wide-desktop:gap-2.25 tablet:max-compact-desktop:order-1 tablet:max-compact-desktop:w-full max-tablet:order-1 max-tablet:inset-auto max-tablet:col-span-full max-tablet:row-start-1 max-tablet:min-h-24 max-tablet:w-full max-tablet:grid-cols-pact-banner-mobile max-tablet:gap-2.5 max-tablet:px-2 max-tablet:py-1.5 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  active:
    "group relative z-10 col-span-full row-start-1 mx-auto grid min-h-21 w-full cursor-pointer grid-cols-pact-banner items-center gap-3 border border-frame-line-bright/75 bg-loadout-card-hover pt-1.75 pr-3.5 pb-1.75 pl-2 text-left text-ink shadow-loadout-card-active transition-colors duration-150 ease-out hover:border-frame-line-bright/85 compact-desktop:max-wide-desktop:min-h-18 compact-desktop:max-wide-desktop:grid-cols-pact-banner-compact compact-desktop:max-wide-desktop:gap-2.25 tablet:max-compact-desktop:order-1 tablet:max-compact-desktop:w-full max-tablet:order-1 max-tablet:inset-auto max-tablet:col-span-full max-tablet:row-start-1 max-tablet:min-h-24 max-tablet:w-full max-tablet:grid-cols-pact-banner-mobile max-tablet:gap-2.5 max-tablet:px-2 max-tablet:py-1.5 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
} as const satisfies Record<PactBannerState, string>;

export const PACT_BANNER_ART_CLASS_NAME =
  "flex size-17 flex-none items-center justify-center overflow-hidden border-r border-frame-line/20 bg-aura-gold compact-desktop:max-wide-desktop:size-14 max-tablet:size-20";

export const PACT_BANNER_ART_IMAGE_CLASS_NAME =
  "size-17 object-contain drop-shadow-art-strong saturate-95 contrast-110 compact-desktop:max-wide-desktop:size-14 max-tablet:size-20";

export const PACT_BANNER_ART_FALLBACK_CLASS_NAME = "text-ink";

export const PACT_BANNER_COPY_CLASS_NAME = "flex min-w-0 flex-1 flex-col";

export const PACT_BANNER_KICKER_CLASS_NAME =
  "whitespace-nowrap font-sans text-xs font-bold uppercase leading-none tracking-widest text-gold max-tablet:text-2xs";

export const PACT_BANNER_NAME_CLASS_NAME =
  "mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap font-display text-pact-name font-normal leading-tight text-ink text-shadow-value compact-desktop:max-wide-desktop:text-xl max-tablet:text-lg";

export const PACT_BANNER_META_CLASS_NAME =
  "mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-xs font-semibold leading-tight text-ink-faint max-tablet:text-2xs";

export const PACT_BANNER_ABILITIES_CLASS_NAME =
  "grid flex-none grid-cols-3 items-center gap-1 max-tablet:gap-0.5";

export const PACT_BANNER_ABILITY_CLASS_NAMES = {
  courage:
    "flex size-8 items-center justify-center overflow-hidden border border-ember/75 bg-surface-deep/75 shadow-control compact-desktop:max-wide-desktop:size-7 max-tablet:size-6",
  spirit:
    "flex size-8 items-center justify-center overflow-hidden border border-aether/75 bg-surface-deep/75 shadow-control compact-desktop:max-wide-desktop:size-7 max-tablet:size-6",
  grace:
    "flex size-8 items-center justify-center overflow-hidden border border-verdant/75 bg-surface-deep/75 shadow-control compact-desktop:max-wide-desktop:size-7 max-tablet:size-6",
  passive:
    "flex size-8 items-center justify-center overflow-hidden border border-frame-line/30 bg-surface-deep/75 shadow-control compact-desktop:max-wide-desktop:size-7 max-tablet:size-6",
} as const satisfies Record<PactBannerAbilityState, string>;

export const PACT_BANNER_ABILITY_IMAGE_CLASS_NAME =
  "size-7.5 object-contain compact-desktop:max-wide-desktop:size-6.5 max-tablet:size-5.5";

export const PACT_BANNER_ABILITY_FALLBACK_CLASS_NAME = "text-ink";
