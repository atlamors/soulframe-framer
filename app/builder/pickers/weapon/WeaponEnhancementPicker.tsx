"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { getRuneDisplayName, runeById, runeCatalogue } from "@/src/data/runes";
import { totemById, totemCatalogue } from "@/src/data/totems";
import { weaponById } from "@/src/data/weapons";
import {
  canEquipTotemInSlot,
  formatTotemEffect,
  getTotemRankValues,
  getTotemSlotVirtue,
  isRuneCompatible,
} from "@/src/domain/enchantments";
import type {
  ArtAllocation,
  Rune,
  SoulframeBuild,
  Totem,
  TotemSelection,
  WeaponEnhancements,
  WeaponHandSlot,
  VirtueId,
} from "@/src/domain/types";
import { CombatArtsModule } from "../../arts/CombatArtsModule";
import { VIRTUE_IDS } from "@/src/domain/types";
import { ACTION_BUTTON_CLASS_NAMES } from "../../components/actionClassNames";
import { IllustratedCloseButton } from "../../components/IllustratedCloseButton";
import { virtueMeta, weaponSlotMeta } from "../../constants";
import { usePickerDialog as useBuilderPickerDialog } from "../../hooks/usePickerDialog";
import { WeaponLoadoutHud as BuilderWeaponLoadoutHud } from "../../loadout/WeaponLoadoutHud";
import {
  CatalogueContextMenu as BuilderCatalogueContextMenu,
  ExpandableSearch as BuilderExpandableSearch,
} from "../shared/CatalogueControls";
import { NightfoldSelect } from "../shared/NightfoldSelect";
import { PICKER_LAYOUT_CLASS_NAMES } from "../shared/PickerLayout";
import { PickerTabs as BuilderPickerTabs } from "../shared/PickerTabs";
import { WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES } from "./weaponEnhancementPickerClassNames";
export function WeaponEnhancementPicker({
  slot,
  tab,
  selectedTotemSlot,
  build,
  onClose,
  onTabChange,
  onChange,
  onArtAllocationChange,
  onResetArtAllocation,
}: {
  slot: WeaponHandSlot;
  tab: "arts" | "rune" | "totems";
  selectedTotemSlot: number;
  build: SoulframeBuild;
  onClose: () => void;
  onTabChange: (
    tab: "weapon" | "arts" | "rune" | "totems",
    totemSlot?: number,
  ) => void;
  onChange: (enhancements: WeaponEnhancements) => void;
  onArtAllocationChange: (artName: string, allocation: ArtAllocation) => void;
  onResetArtAllocation: (artName: string) => void;
}) {
  const panelRef = useBuilderPickerDialog(
    onClose,
    '[data-weapon-config-tabs] button[aria-current="page"]',
  );
  const weaponId = build.equipment[slot];
  const weapon = weaponId ? weaponById.get(weaponId) : undefined;
  const enhancements = build.weaponEnhancements[slot];
  const currentRune = enhancements.rune
    ? runeById.get(enhancements.rune.itemId)
    : undefined;
  const compatibleRunes = runeCatalogue.filter((rune) =>
    isRuneCompatible(rune, weapon),
  );
  const [runeCandidateId, setRuneCandidateId] = useState(
    currentRune?.id ?? compatibleRunes[0]?.id,
  );
  const [totemSlot, setTotemSlot] = useState(
    Math.min(3, Math.max(0, selectedTotemSlot)),
  );
  const currentTotem = enhancements.totems[totemSlot];
  const [totemCandidateId, setTotemCandidateId] = useState(
    currentTotem?.itemId ?? totemCatalogue[0]?.id,
  );
  const [query, setQuery] = useState("");
  const [animal, setAnimal] = useState("all");
  const [enhances, setEnhances] = useState("all");
  const runeCandidate = runeCandidateId
    ? runeById.get(runeCandidateId)
    : undefined;
  const usedTotemIds = new Set(
    enhancements.totems.flatMap((selection, index) =>
      selection && index !== totemSlot ? [selection.itemId] : [],
    ),
  );
  const animalOptions = [...new Set(totemCatalogue.map((item) => item.animal))].sort();
  const enhanceOptions = [
    ...new Set(totemCatalogue.map((item) => item.enhances)),
  ].sort();
  const filteredTotems = totemCatalogue.filter(
    (totem) =>
      !usedTotemIds.has(totem.id) &&
      (animal === "all" || totem.animal === animal) &&
      (enhances === "all" || totem.enhances === enhances) &&
      [totem.name, totem.animal, totem.enhances]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const selectedTotemCandidate = totemCandidateId
    ? totemById.get(totemCandidateId)
    : undefined;
  const totemCandidate =
    selectedTotemCandidate &&
    canEquipTotemInSlot(enhancements, selectedTotemCandidate.id, totemSlot)
      ? selectedTotemCandidate
      : filteredTotems[0];
  const selection = currentTotem ?? {
    itemId: totemCandidate?.id ?? "",
    rank: 3,
    virtue: "courage" as VirtueId,
    variant: "universal" as const,
  };
  const effectValues = totemCandidate
    ? getTotemRankValues(
        { ...selection, itemId: totemCandidate.id },
        totemCandidate.rankValues,
        totemCandidate.gripRankValues,
      )
    : [];

  const setRune = (rune: Rune | null, rank = 3) => {
    const next = {
      ...enhancements,
      rune: rune ? { itemId: rune.id, rank: rank as 0 | 1 | 2 | 3 } : null,
      totems: [...enhancements.totems] as WeaponEnhancements["totems"],
    };
    if (!rune) next.totems[3] = null;
    onChange(next);
  };
  const setTotem = (totem: Totem, nextSelection: TotemSelection) => {
    if (!canEquipTotemInSlot(enhancements, totem.id, totemSlot)) return;

    const totems = [...enhancements.totems] as WeaponEnhancements["totems"];
    totems[totemSlot] = { ...nextSelection, itemId: totem.id };
    onChange({ ...enhancements, totems });
  };
  const navigate = (
    nextTab: "weapon" | "arts" | "rune" | "totems",
    nextTotemSlot?: number,
  ) => {
    if (nextTab === "totems" && nextTotemSlot !== undefined) {
      setTotemSlot(nextTotemSlot);
      const equipped = enhancements.totems[nextTotemSlot];
      if (equipped) setTotemCandidateId(equipped.itemId);
    }
    onTabChange(nextTab, nextTotemSlot);
  };
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
        aria-labelledby="enhancement-picker-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className={PICKER_LAYOUT_CLASS_NAMES.panelContent}>
          <header className={PICKER_LAYOUT_CLASS_NAMES.headerWeapon}>
          <h2
            className={PICKER_LAYOUT_CLASS_NAMES.headerTitleWeapon}
            id="enhancement-picker-title"
          >
            {weaponSlotMeta[slot].label}
          </h2>
          <BuilderWeaponLoadoutHud
            slot={slot}
            build={build}
            active={tab}
            activeTotemSlot={totemSlot}
            inline
            onNavigate={navigate}
          />
          <IllustratedCloseButton
            onClick={onClose}
            aria-label="Close weapon configuration"
          />
        </header>
        <BuilderPickerTabs active={tab} onChange={navigate} />
        {tab === "arts" ? (
          <div className={PICKER_LAYOUT_CLASS_NAMES.bodyDetail}>
            <div className="col-span-full min-w-0 overflow-y-auto p-4 max-tablet:p-2">
              <CombatArtsModule
                build={build}
                slots={[slot]}
                onAllocationChange={onArtAllocationChange}
                onReset={onResetArtAllocation}
              />
            </div>
          </div>
        ) : tab === "rune" ? (
          <div className={PICKER_LAYOUT_CLASS_NAMES.bodyDetail}>
            <aside className={PICKER_LAYOUT_CLASS_NAMES.catalogueColumn}>
              <div
                className={WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.compatibility}
              >
                <small
                  className={
                    WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.compatibilityLabel
                  }
                >
                  Compatible with
                </small>
                <strong
                  className={
                    WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.compatibilityValue
                  }
                >
                  {weapon?.combatArt ?? "Select a weapon"}
                </strong>
              </div>
              <div
                className={PICKER_LAYOUT_CLASS_NAMES.itemList}
                role="listbox"
                aria-label="Runes"
              >
                {compatibleRunes.map((rune) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={runeCandidate?.id === rune.id}
                    className={
                      PICKER_LAYOUT_CLASS_NAMES[
                        runeCandidate?.id === rune.id
                          ? "itemRowCandidate"
                          : "itemRowDefault"
                      ]
                    }
                    onClick={() => setRuneCandidateId(rune.id)}
                    key={rune.id}
                  >
                    <span className={PICKER_LAYOUT_CLASS_NAMES.itemMark}>
                      {rune.image ? (
                        <Image
                          src={rune.image.thumbnailUrl}
                          alt=""
                          width={48}
                          height={48}
                          unoptimized
                        />
                      ) : (
                        "ᚱ"
                      )}
                    </span>
                    <span className={PICKER_LAYOUT_CLASS_NAMES.itemCopy}>
                      <strong className={PICKER_LAYOUT_CLASS_NAMES.itemName}>
                        {getRuneDisplayName(rune)}
                      </strong>
                      <small className={PICKER_LAYOUT_CLASS_NAMES.itemMeta}>
                        {rune.addedSlot
                          ? `Unlocks ${virtueMeta[rune.addedSlot].label} slot`
                          : rune.weaponArt}
                      </small>
                    </span>
                    {rune.id === currentRune?.id ? (
                      <span className={PICKER_LAYOUT_CLASS_NAMES.equippedChip}>
                        Equipped
                      </span>
                    ) : null}
                  </button>
                ))}
                {!compatibleRunes.length ? (
                  <div className={PICKER_LAYOUT_CLASS_NAMES.empty}>
                    <strong className={PICKER_LAYOUT_CLASS_NAMES.emptyTitle}>
                      No compatible Runes
                    </strong>
                    <span>Choose a weapon first.</span>
                  </div>
                ) : null}
              </div>
            </aside>
            <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonColumn}>
              {runeCandidate ? (
                <>
                  <div
                    className={
                      PICKER_LAYOUT_CLASS_NAMES.comparisonHeading
                    }
                  >
                    <span className={PICKER_LAYOUT_CLASS_NAMES.candidateArt}>
                      {runeCandidate.image ? (
                        <Image
                          src={runeCandidate.image.thumbnailUrl}
                          alt=""
                          className="size-28 object-contain drop-shadow-art-strong"
                          width={112}
                          height={112}
                          unoptimized
                        />
                      ) : (
                        "ᚱ"
                      )}
                    </span>
                    <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonCopy}>
                      <small>{runeCandidate.weaponArt} Rune</small>
                      <h3
                        className={PICKER_LAYOUT_CLASS_NAMES.comparisonTitle}
                      >
                        {getRuneDisplayName(runeCandidate)}
                      </h3>
                      <p className={PICKER_LAYOUT_CLASS_NAMES.comparisonMeta}>
                        {runeCandidate.maxRankDescription}
                      </p>
                      <a
                        className={PICKER_LAYOUT_CLASS_NAMES.externalLink}
                        href={runeCandidate.pageUrl}
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
                  <p
                    className={
                      WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.description
                    }
                  >
                    {runeCandidate.functionality}
                  </p>
                  <div
                    className={WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.rankRow}
                  >
                    <span
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.rankLabel
                      }
                    >
                      Rune Rank
                    </span>
                    <div
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.rankButtons
                      }
                    >
                      {[0, 1, 2, 3].map((rank) => (
                        <button
                          type="button"
                          className={
                            currentRune?.id === runeCandidate.id &&
                            enhancements.rune?.rank === rank
                              ? WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES
                                  .rankButton.active
                              : WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES
                                  .rankButton.inactive
                          }
                          onClick={() => setRune(runeCandidate, rank)}
                          key={rank}
                        >
                          {rank}
                        </button>
                      ))}
                    </div>
                  </div>
                  <section
                    className={WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.effectCard}
                  >
                    <small
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.effectLabel
                      }
                    >
                      Rune Effect
                    </small>
                    <strong
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.effectValue
                      }
                    >
                      {runeCandidate.stats[0]?.effect}
                    </strong>
                    <span
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.effectDetail
                      }
                    >
                      {runeCandidate.stats[0]?.ranks.join(" · ")}
                    </span>
                  </section>
                  <div className={PICKER_LAYOUT_CLASS_NAMES.actions}>
                    <button
                      type="button"
                      className={ACTION_BUTTON_CLASS_NAMES.pickerQuiet}
                      onClick={() => setRune(null)}
                      disabled={!currentRune}
                    >
                      Clear Rune
                    </button>
                    <button
                      type="button"
                      className={ACTION_BUTTON_CLASS_NAMES.pickerPrimary}
                      onClick={() => {
                        setRune(runeCandidate);
                        navigate("totems", 0);
                      }}
                    >
                      Equip &amp; Choose Totems
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={PICKER_LAYOUT_CLASS_NAMES.bodyDetail}>
            <aside className={PICKER_LAYOUT_CLASS_NAMES.catalogueColumn}>
              <div
                className={WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.totemTabs}
                aria-label="Totem slots"
              >
                {enhancements.totems.map((totem, index) => {
                  const slotVirtue = getTotemSlotVirtue(index, currentRune);
                  return (
                    <button
                      type="button"
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.totemSlot[
                          totemSlot === index ? "active" : "inactive"
                        ][slotVirtue ?? "neutral"][
                          index === 3 && !enhancements.rune
                            ? "locked"
                            : "unlocked"
                        ]
                      }
                      onClick={() => {
                        setTotemSlot(index);
                        if (totem) setTotemCandidateId(totem.itemId);
                      }}
                      disabled={index === 3 && !enhancements.rune}
                      key={index}
                    >
                      {index + 1}
                      {totem ? (
                        <span
                          className={
                            WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.totemSlotMarker
                          }
                          aria-hidden="true"
                        >
                          •
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <BuilderCatalogueContextMenu
                idPrefix={`${slot}-totem-catalogue`}
                search={
                  <BuilderExpandableSearch
                    value={query}
                    onChange={setQuery}
                    label="Search Totems"
                    placeholder={`Search ${totemCatalogue.length} Totems`}
                  />
                }
                activeFilterCount={[animal, enhances].filter(
                  (value) => value !== "all",
                ).length}
                filteredCount={filteredTotems.length}
                totalCount={totemCatalogue.length}
                onClearFilters={() => {
                  setAnimal("all");
                  setEnhances("all");
                }}
                filters={
                  <div
                    className={WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.filterRow}
                  >
                    <NightfoldSelect
                      value={animal}
                      onChange={setAnimal}
                      ariaLabel="Filter Totems by animal"
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.filterSelect
                      }
                      options={[
                        { value: "all", label: "All animals" },
                        ...animalOptions.map((option) => ({
                          value: option,
                          label: option,
                        })),
                      ]}
                    />
                    <NightfoldSelect
                      value={enhances}
                      onChange={setEnhances}
                      ariaLabel="Filter Totems by effect"
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.filterSelect
                      }
                      options={[
                        { value: "all", label: "All effects" },
                        ...enhanceOptions.map((option) => ({
                          value: option,
                          label: option,
                        })),
                      ]}
                    />
                  </div>
                }
              />
              <div
                className={PICKER_LAYOUT_CLASS_NAMES.itemList}
                role="listbox"
                aria-label="Totems"
              >
                {filteredTotems.map((totem) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={totemCandidate?.id === totem.id}
                    className={
                      PICKER_LAYOUT_CLASS_NAMES[
                        totemCandidate?.id === totem.id
                          ? "itemRowCandidate"
                          : "itemRowDefault"
                      ]
                    }
                    onClick={() => setTotemCandidateId(totem.id)}
                    key={totem.id}
                  >
                    <span className={PICKER_LAYOUT_CLASS_NAMES.itemMark}>
                      {totem.image ? (
                        <Image
                          src={totem.image.thumbnailUrl}
                          alt=""
                          width={48}
                          height={48}
                          unoptimized
                        />
                      ) : (
                        "◇"
                      )}
                    </span>
                    <span className={PICKER_LAYOUT_CLASS_NAMES.itemCopy}>
                      <strong className={PICKER_LAYOUT_CLASS_NAMES.itemName}>
                        {totem.name}
                      </strong>
                      <small className={PICKER_LAYOUT_CLASS_NAMES.itemMeta}>
                        {totem.animal} · {totem.enhances}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </aside>
            <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonColumn}>
              {totemCandidate ? (
                <>
                  <div
                    className={
                      PICKER_LAYOUT_CLASS_NAMES.comparisonHeading
                    }
                  >
                    <span className={PICKER_LAYOUT_CLASS_NAMES.candidateArt}>
                      {totemCandidate.image ? (
                        <Image
                          src={totemCandidate.image.thumbnailUrl}
                          alt=""
                          className="size-28 object-contain drop-shadow-art-strong"
                          width={112}
                          height={112}
                          unoptimized
                        />
                      ) : (
                        "◇"
                      )}
                    </span>
                    <div className={PICKER_LAYOUT_CLASS_NAMES.comparisonCopy}>
                      <small>{totemCandidate.animal} Totem</small>
                      <h3
                        className={PICKER_LAYOUT_CLASS_NAMES.comparisonTitle}
                      >
                        {totemCandidate.name}
                      </h3>
                      <p className={PICKER_LAYOUT_CLASS_NAMES.comparisonMeta}>
                        {totemCandidate.enhances}
                      </p>
                      <a
                        className={PICKER_LAYOUT_CLASS_NAMES.externalLink}
                        href={totemCandidate.pageUrl}
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
                  <p
                    className={
                      WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.description
                    }
                  >
                    {totemCandidate.description}
                  </p>
                  <div
                    className={WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.configGrid}
                  >
                    <div
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.configLabel
                      }
                    >
                      <span>Rank</span>
                      <NightfoldSelect
                        value={String(selection.rank)}
                        ariaLabel="Totem rank"
                        className={
                          WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.configSelect
                        }
                        onChange={(value) =>
                          setTotem(totemCandidate, {
                            ...selection,
                            itemId: totemCandidate.id,
                            rank: Number(value) as 0 | 1 | 2 | 3,
                          })
                        }
                        options={[0, 1, 2, 3].map((rank) => ({
                          value: String(rank),
                          label: String(rank),
                        }))}
                      />
                    </div>
                    <div
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.configLabel
                      }
                    >
                      <span>Attunement</span>
                      <NightfoldSelect
                        value={selection.virtue}
                        ariaLabel="Totem attunement"
                        className={
                          WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.configSelect
                        }
                        onChange={(value) =>
                          setTotem(totemCandidate, {
                            ...selection,
                            itemId: totemCandidate.id,
                            virtue: value as VirtueId,
                          })
                        }
                        options={VIRTUE_IDS.map((virtue) => ({
                          value: virtue,
                          label: virtueMeta[virtue].label,
                        }))}
                      />
                    </div>
                    <div
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.configLabel
                      }
                    >
                      <span>Variant</span>
                      <NightfoldSelect
                        value={selection.variant}
                        ariaLabel="Totem variant"
                        className={
                          WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.configSelect
                        }
                        onChange={(value) =>
                          setTotem(totemCandidate, {
                            ...selection,
                            itemId: totemCandidate.id,
                            variant: value as
                              | "universal"
                              | "combatArt",
                          })
                        }
                        options={[
                          { value: "universal", label: "Universal" },
                          {
                            value: "combatArt",
                            label: weapon?.combatArt ?? "Combat Art",
                          },
                        ]}
                      />
                    </div>
                  </div>
                  <section
                    className={WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.effectCard}
                  >
                    <small
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.effectLabel
                      }
                    >
                      Active at Rank {selection.rank}
                    </small>
                    <strong
                      className={
                        WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.effectValue
                      }
                    >
                      {formatTotemEffect(totemCandidate.effect, effectValues)}
                    </strong>
                    {selection.variant === "combatArt" &&
                    totemCandidate.hasUnknownGripValues &&
                    effectValues.includes(null) ? (
                      <span
                        className={
                          WEAPON_ENHANCEMENT_PICKER_CLASS_NAMES.effectDetail
                        }
                      >
                        Some grip-specific values are not yet published.
                      </span>
                    ) : null}
                  </section>
                  <div className={PICKER_LAYOUT_CLASS_NAMES.actions}>
                    <button
                      type="button"
                      className={ACTION_BUTTON_CLASS_NAMES.pickerQuiet}
                      disabled={!currentTotem}
                      onClick={() => {
                        const totems = [
                          ...enhancements.totems,
                        ] as WeaponEnhancements["totems"];
                        totems[totemSlot] = null;
                        onChange({ ...enhancements, totems });
                      }}
                    >
                      Clear Slot
                    </button>
                    <button
                      type="button"
                      className={ACTION_BUTTON_CLASS_NAMES.pickerPrimary}
                      onClick={() => {
                        setTotem(totemCandidate, {
                          ...selection,
                          itemId: totemCandidate.id,
                        });
                        const nextSlot =
                          totemSlot < 3 &&
                          (totemSlot < 2 || enhancements.rune)
                            ? totemSlot + 1
                            : undefined;
                        if (nextSlot === undefined) {
                          onClose();
                        } else {
                          navigate("totems", nextSlot);
                        }
                      }}
                    >
                      {totemSlot < 3 &&
                      (totemSlot < 2 || enhancements.rune)
                        ? "Equip & Continue"
                        : "Equip & Finish"}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
          )}
        </div>
      </section>
    </div>
  );
}
