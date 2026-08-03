"use client";

import { useState } from "react";
import { armorCatalogue } from "@/src/data/catalogue";
import { talismanById, talismanCatalogue } from "@/src/data/talismans";
import { calculateBuild } from "@/src/domain/calculation";
import {
  VIRTUE_IDS,
  type SoulframeBuild,
} from "@/src/domain/types";
import { ACTION_BUTTON_CLASS_NAMES } from "../../components/actionClassNames";
import { IllustratedCloseButton } from "../../components/IllustratedCloseButton";
import {
  StatIcon,
  TalismanArtwork,
} from "../../components/primitives";
import { virtueMeta } from "../../constants";
import { usePickerDialog as useBuilderPickerDialog } from "../../hooks/usePickerDialog";
import { formatDelta } from "../../lib/formatters";
import {
  formatTalismanSummary,
  talismanModifiers,
} from "../../lib/talisman";
import {
  CatalogueContextMenu as BuilderCatalogueContextMenu,
  ExpandableSearch as BuilderExpandableSearch,
} from "../shared/CatalogueControls";
import { PICKER_LAYOUT_CLASS_NAMES } from "../shared/PickerLayout";

const TALISMAN_PICKER_CLASS_NAMES = {
  modifierGrid: "mt-7 grid grid-cols-2 gap-2",
  modifierChip:
    "flex min-h-14.5 items-center gap-2 border border-frame-line/25 bg-picker-detail px-2.5 py-2 shadow-picker-row",
  modifierCopy: "flex flex-col",
  modifierLabel:
    "font-sans text-xs uppercase tracking-widest text-ink-faint",
  modifierValue:
    "font-display text-xl font-normal text-gold-pale lining-nums tabular-nums text-shadow-value",
  effectiveVirtues:
    "mt-6 grid grid-cols-3 border border-frame-line/35 bg-picker-header py-4 shadow-picker-row",
  effectiveVirtue: "flex flex-col items-center",
  effectiveVirtueLabel:
    "font-sans text-xs uppercase tracking-widest text-ink-faint",
  effectiveVirtueValue:
    "font-display text-xl font-normal text-gold-pale lining-nums tabular-nums text-shadow-value",
  defenseImpact:
    "mt-5.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-frame-line/30 bg-surface-overlay px-3 pt-3.5 pb-3 text-ink-faint",
  defenseImpactLabel:
    "font-sans text-xs uppercase tracking-wider",
  defenseImpactValue:
    "font-display text-base font-normal text-ink-soft",
  defenseImpactNote: "w-full font-sans text-xs",
  conditionalNote: "mt-3 font-sans text-xs text-danger",
} as const satisfies Record<string, string>;

