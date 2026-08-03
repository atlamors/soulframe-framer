import type { VirtueId } from "@/src/domain/types";

export const VIRTUE_PIP_STRIP_CLASS_NAME =
  "flex min-h-5 items-center gap-1";

export const VIRTUE_PIP_CLASS_NAMES = {
  courage:
    "inline-flex size-5 items-center justify-center rounded-full border border-ember/45 bg-ember/10 shadow-sm",
  spirit:
    "inline-flex size-5 items-center justify-center rounded-full border border-aether/45 bg-aether/10 shadow-sm",
  grace:
    "inline-flex size-5 items-center justify-center rounded-full border border-verdant/45 bg-verdant/10 shadow-sm",
} as const satisfies Record<VirtueId, string>;

export const VIRTUE_PIP_IMAGE_CLASS_NAME =
  "size-3.5 object-contain saturate-125 brightness-125 drop-shadow-sm";

export const VIRTUE_PIP_EMPTY_CLASS_NAME =
  "font-display text-sm leading-none text-ink-faint";
