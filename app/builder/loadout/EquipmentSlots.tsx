"use client";

import Image from "next/image";
import { getRuneDisplayName, runeById } from "@/src/data/runes";
import { totemById } from "@/src/data/totems";
import { getTotemSlotVirtue } from "@/src/domain/enchantments";
import {
  DEFENSE_IDS,
  VIRTUE_IDS,
  type ArmorItem,
  type ArmorSlot,
  type ItemContribution,
  type SoulframeBuild,
  type Talisman,
  type Weapon,
  type WeaponEnhancements,
  type WeaponHandSlot,
} from "@/src/domain/types";
import {
  ArmorArtwork,
  TalismanArtwork,
  WeaponArtwork,
} from "../components/primitives";
import {
  VIRTUE_PIP_CLASS_NAMES,
  VIRTUE_PIP_IMAGE_CLASS_NAME,
} from "../components/virtuePipClassNames";
import { RopeFrame } from "../components/RopeFrame";
import {
  defenseMeta,
  slotMeta,
  virtueMeta,
  weaponSlotMeta,
} from "../constants";
import { formatTalismanSummary, talismanModifiers } from "../lib/talisman";
import {
  ENCHANTMENT_SOCKET_CLASS_NAMES,
  ENCHANTMENT_SOCKET_FALLBACK_CLASS_NAMES,
  ENCHANTMENT_SOCKET_IMAGE_CLASS_NAMES,
  EQUIPMENT_SLOT_ART_CLASS_NAMES,
  EQUIPMENT_SLOT_CLASS_NAMES,
  EQUIPMENT_SLOT_COPY_CLASS_NAME,
  EQUIPMENT_SLOT_DEFENSE_ICON_CLASS_NAME,
  EQUIPMENT_SLOT_DEFENSE_STAT_CLASS_NAME,
  EQUIPMENT_SLOT_DEFENSE_STATS_CLASS_NAME,
  EQUIPMENT_SLOT_DEFENSE_VALUE_CLASS_NAME,
  EQUIPMENT_SLOT_ENCHANTMENT_STRIP_CLASS_NAME,
  EQUIPMENT_SLOT_LABEL_CLASS_NAME,
  EQUIPMENT_SLOT_NAME_CLASS_NAME,
  EQUIPMENT_SLOT_TALISMAN_SUMMARY_CLASS_NAME,
  EQUIPMENT_SLOT_TALISMAN_STAT_CLASS_NAME,
  EQUIPMENT_SLOT_TALISMAN_STAT_FALLBACK_CLASS_NAME,
  EQUIPMENT_SLOT_TALISMAN_STAT_ICON_FRAME_CLASS_NAME,
  EQUIPMENT_SLOT_TALISMAN_STAT_ICON_CLASS_NAME,
  EQUIPMENT_SLOT_TALISMAN_STAT_VALUE_CLASS_NAME,
  EQUIPMENT_SLOT_STANDARD_BOTTOM_PADDING_CLASS_NAME,
  EQUIPMENT_SLOT_STANDARD_FOOTER_CLASS_NAMES,
  EQUIPMENT_SLOT_REQUIREMENT_CLASS_NAMES,
  EQUIPMENT_SLOT_REQUIREMENT_EMPTY_CLASS_NAME,
  EQUIPMENT_SLOT_REQUIREMENT_ICON_CLASS_NAME,
  EQUIPMENT_SLOT_WEAPON_MAIN_CLASS_NAME,
  EQUIPMENT_SLOT_WEAPON_SUMMARY_DEFAULT_CLASS_NAME,
  EQUIPMENT_SLOT_WEAPON_SUMMARY_MOBILE_CLASS_NAME,
  type EquipmentSlotVisualState,
} from "./equipmentSlotsClassNames";

function EquipmentSlotDecoration({ state }: { state: EquipmentSlotVisualState }) {
  return (
    <RopeFrame appearance={state === "active" ? "active" : "interactive"} />
  );
}

