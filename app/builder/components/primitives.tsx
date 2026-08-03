"use client";

import { useState } from "react";
import Image from "next/image";
import { armorImageById } from "@/src/data/armor-images";
import { meetsArmorRequirement } from "@/src/domain/calculation";
import {
  VIRTUE_IDS,
  type ArmorItem,
  type SoulframeBuild,
  type Talisman,
  type VirtueValues,
  type Weapon,
} from "@/src/domain/types";
import { virtueMeta } from "../constants";
import { formatVirtueVector } from "../lib/formatters";
import {
  REQUIREMENT_BADGE_CLASS_NAMES,
  REQUIREMENT_BADGE_ICON_CLASS_NAME,
  REQUIREMENT_BADGE_UNMET_LABEL_CLASS_NAME,
  STAT_ICON_CLASS_NAMES,
  STAT_ICON_IMAGE_CLASS_NAME,
} from "./primitiveClassNames";
import { SCREEN_READER_ONLY_CLASS_NAME } from "./accessibilityClassNames";
import {
  ARMOR_ARTWORK_CLASS_NAMES,
  ARTWORK_FALLBACK_CLASS_NAME,
  TALISMAN_ARTWORK_CLASS_NAMES,
  WEAPON_ARTWORK_CLASS_NAMES,
  type ArmorArtworkAppearance,
  type TalismanArtworkAppearance,
  type WeaponArtworkAppearance,
} from "./artworkClassNames";
import {
  VIRTUE_PIP_CLASS_NAMES,
  VIRTUE_PIP_EMPTY_CLASS_NAME,
  VIRTUE_PIP_IMAGE_CLASS_NAME,
  VIRTUE_PIP_STRIP_CLASS_NAME,
} from "./virtuePipClassNames";

export function StatIcon({
  src,
  label,
  size = "regular",
  appearance = "default",
}: {
  src: string;
  label: string;
  size?: "small" | "regular" | "large";
  appearance?: "default" | "armorStat";
}) {
  return (
    <span
      className={
        appearance === "armorStat"
          ? STAT_ICON_CLASS_NAMES.armorStat
          : STAT_ICON_CLASS_NAMES[size]
      }
    >
      {/* The source workbook provides these six canonical icons. */}
      <Image
        className={STAT_ICON_IMAGE_CLASS_NAME}
        src={src}
        alt=""
        aria-hidden="true"
        height={50}
        width={50}
        unoptimized
      />
      <span className={SCREEN_READER_ONLY_CLASS_NAME}>{label}</span>
    </span>
  );
}

