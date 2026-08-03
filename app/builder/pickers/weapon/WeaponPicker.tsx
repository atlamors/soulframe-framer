"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { armorCatalogue } from "@/src/data/catalogue";
import { talismanCatalogue } from "@/src/data/talismans";
import { releasedWeaponCatalogue, weaponById } from "@/src/data/weapons";
import { calculateBuild } from "@/src/domain/calculation";
import {
  VIRTUE_IDS,
  type SoulframeBuild,
  type Weapon,
  type WeaponHandSlot,
  type VirtueId,
} from "@/src/domain/types";
import { ACTION_BUTTON_CLASS_NAMES } from "../../components/actionClassNames";
import { IllustratedCloseButton } from "../../components/IllustratedCloseButton";
import { WeaponArtwork } from "../../components/primitives";
import { virtueMeta, weaponSlotMeta } from "../../constants";
import { usePickerDialog as useBuilderPickerDialog } from "../../hooks/usePickerDialog";
import { WeaponLoadoutHud as BuilderWeaponLoadoutHud } from "../../loadout/WeaponLoadoutHud";
import { WeaponPrimaryHud as BuilderWeaponPrimaryHud } from "../../loadout/WeaponPrimaryHud";
import {
  getWeaponDamage,
  getWeaponDamageRows,
  meetsWeaponRequirements,
} from "../../lib/weapon-damage";
import {
  CatalogueContextMenu as BuilderCatalogueContextMenu,
  ExpandableSearch as BuilderExpandableSearch,
} from "../shared/CatalogueControls";
import { WeaponDropTable as BuilderWeaponDropTable } from "../shared/ItemDetails";
import { PICKER_LAYOUT_CLASS_NAMES } from "../shared/PickerLayout";
import { PICKER_CONTROL_CLASS_NAMES } from "../shared/pickerControlClassNames";
import { PickerTabs as BuilderPickerTabs } from "../shared/PickerTabs";
import { WEAPON_PICKER_CLASS_NAMES } from "./weaponPickerClassNames";
export function WeaponPicker({
  slot,
  build,
  onClose,
  onConfigure,
  onEquip,
  onUnequip,
}: {
  slot: WeaponHandSlot;
  build: SoulframeBuild;
  onClose: () => void;
  onConfigure: (
    tab: "weapon" | "arts" | "rune" | "totems",
    totemSlot?: number,
  ) => void;
  onEquip: (itemId: string) => void;
  onUnequip: () => void;
}) {
  const panelRef = useBuilderPickerDialog(onClose);
  const [query, setQuery] = useState("");
  const [pipFilter, setPipFilter] = useState<"all" | VirtueId>("all");
  const [requirementFilter, setRequirementFilter] = useState<
    "all" | "met" | "unmet" | "none"
  >("all");
  const [artFilter, setArtFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [sortKey, setSortKey] = useState<
    | "name"
    | "primary"
    | "secondary"
    | "stagger"
    | "smite"
    | "art"
    | "rarity"
    | "origin"
  >("primary");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const compatibleItems = useMemo(
    () => releasedWeaponCatalogue.filter((item) => item.slot === slot),
    [slot],
  );
  const buildCalculation = calculateBuild(
    build,
    armorCatalogue,
    talismanCatalogue,
  );
  const currentItem = build.equipment[slot]
    ? weaponById.get(build.equipment[slot]!)
    : undefined;
  const [candidateId, setCandidateId] = useState(
    currentItem?.id ?? compatibleItems[0]?.id,
  );
  const artOptions = [...new Set(compatibleItems.map((item) => item.combatArt))]
    .sort();
  const rarityOptions = [
    ...new Set(compatibleItems.map((item) => item.rarity)),
  ].sort();
  const originOptions = [...new Set(compatibleItems.map((item) => item.origin))]
    .sort();
  const rarityRank: Record<string, number> = {
    Unknown: 0,
    Common: 1,
    Uncommon: 2,
    Rare: 3,
  };
  const filteredItems = compatibleItems
    .filter((item) => {
      const search = query.trim().toLowerCase();
      const requirementMet = meetsWeaponRequirements(
        item,
        buildCalculation.effectiveVirtues,
      );
      const hasRequirement = VIRTUE_IDS.some(
        (virtue) => item.requirements[virtue] > 0,
      );
      return (
        (item.name.toLowerCase().includes(search) ||
          item.combatArt.toLowerCase().includes(search) ||
          item.origin.toLowerCase().includes(search)) &&
        (pipFilter === "all" || item.attunement[pipFilter] > 0) &&
        (artFilter === "all" || item.combatArt === artFilter) &&
        (rarityFilter === "all" || item.rarity === rarityFilter) &&
        (originFilter === "all" || item.origin === originFilter) &&
        (requirementFilter === "all" ||
          (requirementFilter === "none" && !hasRequirement) ||
          (requirementFilter === "met" && hasRequirement && requirementMet) ||
          (requirementFilter === "unmet" && hasRequirement && !requirementMet))
      );
    })
    .sort((left, right) => {
      if (left.id === currentItem?.id) return -1;
      if (right.id === currentItem?.id) return 1;

      const leftDamage = getWeaponDamage(
        left,
        buildCalculation.effectiveVirtues,
      );
      const rightDamage = getWeaponDamage(
        right,
        buildCalculation.effectiveVirtues,
      );
      const values = {
        name: [left.name, right.name],
        primary: [leftDamage.primary.total ?? -1, rightDamage.primary.total ?? -1],
        secondary: [
          leftDamage.secondary.total ?? -1,
          rightDamage.secondary.total ?? -1,
        ],
        stagger: [leftDamage.stagger ?? -1, rightDamage.stagger ?? -1],
        smite: [
          left.stats.smite.percent ?? -1,
          right.stats.smite.percent ?? -1,
        ],
        art: [left.combatArt, right.combatArt],
        rarity: [rarityRank[left.rarity] ?? 0, rarityRank[right.rarity] ?? 0],
        origin: [left.origin, right.origin],
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
    artFilter,
    rarityFilter,
    originFilter,
  ].filter((value) => value !== "all").length;
  const clearFilters = () => {
    setPipFilter("all");
    setRequirementFilter("all");
    setArtFilter("all");
    setRarityFilter("all");
    setOriginFilter("all");
  };
  const changeSort = (value: typeof sortKey) => {
    setSortKey(value);
    setSortDirection(
      ["name", "art", "origin"].includes(value) ? "asc" : "desc",
    );
  };
  const weaponSortValue = (item: Weapon) => {
    const damage = getWeaponDamage(item, buildCalculation.effectiveVirtues);
    switch (sortKey) {
      case "primary":
        return damage.primary.total ?? "—";
      case "secondary":
        return damage.secondary.total ?? "—";
      case "stagger":
        return damage.stagger ?? "—";
      case "smite":
        return item.stats.smite.percent === null
          ? "—"
          : `${item.stats.smite.percent}%`;
      case "art":
        return item.combatArt;
      case "rarity":
        return item.rarity;
      case "origin":
        return item.origin;
      default:
        return damage.primary.total ?? "—";
    }
  };

  const rank30Rows = candidate ? getWeaponDamageRows(candidate) : [];

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
        aria-labelledby="weapon-picker-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className={PICKER_LAYOUT_CLASS_NAMES.panelContent}>
          <header className={PICKER_LAYOUT_CLASS_NAMES.headerWeapon}>
          <h2
            className={PICKER_LAYOUT_CLASS_NAMES.headerTitleWeapon}
            id="weapon-picker-title"
          >
            {weaponSlotMeta[slot].label}
          </h2>
          <BuilderWeaponLoadoutHud
            slot={slot}
            build={build}
            active="weapon"
            inline
            onNavigate={onConfigure}
          />
          <IllustratedCloseButton
            onClick={onClose}
            aria-label="Close weapon picker"
          />
        </header>
        <BuilderPickerTabs active="weapon" onChange={onConfigure} />

        <div className={PICKER_LAYOUT_CLASS_NAMES.body}>
          <aside className={PICKER_LAYOUT_CLASS_NAMES.catalogueColumn}>
            <BuilderCatalogueContextMenu
              idPrefix="weapon-catalogue"
              search={
                <BuilderExpandableSearch
                  value={query}
                  onChange={setQuery}
                  label="Search weapons"
                  placeholder={`Search ${compatibleItems.length} ${
                    slot === "mainHand" ? "weapons" : "sidearms"
                  }`}
                />
              }
              activeFilterCount={activeFilterCount}
              filteredCount={filteredItems.length}
              totalCount={compatibleItems.length}
              onClearFilters={clearFilters}
              filters={
                <div className={PICKER_CONTROL_CLASS_NAMES.filters}>
                  <div
                    className={PICKER_CONTROL_CLASS_NAMES.filterSelectWrap}
                  >
                    <select
                      className={PICKER_CONTROL_CLASS_NAMES.filterSelect}
                      aria-label="Filter weapons by Attunement Virtue"
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
                  <div
                    className={PICKER_CONTROL_CLASS_NAMES.filterSelectWrap}
                  >
                    <select
                      className={PICKER_CONTROL_CLASS_NAMES.filterSelect}
                      aria-label="Filter weapons by Combat Art"
                      value={artFilter}
                      onChange={(event) => setArtFilter(event.target.value)}
                    >
                      <option
                        className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                        value="all"
                      >
                        All arts
                      </option>
                      {artOptions.map((art) => (
                        <option
                          className={PICKER_CONTROL_CLASS_NAMES.filterOption}
                          value={art}
                          key={art}
                        >
                          {art}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className={PICKER_CONTROL_CLASS_NAMES.filterSelectArrow}
                      aria-hidden="true"
                    />
                  </div>
                  <div
                    className={PICKER_CONTROL_CLASS_NAMES.filterSelectWrap}
                  >
                    <select
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelect}
                  aria-label="Filter weapons by rarity"
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
                  aria-label="Filter weapons by origin"
                  value={originFilter}
                  onChange={(event) => setOriginFilter(event.target.value)}
                >
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="all">All origins</option>
                  {originOptions.map((origin) => (
                    <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value={origin} key={origin}>
                      {origin}
                    </option>
                  ))}
                </select>
                <ChevronDown className={PICKER_CONTROL_CLASS_NAMES.filterSelectArrow} aria-hidden="true" />
                </div>
                <div className={PICKER_CONTROL_CLASS_NAMES.filterSelectWrap}>
                <select
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelect}
                  aria-label="Filter weapons by requirement status"
                  value={requirementFilter}
                  onChange={(event) =>
                    setRequirementFilter(
                      event.target.value as typeof requirementFilter,
                    )
                  }
                >
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="all">All requirements</option>
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="met">Requirement met</option>
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="unmet">Requirement unmet</option>
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="none">No requirement</option>
                </select>
                <ChevronDown className={PICKER_CONTROL_CLASS_NAMES.filterSelectArrow} aria-hidden="true" />
                </div>
                </div>
              }
              sort={
                <div className={PICKER_CONTROL_CLASS_NAMES.sort}>
                <div className={PICKER_CONTROL_CLASS_NAMES.filterSelectWrap}>
                <select
                  className={PICKER_CONTROL_CLASS_NAMES.filterSelect}
                  aria-label="Sort weapons"
                  value={sortKey}
                  onChange={(event) =>
                    changeSort(event.target.value as typeof sortKey)
                  }
                >
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="name">Name</option>
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="primary">Current light damage</option>
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="secondary">Current heavy damage</option>
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="stagger">Stagger</option>
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="smite">Smite chance</option>
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="art">Combat Art</option>
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="rarity">Rarity</option>
                  <option className={PICKER_CONTROL_CLASS_NAMES.filterOption} value="origin">Origin</option>
                </select>
                <ChevronDown className={PICKER_CONTROL_CLASS_NAMES.filterSelectArrow} aria-hidden="true" />
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
                    <ArrowUpAZ className={PICKER_CONTROL_CLASS_NAMES.sortIcon} aria-hidden="true" />
                  ) : (
                    <ArrowDownAZ className={PICKER_CONTROL_CLASS_NAMES.sortIcon} aria-hidden="true" />
                  )}
                </button>
                </div>
              }
            />
            <div
              className={PICKER_LAYOUT_CLASS_NAMES.itemList}
              role="listbox"
              aria-label="Weapons"
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
                      <WeaponArtwork
                        item={item}
                        appearance="default"
                        fallback={weaponSlotMeta[slot].index}
                        sizes="44px"
                      />
                    </span>
                    <span className={PICKER_LAYOUT_CLASS_NAMES.itemCopy}>
                      <strong className={PICKER_LAYOUT_CLASS_NAMES.itemName}>
                        {item.name}
                      </strong>
                      <small className={PICKER_LAYOUT_CLASS_NAMES.itemMeta}>
                        {item.combatArt} · {item.origin}
                      </small>
                    </span>
                    <span className={PICKER_LAYOUT_CLASS_NAMES.itemSide}>
                      <span className={PICKER_LAYOUT_CLASS_NAMES.itemTotal}>
                        {weaponSortValue(item)}
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
                  <strong className={PICKER_LAYOUT_CLASS_NAMES.emptyTitle}>
                    No weapons found
                  </strong>
                </div>
              ) : null}
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
                    <WeaponArtwork
                      item={candidate}
                      appearance="default"
                      fallback={weaponSlotMeta[slot].index}
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
                      {candidate.rarity} · {candidate.combatArt} ·{" "}
                      {candidate.damageType}
                    </p>
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

                <BuilderWeaponPrimaryHud
                  item={candidate}
                  virtues={buildCalculation.effectiveVirtues}
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
                    <span
                      className={PICKER_CONTROL_CLASS_NAMES.breakdownCopy}
                    >
                      <strong
                        className={PICKER_CONTROL_CLASS_NAMES.breakdownTitle}
                      >
                        Rank 30 Damage
                      </strong>
                      <small
                        className={PICKER_CONTROL_CLASS_NAMES.breakdownSubtitle}
                      >
                        All calculations use Rank 30 values
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
                  <div className={WEAPON_PICKER_CLASS_NAMES.statTable}>
                    <div className={WEAPON_PICKER_CLASS_NAMES.statHead}>
                      <span>Damage</span>
                      <span>Rank 30</span>
                      <span>Data</span>
                    </div>
                    {rank30Rows.map((row) => (
                      <div
                        className={WEAPON_PICKER_CLASS_NAMES.statRow}
                        key={row.id}
                      >
                        <span
                          className={WEAPON_PICKER_CLASS_NAMES.statLabel}
                        >
                          {row.label}
                        </span>
                        <strong
                          className={WEAPON_PICKER_CLASS_NAMES.statValue}
                        >
                          {row.value ?? "—"}
                        </strong>
                        <strong
                          className={WEAPON_PICKER_CLASS_NAMES.statValue}
                        >
                          {row.value === undefined ? "Unavailable" : "Available"}
                        </strong>
                      </div>
                    ))}
                  </div>
                </details>

                <BuilderWeaponDropTable item={candidate} />

                <p className={WEAPON_PICKER_CLASS_NAMES.description}>{candidate.description}</p>

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
                    onClick={() => {
                      if (candidate.id !== currentItem?.id) {
                        onEquip(candidate.id);
                      }
                      onConfigure("rune");
                    }}
                  >
                    {candidate.id === currentItem?.id
                      ? "Continue to Rune"
                      : "Equip & Choose Rune"}
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
