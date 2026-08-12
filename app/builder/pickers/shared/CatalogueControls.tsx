"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowUpDown,
  ListFilter,
  Search,
  X,
} from "lucide-react";

type ExpandableSearchState = "closed" | "open";
type CatalogueContextTriggerState = "closed" | "open";
type CatalogueContextElement =
  | "root"
  | "toolbar"
  | "toolbarIcon"
  | "activeFilterCount"
  | "resultCount"
  | "filterHeading"
  | "filterHeadingContent"
  | "sortHeading"
  | "headingIcon"
  | "clearFilters";
type ExpandableSearchElement = "action" | "icon";

const CATALOGUE_CONTEXT_CLASS_NAMES = {
  root: "relative z-10 mt-1",
  toolbar:
    "relative flex min-h-9 items-center gap-1.5 max-tablet:min-h-11",
  toolbarIcon:
    "size-3.75",
  activeFilterCount:
    "-mr-0.75 inline-flex size-4.5 items-center justify-center rounded-full bg-gold text-counter tracking-normal text-night",
  resultCount:
    "relative z-10 ml-auto min-w-19.5 text-right font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft lining-nums tabular-nums",
  filterHeading:
    "mb-2 flex items-center justify-between gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-gold-bright",
  filterHeadingContent: "flex items-center gap-1.5",
  sortHeading:
    "mb-2 flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-gold-bright",
  headingIcon:
    "size-3.5",
  clearFilters:
    "min-h-8 cursor-pointer border-0 bg-transparent py-1 pr-0 pl-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-faint enabled:hover:text-gold-bright focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-default disabled:opacity-50 max-tablet:min-h-11",
} as const satisfies Record<CatalogueContextElement, string>;

const CATALOGUE_CONTEXT_TRIGGER_CLASS_NAMES = {
  closed:
    "relative inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 border border-frame-line/45 bg-control px-2.5 py-0 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft shadow-control transition-colors duration-150 hover:border-gold hover:bg-control-hover hover:text-gold-bright focus-visible:border-gold focus-visible:bg-control-hover focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none max-tablet:h-11 max-tablet:px-2",
  open:
    "relative inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 border border-gold bg-control-hover px-2.5 py-0 font-sans text-xs font-semibold uppercase tracking-wide text-gold-bright shadow-control-active transition-colors duration-150 hover:border-gold-bright hover:bg-control-hover focus-visible:border-gold-bright focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none max-tablet:h-11 max-tablet:px-2",
} as const satisfies Record<CatalogueContextTriggerState, string>;

const CATALOGUE_CONTEXT_POPOVER_CLASS_NAMES = {
  filters:
    "absolute inset-x-0 top-full z-20 mt-1 animate-popover-in border border-frame-line/55 bg-picker-popover p-3 shadow-popover backdrop-blur-xl motion-reduce:animate-none",
  sort:
    "absolute top-full right-0 z-20 mt-1 w-control animate-popover-in border border-frame-line/55 bg-picker-popover p-3 shadow-popover backdrop-blur-xl motion-reduce:animate-none max-mobile-wide:w-full",
} as const satisfies Record<"filters" | "sort", string>;

const EXPANDABLE_SEARCH_ROOT_CLASS_NAMES = {
  closed:
    "relative z-20 flex h-9 min-w-9 flex-none basis-9 overflow-hidden transition-all duration-200 ease-spring motion-reduce:transition-none max-tablet:h-11 max-tablet:min-w-11 max-tablet:basis-11",
  open:
    "absolute inset-y-0 left-0 right-21 z-20 flex h-9 min-w-9 flex-none basis-9 overflow-hidden transition-all duration-200 ease-spring motion-reduce:transition-none max-tablet:h-11 max-tablet:min-w-11 max-tablet:basis-11",
} as const satisfies Record<ExpandableSearchState, string>;

