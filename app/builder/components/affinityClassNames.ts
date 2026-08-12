import type { VirtueId } from "@/src/domain/types";

export const VIRTUE_ALIGNMENT_CLASS_NAMES = {
  figure:
    "relative w-full min-w-0 self-start max-tablet:col-start-1 max-tablet:row-start-2 max-tablet:min-h-52.5 max-tablet:self-stretch",
  map:
    "relative mx-auto aspect-4/5 h-auto w-full max-w-77.5 max-tablet:h-full max-tablet:max-w-52.5 max-tablet:aspect-auto",
  prismStack:
    "group/affinity-prism absolute top-1/20 left-1/2 aspect-square w-47/50 -translate-x-1/2 isolate select-none max-tablet:top-1/2 max-tablet:-translate-y-1/2",
  preview:
    "pointer-events-none relative aspect-square size-10 flex-none isolate select-none",
  lightField:
    "transition-opacity duration-150 ease-out motion-reduce:transition-none",
  selectorLight:
    "opacity-90 transition-opacity duration-150 ease-out motion-reduce:transition-none",
  interaction:
    "absolute inset-0 z-10 h-full w-full cursor-crosshair touch-none overflow-visible focus:outline-none! focus-visible:outline-none!",
  marker:
    "pointer-events-none absolute top-(--alignment-y) left-(--alignment-x) z-10 flex size-4.25 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-3 border-night bg-gold-bright ring-1 ring-gold-bright shadow-affinity-marker group-focus-within/affinity-prism:shadow-affinity-marker-focus",
  previewMarker:
    "pointer-events-none absolute top-(--alignment-y) left-(--alignment-x) z-10 flex size-2 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-night bg-gold-bright ring-1 ring-gold-bright shadow-sm",
  markerDot: "size-0.75 rounded-full bg-night",
  nodeCopy: "flex flex-col gap-0.5 leading-none",
  nodeLabel:
    "font-sans text-xs leading-none font-bold uppercase tracking-wider text-ink-soft tablet:max-wide-desktop:text-2xs max-tablet:text-2xs max-mobile-wide:text-xs",
  nodeValue: "flex items-baseline gap-1 whitespace-nowrap leading-none",
  nodeStrong:
    "font-display text-2xl leading-none font-normal lining-nums tabular-nums tablet:max-wide-desktop:text-xl max-tablet:text-lg max-mobile-wide:text-xl",
  nodeBonus:
    "font-display text-sm leading-none font-bold not-italic lining-nums tabular-nums text-verdant tablet:max-wide-desktop:text-xs max-tablet:text-xs",
  total:
    "absolute inset-x-0 bottom-0 flex flex-col items-center max-tablet:hidden",
  totalLabel:
    "block w-full whitespace-nowrap text-center font-sans text-2xs font-bold uppercase tracking-wider text-ink-soft",
  totalValueRow: "flex items-baseline gap-1.25",
  totalValue:
    "text-center font-display text-affinity-total leading-none font-normal lining-nums tabular-nums text-gold-bright text-shadow-affinity-total",
  pactBond: "mt-1.5 flex flex-col items-center gap-1",
  pactBondLabel:
    "font-sans text-2xs font-bold leading-none uppercase tracking-wider text-ink-soft",
  pactBondValues: "flex items-center justify-center gap-2",
  pactBondValue:
    "inline-flex items-center gap-0.75 font-display text-sm leading-none font-normal lining-nums tabular-nums text-gold-pale",
  mobileControls: "contents",
  mobileTotal:
    "hidden max-tablet:col-start-2 max-tablet:row-start-2 max-tablet:flex max-tablet:min-w-0 max-tablet:self-start max-tablet:flex-col max-tablet:items-center max-tablet:px-0.5 max-tablet:pt-0.5 max-tablet:pb-2.5",
  mobileTotalLabel:
    "text-center font-sans text-2xs font-bold leading-tight uppercase tracking-wider text-ink-soft",
  mobileTotalValue:
    "mt-1 font-display text-3xl font-normal leading-none lining-nums tabular-nums text-gold-bright text-shadow-display",
  optimize:
    "mt-3 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1.75 border border-line-bright/45 bg-control px-3.5 font-sans text-xs font-bold uppercase tracking-wider text-gold-bright shadow-control transition-colors duration-150 ease-out hover:border-line-bright/75 hover:bg-control-hover hover:text-ink focus-visible:border-line-bright/75 focus-visible:bg-control-hover focus-visible:text-ink focus-visible:outline-none focus-visible:shadow-focus compact-desktop:max-wide-desktop:mt-2.25 max-tablet:col-span-full max-tablet:mt-2 max-tablet:min-h-11 max-tablet:border-x-0 max-tablet:border-b-0 max-tablet:border-t max-tablet:border-line max-tablet:bg-transparent max-tablet:px-1 max-tablet:text-2xs max-tablet:font-semibold max-tablet:tracking-wide max-tablet:text-ink-soft max-tablet:shadow-none max-tablet:hover:border-line max-tablet:hover:bg-transparent max-tablet:hover:text-gold-bright max-tablet:focus-visible:border-line max-tablet:focus-visible:bg-transparent max-tablet:focus-visible:text-gold-bright motion-reduce:transition-none",
  optimizeIcon: "size-4 max-tablet:size-3.5",
} as const;

