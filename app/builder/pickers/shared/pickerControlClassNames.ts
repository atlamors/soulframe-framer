type PickerControlClassName =
  | "filters"
  | "filterSelectWrap"
  | "filterSelect"
  | "filterSelectArrow"
  | "filterOption"
  | "sort"
  | "sortButton"
  | "sortIcon"
  | "breakdown"
  | "breakdownSummary"
  | "breakdownCopy"
  | "breakdownTitle"
  | "breakdownSubtitle"
  | "breakdownContent";

type PickerControlChevronState = "closed" | "open";

export const PICKER_CONTROL_CLASS_NAMES = {
  filters: "grid grid-cols-2 gap-1.5",
  filterSelectWrap: "relative",
  filterSelect:
    "h-9 w-full min-w-0 cursor-pointer appearance-none overflow-hidden text-ellipsis border border-frame-line/45 bg-control py-0 pr-6 pl-2 font-sans text-xs font-semibold text-ink-soft shadow-control transition-colors duration-150 hover:border-gold hover:text-ink focus-visible:border-gold focus-visible:text-ink focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none max-tablet:h-11 max-tablet:text-base",
  filterSelectArrow:
    "pointer-events-none absolute top-1/2 right-1.5 size-3 -translate-y-1/2",
  filterOption: "bg-surface-raised text-ink normal-case",
  sort: "mt-1.5 flex gap-1.5",
  sortButton:
    "flex min-h-9 items-center justify-center border border-frame-line/45 bg-control p-0 font-sans text-xs text-ink-soft shadow-control transition-colors duration-150 enabled:hover:border-gold enabled:hover:bg-control-hover enabled:hover:text-gold-bright focus-visible:border-gold focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none max-tablet:min-h-11",
  sortIcon: "size-4 stroke-2",
  breakdown: "mt-4.5 border-y border-frame-line/30 bg-surface-overlay",
  breakdownSummary:
    "flex min-h-13 cursor-pointer list-none items-center justify-between px-3 py-2 text-ink-soft transition-colors duration-150 hover:bg-picker-row-hover hover:text-gold-bright focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none",
  breakdownCopy: "flex flex-col gap-0.75",
  breakdownTitle:
    "font-display text-base font-normal tracking-tight",
  breakdownSubtitle:
    "font-sans text-xs font-medium uppercase tracking-wide text-ink-soft",
  breakdownContent: "px-3 pb-3",
  breakdownChevron: {
    closed:
      "size-4 stroke-2 transition-transform duration-150 motion-reduce:transition-none",
    open:
      "size-4 rotate-180 stroke-2 transition-transform duration-150 motion-reduce:transition-none",
  },
} as const satisfies Record<PickerControlClassName, string> & {
  breakdownChevron: Record<PickerControlChevronState, string>;
};