const EXPANDABLE_SEARCH_SURFACE_CLASS_NAMES = {
  closed:
    "flex h-9 w-full items-center border border-frame-line/45 bg-surface bg-control shadow-control transition-colors duration-150 ease-spring motion-reduce:transition-none max-tablet:h-11",
  open:
    "flex h-9 w-full items-center border border-gold bg-surface bg-control-hover shadow-control-active transition-colors duration-150 ease-spring motion-reduce:transition-none max-tablet:h-11",
} as const satisfies Record<ExpandableSearchState, string>;

const EXPANDABLE_SEARCH_INPUT_CLASS_NAMES = {
  closed:
    "h-8.5 w-0 min-w-0 flex-auto appearance-none rounded-none border-0 bg-transparent p-0 font-sans text-xs font-semibold text-ink opacity-0 shadow-none outline-0 transition-opacity duration-150 pointer-events-none placeholder:text-ink-faint focus:border-0 focus:bg-transparent focus:shadow-none focus:outline-0 focus-visible:border-0 focus-visible:bg-transparent focus-visible:shadow-none focus-visible:outline-0 active:border-0 active:bg-transparent active:shadow-none active:outline-0 motion-reduce:transition-none max-tablet:h-10.5 max-tablet:text-base",
  open:
    "h-8.5 w-auto min-w-0 flex-auto appearance-none rounded-none border-0 bg-transparent p-0 font-sans text-xs font-semibold text-ink opacity-100 shadow-none outline-0 transition-opacity duration-150 pointer-events-auto placeholder:text-ink-faint focus:border-0 focus:bg-transparent focus:shadow-none focus:outline-0 focus-visible:border-0 focus-visible:bg-transparent focus-visible:shadow-none focus-visible:outline-0 active:border-0 active:bg-transparent active:shadow-none active:outline-0 motion-reduce:transition-none max-tablet:h-10.5 max-tablet:text-base",
} as const satisfies Record<ExpandableSearchState, string>;

const EXPANDABLE_SEARCH_CLASS_NAMES = {
  action:
    "flex size-8.5 flex-none cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-ink-soft hover:text-gold-bright focus-visible:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus max-tablet:size-10.5",
  icon: "size-3.75",
} as const satisfies Record<ExpandableSearchElement, string>;

