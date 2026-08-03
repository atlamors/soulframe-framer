"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getRuneDisplayName, runeById } from "@/src/data/runes";
import { totemById } from "@/src/data/totems";
import { weaponById } from "@/src/data/weapons";
import { getTotemSlotVirtue } from "@/src/domain/enchantments";
import type {
  SoulframeBuild,
  WeaponHandSlot,
} from "@/src/domain/types";
import { HUD_SUPPORTING_IMAGE_CLASS_NAMES } from "../components/artworkClassNames";
import { WeaponArtwork } from "../components/primitives";
import { weaponSlotMeta } from "../constants";
import {
  getLoadoutArtState,
  getLoadoutSegmentState,
  LOADOUT_HUD_ART_CLASS_NAMES,
  LOADOUT_HUD_CLASS_NAMES,
  LOADOUT_HUD_CONNECTOR_CLASS_NAMES,
  LOADOUT_HUD_COPY_CLASS_NAMES,
  LOADOUT_HUD_COPY_LABEL_CLASS_NAMES,
  LOADOUT_HUD_COPY_META_CLASS_NAMES,
  LOADOUT_HUD_COPY_STRONG_CLASS_NAMES,
  LOADOUT_HUD_RUNE_SEGMENT_CLASS_NAMES,
  LOADOUT_HUD_TOTEM_SEGMENT_CLASS_NAMES,
  LOADOUT_HUD_TOTEMS_CLASS_NAMES,
  LOADOUT_HUD_WEAPON_SEGMENT_CLASS_NAMES,
  WEAPON_LOADOUT_ROOT_CLASS_NAMES,
  WEAPON_LOADOUT_TRACK_CLASS_NAMES,
} from "./weaponLoadoutHudClassNames";

