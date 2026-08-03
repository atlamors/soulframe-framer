export const MOBILE_SUPPORT_ZONE_CLASS_NAMES = {
  root:
    "hidden max-tablet:relative max-tablet:z-10 max-tablet:order-8 max-tablet:col-span-full max-tablet:row-start-6 max-tablet:-mx-4 max-tablet:mt-2 max-tablet:flex max-tablet:flex-col max-tablet:items-center max-tablet:gap-4 max-tablet:pb-2",
  adPlaceholder:
    "relative isolate flex h-62.5 w-75 max-w-full flex-col items-center justify-center overflow-hidden border-0 px-5 text-center",
  adFrame:
    "pointer-events-none absolute inset-0 z-0 block size-full object-fill",
  adEyebrow:
    "relative z-10 font-sans text-2xs font-bold uppercase tracking-widest text-ink-faint",
  adSize:
    "relative z-10 mt-1.5 font-display text-xl font-normal lining-nums tabular-nums text-gold-pale text-shadow-value",
  adNote:
    "relative z-10 mt-1 max-w-48 font-sans text-2xs font-semibold leading-snug text-ink-faint",
  support:
    "w-75 max-w-full border-t border-frame-line/32 px-2 pt-3 text-center",
  supportHeading:
    "font-sans text-2xs font-bold uppercase tracking-widest text-gold",
  supportCopy:
    "mt-1 font-sans text-2xs font-semibold leading-snug text-ink-faint",
  supportLinks: "mt-2 grid grid-cols-2 gap-2",
  supportLink:
    "flex min-h-11 items-center justify-center gap-2 border border-frame-line/35 bg-control px-3 font-sans text-xs font-bold uppercase tracking-wide text-ink-soft opacity-75 shadow-control",
  supportLogo:
    "size-5 flex-none text-gold-bright drop-shadow-sm",
  supportLinkCopy: "flex min-w-0 flex-col items-start leading-none",
  supportLinkName: "text-gold-pale",
  supportLinkState:
    "mt-1 font-sans text-3xs font-semibold uppercase tracking-wider text-ink-faint",
} as const;