export function ArmorArtwork({
  item,
  fallback,
  preview = false,
  sizes,
  appearance = "default",
}: {
  item?: ArmorItem;
  fallback: string;
  preview?: boolean;
  sizes: string;
  appearance?: ArmorArtworkAppearance;
}) {
  const [failed, setFailed] = useState(false);
  const asset = item ? armorImageById.get(item.id) : undefined;

  if (!asset || failed) {
    return <span className={ARTWORK_FALLBACK_CLASS_NAME}>{fallback}</span>;
  }

  return (
    <Image
      className={ARMOR_ARTWORK_CLASS_NAMES[appearance]}
      src={preview ? asset.imageUrl : asset.thumbnailUrl}
      alt=""
      aria-hidden="true"
      width={preview ? asset.width : asset.thumbnailWidth}
      height={preview ? asset.height : asset.thumbnailHeight}
      sizes={sizes}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

export function TalismanArtwork({
  item,
  preview = false,
  sizes,
  appearance = "default",
}: {
  item?: Talisman;
  preview?: boolean;
  sizes: string;
  appearance?: TalismanArtworkAppearance;
}) {
  if (!item) {
    return <span className={ARTWORK_FALLBACK_CLASS_NAME}>IV</span>;
  }

  return (
    <Image
      className={TALISMAN_ARTWORK_CLASS_NAMES[appearance]}
      src={preview ? item.imageUrl : item.thumbnailUrl}
      alt=""
      aria-hidden="true"
      width={preview ? item.width : item.thumbnailWidth}
      height={preview ? item.height : item.thumbnailHeight}
      sizes={sizes}
      unoptimized
    />
  );
}

export function WeaponArtwork({
  item,
  preview = false,
  sizes,
  fallback,
  appearance = "default",
}: {
  item?: Weapon;
  preview?: boolean;
  sizes: string;
  fallback: string;
  appearance?: WeaponArtworkAppearance;
}) {
  if (!item) {
    return <span className={ARTWORK_FALLBACK_CLASS_NAME}>{fallback}</span>;
  }

  return (
    <Image
      className={WEAPON_ARTWORK_CLASS_NAMES[appearance]}
      src={preview ? item.imageUrl : item.thumbnailUrl}
      alt=""
      aria-hidden="true"
      width={preview ? item.width : item.thumbnailWidth}
      height={preview ? item.height : item.thumbnailHeight}
      sizes={sizes}
      unoptimized
    />
  );
}

export function VirtuePipStrip({
  values,
}: {
  values: VirtueValues;
}) {
  const pips = VIRTUE_IDS.flatMap((virtue) =>
    Array.from({ length: values[virtue] }, (_, index) => ({
      virtue,
      id: [virtue, index].join("-"),
    })),
  );

  return (
    <span
      className={VIRTUE_PIP_STRIP_CLASS_NAME}
      aria-label={formatVirtueVector(values) || "No pips"}
    >
      {pips.length ? (
        pips.map(({ virtue, id }) => (
          <span
            className={VIRTUE_PIP_CLASS_NAMES[virtue]}
            key={id}
            title={[virtueMeta[virtue].label, "pip"].join(" ")}
          >
            <Image
              className={VIRTUE_PIP_IMAGE_CLASS_NAME}
              src={virtueMeta[virtue].icon}
              alt=""
              width={18}
              height={18}
              unoptimized
            />
          </span>
        ))
      ) : (
        <span className={VIRTUE_PIP_EMPTY_CLASS_NAME}>—</span>
      )}
    </span>
  );
}

export function RequirementBadge({
  item,
  virtues,
  compact = false,
  placement = "default",
}: {
  item: ArmorItem;
  virtues: SoulframeBuild["virtues"];
  compact?: boolean;
  placement?: "default" | "heading";
}) {
  const requirement = item.requirement;

  if (!requirement) {
    return null;
  }

  const meta = virtueMeta[requirement.virtue];
  const met = meetsArmorRequirement(item, virtues);
  const current = virtues[requirement.virtue];
  const accessibleLabel = [
    "Requires ",
    requirement.value,
    " ",
    meta.label,
    "; current ",
    current,
    "; requirement ",
    met ? "met" : "unmet",
  ].join("");

  return (
    <span
      className={
        placement === "heading"
          ? met
            ? REQUIREMENT_BADGE_CLASS_NAMES.headingMet
            : REQUIREMENT_BADGE_CLASS_NAMES.headingUnmet
          : met
            ? REQUIREMENT_BADGE_CLASS_NAMES.defaultMet
            : REQUIREMENT_BADGE_CLASS_NAMES.defaultUnmet
      }
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      <Image
        className={REQUIREMENT_BADGE_ICON_CLASS_NAME}
        src={meta.icon}
        alt=""
        aria-hidden="true"
        width={18}
        height={18}
        unoptimized
      />
      <span>
        {compact
          ? [
              meta.label.slice(0, 1),
              " ",
              current,
              "/",
              requirement.value,
            ].join("")
          : ["Requires ", requirement.value, " ", meta.label].join("")}
      </span>
      {!met ? (
        <em className={REQUIREMENT_BADGE_UNMET_LABEL_CLASS_NAME}>Unmet</em>
      ) : null}
    </span>
  );
}