export function WeaponLoadoutHud({
  slot,
  build,
  active,
  activeTotemSlot = 0,
  inline = false,
  onNavigate,
}: {
  slot: WeaponHandSlot;
  build: SoulframeBuild;
  active: "weapon" | "arts" | "rune" | "totems";
  activeTotemSlot?: number;
  inline?: boolean;
  onNavigate: (
    tab: "weapon" | "arts" | "rune" | "totems",
    totemSlot?: number,
  ) => void;
}) {
  const weaponId = build.equipment[slot];
  const weapon = weaponId ? weaponById.get(weaponId) : undefined;
  const enhancements = build.weaponEnhancements[slot];
  const rune = enhancements.rune
    ? runeById.get(enhancements.rune.itemId)
    : undefined;
  const layout = inline ? "inline" : "default";
  const weaponActivity = active === "weapon" ? "active" : "inactive";
  const runeActivity = active === "rune" ? "active" : "inactive";
  const runeSegmentState = getLoadoutSegmentState(
    active === "rune",
    Boolean(rune),
    false,
  );
  const runeArtState = getLoadoutArtState(
    active === "rune",
    null,
  );

  return (
    <section
      className={WEAPON_LOADOUT_ROOT_CLASS_NAMES[layout]}
      aria-label={`Current ${weaponSlotMeta[slot].label} loadout`}
    >
      <div className={WEAPON_LOADOUT_TRACK_CLASS_NAMES[layout]}>
        <button
          type="button"
          className={
            LOADOUT_HUD_WEAPON_SEGMENT_CLASS_NAMES[layout][weaponActivity]
          }
          data-state={weaponActivity}
          onClick={() => onNavigate("weapon")}
          title={weapon?.name ?? "Choose a weapon"}
        >
          <span
            className={
              LOADOUT_HUD_ART_CLASS_NAMES[layout].weapon[weaponActivity]
            }
            aria-hidden="true"
          >
            {weaponActivity === "active" ? (
              <span
                className={LOADOUT_HUD_CLASS_NAMES.activeGlow}
                aria-hidden="true"
              />
            ) : null}
            <WeaponArtwork
              item={weapon}
              appearance={inline ? "hudInline" : "hud"}
              fallback={weaponSlotMeta[slot].index}
              sizes="52px"
            />
          </span>
          <span className={LOADOUT_HUD_COPY_CLASS_NAMES[layout].primary}>
            <small
              className={LOADOUT_HUD_COPY_LABEL_CLASS_NAMES[weaponActivity]}
            >
              Weapon
            </small>
            <strong
              className={
                LOADOUT_HUD_COPY_STRONG_CLASS_NAMES[layout][weaponActivity]
              }
            >
              {weapon?.name ?? "Unframed"}
            </strong>
            <em
              className={
                LOADOUT_HUD_COPY_META_CLASS_NAMES[layout][weaponActivity]
              }
            >
              {weapon?.combatArt ?? "Choose a weapon"}
            </em>
          </span>
        </button>
        <span
          className={LOADOUT_HUD_CONNECTOR_CLASS_NAMES[layout]}
          aria-hidden="true"
        >
          <ArrowRight className={LOADOUT_HUD_CLASS_NAMES.connectorIcon} />
        </span>
        <button
          type="button"
          className={
            LOADOUT_HUD_RUNE_SEGMENT_CLASS_NAMES[layout][runeSegmentState]
          }
          data-filled={Boolean(rune)}
          data-locked={false}
          data-state={runeActivity}
          data-virtue={rune?.addedSlot ?? "neutral"}
          onClick={() => onNavigate("rune")}
          disabled={!weapon}
          title={rune ? getRuneDisplayName(rune) : "Choose a Rune"}
        >
          <span
            className={
              LOADOUT_HUD_ART_CLASS_NAMES[layout].supporting[runeArtState]
            }
            aria-hidden="true"
          >
            {runeActivity === "active" ? (
              <span
                className={LOADOUT_HUD_CLASS_NAMES.activeGlow}
                aria-hidden="true"
              />
            ) : null}
            {rune?.image ? (
              <Image
                className={HUD_SUPPORTING_IMAGE_CLASS_NAMES[layout]}
                src={rune.image.thumbnailUrl}
                alt=""
                width={42}
                height={42}
                unoptimized
              />
            ) : (
              "ᚱ"
            )}
          </span>
          <span className={LOADOUT_HUD_COPY_CLASS_NAMES[layout].primary}>
            <small
              className={LOADOUT_HUD_COPY_LABEL_CLASS_NAMES[runeActivity]}
            >
              Rune
            </small>
            <strong
              className={
                LOADOUT_HUD_COPY_STRONG_CLASS_NAMES[layout][runeActivity]
              }
            >
              {rune ? getRuneDisplayName(rune) : "Empty"}
            </strong>
            <em
              className={
                LOADOUT_HUD_COPY_META_CLASS_NAMES[layout][runeActivity]
              }
            >
              {enhancements.rune ? `Rank ${enhancements.rune.rank}` : "Next"}
            </em>
          </span>
        </button>
        <span
          className={LOADOUT_HUD_CONNECTOR_CLASS_NAMES[layout]}
          aria-hidden="true"
        >
          <ArrowRight className={LOADOUT_HUD_CLASS_NAMES.connectorIcon} />
        </span>
        <div className={LOADOUT_HUD_TOTEMS_CLASS_NAMES[layout]}>
          {enhancements.totems.map((selection, index) => {
            const totem = selection
              ? totemById.get(selection.itemId)
              : undefined;
            const isLocked = index === 3 && !rune;
            const slotVirtue = getTotemSlotVirtue(index, rune);
            const isActive =
              active === "totems" && activeTotemSlot === index;
            const totemActivity = isActive ? "active" : "inactive";
            const totemSegmentState = getLoadoutSegmentState(
              isActive,
              Boolean(selection),
              isLocked,
            );
            const totemArtState = getLoadoutArtState(isActive, slotVirtue);
            return (
              <button
                type="button"
                className={
                  LOADOUT_HUD_TOTEM_SEGMENT_CLASS_NAMES[layout][
                    totemSegmentState
                  ]
                }
                data-filled={Boolean(selection)}
                data-locked={isLocked}
                data-state={totemActivity}
                data-virtue={slotVirtue ?? "neutral"}
                onClick={() => onNavigate("totems", index)}
                disabled={!weapon || isLocked}
                title={
                  isLocked
                    ? "Equip a Rune to unlock"
                    : totem?.name ?? `Choose Totem ${index + 1}`
                }
                key={index}
              >
                <span
                  className={
                    LOADOUT_HUD_ART_CLASS_NAMES[layout].supporting[
                      totemArtState
                    ]
                  }
                  aria-hidden="true"
                >
                  {isActive ? (
                    <span
                      className={LOADOUT_HUD_CLASS_NAMES.activeGlow}
                      aria-hidden="true"
                    />
                  ) : null}
                  {totem?.image ? (
                    <Image
                      className={HUD_SUPPORTING_IMAGE_CLASS_NAMES[layout]}
                      src={totem.image.thumbnailUrl}
                      alt=""
                      width={38}
                      height={38}
                      unoptimized
                    />
                  ) : (
                    <span>{isLocked ? "×" : index + 1}</span>
                  )}
                </span>
                <span className={LOADOUT_HUD_COPY_CLASS_NAMES[layout].totem}>
                  <small
                    className={
                      LOADOUT_HUD_COPY_LABEL_CLASS_NAMES[totemActivity]
                    }
                  >
                    Totem {index + 1}
                  </small>
                  <strong
                    className={
                      LOADOUT_HUD_COPY_STRONG_CLASS_NAMES[layout][
                        totemActivity
                      ]
                    }
                  >
                    {totem?.name ?? (isLocked ? "Locked" : "Empty")}
                  </strong>
                  <em
                    className={
                      LOADOUT_HUD_COPY_META_CLASS_NAMES[layout][totemActivity]
                    }
                  >
                    {selection
                      ? `Rank ${selection.rank}`
                      : index === 0
                        ? "Next"
                        : "—"}
                  </em>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