export const VIRTUE_ALIGNMENT_FOUNDATION_CLASS_NAMES = {
  layout:
    "grid h-full min-h-44 min-w-0 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-stretch gap-x-2.25 compact-desktop:grid-cols-[minmax(0,1fr)_minmax(8rem,0.72fr)] compact-desktop:gap-x-4",
  controls:
    "contents",
  figure: "contents",
  figureRoot: "contents",
  map:
    "col-start-1 row-start-1 h-full! min-h-44 w-full! max-w-none! self-stretch aspect-auto!",
  prismStack:
    "top-1/2! h-full! w-auto! max-w-full! -translate-y-1/2",
  nodeOverlay: "hidden",
  totalOverlay: "hidden",
  readout:
    "col-start-2 row-start-1 flex min-w-0 flex-col justify-center gap-2 border-y border-line/35 py-2",
  virtueList: "flex min-w-0 flex-col gap-1.5",
  virtue:
    "flex min-w-0 items-baseline justify-between gap-2",
  virtueLabel:
    "font-sans text-[0.625rem] font-bold uppercase leading-none tracking-wide text-ink-soft",
  virtueValue: "flex items-baseline gap-0.5 whitespace-nowrap",
  virtueStrong:
    "font-display text-xl font-normal leading-none lining-nums tabular-nums text-ink",
  virtueBonus:
    "font-sans text-[0.625rem] font-bold leading-none lining-nums tabular-nums text-verdant",
  total:
    "flex min-w-0 flex-col items-center gap-1 border-b border-line/35 pb-2",
  totalLabel:
    "font-sans text-[0.625rem] font-bold uppercase leading-none tracking-wide text-ink-soft",
  totalValue:
    "font-display text-3xl font-normal leading-none lining-nums tabular-nums text-gold-bright",
  pactBond:
    "flex min-w-0 flex-col items-center gap-1",
} as const;

export const VIRTUE_PRISM_LAYER_CLASS_NAMES = {
  unlit:
    "pointer-events-none absolute inset-0 z-0 block size-full select-none object-contain opacity-90 drop-shadow-xl saturate-50 sepia contrast-105",
  lighting:
    "pointer-events-none absolute inset-0 z-1 size-full select-none overflow-visible opacity-90 saturate-110 contrast-105",
  detail:
    "pointer-events-none absolute inset-0 z-2 block size-full select-none object-contain opacity-35 grayscale brightness-60 contrast-150",
} as const;

export const ALIGNMENT_NODE_CLASS_NAMES = {
  spirit:
    "absolute -top-4.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.75 compact-desktop:max-wide-desktop:-top-3.5 max-tablet:top-0",
  courage:
    "absolute bottom-1/5 left-0 z-10 flex items-center gap-1.75 max-tablet:bottom-0",
  grace:
    "absolute right-0 bottom-1/5 z-10 flex items-center gap-1.75 max-tablet:bottom-0",
} as const satisfies Record<VirtueId, string>;

export const AFFINITY_SOURCE_FOUNDATION_CLASS_NAMES = {
  section:
    "compact-desktop:mt-0! compact-desktop:border-0 compact-desktop:pt-0!",
  header: "compact-desktop:mb-1.5",
  triggerRow:
    "max-tablet:grid-cols-2! max-tablet:gap-1.5! compact-desktop:mt-0! compact-desktop:grid-cols-2 compact-desktop:gap-1.5!",
  trigger:
    "compact-desktop:min-h-10! compact-desktop:flex-row compact-desktop:items-center compact-desktop:justify-between compact-desktop:gap-2 compact-desktop:px-2.5! compact-desktop:py-1!",
  triggerTitle: "compact-desktop:text-[0.625rem]",
  summary: "compact-desktop:pr-3 compact-desktop:text-sm!",
} as const;