export function TalismanPicker({
  build,
  onClose,
  onEquip,
  onUnequip,
}: {
  build: SoulframeBuild;
  onClose: () => void;
  onEquip: (itemId: string) => void;
  onUnequip: () => void;
}) {
  const panelRef = useBuilderPickerDialog(onClose);
  const [query, setQuery] = useState("");
  const currentItem = build.equipment.talisman
    ? talismanById.get(build.equipment.talisman)
    : undefined;
  const [candidateId, setCandidateId] = useState(
    currentItem?.id ?? talismanCatalogue[0]?.id,
  );
  const filteredItems = talismanCatalogue.filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const candidate =
    talismanById.get(candidateId) ?? filteredItems[0] ?? talismanCatalogue[0];
  const currentCalculation = calculateBuild(
    build,
    armorCatalogue,
    talismanCatalogue,
  );
  const candidateCalculation = candidate
    ? calculateBuild(
        {
          ...build,
          equipment: { ...build.equipment, talisman: candidate.id },
        },
        armorCatalogue,
        talismanCatalogue,
      )
    : undefined;

  return (
    <div
      className={PICKER_LAYOUT_CLASS_NAMES.backdrop}
      role="presentation"
      onPointerDown={onClose}
    >
      <section
        ref={panelRef}
        className={PICKER_LAYOUT_CLASS_NAMES.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="talisman-picker-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className={PICKER_LAYOUT_CLASS_NAMES.panelContent}>
          <header className={PICKER_LAYOUT_CLASS_NAMES.headerDefault}>
          <h2
            className={PICKER_LAYOUT_CLASS_NAMES.headerTitleDefault}
            id="talisman-picker-title"
          >
            Choose Talisman
          </h2>
          <IllustratedCloseButton
            onClick={onClose}
            aria-label="Close Talisman picker"
          />
        </header>

        <div className={PICKER_LAYOUT_CLASS_NAMES.body}>
          <aside className={PICKER_LAYOUT_CLASS_NAMES.catalogueColumn}>
            <BuilderCatalogueContextMenu
              idPrefix="talisman-catalogue"
              search={
                <BuilderExpandableSearch
                  value={query}
                  onChange={setQuery}
                  label="Search Talismans"
                  placeholder={`Search ${talismanCatalogue.length} Talismans`}
                />
              }
              activeFilterCount={0}
              filteredCount={filteredItems.length}
              totalCount={talismanCatalogue.length}
            />
            <div
              className={PICKER_LAYOUT_CLASS_NAMES.itemList}
              role="listbox"
              aria-label="Talismans"
            >
              {filteredItems.map((item) => {
                const isCandidate = item.id === candidate?.id;

                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={isCandidate}
                    className={
                      PICKER_LAYOUT_CLASS_NAMES[
                        isCandidate ? "itemRowCandidate" : "itemRowDefault"
                      ]
                    }
                    key={item.id}
                    onClick={() => setCandidateId(item.id)}
                    onFocus={() => setCandidateId(item.id)}
                  >
                    <span
                      className={PICKER_LAYOUT_CLASS_NAMES.itemMark}
                      aria-hidden="true"
                    >
                      <TalismanArtwork
                        item={item}
                        appearance="default"
                        sizes="44px"
                      />
                    </span>
                    <span className={PICKER_LAYOUT_CLASS_NAMES.itemCopy}>
                      <strong className={PICKER_LAYOUT_CLASS_NAMES.itemName}>
                        {item.name}
                      </strong>
                      <small
                        className={PICKER_LAYOUT_CLASS_NAMES.talismanModifiers}
                      >
                        {formatTalismanSummary(item)}
                      </small>
                    </span>
                    <span className={PICKER_LAYOUT_CLASS_NAMES.itemSide}>
                      {item.id === currentItem?.id ? (
                        <span className={PICKER_LAYOUT_CLASS_NAMES.equippedChip}>
                          Equipped
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
              {filteredItems.length === 0 ? (
                <div className={PICKER_LAYOUT_CLASS_NAMES.empty}>
                  <strong className={PICKER_LAYOUT_CLASS_NAMES.emptyTitle}>
                    No Talismans found
                  </strong>
                </div>
              ) : null}
            </div>
          </aside>

          <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonColumn}>
            {candidate && candidateCalculation ? (
              <>
                <div
                  className={PICKER_LAYOUT_CLASS_NAMES.comparisonHeading}
                >
                  <span
                    className={PICKER_LAYOUT_CLASS_NAMES.candidateArt}
                    aria-hidden="true"
                  >
                    <TalismanArtwork
                      item={candidate}
                      appearance="default"
                      preview
                      sizes="112px"
                    />
                  </span>
                  <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonCopy}>
                    <h3
                      className={PICKER_LAYOUT_CLASS_NAMES.comparisonTitle}
                    >
                      {candidate.name}
                    </h3>
                    <p className={PICKER_LAYOUT_CLASS_NAMES.comparisonMeta}>
                      {candidate.rarity} · {candidate.accessorySet}
                    </p>
                  </div>
                </div>

                <div
                  className={TALISMAN_PICKER_CLASS_NAMES.modifierGrid}
                  aria-label="Talisman modifiers"
                >
                  {talismanModifiers(candidate).map((modifier) => (
                    <span
                      className={TALISMAN_PICKER_CLASS_NAMES.modifierChip}
                      key={modifier.id}
                    >
                      {modifier.icon ? (
                        <StatIcon
                          src={modifier.icon}
                          label={modifier.label}
                          size="small"
                        />
                      ) : null}
                      <span className={TALISMAN_PICKER_CLASS_NAMES.modifierCopy}>
                        <small
                          className={TALISMAN_PICKER_CLASS_NAMES.modifierLabel}
                        >
                          {modifier.label}
                        </small>
                        <strong
                          className={TALISMAN_PICKER_CLASS_NAMES.modifierValue}
                        >
                          +{modifier.value}
                        </strong>
                      </span>
                    </span>
                  ))}
                </div>

                <div className={TALISMAN_PICKER_CLASS_NAMES.effectiveVirtues}>
                  {VIRTUE_IDS.map((virtue) => (
                    <span
                      className={TALISMAN_PICKER_CLASS_NAMES.effectiveVirtue}
                      key={virtue}
                    >
                      <small
                        className={
                          TALISMAN_PICKER_CLASS_NAMES.effectiveVirtueLabel
                        }
                      >
                        {virtueMeta[virtue].label}
                      </small>
                      <strong
                        className={
                          TALISMAN_PICKER_CLASS_NAMES.effectiveVirtueValue
                        }
                      >
                        {candidateCalculation.effectiveVirtues[virtue]}
                      </strong>
                    </span>
                  ))}
                </div>

                <div className={TALISMAN_PICKER_CLASS_NAMES.defenseImpact}>
                  <span className={TALISMAN_PICKER_CLASS_NAMES.defenseImpactLabel}>
                    Secondary defense impact
                  </span>
                  <strong
                    className={TALISMAN_PICKER_CLASS_NAMES.defenseImpactValue}
                  >
                    {formatDelta(
                      candidateCalculation.total - currentCalculation.total,
                    )}
                  </strong>
                  <small
                    className={TALISMAN_PICKER_CLASS_NAMES.defenseImpactNote}
                  >
                    Includes defense gained through virtue scaling
                  </small>
                </div>

                {candidate.hasUnmodeledConditionalEffect ? (
                  <p className={TALISMAN_PICKER_CLASS_NAMES.conditionalNote}>
                    Encounter-dependent Cogah effect is not included.
                  </p>
                ) : null}

                <div className={PICKER_LAYOUT_CLASS_NAMES.actions}>
                  {currentItem ? (
                    <button
                      type="button"
                      className={ACTION_BUTTON_CLASS_NAMES.pickerQuiet}
                      onClick={onUnequip}
                    >
                      Clear
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className={ACTION_BUTTON_CLASS_NAMES.pickerPrimary}
                    onClick={() => onEquip(candidate.id)}
                    disabled={candidate.id === currentItem?.id}
                  >
                    {candidate.id === currentItem?.id ? "Equipped" : "Equip"}
                  </button>
                </div>
              </>
            ) : null}
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
