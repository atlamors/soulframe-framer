export const MOBILE_SUPPORT_ZONE_CLASS_NAMES = {
  root:
    "relative z-10 col-span-9 col-start-1 row-start-2 mt-4 flex min-w-0 items-center justify-center pb-2 tablet:max-compact-desktop:col-span-full tablet:max-compact-desktop:col-start-1 tablet:max-compact-desktop:row-start-6 compact-desktop:col-span-2 compact-desktop:col-start-1 compact-desktop:row-start-3 compact-desktop:justify-end compact-desktop:px-3.25 max-tablet:order-8 max-tablet:col-span-full max-tablet:row-start-6 max-tablet:-mx-4 max-tablet:mt-2 max-tablet:flex-col max-tablet:gap-4 max-tablet:pb-30",
  adPlaceholder:
    "relative isolate flex h-22.5 w-full max-w-182 min-w-0 flex-col items-center justify-center overflow-visible border-0 bg-control/45 px-5 text-center shadow-control wide-desktop:max-w-242.5 max-tablet:h-62.5 max-tablet:w-75 max-tablet:max-w-full max-tablet:overflow-hidden max-tablet:bg-transparent max-tablet:shadow-none",
  adFrame:
    "pointer-events-none absolute inset-0 z-0 hidden size-full object-fill max-tablet:block",
  adDesktopFrame: "max-tablet:hidden",
  adEyebrow:
    "relative z-10 font-sans text-2xs font-bold uppercase tracking-widest text-ink-faint",
  adSize:
    "relative z-10 mt-1.5 font-display text-xl font-normal lining-nums tabular-nums text-gold-pale text-shadow-value",
  adSizeMobile: "hidden max-tablet:inline",
  adSizeDesktop: "hidden tablet:inline wide-desktop:hidden",
  adSizeWide: "hidden wide-desktop:inline",
  adNote:
    "relative z-10 mt-1 max-w-48 font-sans text-2xs font-semibold leading-snug text-ink-faint",
  support:
    "hidden w-75 max-w-full border-t border-frame-line/32 px-2 pt-3 text-center max-tablet:block",
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