export function EquipmentSlot({
  slot,
  item,
  contribution,
  virtues,
  isActive,
  onOpen,
}: {
  slot: ArmorSlot;
  item?: ArmorItem;
  contribution?: ItemContribution;
  virtues: SoulframeBuild["virtues"];
  isActive: boolean;
  onOpen: () => void;
}) {
  const meta = slotMeta[slot];
  const slotState = isActive ? "active" : "default";
  const fillState = item ? "filled" : "empty";
  const requirementSummary =
    item?.requirement && contribution
      ? ` Requires ${item.requirement.value} ${
          virtueMeta[item.requirement.virtue].label
        }; current ${virtues[item.requirement.virtue]}; ${
          contribution.requirementMet ? "met" : "unmet"
        }.`
      : item
        ? " No virtue requirement."
        : "";
  const defenseSummary = contribution
    ? ` Physical defense ${contribution.defenses.physicalDefense.total}, magick defense ${contribution.defenses.magickDefense.total}, stability increase ${contribution.defenses.stabilityIncrease.total}; ${contribution.total} total defense.`
    : "";

  return (
    <button
      type="button"
      className={`${EQUIPMENT_SLOT_CLASS_NAMES[slot][slotState]} ${EQUIPMENT_SLOT_STANDARD_BOTTOM_PADDING_CLASS_NAME}`}
      onClick={onOpen}
      aria-expanded={isActive}
      aria-haspopup="dialog"
      aria-label={`${meta.label}: ${
        item?.name ?? "empty"
      }.${defenseSummary}${requirementSummary} Change item.`}
    >
      <EquipmentSlotDecoration state={slotState} />
      <span
        className={EQUIPMENT_SLOT_ART_CLASS_NAMES.standard[fillState]}
        aria-hidden="true"
      >
        <ArmorArtwork
          key={item?.id ?? `${slot}-empty`}
          item={item}
          appearance="default"
          fallback={meta.index}
          sizes="(max-width: 680px) 58px, 78px"
        />
      </span>
      <span className={EQUIPMENT_SLOT_COPY_CLASS_NAME}>
        <span className={EQUIPMENT_SLOT_LABEL_CLASS_NAME}>{meta.label}</span>
        <strong className={EQUIPMENT_SLOT_NAME_CLASS_NAME}>
          {item?.name ?? meta.prompt}
        </strong>
        {contribution ? (
          <span
            className={EQUIPMENT_SLOT_DEFENSE_STATS_CLASS_NAME}
            aria-hidden="true"
          >
            {DEFENSE_IDS.map((defense) => (
              <span
                className={EQUIPMENT_SLOT_DEFENSE_STAT_CLASS_NAME}
                title={defenseMeta[defense].label}
                key={defense}
              >
                <Image
                  className={EQUIPMENT_SLOT_DEFENSE_ICON_CLASS_NAME}
                  src={defenseMeta[defense].icon}
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                />
                <b className={EQUIPMENT_SLOT_DEFENSE_VALUE_CLASS_NAME}>
                  {contribution.defenses[defense].total}
                </b>
              </span>
            ))}
          </span>
        ) : null}
      </span>
      <span className={EQUIPMENT_SLOT_STANDARD_FOOTER_CLASS_NAMES.requirement}>
        {item?.requirement && contribution ? (
          <span
            className={
              EQUIPMENT_SLOT_REQUIREMENT_CLASS_NAMES[
                contribution.requirementMet ? "met" : "unmet"
              ]
            }
            aria-hidden="true"
          >
            <Image
              className={EQUIPMENT_SLOT_REQUIREMENT_ICON_CLASS_NAME}
              src={virtueMeta[item.requirement.virtue].icon}
              alt=""
              width={18}
              height={18}
              unoptimized
            />
            <span>
              {contribution.requirementMet
                ? `${item.requirement.value} required`
                : `${virtues[item.requirement.virtue]}/${item.requirement.value} requirement unmet`}
            </span>
          </span>
        ) : (
          <span className={EQUIPMENT_SLOT_REQUIREMENT_EMPTY_CLASS_NAME}>
            {item ? "No requirement" : "No armour selected"}
          </span>
        )}
      </span>
    </button>
  );
}

