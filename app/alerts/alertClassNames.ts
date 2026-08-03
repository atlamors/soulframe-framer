import type { AlertSeverity } from "@/src/ui/alerts/alertState";
import {
  MOBILE_FULLSCREEN_OVERLAY_CLASS_NAMES,
  MOBILE_HEADER_MENU_SURFACE_CLASS_NAME,
} from "@/app/components/mobileFullscreenOverlayClassNames";

export const ALERT_CLASS_NAMES = {
  toastViewport:
    "fixed right-0 bottom-0 z-70 flex w-full max-w-110 list-none flex-col gap-2 p-safe-inline pb-safe-bottom outline-none max-tablet:top-mobile-header max-tablet:bottom-auto max-tablet:max-w-none",
  toast:
    "pointer-events-auto grid grid-cols-12 gap-x-3 gap-y-1 border border-line-bright/55 border-l-2 bg-surface bg-control px-3.5 py-3 shadow-panel data-[state=open]:animate-slide-in motion-reduce:animate-none",
  toastTitle:
    "col-span-11 font-sans text-xs font-bold uppercase tracking-wider text-gold-bright",
  toastDescription:
    "col-span-11 font-sans text-xs font-semibold leading-snug text-ink-soft",
  toastClose:
    "col-start-12 row-start-1 row-span-2 inline-flex size-9 cursor-pointer items-center justify-center self-center border-0 bg-transparent p-0 text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  toastCloseIcon: "size-4",
  dialogOverlay:
    `${MOBILE_FULLSCREEN_OVERLAY_CLASS_NAMES.overlay} max-tablet:z-0`,
  dialogContent:
    `top-1/2 left-1/2 max-h-overlay-max w-full max-w-168 -translate-x-1/2 -translate-y-1/2 border border-frame-line/60 bg-surface shadow-panel data-[state=open]:animate-fade-up max-tablet:inset-0 max-tablet:z-10 max-tablet:h-dvh max-tablet:max-h-none max-tablet:max-w-none max-tablet:translate-x-0 max-tablet:translate-y-0 max-tablet:border-0 ${MOBILE_HEADER_MENU_SURFACE_CLASS_NAME} max-tablet:pt-mobile-header max-tablet:pb-safe-bottom max-tablet:data-[state=open]:animate-mobile-overlay-surface-in max-tablet:data-[state=closed]:pointer-events-none max-tablet:data-[state=closed]:animate-mobile-overlay-surface-out motion-reduce:animate-none`,
  dialogHeader:
    "flex flex-none items-start justify-between gap-4 border-b border-line bg-aura-gold px-5 py-4 max-tablet:contents",
  dialogHeading: "min-w-0 max-tablet:sr-only",
  dialogTitle:
    "font-display text-heading leading-none text-gold-bright text-shadow-display",
  dialogDescription:
    "mt-1 font-sans text-xs font-semibold leading-snug text-ink-soft",
  dialogClose:
    "inline-flex size-11 flex-none cursor-pointer items-center justify-center border border-line-bright/45 bg-surface-deep/55 p-0 text-ink-soft shadow-control transition-colors hover:border-line-bright hover:text-ink focus-visible:outline-none focus-visible:shadow-focus max-tablet:hidden motion-reduce:transition-none",
  dialogCloseIcon: "size-5",
  dialogBody:
    "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 max-tablet:px-safe-inline",
  section: "not-first:mt-5",
  sectionHeading:
    "mb-2.5 font-sans text-2xs font-bold uppercase tracking-widest text-gold",
  list: "flex flex-col border-y border-line/55",
  item: "flex items-start gap-3 border-b border-line/45 px-3 py-3 last:border-b-0",
  itemIcon: "mt-0.5 size-4.5",
  itemCopy: "min-w-0 flex-1",
  itemTitle: "font-sans text-sm font-bold leading-snug text-ink",
  itemDescription:
    "mt-0.5 font-sans text-xs font-semibold leading-snug text-ink-soft",
  itemMeta:
    "whitespace-nowrap font-sans text-2xs font-bold uppercase tracking-wider text-ink-faint",
  itemActions: "flex flex-none flex-col items-end gap-1.5",
  itemMuted:
    "whitespace-nowrap font-sans text-2xs font-bold uppercase tracking-wider text-gold",
  itemUnmute:
    "cursor-pointer border border-line-bright/45 bg-transparent px-2 py-1 font-sans text-2xs font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-line-bright hover:text-ink focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  empty:
    "border border-line/45 bg-surface-deep/35 px-3 py-4 font-sans text-xs font-semibold leading-snug text-ink-faint",
} as const;

export const ALERT_SEVERITY_CLASS_NAMES = {
  info: "border-aether/70",
  warning: "border-gold/75",
  danger: "border-danger/80",
} as const satisfies Record<AlertSeverity, string>;

export const ALERT_SEVERITY_ICON_CLASS_NAMES = {
  info: "text-aether",
  warning: "text-gold-bright",
  danger: "text-danger",
} as const satisfies Record<AlertSeverity, string>;
