"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import {
  joineryById,
  joineryCatalogue,
} from "@/src/data/joineries";
import {
  getJoineryPipApplication,
  isJoineryCompatible,
} from "@/src/domain/weapon-configuration";
import type {
  Joinery,
  VirtueValues,
  Weapon,
  WeaponEnhancements,
} from "@/src/domain/types";
import { ACTION_BUTTON_CLASS_NAMES } from "../../components/actionClassNames";
import { virtueMeta } from "../../constants";
import {
  CatalogueContextMenu,
  ExpandableSearch,
} from "../shared/CatalogueControls";
import { PICKER_LAYOUT_CLASS_NAMES } from "../shared/PickerLayout";
import {
  JOINERY_PICKER_PANEL_CLASS_NAMES,
  JOINERY_PIP_CLASS_NAMES,
} from "./joineryPickerPanelClassNames";

export type JoineryFamilyGroup = {
  family: string;
  items: Joinery[];
};

export function matchesJoineryQuery(joinery: Joinery, query: string) {
  if (!query) return true;
  return [
    joinery.name,
    joinery.family,
    joinery.tier,
    joinery.rarity,
    joinery.blessing,
    joinery.virtue,
    joinery.attunementText,
    joinery.description,
    ...joinery.sourceTypes,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function groupJoineriesByFamily(
  joineries: readonly Joinery[],
): JoineryFamilyGroup[] {
  const groups = new Map<string, Joinery[]>();
  for (const joinery of joineries) {
    const family = groups.get(joinery.family) ?? [];
    family.push(joinery);
    groups.set(joinery.family, family);
  }
  return [...groups].map(([family, items]) => ({ family, items }));
}

export function getJoineryCatalogueView(
  catalogue: readonly Joinery[],
  weapon: Weapon | undefined,
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const compatible = catalogue.filter((joinery) =>
    isJoineryCompatible(joinery, weapon),
  );
  const matching = catalogue.filter((joinery) =>
    matchesJoineryQuery(joinery, normalizedQuery),
  );
  const visible = matching.filter((joinery) =>
    isJoineryCompatible(joinery, weapon),
  );

  return {
    normalizedQuery,
    compatible,
    matching,
    visible,
    groups: groupJoineriesByFamily(visible),
    hiddenByWeaponType:
      Boolean(weapon) &&
      Boolean(normalizedQuery) &&
      matching.length > 0 &&
      visible.length === 0,
  };
}

function JoineryPips({ joinery }: { joinery: Joinery }) {
  return (
    <span
      className={`${JOINERY_PICKER_PANEL_CLASS_NAMES.itemPips} ${JOINERY_PIP_CLASS_NAMES[joinery.virtue]}`}
      aria-label={`${joinery.attunementPips} ${virtueMeta[joinery.virtue].label} attunement ${joinery.attunementPips === 1 ? "pip" : "pips"}`}
    >
      {Array.from({ length: joinery.attunementPips }, (_, index) => (
        <span aria-hidden="true" key={index}>
          ◆
        </span>
      ))}
    </span>
  );
}

function getJoineryWasteFeedback(
  nativeAttunement: VirtueValues | undefined,
  joinery: Joinery,
) {
  if (!nativeAttunement) return null;
  const application = getJoineryPipApplication(nativeAttunement, joinery);
  if (application.wasted <= 0) return null;
  return `${application.applied} applied · ${application.wasted} wasted at 5-pip cap`;
}

function AttunementSnapshot({
  label,
  joinery,
  nativeAttunement,
  current,
}: {
  label: string;
  joinery?: Joinery;
  nativeAttunement?: VirtueValues;
  current?: boolean;
}) {
  const wasteFeedback = joinery
    ? getJoineryWasteFeedback(nativeAttunement, joinery)
    : null;

  return (
    <div
      className={
        JOINERY_PICKER_PANEL_CLASS_NAMES[
          current ? "snapshotCurrent" : "snapshotPrevious"
        ]
      }
    >
      <small className={JOINERY_PICKER_PANEL_CLASS_NAMES.snapshotLabel}>
        {label}
      </small>
      <strong className={JOINERY_PICKER_PANEL_CLASS_NAMES.snapshotName}>
        {joinery?.name ?? "No Joinery"}
      </strong>
      {joinery ? (
        <>
          <span className={JOINERY_PICKER_PANEL_CLASS_NAMES.snapshotAttunement}>
            {joinery.attunementText}
          </span>
          <span className={JOINERY_PICKER_PANEL_CLASS_NAMES.snapshotPips}>
            <JoineryPips joinery={joinery} />
          </span>
          {wasteFeedback ? (
            <small className={JOINERY_PICKER_PANEL_CLASS_NAMES.snapshotWaste}>
              {wasteFeedback}
            </small>
          ) : null}
          <small className={JOINERY_PICKER_PANEL_CLASS_NAMES.snapshotMeta}>
            {joinery.blessing} · {virtueMeta[joinery.virtue].label}
          </small>
        </>
      ) : (
        <span className={JOINERY_PICKER_PANEL_CLASS_NAMES.snapshotAttunement}>
          No attunement
        </span>
      )}
    </div>
  );
}

export function JoineryPickerPanel({
  weapon,
  enhancements,
  onChange,
}: {
  weapon?: Weapon;
  enhancements: WeaponEnhancements;
  onChange: (enhancements: WeaponEnhancements) => void;
}) {
  const [query, setQuery] = useState("");
  const [previousJoineryId, setPreviousJoineryId] = useState<string | null>(
    null,
  );
  const catalogueView = useMemo(
    () => getJoineryCatalogueView(joineryCatalogue, weapon, query),
    [query, weapon],
  );
  const currentJoinery = enhancements.joineryId
    ? joineryById.get(enhancements.joineryId)
    : undefined;
  const previousJoinery = previousJoineryId
    ? joineryById.get(previousJoineryId)
    : undefined;
  const currentWasteFeedback = currentJoinery
    ? getJoineryWasteFeedback(weapon?.attunement, currentJoinery)
    : null;

  const replaceJoinery = (nextJoinery: Joinery | null) => {
    if (nextJoinery && !isJoineryCompatible(nextJoinery, weapon)) return;
    const nextId = nextJoinery?.id ?? null;
    if (nextId === enhancements.joineryId) return;
    setPreviousJoineryId(enhancements.joineryId);
    onChange({ ...enhancements, joineryId: nextId });
  };

  return (
    <>
      <section
        className={JOINERY_PICKER_PANEL_CLASS_NAMES.currentBand}
        aria-label="Current Joinery selection"
      >
        <div className={JOINERY_PICKER_PANEL_CLASS_NAMES.currentLayout}>
          <div
            className={JOINERY_PICKER_PANEL_CLASS_NAMES.currentSelection}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={JOINERY_PICKER_PANEL_CLASS_NAMES.currentArt}>
              {currentJoinery ? (
                <Image
                  className={JOINERY_PICKER_PANEL_CLASS_NAMES.currentImage}
                  src={currentJoinery.icon.thumbnailUrl}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                />
              ) : (
                <span aria-hidden="true">◇</span>
              )}
            </span>
            <span className={JOINERY_PICKER_PANEL_CLASS_NAMES.currentCopy}>
              <small className={JOINERY_PICKER_PANEL_CLASS_NAMES.currentLabel}>
                Current Joinery
              </small>
              <strong className={JOINERY_PICKER_PANEL_CLASS_NAMES.currentName}>
                {currentJoinery?.name ?? "None selected"}
              </strong>
              <span className={JOINERY_PICKER_PANEL_CLASS_NAMES.currentMeta}>
                {currentJoinery
                  ? `${currentJoinery.attunementText} · ${currentJoinery.blessing}`
                  : "Choose a compatible material below"}
              </span>
              {currentWasteFeedback ? (
                <small
                  className={JOINERY_PICKER_PANEL_CLASS_NAMES.currentWaste}
                >
                  {currentWasteFeedback}
                </small>
              ) : null}
            </span>
          </div>
          <button
            type="button"
            className={ACTION_BUTTON_CLASS_NAMES.pickerQuiet}
            onClick={() => replaceJoinery(null)}
            disabled={!currentJoinery}
          >
            Clear Joinery
          </button>
        </div>
      </section>

      <div className={PICKER_LAYOUT_CLASS_NAMES.bodyDetail}>
        <aside className={PICKER_LAYOUT_CLASS_NAMES.catalogueColumn}>
          <div className={JOINERY_PICKER_PANEL_CLASS_NAMES.weaponContext}>
            <small className={JOINERY_PICKER_PANEL_CLASS_NAMES.weaponContextLabel}>
              Active weapon
            </small>
            <strong className={JOINERY_PICKER_PANEL_CLASS_NAMES.weaponContextValue}>
              {weapon?.name ?? "Select a weapon"}
            </strong>
            <span className={JOINERY_PICKER_PANEL_CLASS_NAMES.weaponContextMeta}>
              {weapon?.combatArt ?? "Weapon type required"}
            </span>
          </div>
          <CatalogueContextMenu
            idPrefix="joinery-catalogue"
            search={
              <ExpandableSearch
                value={query}
                onChange={setQuery}
                label="Search Joineries"
                placeholder={`Search ${joineryCatalogue.length} Joineries`}
              />
            }
            activeFilterCount={0}
            filteredCount={catalogueView.visible.length}
            totalCount={catalogueView.compatible.length}
          />
          <div
            className={PICKER_LAYOUT_CLASS_NAMES.itemList}
            role="group"
            aria-label="Compatible Joineries grouped by material family"
          >
            {catalogueView.groups.map((group, groupIndex) => {
              const headingId = `joinery-family-${groupIndex}`;
              return (
                <section
                  className={JOINERY_PICKER_PANEL_CLASS_NAMES.familyGroup}
                  role="group"
                  aria-labelledby={headingId}
                  key={group.family}
                >
                  <h3
                    className={JOINERY_PICKER_PANEL_CLASS_NAMES.familyHeading}
                    id={headingId}
                  >
                    <span className={JOINERY_PICKER_PANEL_CLASS_NAMES.familyName}>
                      {group.family}
                    </span>
                    <small className={JOINERY_PICKER_PANEL_CLASS_NAMES.familyCount}>
                      {group.items.length} options
                    </small>
                  </h3>
                  {group.items.map((joinery) => {
                    const isCurrent = joinery.id === currentJoinery?.id;
                    const wasteFeedback = getJoineryWasteFeedback(
                      weapon?.attunement,
                      joinery,
                    );
                    return (
                      <button
                        type="button"
                        aria-pressed={isCurrent}
                        aria-label={`Select ${joinery.name}, ${joinery.attunementText}${wasteFeedback ? `, ${wasteFeedback}` : ""}`}
                        className={
                          PICKER_LAYOUT_CLASS_NAMES[
                            isCurrent ? "itemRowCandidate" : "itemRowDefault"
                          ]
                        }
                        onClick={() => replaceJoinery(joinery)}
                        key={joinery.id}
                      >
                        <span className={PICKER_LAYOUT_CLASS_NAMES.itemMark}>
                          <Image
                            src={joinery.icon.thumbnailUrl}
                            alt=""
                            width={48}
                            height={48}
                            unoptimized
                          />
                        </span>
                        <span className={PICKER_LAYOUT_CLASS_NAMES.itemCopy}>
                          <strong
                            className={
                              JOINERY_PICKER_PANEL_CLASS_NAMES.itemAttunement
                            }
                          >
                            <JoineryPips joinery={joinery} />
                            <span>{joinery.attunementText}</span>
                          </strong>
                          <small
                            className={JOINERY_PICKER_PANEL_CLASS_NAMES.itemMeta}
                          >
                            {joinery.blessing} · {joinery.tier}
                          </small>
                          {wasteFeedback ? (
                            <small
                              className={
                                JOINERY_PICKER_PANEL_CLASS_NAMES.itemWaste
                              }
                            >
                              {wasteFeedback}
                            </small>
                          ) : null}
                        </span>
                        {isCurrent ? (
                          <span className={PICKER_LAYOUT_CLASS_NAMES.equippedChip}>
                            Current
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </section>
              );
            })}
            {!catalogueView.visible.length ? (
              <div className={PICKER_LAYOUT_CLASS_NAMES.empty}>
                <div className={JOINERY_PICKER_PANEL_CLASS_NAMES.emptyCopy}>
                  <strong className={PICKER_LAYOUT_CLASS_NAMES.emptyTitle}>
                    {weapon ? "No compatible Joineries" : "Choose a weapon first"}
                  </strong>
                  <span>
                    {!weapon
                      ? "Joinery eligibility depends on the weapon type."
                      : catalogueView.hiddenByWeaponType
                        ? `Matching Joineries were hidden because they do not support ${weapon.combatArt} weapons.`
                        : catalogueView.normalizedQuery
                          ? "No Joineries match this search."
                          : "No Joineries support this weapon type."}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonColumn}>
          {currentJoinery ? (
            <>
              <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonHeading}>
                <span className={PICKER_LAYOUT_CLASS_NAMES.candidateArt}>
                  <Image
                    src={currentJoinery.icon.thumbnailUrl}
                    alt=""
                    className="size-28 object-contain drop-shadow-art-strong"
                    width={112}
                    height={112}
                    unoptimized
                  />
                </span>
                <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonCopy}>
                  <small>{currentJoinery.family} Joinery</small>
                  <h3 className={PICKER_LAYOUT_CLASS_NAMES.comparisonTitle}>
                    {currentJoinery.name}
                  </h3>
                  <p className={PICKER_LAYOUT_CLASS_NAMES.comparisonMeta}>
                    {currentJoinery.rarity} · {currentJoinery.tier} · {currentJoinery.sourceTypes.join(" · ")}
                  </p>
                  <a
                    className={PICKER_LAYOUT_CLASS_NAMES.externalLink}
                    href={currentJoinery.parentPageUrl}
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
              <p className={JOINERY_PICKER_PANEL_CLASS_NAMES.description}>
                {currentJoinery.description}
              </p>
              <section
                className={JOINERY_PICKER_PANEL_CLASS_NAMES.comparisonSection}
                aria-labelledby="joinery-attunement-change-title"
              >
                <h4
                  className={JOINERY_PICKER_PANEL_CLASS_NAMES.comparisonTitle}
                  id="joinery-attunement-change-title"
                >
                  Attunement change
                </h4>
                <div className={JOINERY_PICKER_PANEL_CLASS_NAMES.comparisonGrid}>
                  <AttunementSnapshot
                    label="Previous"
                    joinery={previousJoinery}
                    nativeAttunement={weapon?.attunement}
                  />
                  <AttunementSnapshot
                    label="Current"
                    joinery={currentJoinery}
                    nativeAttunement={weapon?.attunement}
                    current
                  />
                </div>
              </section>
              <div className={JOINERY_PICKER_PANEL_CLASS_NAMES.detailEnd} />
            </>
          ) : (
            <div className={PICKER_LAYOUT_CLASS_NAMES.empty}>
              <div className={JOINERY_PICKER_PANEL_CLASS_NAMES.emptyCopy}>
                <strong className={PICKER_LAYOUT_CLASS_NAMES.emptyTitle}>
                  No Joinery selected
                </strong>
                <span>
                  Choose a compatible option to replace the current Joinery immediately.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
