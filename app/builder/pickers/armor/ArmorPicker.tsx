"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { armorById, armorCatalogue } from "@/src/data/catalogue";
import { armorImageById } from "@/src/data/armor-images";
import { talismanCatalogue } from "@/src/data/talismans";
import {
  calculateBuild,
  calculateItemContribution,
  meetsArmorRequirement,
} from "@/src/domain/calculation";
import {
  DEFENSE_IDS,
  VIRTUE_IDS,
  type ArmorItem,
  type ArmorSlot,
  type DefenseId,
  type SoulframeBuild,
  type VirtueId,
} from "@/src/domain/types";
import { ACTION_BUTTON_CLASS_NAMES } from "../../components/actionClassNames";
import { IllustratedCloseButton } from "../../components/IllustratedCloseButton";
import {
  ArmorArtwork,
  RequirementBadge,
} from "../../components/primitives";
import { slotMeta, virtueMeta } from "../../constants";
import { usePickerDialog as useBuilderPickerDialog } from "../../hooks/usePickerDialog";
import {
  CatalogueContextMenu as BuilderCatalogueContextMenu,
  ExpandableSearch as BuilderExpandableSearch,
} from "../shared/CatalogueControls";
import {
  ArmorBaseOverview as BuilderArmorBaseOverview,
  ArmorDropTable as BuilderArmorDropTable,
  ItemStatDetails as BuilderItemStatDetails,
} from "../shared/ItemDetails";
import { PICKER_LAYOUT_CLASS_NAMES } from "../shared/PickerLayout";
import { PICKER_CONTROL_CLASS_NAMES } from "../shared/pickerControlClassNames";
import { ARMOR_PICKER_CLASS_NAMES } from "./armorPickerClassNames";
export function ItemPicker({
  slot,
  build,
  onClose,
  onEquip,
  onUnequip,
}: {
  slot: ArmorSlot;
  build: SoulframeBuild;
  onClose: () => void;
  onEquip: (itemId: string) => void;
  onUnequip: () => void;
}) {
  const panelRef = useBuilderPickerDialog(onClose);
  const [query, setQuery] = useState("");
  const [pipFilter, setPipFilter] = useState<"all" | VirtueId>("all");
  const [requirementFilter, setRequirementFilter] = useState<
    "all" | "met" | "unmet" | "none"
  >("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [armorSetFilter, setArmorSetFilter] = useState("all");
  const [sortKey, setSortKey] = useState<
    "name" | "total" | DefenseId | "rarity" | "armorSet"
  >("total");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const compatibleItems = useMemo(
    () => armorCatalogue.filter((item) => item.slot === slot),
    [slot],
  );
  const buildCalculation = calculateBuild(
    build,
    armorCatalogue,
    talismanCatalogue,
  );
  const currentItem = build.equipment[slot]
    ? armorById.get(build.equipment[slot]!)
    : undefined;
  const [candidateId, setCandidateId] = useState(
    currentItem?.id ?? compatibleItems[0]?.id,
  );
  const rarityOptions = [
    ...new Set(compatibleItems.map((item) => item.rarity)),
  ].sort();
  const armorSetOptions = [
    ...new Set(compatibleItems.map((item) => item.armorSet)),
  ].sort();
  const rarityRank: Record<string, number> = {
    Unknown: 0,
    Common: 1,
    Uncommon: 2,
    Rare: 3,
  };
  const contributionById = new Map(
    compatibleItems.map((item) => [
      item.id,
      calculateItemContribution(item, buildCalculation.effectiveVirtues),
    ]),
  );
  const filteredItems = compatibleItems
    .filter((item) => {
      const requirementMet = meetsArmorRequirement(
        item,
        buildCalculation.effectiveVirtues,
      );
      return (
        item.name.toLowerCase().includes(query.trim().toLowerCase()) &&
        (pipFilter === "all" ||
          DEFENSE_IDS.some(
            (defense) => item.defenses[defense].pips[pipFilter] > 0,
          )) &&
        (rarityFilter === "all" || item.rarity === rarityFilter) &&
        (armorSetFilter === "all" || item.armorSet === armorSetFilter) &&
        (requirementFilter === "all" ||
          (requirementFilter === "none" && item.requirement === null) ||
          (requirementFilter === "met" &&
            item.requirement !== null &&
            requirementMet) ||
          (requirementFilter === "unmet" &&
            item.requirement !== null &&
            !requirementMet))
      );
    })
    .sort((left, right) => {
      if (left.id === currentItem?.id) return -1;
      if (right.id === currentItem?.id) return 1;

      const leftContribution = contributionById.get(left.id)!;
      const rightContribution = contributionById.get(right.id)!;
      const values = {
        name: [left.name, right.name],
        total: [leftContribution.total, rightContribution.total],
        physicalDefense: [
          leftContribution.defenses.physicalDefense.total,
          rightContribution.defenses.physicalDefense.total,
        ],
        magickDefense: [
          leftContribution.defenses.magickDefense.total,
          rightContribution.defenses.magickDefense.total,
        ],
        stabilityIncrease: [
          leftContribution.defenses.stabilityIncrease.total,
          rightContribution.defenses.stabilityIncrease.total,
        ],
        rarity: [rarityRank[left.rarity] ?? 0, rarityRank[right.rarity] ?? 0],
        armorSet: [left.armorSet, right.armorSet],
      }[sortKey];
      const comparison =
        typeof values[0] === "number" && typeof values[1] === "number"
          ? values[0] - values[1]
          : String(values[0]).localeCompare(String(values[1]));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  const candidate =
    filteredItems.find((item) => item.id === candidateId) ?? filteredItems[0];
  const activeFilterCount = [
    pipFilter,
    requirementFilter,
    rarityFilter,
    armorSetFilter,
  ].filter((value) => value !== "all").length;
  const clearFilters = () => {
    setPipFilter("all");
    setRequirementFilter("all");
    setRarityFilter("all");
    setArmorSetFilter("all");
  };
  const changeSort = (value: typeof sortKey) => {
    setSortKey(value);
    setSortDirection(
      ["name", "armorSet"].includes(value) ? "asc" : "desc",
    );
  };
  const armorSortValue = (item: ArmorItem) => {
    const contribution = contributionById.get(item.id)!;
    switch (sortKey) {
      case "total":
        return contribution.total;
      case "physicalDefense":
      case "magickDefense":
      case "stabilityIncrease":
        return contribution.defenses[sortKey].total;
      case "rarity":
        return item.rarity;
      case "armorSet":
        return item.armorSet;
      default:
        return contribution.total;
    }
  };
  const currentContribution = currentItem
    ? calculateItemContribution(currentItem, buildCalculation.effectiveVirtues)
    : undefined;
  const candidateContribution = candidate
    ? calculateItemContribution(
        candidate,
        buildCalculation.effectiveVirtues,
      )
    : undefined;
  const candidatePageUrl = candidate
    ? armorImageById.get(candidate.id)?.pageUrl
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
        aria-labelledby="picker-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className={PICKER_LAYOUT_CLASS_NAMES.panelContent}>
          <header className={PICKER_LAYOUT_CLASS_NAMES.headerDefault}>
          <div className={PICKER_LAYOUT_CLASS_NAMES.headerCopy}>
            <h2
              className={PICKER_LAYOUT_CLASS_NAMES.headerTitleDefault}
              id="picker-title"
            >
              Choose {slotMeta[slot].label}
            </h2>
          </div>
          <IllustratedCloseButton
            onClick={onClose}
            aria-label="Close item picker"
          />
        </header>

        <div className={PICKER_LAYOUT_CLASS_NAMES.body}>
          <aside className={PICKER_LAYOUT_CLASS_NAMES.catalogueColumn}>
            <BuilderCatalogueContextMenu
              idPrefix="armor-catalogue"
              search={
                <BuilderExpandableSearch
                  value={query}
                  onChange={setQuery}
                  label="Search compatible armor"
                  placeholder={`Search ${compatibleItems.length} ${slotMeta[slot].label.toLowerCase()} options`}
                />
              }
              activeFilterCount={activeFilterCount}
              filteredCount={filteredItems.length}
              totalCount={compatibleItems.length}
              onClearFilters={clearFilters}
              filters={
                <div className={PICKER_CONTROL_CLASS_NAMES.filters}>
                <div className={PICKER_CONTROL_CLASS_NAMES.filterSelectWrap}>
                <select
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelect}
                  aria-label="Filter armor by pip Virtue"
                  value={pipFilter}
                  onChange={(event) =>
                    setPipFilter(event.target.value as "all" | VirtueId)
                  }
                >
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="all"
                  >
                    All pips
                  </option>
                  {VIRTUE_IDS.map((virtue) => (
                    <option
                      className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                      value={virtue}
                      key={virtue}
                    >
                      {virtueMeta[virtue].label} pips
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelectArrow}
                  aria-hidden="true"
                />
                </div>
                <div className={PICKER_CONTROL_CLASS_NAMES.filterSelectWrap}>
                <select
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelect}
                  aria-label="Filter armor by rarity"
                  value={rarityFilter}
                  onChange={(event) => setRarityFilter(event.target.value)}
                >
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="all"
                  >
                    All rarities
                  </option>
                  {rarityOptions.map((rarity) => (
                    <option
                      className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                      value={rarity}
                      key={rarity}
                    >
                      {rarity}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelectArrow}
                  aria-hidden="true"
                />
                </div>
                <div className={PICKER_CONTROL_CLASS_NAMES.filterSelectWrap}>
                <select
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelect}
                  aria-label="Filter armor by set"
                  value={armorSetFilter}
                  onChange={(event) => setArmorSetFilter(event.target.value)}
                >
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="all"
                  >
                    All sets
                  </option>
                  {armorSetOptions.map((armorSet) => (
                    <option
                      className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                      value={armorSet}
                      key={armorSet}
                    >
                      {armorSet}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelectArrow}
                  aria-hidden="true"
                />
                </div>
                <div className={PICKER_CONTROL_CLASS_NAMES.filterSelectWrap}>
                <select
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelect}
                  aria-label="Filter armor by requirement status"
                  value={requirementFilter}
                  onChange={(event) =>
                    setRequirementFilter(
                      event.target.value as typeof requirementFilter,
                    )
                  }
                >
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="all"
                  >
                    All requirements
                  </option>
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="met"
                  >
                    Requirement met
                  </option>
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="unmet"
                  >
                    Requirement unmet
                  </option>
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="none"
                  >
                    No requirement
                  </option>
                </select>
                <ChevronDown
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelectArrow}
                  aria-hidden="true"
                />
                </div>
                </div>
              }
              sort={
                <div className={PICKER_CONTROL_CLASS_NAMES.sort}>
                <div className={PICKER_CONTROL_CLASS_NAMES.filterSelectWrap}>
                <select
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelect}
                  aria-label="Sort armor"
                  value={sortKey}
                  onChange={(event) =>
                    changeSort(event.target.value as typeof sortKey)
                  }
                >
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="name"
                  >
                    Name
                  </option>
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="total"
                  >
                    Current total defense
                  </option>
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="physicalDefense"
                  >
                    Current physical
                  </option>
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="magickDefense"
                  >
                    Current magick
                  </option>
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="stabilityIncrease"
                  >
                    Current stability
                  </option>
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="rarity"
                  >
                    Rarity
                  </option>
                  <option
                    className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                    value="armorSet"
                  >
                    Armor Set
                  </option>
                </select>
                <ChevronDown
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelectArrow}
                  aria-hidden="true"
                />
                </div>
                <button
                  type="button"
                  className={PICKER_CONTROL_CLASS_NAMES.sortButton}
                  onClick={() =>
                    setSortDirection((current) =>
                      current === "asc" ? "desc" : "asc",
                    )
                  }
                  aria-label={`Sort ${
                    sortDirection === "asc" ? "descending" : "ascending"
                  }`}
                  title={`Sort ${
                    sortDirection === "asc" ? "descending" : "ascending"
                  }`}
                >
                  {sortDirection === "asc" ? (
                    <ArrowUpAZ
                      className={PICKER_CONTROL_CLASS_NAMES.sortIcon}
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowDownAZ
                      className={PICKER_CONTROL_CLASS_NAMES.sortIcon}
                      aria-hidden="true"
                    />
                  )}
                </button>
                </div>
              }
            />
            <div
              className={PICKER_LAYOUT_CLASS_NAMES.itemList}
              role="listbox"
              aria-label="Compatible armor"
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
                      <ArmorArtwork
                        item={item}
                        appearance="default"
                        fallback={slotMeta[slot].index}
                        sizes="44px"
                      />
                    </span>
                    <span className={PICKER_LAYOUT_CLASS_NAMES.itemCopy}>
                      <strong className={PICKER_LAYOUT_CLASS_NAMES.itemName}>
                        {item.name}
                      </strong>
                      <small className={PICKER_LAYOUT_CLASS_NAMES.itemMeta}>
                        {item.rarity} · {item.armorSet}
                      </small>
                    </span>
                    <span className={PICKER_LAYOUT_CLASS_NAMES.itemSide}>
                      {!meetsArmorRequirement(
                        item,
                        buildCalculation.effectiveVirtues,
                      ) ? (
                        <RequirementBadge
                          item={item}
                          virtues={buildCalculation.effectiveVirtues}
                          compact
                        />
                      ) : null}
                      <span className={PICKER_LAYOUT_CLASS_NAMES.itemTotal}>
                        {armorSortValue(item)}
                      </span>
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
                  <span>∅</span>
                  <strong className={PICKER_LAYOUT_CLASS_NAMES.emptyTitle}>
                    No armor found
                  </strong>
                  <p>Try a shorter name or clear the search.</p>
                </div>
              ) : null}
            </div>
          </aside>

          <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonColumn}>
            {candidate && candidateContribution ? (
              <>
                <div
                  className={PICKER_LAYOUT_CLASS_NAMES.comparisonHeading}
                >
                  <span
                    className={PICKER_LAYOUT_CLASS_NAMES.candidateArt}
                    aria-hidden="true"
                  >
                    <ArmorArtwork
                      key={candidate.id}
                      item={candidate}
                      appearance="default"
                      fallback={slotMeta[slot].index}
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
                    <div className={ARMOR_PICKER_CLASS_NAMES.headingActions}>
                      <RequirementBadge
                        item={candidate}
                        virtues={buildCalculation.effectiveVirtues}
                        placement="heading"
                      />
                      {candidatePageUrl ? (
                        <a
                          className={PICKER_LAYOUT_CLASS_NAMES.externalLink}
                          href={candidatePageUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View on Avakot
                          <ExternalLink
                            className={
                              PICKER_LAYOUT_CLASS_NAMES.externalLinkIcon
                            }
                            aria-hidden="true"
                          />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                <BuilderArmorBaseOverview
                  item={candidate}
                  contribution={candidateContribution}
                  comparison={currentContribution}
                />

                <details
                  className={PICKER_CONTROL_CLASS_NAMES.breakdown}
                  onToggle={(event) =>
                    setIsBreakdownOpen(event.currentTarget.open)
                  }
                >
                  <summary
                    className={PICKER_CONTROL_CLASS_NAMES.breakdownSummary}
                  >
                    <span className={PICKER_CONTROL_CLASS_NAMES.breakdownCopy}>
                      <strong
                        className={PICKER_CONTROL_CLASS_NAMES.breakdownTitle}
                      >
                        Calculation Breakdown
                      </strong>
                      <small
                        className={PICKER_CONTROL_CLASS_NAMES.breakdownSubtitle}
                      >
                        Base armor + virtue scaling
                      </small>
                    </span>
                    <ChevronDown
                      className={
                        PICKER_CONTROL_CLASS_NAMES.breakdownChevron[
                          isBreakdownOpen ? "open" : "closed"
                        ]
                      }
                      aria-hidden="true"
                    />
                  </summary>
                  <div className={PICKER_CONTROL_CLASS_NAMES.breakdownContent}>
                    <BuilderItemStatDetails
                      contribution={candidateContribution}
                      comparison={currentContribution}
                    />
                  </div>
                </details>

                <BuilderArmorDropTable item={candidate} />

                <div className={PICKER_LAYOUT_CLASS_NAMES.actions}>
                  {currentItem ? (
                    <button
                      type="button"
                      className={ACTION_BUTTON_CLASS_NAMES.pickerQuiet}
                      onClick={onUnequip}
                    >
                      Clear slot
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
                    {candidate.id === currentItem?.id
                      ? "Currently equipped"
                      : `Equip ${slotMeta[slot].label}`}
                  </button>
                </div>
              </>
            ) : (
              <div className={PICKER_LAYOUT_CLASS_NAMES.empty}>
                <span>∅</span>
                <strong className={PICKER_LAYOUT_CLASS_NAMES.emptyTitle}>
                  No candidate selected
                </strong>
              </div>
            )}
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