export const AFFINITY_SOURCE_CLASS_NAMES = {
  section:
    "relative isolate mt-2 pt-4 compact-desktop:max-wide-desktop:mt-1 compact-desktop:max-wide-desktop:pt-3 max-tablet:contents",
  header: "flex items-baseline max-tablet:hidden",
  title:
    "font-sans text-2xs font-bold uppercase tracking-wider text-ink-soft",
  triggerRow:
    "mt-2.5 grid grid-cols-2 gap-1.5 compact-desktop:max-wide-desktop:mt-2 compact-desktop:max-wide-desktop:gap-1 max-tablet:col-start-2 max-tablet:row-start-2 max-tablet:mt-0 max-tablet:self-end max-tablet:grid-cols-1",
  trigger:
    "group group/source relative isolate flex min-h-14 min-w-0 cursor-pointer flex-col items-start justify-center gap-1 border-0 bg-surface-deep/65 py-1.75 pr-7 pl-2.5 text-left text-ink-soft shadow-control transition-colors duration-150 ease-out hover:bg-surface-raised hover:text-ink focus-visible:bg-surface-raised focus-visible:text-ink focus-visible:outline-none focus-visible:shadow-focus aria-expanded:bg-surface-raised aria-expanded:text-ink compact-desktop:max-wide-desktop:min-h-12 compact-desktop:max-wide-desktop:pl-1.75 max-tablet:min-h-11 max-tablet:pl-2.25 motion-reduce:transition-none",
  triggerTitle:
    "relative z-2 font-sans text-2xs font-bold uppercase leading-none tracking-wider text-ink-soft",
  summary:
    "relative z-2 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-display text-base leading-none lining-nums tabular-nums text-gold-bright compact-desktop:max-wide-desktop:text-sm",
  summaryPips: "inline-flex items-center gap-1",
  summaryPip: "size-5 object-contain drop-shadow-art-strong",
  triggerArrow:
    "pointer-events-none absolute top-1/2 right-2 z-2 flex h-1.25 w-2.5 -translate-y-1/2 items-center justify-center transition-transform duration-150 ease-out group-aria-expanded/source:rotate-180 motion-reduce:transition-none",
  panel:
    "fixed z-70 grid min-w-0 gap-2 overflow-x-hidden overflow-y-auto border border-line-bright bg-surface p-2.25 shadow-popover animate-popover-in motion-reduce:animate-none",
  rankControls:
    "grid min-w-0 grid-cols-[minmax(0,1fr)_4rem] items-center gap-2",
  rankRange:
    "h-11 min-w-0 w-full cursor-pointer accent-gold-bright focus-visible:outline-none focus-visible:shadow-focus",
  rankNumber:
    "min-h-11 w-16 border border-line-bright/45 bg-control px-1 text-center font-display text-xl leading-none lining-nums tabular-nums text-gold-bright outline-none transition-colors hover:border-line-bright/75 hover:bg-control-hover focus-visible:border-gold-bright focus-visible:bg-control-hover focus-visible:shadow-focus motion-reduce:transition-none",
  fables: "grid min-w-0 gap-2 compact-desktop:max-wide-desktop:gap-1.5",
  fable:
    "grid min-w-0 gap-1.5 border border-frame-line/30 bg-surface-deep/55 px-2.5 py-2 shadow-control",
  fableTitle:
    "font-sans text-2xs font-bold uppercase tracking-wider text-ink-soft",
  choiceGroup: "grid min-w-0 grid-cols-4 gap-1 max-mobile-wide:grid-cols-2",
  choice:
    "group relative isolate flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 border border-line-bright/35 bg-control px-1.5 py-1 font-sans text-2xs font-bold leading-tight text-ink-soft transition-colors hover:border-line-bright/75 hover:bg-control-hover hover:text-ink focus-visible:border-gold-bright focus-visible:bg-control-hover focus-visible:text-ink focus-visible:outline-none focus-visible:shadow-focus aria-pressed:border-gold-bright/75 aria-pressed:bg-surface-raised aria-pressed:text-gold-bright motion-reduce:transition-none",
  choiceIcon: "relative z-2 size-5 flex-none object-contain drop-shadow-art-strong",
  choiceText: "relative z-2 min-w-0 text-center",
} as const;

export const AFFINITY_POPOVER_CLASS_NAMES = {
  pact:
    "absolute top-full left-0 z-20 mt-1.75 grid w-full grid-cols-3 gap-1.5 border border-line-bright bg-surface p-2.25 shadow-popover animate-popover-in max-tablet:fixed max-tablet:inset-x-3 max-tablet:top-auto max-tablet:bottom-17.5 max-tablet:mt-0 max-tablet:max-h-overlay-max max-tablet:w-auto max-tablet:overflow-y-auto max-mobile-wide:grid-cols-1",
  fables:
    "absolute top-full left-0 z-20 mt-1.75 grid w-full grid-cols-2 gap-1.5 border border-line-bright bg-surface p-2.25 shadow-popover animate-popover-in max-tablet:fixed max-tablet:inset-x-3 max-tablet:top-auto max-tablet:bottom-17.5 max-tablet:mt-0 max-tablet:max-h-overlay-max max-tablet:w-auto max-tablet:overflow-y-auto max-mobile-wide:grid-cols-1",
} as const;

export const AFFINITY_POPOVER_ARROW_CLASS_NAMES = {
  pact:
    "absolute -top-1.25 left-1/2 size-2 -translate-x-1/2 rotate-45 border-t border-l border-line-bright bg-surface max-tablet:hidden",
  fables:
    "absolute -top-1.25 left-5/6 size-2 -translate-x-1/2 rotate-45 border-t border-l border-line-bright bg-surface max-tablet:hidden",
} as const;
