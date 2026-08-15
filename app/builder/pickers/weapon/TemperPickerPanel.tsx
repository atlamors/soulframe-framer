"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { temperById, temperCatalogue } from "@/src/data/tempers";
import {
  CRAFTWORK_TIERS,
  getCraftworkTemperRange,
  getCraftworkTemperStatus,
  getPromotedCraftworkTier,
  getTemperCompatibilityReasons,
  isTemperCompatible,
  type TemperCompatibilityReason,
} from "@/src/domain/weapon-configuration";
import type {
  CraftworkTier,
  Temper,
  Weapon,
  WeaponEnhancements,
} from "@/src/domain/types";
import { ACTION_BUTTON_CLASS_NAMES } from "../../components/actionClassNames";
import {
  CatalogueContextMenu,
  ExpandableSearch,
} from "../shared/CatalogueControls";
import { NightfoldSelect } from "../shared/NightfoldSelect";
import { PICKER_LAYOUT_CLASS_NAMES } from "../shared/PickerLayout";
import { TEMPER_PICKER_PANEL_CLASS_NAMES } from "./temperPickerPanelClassNames";

function matchesTemperQuery(temper: Temper, query: string) {
  if (!query) return true;
  return [
    temper.name,
    temper.description,
    temper.origin,
    temper.compatibility,
    ...temper.stats.flatMap((stat) => [
      stat.effect,
      stat.notes,
      stat.stacks.single,
      stat.stacks.double,
    ]),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function formatTemperEffect(effect: string, value: string) {
  return effect.includes("$1")
    ? effect.replace("$1", value)
    : `${value} ${effect}`;
}

function hiddenMatchMessage(reasons: ReadonlySet<TemperCompatibilityReason>) {
  const hiddenByOrigin = reasons.has("origin");
  const hiddenByWeaponType = reasons.has("weapon-type");
  if (hiddenByOrigin && hiddenByWeaponType) {
    return "Matching Tempers were hidden by Origin and weapon type compatibility.";
  }
  if (hiddenByOrigin) {
    return "Matching Tempers were hidden by Origin compatibility.";
  }
  if (hiddenByWeaponType) {
    return "Matching Tempers were hidden by weapon type compatibility.";
  }
  return "No compatible Tempers match this search.";
}

export function TemperPickerPanel({
  weapon,
  enhancements,
  onChange,
}: {
  weapon?: Weapon;
  enhancements: WeaponEnhancements;
  onChange: (enhancements: WeaponEnhancements) => void;
}) {
  const [query, setQuery] = useState("");
  const compatibleTempers = useMemo(
    () => temperCatalogue.filter((temper) => isTemperCompatible(temper, weapon)),
    [weapon],
  );
  const [candidateId, setCandidateId] = useState<string | undefined>(() => {
    const equippedCandidate = enhancements.tempers.find((temperId) => {
      const temper = temperById.get(temperId);
      return temper ? isTemperCompatible(temper, weapon) : false;
    });
    return equippedCandidate ?? compatibleTempers[0]?.id;
  });
  const normalizedQuery = query.trim().toLowerCase();
  const selectableMatches = useMemo(
    () =>
      temperCatalogue.filter(
        (temper) =>
          !temper.isPlaceholder && matchesTemperQuery(temper, normalizedQuery),
      ),
    [normalizedQuery],
  );
  const filteredTempers = useMemo(
    () =>
      selectableMatches.filter((temper) => isTemperCompatible(temper, weapon)),
    [selectableMatches, weapon],
  );
  const hiddenReasons = useMemo(() => {
    const reasons = new Set<TemperCompatibilityReason>();
    for (const temper of selectableMatches) {
      for (const reason of getTemperCompatibilityReasons(temper, weapon)) {
        reasons.add(reason);
      }
    }
    return reasons;
  }, [selectableMatches, weapon]);
  const candidateFromState = candidateId ? temperById.get(candidateId) : undefined;
  const candidate =
    candidateFromState && isTemperCompatible(candidateFromState, weapon)
      ? candidateFromState
      : compatibleTempers[0];
  const occurrenceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const temperId of enhancements.tempers) {
      counts.set(temperId, (counts.get(temperId) ?? 0) + 1);
    }
    return counts;
  }, [enhancements.tempers]);
  const status = getCraftworkTemperStatus(
    enhancements.craftwork,
    enhancements.tempers.length,
  );
  const candidateOccurrences = candidate
    ? occurrenceCounts.get(candidate.id) ?? 0
    : 0;
  const promotedTier = getPromotedCraftworkTier(
    enhancements.craftwork,
    enhancements.tempers.length + 1,
  );
  const canAddCandidate =
    Boolean(candidate) && candidateOccurrences < 2 && promotedTier !== null;
  const craftworkOptions = CRAFTWORK_TIERS.map((tier) => ({
    value: tier,
    label: `${tier} · ${getCraftworkTemperRange(tier).minimum}–${getCraftworkTemperRange(tier).maximum}`,
    disabled:
      getCraftworkTemperRange(tier).maximum < enhancements.tempers.length,
  }));

  const setCraftwork = (tier: CraftworkTier) => {
    if (getCraftworkTemperRange(tier).maximum < enhancements.tempers.length) {
      return;
    }
    onChange({ ...enhancements, craftwork: tier });
  };

  const addCandidate = () => {
    if (!candidate || !canAddCandidate || !promotedTier) return;
    onChange({
      ...enhancements,
      craftwork: promotedTier,
      tempers: [...enhancements.tempers, candidate.id],
    });
  };

  const removeSlot = (slotIndex: number) => {
    onChange({
      ...enhancements,
      tempers: enhancements.tempers.filter((_, index) => index !== slotIndex),
    });
  };

  return (
    <>
      <section
        className={TEMPER_PICKER_PANEL_CLASS_NAMES.capacityBand}
        aria-labelledby="temper-capacity-title"
      >
        <div className={TEMPER_PICKER_PANEL_CLASS_NAMES.capacityHeading}>
          <div className={TEMPER_PICKER_PANEL_CLASS_NAMES.capacityCopy}>
            <small
              className={TEMPER_PICKER_PANEL_CLASS_NAMES.capacityLabel}
              id="temper-capacity-title"
            >
              Craftwork &amp; Temper capacity
            </small>
            <strong className={TEMPER_PICKER_PANEL_CLASS_NAMES.capacityValue}>
              {enhancements.craftwork}
            </strong>
            <span
              className={TEMPER_PICKER_PANEL_CLASS_NAMES.capacityStatus}
              aria-live="polite"
            >
              {status.used} of {status.maximum} slots occupied
              {status.missing
                ? ` · ${status.missing} below this tier’s minimum`
                : " · Tier requirement met"}
            </span>
          </div>
          <div className={TEMPER_PICKER_PANEL_CLASS_NAMES.craftworkControl}>
            <span className={TEMPER_PICKER_PANEL_CLASS_NAMES.craftworkLabel}>
              Craftwork tier
            </span>
            <NightfoldSelect
              value={enhancements.craftwork}
              options={craftworkOptions}
              ariaLabel="Craftwork tier"
              className={TEMPER_PICKER_PANEL_CLASS_NAMES.craftworkSelect}
              onChange={(value) => setCraftwork(value as CraftworkTier)}
            />
          </div>
        </div>
        <div
          className={TEMPER_PICKER_PANEL_CLASS_NAMES.slotList}
          role="list"
          aria-label={`${status.maximum} Temper slots`}
        >
          {Array.from({ length: status.maximum }, (_, index) => {
            const temperId = enhancements.tempers[index];
            const temper = temperId ? temperById.get(temperId) : undefined;
            return (
              <span
                className={TEMPER_PICKER_PANEL_CLASS_NAMES.slotItem}
                role="listitem"
                key={index}
              >
                {temper ? (
                  <button
                    type="button"
                    className={TEMPER_PICKER_PANEL_CLASS_NAMES.occupiedSlot}
                    onClick={() => removeSlot(index)}
                    aria-label={`Remove ${temper.name} from Temper slot ${index + 1}`}
                    title={`Remove ${temper.name}`}
                  >
                    <Image
                      className={TEMPER_PICKER_PANEL_CLASS_NAMES.occupiedImage}
                      src={temper.icon.thumbnailUrl}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                    />
                    <span
                      className={TEMPER_PICKER_PANEL_CLASS_NAMES.slotNumber}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                  </button>
                ) : (
                  <span
                    className={TEMPER_PICKER_PANEL_CLASS_NAMES.emptySlot}
                    aria-label={`Temper slot ${index + 1}, empty`}
                  >
                    <span
                      className={TEMPER_PICKER_PANEL_CLASS_NAMES.emptySlotMark}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </section>

      <div className={PICKER_LAYOUT_CLASS_NAMES.bodyDetail}>
        <aside className={PICKER_LAYOUT_CLASS_NAMES.catalogueColumn}>
          <div className={TEMPER_PICKER_PANEL_CLASS_NAMES.weaponContext}>
            <small className={TEMPER_PICKER_PANEL_CLASS_NAMES.weaponContextLabel}>
              Active weapon
            </small>
            <strong className={TEMPER_PICKER_PANEL_CLASS_NAMES.weaponContextValue}>
              {weapon?.name ?? "Select a weapon"}
            </strong>
            <span className={TEMPER_PICKER_PANEL_CLASS_NAMES.weaponContextMeta}>
              {weapon ? `${weapon.origin} Origin · ${weapon.combatArt}` : "Origin · weapon type"}
            </span>
          </div>
          <CatalogueContextMenu
            idPrefix="temper-catalogue"
            search={
              <ExpandableSearch
                value={query}
                onChange={setQuery}
                label="Search Tempers"
                placeholder={`Search ${temperCatalogue.filter((temper) => !temper.isPlaceholder).length} Tempers`}
              />
            }
            activeFilterCount={0}
            filteredCount={filteredTempers.length}
            totalCount={compatibleTempers.length}
          />
          <div
            className={PICKER_LAYOUT_CLASS_NAMES.itemList}
            role="listbox"
            aria-label="Compatible Tempers"
          >
            {filteredTempers.map((temper) => {
              const occurrences = occurrenceCounts.get(temper.id) ?? 0;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={candidate?.id === temper.id}
                  className={
                    PICKER_LAYOUT_CLASS_NAMES[
                      candidate?.id === temper.id
                        ? "itemRowCandidate"
                        : "itemRowDefault"
                    ]
                  }
                  onClick={() => setCandidateId(temper.id)}
                  key={temper.id}
                >
                  <span className={PICKER_LAYOUT_CLASS_NAMES.itemMark}>
                    <Image
                      src={temper.icon.thumbnailUrl}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                    />
                  </span>
                  <span className={PICKER_LAYOUT_CLASS_NAMES.itemCopy}>
                    <strong className={PICKER_LAYOUT_CLASS_NAMES.itemName}>
                      {temper.name}
                    </strong>
                    <small className={PICKER_LAYOUT_CLASS_NAMES.itemMeta}>
                      {temper.origin} · {temper.compatibility}
                    </small>
                  </span>
                  {occurrences ? (
                    <span className={TEMPER_PICKER_PANEL_CLASS_NAMES.occurrenceChip}>
                      {occurrences} / 2
                    </span>
                  ) : null}
                </button>
              );
            })}
            {!filteredTempers.length ? (
              <div className={PICKER_LAYOUT_CLASS_NAMES.empty}>
                <div className={TEMPER_PICKER_PANEL_CLASS_NAMES.emptyCopy}>
                  <strong className={PICKER_LAYOUT_CLASS_NAMES.emptyTitle}>
                    {weapon ? "No compatible Tempers" : "Choose a weapon first"}
                  </strong>
                  <span>
                    {!weapon
                      ? "Temper eligibility depends on the weapon’s Origin and type."
                      : normalizedQuery && selectableMatches.length
                        ? hiddenMatchMessage(hiddenReasons)
                        : normalizedQuery
                          ? "No selectable Tempers match this search."
                          : "No selectable Tempers support this weapon context."}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonColumn}>
          {candidate ? (
            <>
              <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonHeading}>
                <span className={PICKER_LAYOUT_CLASS_NAMES.candidateArt}>
                  <Image
                    src={candidate.icon.thumbnailUrl}
                    alt=""
                    className="size-28 object-contain drop-shadow-art-strong"
                    width={112}
                    height={112}
                    unoptimized
                  />
                </span>
                <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonCopy}>
                  <small>{candidate.origin} Temper</small>
                  <h3 className={PICKER_LAYOUT_CLASS_NAMES.comparisonTitle}>
                    {candidate.name}
                  </h3>
                  <p className={PICKER_LAYOUT_CLASS_NAMES.comparisonMeta}>
                    {candidate.compatibility} · {candidateOccurrences} of 2 equipped
                  </p>
                  <a
                    className={PICKER_LAYOUT_CLASS_NAMES.externalLink}
                    href={candidate.provenance.pageUrl}
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
              <p className={TEMPER_PICKER_PANEL_CLASS_NAMES.description}>
                {candidate.description}
              </p>
              <div className={TEMPER_PICKER_PANEL_CLASS_NAMES.statList}>
                {candidate.stats.map((stat, index) => (
                  <section
                    className={TEMPER_PICKER_PANEL_CLASS_NAMES.statCard}
                    key={`${stat.effectId}-${index}`}
                  >
                    <strong className={TEMPER_PICKER_PANEL_CLASS_NAMES.statHeading}>
                      {stat.effect.replace("$1", "").trim()}
                    </strong>
                    <div className={TEMPER_PICKER_PANEL_CLASS_NAMES.statStacks}>
                      <div className={TEMPER_PICKER_PANEL_CLASS_NAMES.statRow}>
                        <span className={TEMPER_PICKER_PANEL_CLASS_NAMES.statCount}>
                          1×
                        </span>
                        <span className={TEMPER_PICKER_PANEL_CLASS_NAMES.statValue}>
                          {formatTemperEffect(stat.effect, stat.stacks.single)}
                        </span>
                      </div>
                      <div className={TEMPER_PICKER_PANEL_CLASS_NAMES.statRow}>
                        <span className={TEMPER_PICKER_PANEL_CLASS_NAMES.statCount}>
                          2×
                        </span>
                        <span className={TEMPER_PICKER_PANEL_CLASS_NAMES.statValue}>
                          {formatTemperEffect(stat.effect, stat.stacks.double)}
                        </span>
                      </div>
                    </div>
                    {stat.notes ? (
                      <small className={TEMPER_PICKER_PANEL_CLASS_NAMES.statNote}>
                        {stat.notes}
                      </small>
                    ) : null}
                  </section>
                ))}
              </div>
              <div className={PICKER_LAYOUT_CLASS_NAMES.actions}>
                <span />
                <button
                  type="button"
                  className={ACTION_BUTTON_CLASS_NAMES.pickerPrimary}
                  onClick={addCandidate}
                  disabled={!canAddCandidate}
                >
                  {candidateOccurrences >= 2
                    ? "Maximum 2 equipped"
                    : promotedTier === null
                      ? "Temper capacity full"
                      : promotedTier !== enhancements.craftwork
                        ? `Add & Promote to ${promotedTier}`
                        : "Add Temper"}
                </button>
              </div>
            </>
          ) : (
            <div className={PICKER_LAYOUT_CLASS_NAMES.empty}>
              <div className={TEMPER_PICKER_PANEL_CLASS_NAMES.emptyCopy}>
                <strong className={PICKER_LAYOUT_CLASS_NAMES.emptyTitle}>
                  No Temper selected
                </strong>
                <span>Choose a compatible Temper to inspect its effects.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
