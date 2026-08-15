"use client";

export type PickerTab =
  | "weapon"
  | "arts"
  | "rune"
  | "totems"
  | "tempers"
  | "joinery";
type PickerTabState = "active" | "inactive";

const PICKER_TABS = [
  { id: "weapon", label: "Weapon" },
  { id: "arts", label: "Arts" },
  { id: "rune", label: "Rune" },
  { id: "totems", label: "Totems" },
  { id: "tempers", label: "Tempers" },
  { id: "joinery", label: "Joinery" },
] as const satisfies ReadonlyArray<{ id: PickerTab; label: string }>;

const PICKER_TAB_CLASS_NAMES = {
  active:
    "cursor-pointer border-0 border-b-2 border-gold-bright bg-aura-gold px-4.5 font-sans text-label font-bold uppercase tracking-wider text-gold-bright shadow-control-active transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none max-tablet:min-h-12 max-tablet:px-1 max-mobile-wide:px-0.5 max-mobile-wide:text-2xs max-mobile-wide:tracking-normal",
  inactive:
    "cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-4.5 font-sans text-label font-bold uppercase tracking-wider text-ink-faint transition-colors duration-150 hover:bg-surface-overlay hover:text-ink focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none max-tablet:min-h-12 max-tablet:px-1 max-mobile-wide:px-0.5 max-mobile-wide:text-2xs max-mobile-wide:tracking-normal",
} as const satisfies Record<PickerTabState, string>;

export function PickerTabs({
  active,
  onChange,
}: {
  active: PickerTab;
  onChange: (tab: PickerTab) => void;
}) {
  return (
    <nav
      className="grid min-h-12 grid-cols-6 border-b border-frame-line/35 bg-picker-header px-6.5 shadow-control max-tablet:sticky max-tablet:top-0 max-tablet:z-10 max-tablet:flex-none max-tablet:px-0"
      data-weapon-config-tabs
      aria-label="Weapon configuration"
    >
      {PICKER_TABS.map((tab) => (
        <button
          type="button"
          className={
            PICKER_TAB_CLASS_NAMES[active === tab.id ? "active" : "inactive"]
          }
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
          key={tab.id}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
