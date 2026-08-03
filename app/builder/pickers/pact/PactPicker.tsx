"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import {
  pactAbilityById,
  pactById,
  pactCatalogue,
} from "@/src/data/pacts";
import { pactArtTreeByPactId } from "@/src/data/arts";
import {
  createDefaultPactArtAllocation,
  getPactArtPointCap,
} from "@/src/domain/arts";
import type { ArtAllocation } from "@/src/domain/types";
import { ArtAllocationList } from "../../arts/ArtAllocationList";
import { ACTION_BUTTON_CLASS_NAMES } from "../../components/actionClassNames";
import { IllustratedCloseButton } from "../../components/IllustratedCloseButton";
import { virtueMeta } from "../../constants";
import { usePickerDialog } from "../../hooks/usePickerDialog";
import {
  CatalogueContextMenu,
  ExpandableSearch,
} from "../shared/CatalogueControls";
import { PICKER_LAYOUT_CLASS_NAMES } from "../shared/PickerLayout";
import {
  PACT_PICKER_ABILITY_CLASS_NAMES,
  PACT_PICKER_CLASS_NAMES,
} from "./pactPickerClassNames";

export function PactPicker({
  currentId,
  allocations,
  onClose,
  onEquip,
  onAllocationChange,
  onResetAllocation,
}: {
  currentId: string | null;
  allocations: Record<string, ArtAllocation>;
  onClose: () => void;
  onEquip: (itemId: string) => void;
  onAllocationChange: (pactId: string, allocation: ArtAllocation) => void;
  onResetAllocation: (pactId: string) => void;
}) {
  const panelRef = usePickerDialog(onClose);
  const [candidateId, setCandidateId] = useState(
    currentId ?? pactCatalogue[0]?.id,
  );
  const [query, setQuery] = useState("");
  const candidate =
    pactById.get(candidateId) ??
    pactCatalogue.find((pact) =>
      pact.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  const filtered = pactCatalogue.filter((pact) =>
    [pact.name, pact.basePact, pact.variant]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const candidateTree = candidate
    ? pactArtTreeByPactId.get(candidate.id)
    : undefined;
  const candidateAllocation = candidate
    ? allocations[candidate.id] ?? createDefaultPactArtAllocation(candidate)
    : {};

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
        aria-labelledby="pact-picker-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className={PICKER_LAYOUT_CLASS_NAMES.panelContent}>
          <header className={PICKER_LAYOUT_CLASS_NAMES.headerDefault}>
          <div className={PICKER_LAYOUT_CLASS_NAMES.headerCopy}>
            <small className={PACT_PICKER_CLASS_NAMES.kicker}>
              Envoy identity
            </small>
            <h2
              className={PICKER_LAYOUT_CLASS_NAMES.headerTitleDefault}
              id="pact-picker-title"
            >
              Choose Pact
            </h2>
          </div>
          <IllustratedCloseButton
            onClick={onClose}
            aria-label="Close Pact picker"
          />
        </header>
          <div className={PICKER_LAYOUT_CLASS_NAMES.bodyDetail}>
          <aside className={PICKER_LAYOUT_CLASS_NAMES.catalogueColumn}>
            <CatalogueContextMenu
              idPrefix="pact-catalogue"
              search={
                <ExpandableSearch
                  value={query}
                  onChange={setQuery}
                  label="Search Pacts"
                  placeholder={`Search ${pactCatalogue.length} Pacts`}
                />
              }
              activeFilterCount={0}
              filteredCount={filtered.length}
              totalCount={pactCatalogue.length}
            />
            <div
              className={PICKER_LAYOUT_CLASS_NAMES.itemList}
              role="listbox"
              aria-label="Pacts"
            >
              {filtered.map((pact) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={candidate?.id === pact.id}
                  className={
                    PICKER_LAYOUT_CLASS_NAMES[
                      candidate?.id === pact.id
                        ? "itemRowCandidate"
                        : "itemRowDefault"
                    ]
                  }
                  onClick={() => setCandidateId(pact.id)}
                  key={pact.id}
                >
                  <span
                    className={PICKER_LAYOUT_CLASS_NAMES.itemMark}
                    aria-hidden="true"
                  >
                    {pact.image ? (
                      <Image
                        src={pact.image.thumbnailUrl}
                        alt=""
                        width={48}
                        height={48}
                        unoptimized
                      />
                    ) : (
                      "✦"
                    )}
                  </span>
                  <span className={PICKER_LAYOUT_CLASS_NAMES.itemCopy}>
                    <strong className={PICKER_LAYOUT_CLASS_NAMES.itemName}>
                      {pact.name}
                    </strong>
                    <small className={PICKER_LAYOUT_CLASS_NAMES.itemMeta}>
                      {pact.variant === "wyld" ? "Wyld Pact" : "Pact"}
                    </small>
                  </span>
                  {pact.id === currentId ? (
                    <span className={PICKER_LAYOUT_CLASS_NAMES.equippedChip}>
                      Equipped
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </aside>
          <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonColumn}>
            {candidate ? (
              <>
                <div
                  className={PICKER_LAYOUT_CLASS_NAMES.comparisonHeading}
                >
                  <span
                    className={PICKER_LAYOUT_CLASS_NAMES.candidateArt}
                    aria-hidden="true"
                  >
                    {candidate.image ? (
                      <Image
                        src={candidate.image.thumbnailUrl}
                        alt=""
                        className="size-28 object-contain drop-shadow-art-strong"
                        width={112}
                        height={112}
                        unoptimized
                      />
                    ) : (
                      "✦"
                    )}
                  </span>
                  <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonCopy}>
                    <small>
                      {candidate.variant === "wyld" ? "Wyld Pact" : "Pact"}
                    </small>
                    <h3
                      className={PICKER_LAYOUT_CLASS_NAMES.comparisonTitle}
                    >
                      {candidate.name}
                    </h3>
                    <a
                      className={PICKER_LAYOUT_CLASS_NAMES.externalLink}
                      href={candidate.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Avakot
                      <ExternalLink
                        className={PICKER_LAYOUT_CLASS_NAMES.externalLinkIcon}
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </div>
                <p className={PACT_PICKER_CLASS_NAMES.description}>
                  {candidate.description}
                </p>
                {candidateTree ? (
                  <ArtAllocationList
                    label={`${candidate.name} Pact Arts`}
                    nodes={candidateTree.nodes}
                    allocation={candidateAllocation}
                    pointCap={getPactArtPointCap(candidate)}
                    onChange={(allocation) =>
                      onAllocationChange(candidate.id, allocation)
                    }
                    onReset={() => onResetAllocation(candidate.id)}
                    getIcon={(node) => {
                      const ability = node.abilityId
                        ? pactAbilityById.get(node.abilityId)
                        : undefined;
                      return (
                        ability?.artImage?.thumbnailUrl ??
                        ability?.image?.thumbnailUrl ??
                        undefined
                      );
                    }}
                  />
                ) : null}
                <section className={PACT_PICKER_CLASS_NAMES.abilitySection}>
                  <header className={PACT_PICKER_CLASS_NAMES.abilityHeader}>
                    <span className={PACT_PICKER_CLASS_NAMES.abilityHeading}>
                      Arcanics & Passives
                    </span>
                  </header>
                  <div className={PACT_PICKER_CLASS_NAMES.abilityGrid}>
                    {candidate.abilityIds.map((abilityId) => {
                      const ability = pactAbilityById.get(abilityId);
                      if (!ability) return null;
                      return (
                        <article
                          className={
                            PACT_PICKER_ABILITY_CLASS_NAMES[
                              ability.assignedVirtue ?? "passive"
                            ].unlocked
                          }
                          key={ability.id}
                        >
                          <span
                            className={PACT_PICKER_CLASS_NAMES.abilityArt}
                            aria-hidden="true"
                          >
                            {ability.image ? (
                              <Image
                                src={ability.image.thumbnailUrl}
                                alt=""
                                width={46}
                                height={46}
                                className={PACT_PICKER_CLASS_NAMES.abilityImage}
                                unoptimized
                              />
                            ) : (
                              "✦"
                            )}
                          </span>
                          <div className={PACT_PICKER_CLASS_NAMES.abilityCopy}>
                            <small className={PACT_PICKER_CLASS_NAMES.abilityMeta}>
                              {ability.assignedVirtue
                                ? virtueMeta[ability.assignedVirtue].label
                                : "Passive"}
                            </small>
                            <strong className={PACT_PICKER_CLASS_NAMES.abilityName}>
                              {ability.name}
                            </strong>
                            <p
                              className={
                                PACT_PICKER_CLASS_NAMES.abilityDescription
                              }
                            >
                              {ability.effect || ability.description}
                            </p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
                <div className={PICKER_LAYOUT_CLASS_NAMES.actions}>
                  <span />
                  <button
                    type="button"
                    className={ACTION_BUTTON_CLASS_NAMES.pickerPrimary}
                    onClick={() => {
                      onEquip(candidate.id);
                      onClose();
                    }}
                    disabled={candidate.id === currentId}
                  >
                    {candidate.id === currentId
                      ? "Currently equipped"
                      : "Bind Pact"}
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