export function TalismanEquipmentSlot({
  item,
  isActive,
  onOpen,
}: {
  item?: Talisman;
  isActive: boolean;
  onOpen: () => void;
}) {
  const slotState = isActive ? "active" : "default";
  const fillState = item ? "filled" : "empty";
  const modifiers = item ? talismanModifiers(item).slice(0, 3) : [];

  return (
    <button
      type="button"
      className={`${EQUIPMENT_SLOT_CLASS_NAMES.talisman[slotState]} ${EQUIPMENT_SLOT_STANDARD_BOTTOM_PADDING_CLASS_NAME}`}
      onClick={onOpen}
      aria-expanded={isActive}
      aria-haspopup="dialog"
      aria-label={`Talisman: ${item?.name ?? "empty"}. ${
        item ? formatTalismanSummary(item) : "Choose a Talisman"
      }. Change item.`}
    >
      <EquipmentSlotDecoration state={slotState} />
      <span
        className={EQUIPMENT_SLOT_ART_CLASS_NAMES.standard[fillState]}
        aria-hidden="true"
      >
        <TalismanArtwork item={item} appearance="default" sizes="74px" />
      </span>
      <span className={EQUIPMENT_SLOT_COPY_CLASS_NAME}>
        <span className={EQUIPMENT_SLOT_LABEL_CLASS_NAME}>Talisman</span>
        <strong className={EQUIPMENT_SLOT_NAME_CLASS_NAME}>
          {item?.name ?? "Choose Talisman"}
        </strong>
      </span>
      <span className={EQUIPMENT_SLOT_STANDARD_FOOTER_CLASS_NAMES.talisman}>
        {item && modifiers.length > 0 ? (
          <span
            className={EQUIPMENT_SLOT_TALISMAN_SUMMARY_CLASS_NAME}
            aria-hidden="true"
          >
            {modifiers.map((modifier) => {
              const virtue = VIRTUE_IDS.find(
                (candidate) => candidate === modifier.id,
              );
              return (
                <span
                  className={EQUIPMENT_SLOT_TALISMAN_STAT_CLASS_NAME}
                  title={`${modifier.label} +${modifier.value}`}
                  key={modifier.id}
                >
                  {modifier.icon ? (
                    <span
                      className={
                        virtue
                          ? VIRTUE_PIP_CLASS_NAMES[virtue]
                          : EQUIPMENT_SLOT_TALISMAN_STAT_ICON_FRAME_CLASS_NAME
                      }
                      aria-hidden="true"
                    >
                      <Image
                        className={
                          virtue
                            ? VIRTUE_PIP_IMAGE_CLASS_NAME
                            : EQUIPMENT_SLOT_TALISMAN_STAT_ICON_CLASS_NAME
                        }
                        src={modifier.icon}
                        alt=""
                        width={18}
                        height={18}
                        unoptimized
                      />
                    </span>
                  ) : (
                    <span
                      className={
                        EQUIPMENT_SLOT_TALISMAN_STAT_FALLBACK_CLASS_NAME
                      }
                      aria-hidden="true"
                    >
                      {modifier.label.slice(0, 1)}
                    </span>
                  )}
                  <strong
                    className={EQUIPMENT_SLOT_TALISMAN_STAT_VALUE_CLASS_NAME}
                  >
                    +{modifier.value}
                  </strong>
                </span>
              );
            })}
          </span>
        ) : (
          <span className={EQUIPMENT_SLOT_REQUIREMENT_EMPTY_CLASS_NAME}>
            {item ? "No affinity pips" : "No talisman selected"}
          </span>
        )}
      </span>
    </button>
  );
}