export function CatalogueContextMenu({
  idPrefix,
  search,
  activeFilterCount,
  filteredCount,
  totalCount,
  onClearFilters,
  filters,
  sort,
}: {
  idPrefix: string;
  search?: ReactNode;
  activeFilterCount: number;
  filteredCount: number;
  totalCount: number;
  onClearFilters?: () => void;
  filters?: ReactNode;
  sort?: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const sortTriggerRef = useRef<HTMLButtonElement>(null);
  const [openMenu, setOpenMenu] = useState<"filters" | "sort" | null>(null);

  useEffect(() => {
    if (!openMenu) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, [openMenu]);

  return (
    <div
      className={CATALOGUE_CONTEXT_CLASS_NAMES.root}
      data-menu-state={openMenu ?? "closed"}
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && openMenu) {
          const trigger =
            openMenu === "filters"
              ? filterTriggerRef.current
              : sortTriggerRef.current;
          event.preventDefault();
          event.stopPropagation();
          setOpenMenu(null);
          window.requestAnimationFrame(() => trigger?.focus());
        }
      }}
    >
      <div className={CATALOGUE_CONTEXT_CLASS_NAMES.toolbar}>
        {search}
        {filters ? (
          <button
            ref={filterTriggerRef}
            type="button"
            className={
              CATALOGUE_CONTEXT_TRIGGER_CLASS_NAMES[
                openMenu === "filters" ? "open" : "closed"
              ]
            }
            data-state={openMenu === "filters" ? "open" : "closed"}
            aria-expanded={openMenu === "filters"}
            aria-controls={`${idPrefix}-filters`}
            onClick={() =>
              setOpenMenu((current) =>
                current === "filters" ? null : "filters",
              )
            }
          >
            <ListFilter
              className={CATALOGUE_CONTEXT_CLASS_NAMES.toolbarIcon}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>Filter</span>
            {activeFilterCount ? (
              <b
                className={CATALOGUE_CONTEXT_CLASS_NAMES.activeFilterCount}
                aria-label={`${activeFilterCount} active filters`}
              >
                {activeFilterCount}
              </b>
            ) : null}
          </button>
        ) : null}
        {sort ? (
          <button
            ref={sortTriggerRef}
            type="button"
            className={
              CATALOGUE_CONTEXT_TRIGGER_CLASS_NAMES[
                openMenu === "sort" ? "open" : "closed"
              ]
            }
            data-state={openMenu === "sort" ? "open" : "closed"}
            aria-expanded={openMenu === "sort"}
            aria-controls={`${idPrefix}-sort`}
            onClick={() =>
              setOpenMenu((current) => (current === "sort" ? null : "sort"))
            }
          >
            <ArrowUpDown
              className={CATALOGUE_CONTEXT_CLASS_NAMES.toolbarIcon}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>Sort</span>
          </button>
        ) : null}
        <small className={CATALOGUE_CONTEXT_CLASS_NAMES.resultCount}>
          {filteredCount} of {totalCount}
        </small>
      </div>

      {openMenu === "filters" ? (
        <div
          className={CATALOGUE_CONTEXT_POPOVER_CLASS_NAMES.filters}
          data-menu="filters"
          id={`${idPrefix}-filters`}
          role="dialog"
          aria-label="Filter options"
        >
          <div className={CATALOGUE_CONTEXT_CLASS_NAMES.filterHeading}>
            <span
              className={CATALOGUE_CONTEXT_CLASS_NAMES.filterHeadingContent}
            >
              <ListFilter
                className={CATALOGUE_CONTEXT_CLASS_NAMES.headingIcon}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              Filters
            </span>
            <button
              type="button"
              className={CATALOGUE_CONTEXT_CLASS_NAMES.clearFilters}
              onClick={onClearFilters}
              disabled={activeFilterCount === 0}
            >
              Clear
            </button>
          </div>
          {filters}
        </div>
      ) : null}

      {openMenu === "sort" ? (
        <div
          className={CATALOGUE_CONTEXT_POPOVER_CLASS_NAMES.sort}
          data-menu="sort"
          id={`${idPrefix}-sort`}
          role="dialog"
          aria-label="Sort options"
        >
          <div className={CATALOGUE_CONTEXT_CLASS_NAMES.sortHeading}>
            <ArrowUpDown
              className={CATALOGUE_CONTEXT_CLASS_NAMES.headingIcon}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            Sort
          </div>
          {sort}
        </div>
      ) : null}
    </div>
  );
}

export function ExpandableSearch({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(Boolean(value));
  const searchState: ExpandableSearchState = isOpen ? "open" : "closed";

  const open = () => {
    setIsOpen(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div
      ref={rootRef}
      className={EXPANDABLE_SEARCH_ROOT_CLASS_NAMES[searchState]}
      data-search-state={searchState}
      onBlur={(event) => {
        if (
          !value &&
          !rootRef.current?.contains(event.relatedTarget as Node | null)
        ) {
          setIsOpen(false);
        }
      }}
    >
      <div className={EXPANDABLE_SEARCH_SURFACE_CLASS_NAMES[searchState]}>
        <button
          type="button"
          className={EXPANDABLE_SEARCH_CLASS_NAMES.action}
          data-picker-initial-focus
          onClick={() => {
            if (isOpen) {
              inputRef.current?.focus();
            } else {
              open();
            }
          }}
          aria-label={isOpen ? `${label} field` : label}
          aria-expanded={isOpen}
        >
          <Search
            className={EXPANDABLE_SEARCH_CLASS_NAMES.icon}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          className={EXPANDABLE_SEARCH_INPUT_CLASS_NAMES[searchState]}
          value={value}
          tabIndex={isOpen ? 0 : -1}
          aria-label={label}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => onChange(event.target.value)}
        />
        {isOpen && value ? (
          <button
            type="button"
            className={EXPANDABLE_SEARCH_CLASS_NAMES.action}
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label={`Clear ${label.toLowerCase()}`}
          >
            <X
              className={EXPANDABLE_SEARCH_CLASS_NAMES.icon}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}
