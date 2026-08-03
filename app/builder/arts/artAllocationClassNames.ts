import type { ArtNodeKind } from "@/src/domain/types";

export const ART_ALLOCATION_CLASS_NAMES = {
  root: "grid min-w-0 gap-3",
  summary:
    "flex flex-wrap items-end justify-between gap-2 border-y border-frame-line/35 bg-surface-deep/55 px-3 py-2",
  summaryCopy: "grid gap-0.5",
  summaryLabel:
    "font-sans text-2xs font-bold uppercase tracking-wider text-ink-soft",
  summaryValue:
    "font-display text-xl leading-none lining-nums tabular-nums text-gold-bright",
  reset:
    "min-h-10 cursor-pointer border border-line-bright/45 bg-control px-3 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft transition-colors hover:bg-control-hover hover:text-ink focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none",
  list: "grid gap-1.5",
  row:
    "grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 border border-frame-line/30 bg-surface-deep/55 px-2.5 py-2 shadow-control max-mobile-wide:grid-cols-[2.75rem_minmax(0,1fr)]",
  art:
    "flex size-11 items-center justify-center overflow-hidden border border-line-bright/35 bg-night/70 font-display text-lg text-gold-bright",
  image: "size-10 object-contain drop-shadow-art-strong",
  copy: "grid min-w-0 gap-0.5",
  meta:
    "font-sans text-2xs font-bold uppercase tracking-wider text-ink-faint",
  name: "font-display text-base leading-tight text-ink",
  description: "text-xs leading-snug text-ink-soft",
  unmodeled: "text-2xs font-semibold text-gold-bright/75",
  trailing:
    "flex min-w-0 items-center justify-end gap-2 max-mobile-wide:col-span-2 max-mobile-wide:grid max-mobile-wide:w-full max-mobile-wide:grid-cols-[minmax(0,1fr)_auto]",
  outcome:
    "min-w-0 text-right font-sans text-xs font-bold leading-tight text-gold-bright",
  controls: "flex min-h-11 items-center border border-line-bright/35 bg-control",
  control:
    "flex size-11 cursor-pointer items-center justify-center border-0 bg-transparent font-display text-xl text-gold-bright transition-colors hover:bg-control-hover focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:text-ink-faint/35 motion-reduce:transition-none",
  rank:
    "min-w-14 px-1 text-center font-display text-lg lining-nums tabular-nums text-ink",
} as const;

export const ART_ALLOCATION_ROW_INDENT_CLASS_NAMES = {
  virtue: "ml-0",
  general: "ml-3 max-mobile-wide:ml-1.5",
  passive: "ml-6 max-mobile-wide:ml-3",
  combat: "ml-0",
} as const satisfies Record<ArtNodeKind, string>;