export function WeaponEquipmentSlot({
  slot,
  item,
  enhancements,
  isActive,
  onOpenWeapon,
  onOpenRune,
  onOpenTotem,
}: {
  slot: WeaponHandSlot;
  item?: Weapon;
  enhancements: WeaponEnhancements;
  isActive: boolean;
  onOpenWeapon: () => void;
  onOpenRune: () => void;
  onOpenTotem: (index: number) => void;
}) {
  const meta = weaponSlotMeta[slot];
  const position = slot === "offHand" ? "weapon-1" : "weapon-2";
  const slotState = isActive ? "active" : "default";
  const fillState = item ? "filled" : "empty";
  const attack = item?.stats.level30.attack;
  const rune = enhancements.rune
    ? runeById.get(enhancements.rune.itemId)
    : undefined;
  const runeVirtue = rune?.addedSlot ?? "neutral";

  return (
    <div
      className={EQUIPMENT_SLOT_CLASS_NAMES[position][slotState]}
      aria-expanded={isActive}
    >
      <EquipmentSlotDecoration state={slotState} />
      <button
        type="button"
        className={EQUIPMENT_SLOT_WEAPON_MAIN_CLASS_NAME}
        onClick={onOpenWeapon}
        aria-haspopup="dialog"
        aria-label={`${meta.label}: ${item?.name ?? "empty"}. Change weapon.`}
      >
        <span
          className={EQUIPMENT_SLOT_ART_CLASS_NAMES.weapon[fillState]}
          aria-hidden="true"
        >
          <WeaponArtwork
            item={item}
            appearance="equipment"
            fallback={meta.index}
            sizes="(max-width: 680px) 58px, 78px"
          />
        </span>
        <span className={EQUIPMENT_SLOT_COPY_CLASS_NAME}>
          <span className={EQUIPMENT_SLOT_LABEL_CLASS_NAME}>{meta.label}</span>
          <strong className={EQUIPMENT_SLOT_NAME_CLASS_NAME}>
            {item?.name ?? meta.prompt}
          </strong>
          {item ? (
            <span
              className={EQUIPMENT_SLOT_WEAPON_SUMMARY_DEFAULT_CLASS_NAME}
            >
              {item.combatArt}
              {attack !== undefined ? ` · ${attack} attack` : ""}
            </span>
          ) : null}
          {item ? (
            <span
              className={EQUIPMENT_SLOT_WEAPON_SUMMARY_MOBILE_CLASS_NAME}
            >
              <span>
                {attack !== undefined ? `${attack} Attack` : "Attack —"}
              </span>
              <span>Smite {item.stats.smite.display || "—"}</span>
            </span>
          ) : null}
        </span>
      </button>
      <span
        className={EQUIPMENT_SLOT_ENCHANTMENT_STRIP_CLASS_NAME}
        aria-label="Weapon enhancements"
      >
        <button
          type="button"
          className={
            ENCHANTMENT_SOCKET_CLASS_NAMES.rune[runeVirtue].unlocked
          }
          onClick={onOpenRune}
          aria-label={rune ? `Rune: ${getRuneDisplayName(rune)}` : "Choose Rune"}
          title={rune ? getRuneDisplayName(rune) : "Choose Rune"}
          disabled={!item}
        >
          {rune?.image ? (
            <Image
              className={ENCHANTMENT_SOCKET_IMAGE_CLASS_NAMES.rune.filled}
              src={rune.image.thumbnailUrl}
              alt=""
              width={32}
              height={32}
              unoptimized
            />
          ) : (
            <span
              className={ENCHANTMENT_SOCKET_FALLBACK_CLASS_NAMES.rune.empty}
              aria-hidden="true"
            >
              ᚱ
            </span>
          )}
        </button>
        {enhancements.totems.map((selection, index) => {
          const totem = selection ? totemById.get(selection.itemId) : undefined;
          const isLocked = index === 3 && !rune;
          const slotVirtue = getTotemSlotVirtue(index, rune);
          const virtueState = slotVirtue ?? "neutral";
          const lockState = isLocked ? "locked" : "unlocked";

          return (
            <button
              type="button"
              className={
                ENCHANTMENT_SOCKET_CLASS_NAMES.totem[virtueState][lockState]
              }
              onClick={() => onOpenTotem(index)}
              aria-label={
                isLocked
                  ? "Fourth Totem slot requires a Rune"
                  : totem
                    ? `Totem ${index + 1}: ${totem.name}`
                    : `Choose Totem ${index + 1}`
              }
              title={
                isLocked
                  ? "Equip a Rune to unlock"
                  : totem?.name ?? `Choose Totem ${index + 1}`
              }
              disabled={!item || isLocked}
              key={index}
            >
              {totem?.image ? (
                <Image
                  className={ENCHANTMENT_SOCKET_IMAGE_CLASS_NAMES.totem.filled}
                  src={totem.image.thumbnailUrl}
                  alt=""
                  width={28}
                  height={28}
                  unoptimized
                />
              ) : (
                <span
                  className={
                    ENCHANTMENT_SOCKET_FALLBACK_CLASS_NAMES.totem.empty
                  }
                  aria-hidden="true"
                >
                  {isLocked ? "×" : "◇"}
                </span>
              )}
            </button>
          );
        })}
      </span>
    </div>
  );
}
