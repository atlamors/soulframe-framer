"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { armorById, armorCatalogue } from "@/src/data/catalogue";
import { armorImageById } from "@/src/data/armor-images";
import {
  talismanById,
  talismanCatalogue,
} from "@/src/data/talismans";
import {
  calculateBuild,
  calculateItemContribution,
  meetsArmorRequirement,
} from "@/src/domain/calculation";
import {
  BUILD_SCHEMA_VERSION,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  deserializeBuild,
  parseStoredBuild,
  serializeBuild,
} from "@/src/domain/serialization";
import {
  MAX_VIRTUE_POINTS,
  distributeVirtueTotal,
  getVirtueAlignmentPoint,
  shiftVirtueAlignment,
  virtuesFromAlignmentPoint,
} from "@/src/domain/virtue-alignment";
import {
  ARMOR_SLOTS,
  DEFENSE_IDS,
  VIRTUE_IDS,
  type ArmorItem,
  type ArmorSlot,
  type DefenseId,
  type EquipmentSlot,
  type ItemContribution,
  type SoulframeBuild,
  type Talisman,
  type VirtueId,
  type VirtueValues,
} from "@/src/domain/types";

const DEFAULT_BUILD: SoulframeBuild = {
  schemaVersion: BUILD_SCHEMA_VERSION,
  name: "First Envoy",
  virtues: { courage: 12, spirit: 12, grace: 12 },
  equipment: {
    helm: "helm-arbearers-mask",
    cuirass: "cuirass-arbearers-pauncher",
    leggings: "leggings-arbearers-braes",
    talisman: "talisman-prelude-honour",
  },
};

const virtueMeta: Record<
  VirtueId,
  { label: string; icon: string; tone: string }
> = {
  courage: {
    label: "Courage",
    icon: "/icons/courage.png",
    tone: "ember",
  },
  spirit: {
    label: "Spirit",
    icon: "/icons/spirit.png",
    tone: "aether",
  },
  grace: {
    label: "Grace",
    icon: "/icons/grace.png",
    tone: "verdant",
  },
};

const defenseMeta: Record<
  DefenseId,
  { label: string; shortLabel: string; icon: string }
> = {
  physicalDefense: {
    label: "Physical Defense",
    shortLabel: "Physical",
    icon: "/icons/physical-defense.png",
  },
  magickDefense: {
    label: "Magick Defense",
    shortLabel: "Magick",
    icon: "/icons/magick-defense.png",
  },
  stabilityIncrease: {
    label: "Stability Increase",
    shortLabel: "Stability",
    icon: "/icons/stability-increase.png",
  },
};

const slotMeta: Record<
  ArmorSlot,
  { label: string; index: string; prompt: string }
> = {
  helm: { label: "Helm", index: "I", prompt: "Frame the crown" },
  cuirass: { label: "Cuirass", index: "II", prompt: "Frame the core" },
  leggings: { label: "Leggings", index: "III", prompt: "Frame the stride" },
};

const TRIQUETRA_VIEWBOX_SIZE = 512;
const TRIQUETRA_BOUNDS = {
  top: { x: 256, y: 42 },
  courage: { x: 32, y: 448 },
  grace: { x: 480, y: 448 },
} as const;
const TRIQUETRA_PATH = `
  M 252 24 L 262 26 L 276 40 L 276 44 L 288 52 L 316 98 L 310 130
  L 318 144 L 334 146 L 344 188 L 346 226 L 342 226 L 336 240
  L 342 254 L 390 284 L 400 296 L 406 298 L 406 306 L 412 316
  L 410 328 L 414 332 L 422 332 L 430 342 L 446 340 L 448 346
  L 454 348 L 458 364 L 468 378 L 492 396 L 492 410 L 498 412
  L 510 442 L 508 458 L 460 468 L 402 468 L 378 464 L 356 456
  L 346 456 L 342 450 L 332 448 L 312 438 L 306 430 L 278 418
  L 262 418 L 258 406 L 252 414 L 244 412 L 230 422 L 224 434
  L 220 434 L 216 440 L 148 464 L 114 470 L 64 470 L 20 464
  L 16 460 L 2 458 L 2 440 L 8 432 L 12 416 L 26 412 L 30 406
  L 32 392 L 36 392 L 40 382 L 50 374 L 54 350 L 62 346 L 64 338
  L 76 326 L 80 326 L 84 318 L 102 310 L 108 298 L 122 288
  L 122 284 L 134 280 L 138 272 L 148 270 L 164 258 L 166 230
  L 170 230 L 166 226 L 170 178 L 180 156 L 188 148 L 188 140
  L 196 136 L 196 100 L 214 68 L 222 64 L 226 52 L 252 24 Z
`;

function StatIcon({
  src,
  label,
  size = "regular",
}: {
  src: string;
  label: string;
  size?: "small" | "regular" | "large";
}) {
  return (
    <span className={`stat-icon stat-icon-${size}`}>
      {/* The source workbook provides these six canonical icons. */}
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        height={50}
        width={50}
        unoptimized
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function VirtueAlignment({
  virtues,
  bonuses,
  onChange,
}: {
  virtues: SoulframeBuild["virtues"];
  bonuses: VirtueValues;
  onChange: (virtues: VirtueValues) => void;
}) {
  const total = VIRTUE_IDS.reduce((sum, virtue) => sum + virtues[virtue], 0);
  const alignmentPoint = getVirtueAlignmentPoint(virtues);
  const dominant =
    total === 0
      ? undefined
      : VIRTUE_IDS.reduce((highest, virtue) =>
          virtues[virtue] > virtues[highest] ? virtue : highest,
        );
  const artX =
    TRIQUETRA_BOUNDS.courage.x +
    alignmentPoint.x *
      (TRIQUETRA_BOUNDS.grace.x - TRIQUETRA_BOUNDS.courage.x);
  const artY =
    TRIQUETRA_BOUNDS.top.y +
    alignmentPoint.y *
      (TRIQUETRA_BOUNDS.courage.y - TRIQUETRA_BOUNDS.top.y);
  const alignmentWeights =
    total === 0
      ? { courage: 1 / 3, spirit: 1 / 3, grace: 1 / 3 }
      : {
          courage: virtues.courage / total,
          spirit: virtues.spirit / total,
          grace: virtues.grace / total,
        };
  const fieldOpacity = (weight: number) => 0.08 + Math.sqrt(weight) * 0.82;
  const selectorColor = `rgb(${Math.round(
    230 * alignmentWeights.courage +
      72 * alignmentWeights.spirit +
      66 * alignmentWeights.grace,
  )} ${Math.round(
    95 * alignmentWeights.courage +
      226 * alignmentWeights.spirit +
      185 * alignmentWeights.grace,
  )} ${Math.round(
    61 * alignmentWeights.courage +
      121 * alignmentWeights.spirit +
      255 * alignmentWeights.grace,
  )})`;
  const figureStyle = {
    "--alignment-x": `${(artX / TRIQUETRA_VIEWBOX_SIZE) * 100}%`,
    "--alignment-y": `${(artY / TRIQUETRA_VIEWBOX_SIZE) * 100}%`,
  } as CSSProperties;
  const figureOrder: VirtueId[] = ["spirit", "courage", "grace"];

  const updateFromPointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const sourceX =
      ((event.clientX - bounds.left) / bounds.width) *
      TRIQUETRA_VIEWBOX_SIZE;
    const sourceY =
      ((event.clientY - bounds.top) / bounds.height) *
      TRIQUETRA_VIEWBOX_SIZE;
    const x =
      (sourceX - TRIQUETRA_BOUNDS.courage.x) /
      (TRIQUETRA_BOUNDS.grace.x - TRIQUETRA_BOUNDS.courage.x);
    const y =
      (sourceY - TRIQUETRA_BOUNDS.top.y) /
      (TRIQUETRA_BOUNDS.courage.y - TRIQUETRA_BOUNDS.top.y);
    onChange(virtuesFromAlignmentPoint(total, x, y));
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      updateFromPointer(event);
    }
  };

  const handleAlignmentKey = (event: ReactKeyboardEvent<SVGSVGElement>) => {
    const targetByKey: Partial<Record<string, VirtueId>> = {
      ArrowUp: "spirit",
      ArrowLeft: "courage",
      ArrowRight: "grace",
      c: "courage",
      C: "courage",
      s: "spirit",
      S: "spirit",
      g: "grace",
      G: "grace",
    };
    const target = targetByKey[event.key];
    if (!target) return;

    event.preventDefault();
    onChange(shiftVirtueAlignment(virtues, target));
  };

  return (
    <>
      <div className="virtue-alignment-figure" style={figureStyle}>
        <p className="sr-only" id="alignment-instructions">
          Drag or click within the triangle to distribute the total point pool.
          Use Arrow Up for Spirit, Arrow Left for Courage, or Arrow Right for
          Grace.
        </p>
        <div className="alignment-map">
          <div className="virtue-prism-stack">
            <Image
              className="virtue-prism-layer virtue-prism-unlit"
              src="/virtue-lith-unlit.png"
              alt=""
              aria-hidden="true"
              width={512}
              height={512}
              draggable={false}
              unoptimized
              priority
            />
            <svg
              className="virtue-prism-lighting"
              viewBox={`0 0 ${TRIQUETRA_VIEWBOX_SIZE} ${TRIQUETRA_VIEWBOX_SIZE}`}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <clipPath id="virtue-vector-clip">
                  <path d={TRIQUETRA_PATH} />
                </clipPath>
                <mask
                  id="virtue-stone-mask"
                  className="virtue-stone-alpha-mask"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width={TRIQUETRA_VIEWBOX_SIZE}
                  height={TRIQUETRA_VIEWBOX_SIZE}
                >
                  <image
                    href="/virtue-lith-unlit.png"
                    width={TRIQUETRA_VIEWBOX_SIZE}
                    height={TRIQUETRA_VIEWBOX_SIZE}
                  />
                </mask>
                <radialGradient
                  id="spirit-light"
                  gradientUnits="userSpaceOnUse"
                  cx={TRIQUETRA_BOUNDS.top.x}
                  cy="92"
                  r="300"
                >
                  <stop offset="0" stopColor="#b6ff9f" stopOpacity="1" />
                  <stop offset="0.24" stopColor="#55e66f" stopOpacity="0.96" />
                  <stop offset="0.58" stopColor="#32a95d" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#163b2e" stopOpacity="0" />
                </radialGradient>
                <radialGradient
                  id="courage-light"
                  gradientUnits="userSpaceOnUse"
                  cx={TRIQUETRA_BOUNDS.courage.x}
                  cy={TRIQUETRA_BOUNDS.courage.y}
                  r="330"
                >
                  <stop offset="0" stopColor="#ffd28f" stopOpacity="1" />
                  <stop offset="0.25" stopColor="#f06a42" stopOpacity="0.98" />
                  <stop offset="0.6" stopColor="#a93531" stopOpacity="0.52" />
                  <stop offset="1" stopColor="#451d22" stopOpacity="0" />
                </radialGradient>
                <radialGradient
                  id="grace-light"
                  gradientUnits="userSpaceOnUse"
                  cx={TRIQUETRA_BOUNDS.grace.x}
                  cy={TRIQUETRA_BOUNDS.grace.y}
                  r="330"
                >
                  <stop offset="0" stopColor="#d5fbff" stopOpacity="1" />
                  <stop offset="0.25" stopColor="#4fcaff" stopOpacity="0.98" />
                  <stop offset="0.6" stopColor="#2777c6" stopOpacity="0.54" />
                  <stop offset="1" stopColor="#172d55" stopOpacity="0" />
                </radialGradient>
                <radialGradient
                  id="selector-light"
                  gradientUnits="userSpaceOnUse"
                  cx={artX}
                  cy={artY}
                  r="112"
                >
                  <stop offset="0" stopColor="#fffce8" stopOpacity="1" />
                  <stop
                    offset="0.12"
                    stopColor={selectorColor}
                    stopOpacity="0.94"
                  />
                  <stop
                    offset="0.48"
                    stopColor={selectorColor}
                    stopOpacity="0.42"
                  />
                  <stop offset="1" stopColor={selectorColor} stopOpacity="0" />
                </radialGradient>
                <filter
                  id="virtue-bloom"
                  x="-35%"
                  y="-35%"
                  width="170%"
                  height="170%"
                >
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g
                clipPath="url(#virtue-vector-clip)"
                mask="url(#virtue-stone-mask)"
              >
                <rect
                  className="virtue-light-field"
                  width={TRIQUETRA_VIEWBOX_SIZE}
                  height={TRIQUETRA_VIEWBOX_SIZE}
                  fill="url(#spirit-light)"
                  opacity={fieldOpacity(alignmentWeights.spirit)}
                />
                <rect
                  className="virtue-light-field"
                  width={TRIQUETRA_VIEWBOX_SIZE}
                  height={TRIQUETRA_VIEWBOX_SIZE}
                  fill="url(#courage-light)"
                  opacity={fieldOpacity(alignmentWeights.courage)}
                />
                <rect
                  className="virtue-light-field"
                  width={TRIQUETRA_VIEWBOX_SIZE}
                  height={TRIQUETRA_VIEWBOX_SIZE}
                  fill="url(#grace-light)"
                  opacity={fieldOpacity(alignmentWeights.grace)}
                />
                <rect
                  className="virtue-selector-light"
                  width={TRIQUETRA_VIEWBOX_SIZE}
                  height={TRIQUETRA_VIEWBOX_SIZE}
                  fill="url(#selector-light)"
                  filter="url(#virtue-bloom)"
                />
              </g>
            </svg>
            <Image
              className="virtue-prism-layer virtue-prism-detail"
              src="/virtue-lith-unlit.png"
              alt=""
              aria-hidden="true"
              width={512}
              height={512}
              draggable={false}
              unoptimized
            />
            <svg
              className="virtue-prism-interaction"
              viewBox={`0 0 ${TRIQUETRA_VIEWBOX_SIZE} ${TRIQUETRA_VIEWBOX_SIZE}`}
              role="group"
              aria-roledescription="virtue alignment control"
              aria-describedby="alignment-instructions"
              aria-label={`Courage ${virtues.courage}, Spirit ${virtues.spirit}, Grace ${virtues.grace}`}
              tabIndex={0}
              onKeyDown={handleAlignmentKey}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
            >
              <path className="virtue-prism-hit-area" d={TRIQUETRA_PATH} />
            </svg>
            <span className="alignment-marker" aria-hidden="true">
              <i />
            </span>
          </div>
          {figureOrder.map((virtue) => {
            const meta = virtueMeta[virtue];
            const effective = virtues[virtue] + bonuses[virtue];
            return (
              <span
                className={`alignment-node alignment-node-${virtue} tone-${meta.tone}`}
                aria-hidden="true"
                key={virtue}
              >
                <StatIcon src={meta.icon} label={meta.label} size="small" />
                <span>
                  <small>{meta.label}</small>
                  <strong>{effective}</strong>
                  {bonuses[virtue] > 0 ? (
                    <em>
                      {virtues[virtue]} + {bonuses[virtue]}
                    </em>
                  ) : null}
                </span>
              </span>
            );
          })}
          <label className="alignment-total-control">
            <small>Total</small>
            <span>
              <input
                type="number"
                min="0"
                max={MAX_VIRTUE_POINTS}
                value={total}
                aria-label="Total virtue points"
                onChange={(event) =>
                  onChange(
                    distributeVirtueTotal(
                      Number(event.target.value),
                      virtues,
                    ),
                  )
                }
              />
              <em>points</em>
            </span>
          </label>
        </div>
        <span className="alignment-caption">
          {dominant ? `${virtueMeta[dominant].label} leaning` : "Unaligned"}
        </span>
      </div>
    </>
  );
}

function formatDelta(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function ArmorArtwork({
  item,
  fallback,
  preview = false,
  sizes,
}: {
  item?: ArmorItem;
  fallback: string;
  preview?: boolean;
  sizes: string;
}) {
  const [failed, setFailed] = useState(false);
  const asset = item ? armorImageById.get(item.id) : undefined;

  if (!asset || failed) {
    return <span className="armor-art-fallback">{fallback}</span>;
  }

  return (
    <Image
      className="armor-art-image"
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

function TalismanArtwork({
  item,
  preview = false,
  sizes,
}: {
  item?: Talisman;
  preview?: boolean;
  sizes: string;
}) {
  if (!item) {
    return <span className="armor-art-fallback">IV</span>;
  }

  return (
    <Image
      className="armor-art-image"
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

function talismanModifiers(item: Talisman) {
  const modifiers: Array<{
    id: string;
    label: string;
    value: number;
    icon: string;
  }> = [
    ...VIRTUE_IDS.flatMap((virtue) =>
      item.stats.virtues[virtue] > 0
        ? [
            {
              id: virtue,
              label: virtueMeta[virtue].label,
              value: item.stats.virtues[virtue],
              icon: virtueMeta[virtue].icon,
            },
          ]
        : [],
    ),
    ...DEFENSE_IDS.flatMap((defense) =>
      item.stats.defenses[defense] > 0
        ? [
            {
              id: defense,
              label: defenseMeta[defense].shortLabel,
              value: item.stats.defenses[defense],
              icon: defenseMeta[defense].icon,
            },
          ]
        : [],
    ),
  ];

  if (item.stats.attack > 0) {
    modifiers.push({
      id: "attack",
      label: "Attack",
      value: item.stats.attack,
      icon: "",
    });
  }
  if (item.stats.stagger > 0) {
    modifiers.push({
      id: "stagger",
      label: "Stagger",
      value: item.stats.stagger,
      icon: "",
    });
  }

  return modifiers;
}

function formatTalismanSummary(item: Talisman) {
  return talismanModifiers(item)
    .slice(0, 3)
    .map((modifier) => `+${modifier.value} ${modifier.label}`)
    .join(" · ");
}

function RequirementBadge({
  item,
  virtues,
  compact = false,
}: {
  item: ArmorItem;
  virtues: SoulframeBuild["virtues"];
  compact?: boolean;
}) {
  const requirement = item.requirement;

  if (!requirement) {
    return null;
  }

  const meta = virtueMeta[requirement.virtue];
  const met = meetsArmorRequirement(item, virtues);
  const current = virtues[requirement.virtue];
  const accessibleLabel = `Requires ${requirement.value} ${meta.label}; current ${current}; requirement ${
    met ? "met" : "unmet"
  }`;

  return (
    <span
      className={`requirement-badge tone-${meta.tone} ${
        met ? "requirement-met" : "requirement-unmet"
      }`}
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      <Image
        src={meta.icon}
        alt=""
        aria-hidden="true"
        width={18}
        height={18}
        unoptimized
      />
      <span>
        {compact
          ? `${meta.label.slice(0, 1)} ${current}/${requirement.value}`
          : `${requirement.value} ${meta.label}`}
      </span>
      {!met ? <em>Unmet</em> : null}
    </span>
  );
}

function EquipmentSlot({
  slot,
  item,
  contribution,
  virtues,
  onOpen,
}: {
  slot: ArmorSlot;
  item?: ArmorItem;
  contribution?: ItemContribution;
  virtues: SoulframeBuild["virtues"];
  onOpen: () => void;
}) {
  const meta = slotMeta[slot];
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
    ? ` ${contribution.total} total defense.`
    : "";

  return (
    <button
      type="button"
      className={`equipment-slot equipment-slot-${slot}`}
      onClick={onOpen}
      aria-label={`${meta.label}: ${
        item?.name ?? "empty"
      }.${defenseSummary}${requirementSummary} Change item.`}
    >
      <span className="slot-art" aria-hidden="true">
        <ArmorArtwork
          key={item?.id ?? `${slot}-empty`}
          item={item}
          fallback={meta.index}
          sizes="74px"
        />
      </span>
      <span className="slot-copy">
        <span className="slot-label">{meta.label}</span>
        <strong>{item?.name ?? meta.prompt}</strong>
        {contribution ? (
          <span className="slot-meta">{contribution.total}</span>
        ) : null}
        {item && contribution && !contribution.requirementMet ? (
          <RequirementBadge item={item} virtues={virtues} compact />
        ) : null}
      </span>
    </button>
  );
}

function TalismanEquipmentSlot({
  item,
  onOpen,
}: {
  item?: Talisman;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="equipment-slot equipment-slot-talisman"
      onClick={onOpen}
      aria-label={`Talisman: ${item?.name ?? "empty"}. ${
        item ? formatTalismanSummary(item) : "Choose a Talisman"
      }. Change item.`}
    >
      <span className="slot-art" aria-hidden="true">
        <TalismanArtwork item={item} sizes="74px" />
      </span>
      <span className="slot-copy">
        <span className="slot-label">Talisman</span>
        <strong>{item?.name ?? "Choose Talisman"}</strong>
        {item ? (
          <span className="slot-talisman-summary">
            {formatTalismanSummary(item)}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function WeaponEquipmentPlaceholder({ index }: { index: 1 | 2 }) {
  return (
    <div
      className={`equipment-slot equipment-slot-weapon-${index} equipment-slot-static`}
      aria-label={`Weapon ${index} slot. Coming soon.`}
    >
      <span className="slot-art weapon-placeholder-art" aria-hidden="true">
        {index === 1 ? "I" : "II"}
      </span>
      <span className="slot-copy">
        <span className="slot-label">Weapon {index}</span>
        <strong>Coming soon</strong>
      </span>
    </div>
  );
}

function ItemStatDetails({
  item,
  contribution,
  comparison,
}: {
  item: ArmorItem;
  contribution: ItemContribution;
  comparison?: ItemContribution;
}) {
  return (
    <div className="item-stat-table">
      <div className="item-stat-head">
        <span>Defense</span>
        <span>Base</span>
        <span>Scaling</span>
        <span>Final</span>
        {comparison ? <span>Δ</span> : null}
      </div>
      {DEFENSE_IDS.map((defense) => {
        const profile = item.defenses[defense];
        const result = contribution.defenses[defense];
        const delta = comparison
          ? result.total - comparison.defenses[defense].total
          : undefined;
        return (
          <div className="item-stat-row" key={defense}>
            <span className="item-stat-name">
              <StatIcon
                src={defenseMeta[defense].icon}
                label={defenseMeta[defense].label}
                size="small"
              />
              <span>
                {defenseMeta[defense].shortLabel}
                <small>
                  C{profile.pips.courage} · S{profile.pips.spirit} · G
                  {profile.pips.grace}
                </small>
              </span>
            </span>
            <span>{result.base}</span>
            <span>+{result.scaling}</span>
            <strong>{result.total}</strong>
            {delta !== undefined ? (
              <span
                className={
                  delta > 0
                    ? "delta-positive"
                    : delta < 0
                      ? "delta-negative"
                      : "delta-neutral"
                }
              >
                {formatDelta(delta)}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ItemPicker({
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
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const compatibleItems = useMemo(
    () => armorCatalogue.filter((item) => item.slot === slot),
    [slot],
  );
  const currentItem = build.equipment[slot]
    ? armorById.get(build.equipment[slot]!)
    : undefined;
  const [candidateId, setCandidateId] = useState(
    currentItem?.id ?? compatibleItems[0]?.id,
  );
  const filteredItems = compatibleItems.filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const candidate =
    armorById.get(candidateId) ?? filteredItems[0] ?? compatibleItems[0];
  const buildCalculation = calculateBuild(
    build,
    armorCatalogue,
    talismanCatalogue,
  );
  const currentContribution = currentItem
    ? calculateItemContribution(currentItem, buildCalculation.effectiveVirtues)
    : undefined;
  const candidateContribution = candidate
    ? calculateItemContribution(
        candidate,
        buildCalculation.effectiveVirtues,
      )
    : undefined;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    searchRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(
        (element) =>
          !element.hasAttribute("hidden") && element.offsetParent !== null,
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="picker-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={panelRef}
        className="picker-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="picker-header">
          <div>
            <h2 id="picker-title">Choose {slotMeta[slot].label}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close item picker"
          >
            ×
          </button>
        </header>

        <div className="picker-body">
          <aside className="catalogue-column">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search compatible armor</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${compatibleItems.length} ${slotMeta[slot].label.toLowerCase()} options`}
              />
            </label>
            <div className="item-list" role="listbox" aria-label="Compatible armor">
              {filteredItems.map((item) => {
                const isCandidate = item.id === candidate?.id;
                const result = calculateItemContribution(
                  item,
                  buildCalculation.effectiveVirtues,
                );
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={isCandidate}
                    className={`item-list-row ${isCandidate ? "is-candidate" : ""}`}
                    key={item.id}
                    onClick={() => setCandidateId(item.id)}
                    onFocus={() => setCandidateId(item.id)}
                  >
                    <span className="item-list-mark" aria-hidden="true">
                      <ArmorArtwork
                        item={item}
                        fallback={slotMeta[slot].index}
                        sizes="44px"
                      />
                    </span>
                    <span>
                      <strong>{item.name}</strong>
                      <small>{result.total} defense</small>
                    </span>
                    <span className="item-list-side">
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
                      {item.id === currentItem?.id ? (
                        <span className="equipped-chip">Equipped</span>
                      ) : (
                        <span className="item-list-total">{result.total}</span>
                      )}
                    </span>
                  </button>
                );
              })}
              {filteredItems.length === 0 ? (
                <div className="empty-search">
                  <span>∅</span>
                  <strong>No armor found</strong>
                  <p>Try a shorter name or clear the search.</p>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="comparison-column">
            {candidate && candidateContribution ? (
              <>
                <div className="comparison-heading">
                  <span className="candidate-art" aria-hidden="true">
                    <ArmorArtwork
                      key={candidate.id}
                      item={candidate}
                      fallback={slotMeta[slot].index}
                      preview
                      sizes="112px"
                    />
                  </span>
                  <div>
                    <h3>{candidate.name}</h3>
                    <RequirementBadge
                      item={candidate}
                      virtues={buildCalculation.effectiveVirtues}
                    />
                  </div>
                </div>

                <ItemStatDetails
                  item={candidate}
                  contribution={candidateContribution}
                  comparison={currentContribution}
                />

                <div className="comparison-total">
                  <span>
                    <small>Candidate total</small>
                    <strong>{candidateContribution.total}</strong>
                  </span>
                  {currentContribution ? (
                    <span>
                      <small>Overall change</small>
                      <strong
                        className={
                          candidateContribution.total - currentContribution.total >
                          0
                            ? "delta-positive"
                            : candidateContribution.total -
                                  currentContribution.total <
                                0
                              ? "delta-negative"
                              : "delta-neutral"
                        }
                      >
                        {formatDelta(
                          candidateContribution.total -
                            currentContribution.total,
                        )}
                      </strong>
                    </span>
                  ) : null}
                </div>

                <div className="picker-actions">
                  {currentItem ? (
                    <button
                      type="button"
                      className="button button-quiet"
                      onClick={onUnequip}
                    >
                      Clear slot
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="button button-primary"
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
              <div className="empty-search">
                <span>∅</span>
                <strong>No candidate selected</strong>
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}

function TalismanPicker({
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
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    searchRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(
        (element) =>
          !element.hasAttribute("hidden") && element.offsetParent !== null,
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="picker-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={panelRef}
        className="picker-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="talisman-picker-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="picker-header">
          <h2 id="talisman-picker-title">Choose Talisman</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close Talisman picker"
          >
            ×
          </button>
        </header>

        <div className="picker-body">
          <aside className="catalogue-column">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search Talismans</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${talismanCatalogue.length} Talismans`}
              />
            </label>
            <div className="item-list" role="listbox" aria-label="Talismans">
              {filteredItems.map((item) => {
                const isCandidate = item.id === candidate?.id;

                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={isCandidate}
                    className={`item-list-row ${
                      isCandidate ? "is-candidate" : ""
                    }`}
                    key={item.id}
                    onClick={() => setCandidateId(item.id)}
                    onFocus={() => setCandidateId(item.id)}
                  >
                    <span className="item-list-mark" aria-hidden="true">
                      <TalismanArtwork item={item} sizes="44px" />
                    </span>
                    <span>
                      <strong>{item.name}</strong>
                      <small className="item-list-talisman-modifiers">
                        {formatTalismanSummary(item)}
                      </small>
                    </span>
                    <span className="item-list-side">
                      {item.id === currentItem?.id ? (
                        <span className="equipped-chip">Equipped</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
              {filteredItems.length === 0 ? (
                <div className="empty-search">
                  <strong>No Talismans found</strong>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="comparison-column">
            {candidate && candidateCalculation ? (
              <>
                <div className="comparison-heading">
                  <span className="candidate-art" aria-hidden="true">
                    <TalismanArtwork item={candidate} preview sizes="112px" />
                  </span>
                  <div>
                    <h3>{candidate.name}</h3>
                    <p>
                      {candidate.rarity} · {candidate.accessorySet}
                    </p>
                  </div>
                </div>

                <div className="modifier-grid" aria-label="Talisman modifiers">
                  {talismanModifiers(candidate).map((modifier) => (
                    <span className="modifier-chip" key={modifier.id}>
                      {modifier.icon ? (
                        <StatIcon
                          src={modifier.icon}
                          label={modifier.label}
                          size="small"
                        />
                      ) : null}
                      <span>
                        <small>{modifier.label}</small>
                        <strong>+{modifier.value}</strong>
                      </span>
                    </span>
                  ))}
                </div>

                <div className="effective-virtues">
                  {VIRTUE_IDS.map((virtue) => (
                    <span key={virtue}>
                      <small>{virtueMeta[virtue].label}</small>
                      <strong>
                        {candidateCalculation.effectiveVirtues[virtue]}
                      </strong>
                    </span>
                  ))}
                </div>

                <div className="talisman-defense-impact">
                  <span>Secondary defense impact</span>
                  <strong>
                    {formatDelta(
                      candidateCalculation.total - currentCalculation.total,
                    )}
                  </strong>
                  <small>Includes defense gained through virtue scaling</small>
                </div>

                {candidate.hasUnmodeledConditionalEffect ? (
                  <p className="conditional-note">
                    Encounter-dependent Cogah effect is not included.
                  </p>
                ) : null}

                <div className="picker-actions">
                  {currentItem ? (
                    <button
                      type="button"
                      className="button button-quiet"
                      onClick={onUnequip}
                    >
                      Clear
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="button button-primary"
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
      </section>
    </div>
  );
}

export function SoulframeBuilder() {
  const [build, setBuild] = useState<SoulframeBuild>(DEFAULT_BUILD);
  const [activeSlot, setActiveSlot] = useState<EquipmentSlot>();
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<string>();
  const calculation = useMemo(
    () => calculateBuild(build, armorCatalogue, talismanCatalogue),
    [build],
  );
  const unmetRequirementCount = calculation.items.filter(
    (item) => !item.requirementMet,
  ).length;
  const unmetRequirementGroups = VIRTUE_IDS.flatMap((virtue) => {
    const unmetItems = calculation.items.flatMap((contribution) => {
      if (contribution.requirementMet) return [];
      const item = armorById.get(contribution.itemId);
      return item?.requirement?.virtue === virtue ? [item] : [];
    });
    if (!unmetItems.length) return [];

    return [
      {
        virtue,
        itemCount: unmetItems.length,
        required: Math.max(
          ...unmetItems.map((item) => item.requirement?.value ?? 0),
        ),
      },
    ];
  });

  useEffect(() => {
    let nextBuild: SoulframeBuild | undefined;
    let nextNotice: string | undefined;
    const shared = new URLSearchParams(window.location.search).get("build");
    if (shared) {
      const result = deserializeBuild(shared, {
        armor: armorCatalogue,
        talismans: talismanCatalogue,
      });
      if (result.ok) {
        nextBuild = result.build;
        nextNotice =
          result.warnings.length
            ? `Shared build loaded. ${result.warnings.join(" ")}`
            : "Shared build loaded.";
      } else {
        nextNotice = `Shared build could not be loaded. ${result.error}`;
      }
    } else {
      const stored =
        window.localStorage.getItem(STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const result = parseStoredBuild(stored, {
          armor: armorCatalogue,
          talismans: talismanCatalogue,
        });
        if (result.ok) {
          nextBuild = result.build;
          if (result.warnings.length) nextNotice = result.warnings.join(" ");
        } else {
          nextNotice =
            "Saved build was invalid, so the default build was restored.";
        }
      }
    }

    const timer = window.setTimeout(() => {
      if (nextBuild) setBuild(nextBuild);
      if (nextNotice) setNotice(nextNotice);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [build, hydrated]);

  const updateVirtues = (virtues: VirtueValues) => {
    setBuild((current) => ({
      ...current,
      virtues,
    }));
  };

  const shareBuild = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("build", serializeBuild(build));
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("Build link copied to your clipboard.");
    } catch {
      window.history.replaceState({}, "", url);
      setNotice("Build link added to the address bar.");
    }
  };

  const resetBuild = () => {
    setBuild(DEFAULT_BUILD);
    setNotice("Default build restored.");
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#" aria-label="Soulframe Framer home">
          <span className="brand-mark" aria-hidden="true">
            SF
          </span>
          <span>
            <strong>Soulframe</strong>
            <em>Framer</em>
          </span>
        </a>
        <input
          className="build-name"
          value={build.name}
          maxLength={80}
          aria-label="Build name"
          onChange={(event) =>
            setBuild((current) => ({ ...current, name: event.target.value }))
          }
        />
        <div className="topbar-actions">
          <button type="button" className="button button-quiet" onClick={resetBuild}>
            Reset
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={shareBuild}
          >
            Copy build link
          </button>
        </div>
      </header>

      {notice ? (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(undefined)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="builder-workspace">
        <aside className="alignment-rail">
          <header className="workspace-heading">
            <span>Virtues</span>
            {calculation.talisman ? <small>Includes Talisman</small> : null}
          </header>
          <VirtueAlignment
            virtues={build.virtues}
            bonuses={
              calculation.talisman?.virtues ?? {
                courage: 0,
                spirit: 0,
                grace: 0,
              }
            }
            onChange={updateVirtues}
          />
        </aside>

        <div className="loadout-stage">
          <div className="stage-orbit stage-orbit-one" />
          <div className="stage-orbit stage-orbit-two" />
          <div
            className="character-focus"
            aria-label="Neutral character placeholder"
          >
            <div className="character-rune">SF</div>
            <div className="character-silhouette" aria-hidden="true">
              <span className="silhouette-head" />
              <span className="silhouette-body" />
              <span className="silhouette-leg silhouette-leg-left" />
              <span className="silhouette-leg silhouette-leg-right" />
            </div>
          </div>

          {ARMOR_SLOTS.map((slot) => {
            const itemId = build.equipment[slot];
            const item = itemId ? armorById.get(itemId) : undefined;
            const contribution = calculation.items.find(
              (entry) => entry.itemId === itemId,
            );
            return (
              <EquipmentSlot
                key={slot}
                slot={slot}
                item={item}
                contribution={contribution}
                virtues={calculation.effectiveVirtues}
                onOpen={() => setActiveSlot(slot)}
              />
            );
          })}

          <TalismanEquipmentSlot
            item={
              build.equipment.talisman
                ? talismanById.get(build.equipment.talisman)
                : undefined
            }
            onOpen={() => setActiveSlot("talisman")}
          />
          <WeaponEquipmentPlaceholder index={1} />
          <WeaponEquipmentPlaceholder index={2} />
        </div>

        <aside className="stats-rail">
          <header className="workspace-heading">
            <span>Build defense</span>
          </header>
          <div className="total-defense">
            <strong>{calculation.total}</strong>
            <span>Total defense</span>
          </div>

          {unmetRequirementCount > 0 ? (
            <div className="build-requirement-warning" role="status">
              <strong>
                {unmetRequirementCount} requirement
                {unmetRequirementCount === 1 ? "" : "s"} unmet
              </strong>
              {unmetRequirementGroups.map((group) => (
                <span key={group.virtue}>
                  {virtueMeta[group.virtue].label}{" "}
                  {calculation.effectiveVirtues[group.virtue]}/{group.required}
                  {" · "}
                  {group.itemCount} piece{group.itemCount === 1 ? "" : "s"}{" "}
                  base-only
                </span>
              ))}
            </div>
          ) : null}

          <div className="defense-list">
            {DEFENSE_IDS.map((defense) => (
              <div className="defense-row" key={defense}>
                <StatIcon
                  src={defenseMeta[defense].icon}
                  label={defenseMeta[defense].label}
                  size="regular"
                />
                <span>
                  <strong>{defenseMeta[defense].label}</strong>
                </span>
                <b>{calculation.defenses[defense]}</b>
              </div>
            ))}
          </div>

          {calculation.modifiers.attack > 0 ||
          calculation.modifiers.stagger > 0 ? (
            <div className="secondary-modifiers">
              {calculation.modifiers.attack > 0 ? (
                <span>
                  <small>Attack</small>
                  <strong>+{calculation.modifiers.attack}</strong>
                </span>
              ) : null}
              {calculation.modifiers.stagger > 0 ? (
                <span>
                  <small>Stagger</small>
                  <strong>+{calculation.modifiers.stagger}</strong>
                </span>
              ) : null}
            </div>
          ) : null}
        </aside>
      </section>

      <footer className="footer">
        <a href="https://wiki.avakot.org/Armour" target="_blank" rel="noreferrer">
          Sources ↗
        </a>
      </footer>

      {activeSlot && activeSlot !== "talisman" ? (
        <ItemPicker
          slot={activeSlot}
          build={build}
          onClose={() => setActiveSlot(undefined)}
          onEquip={(itemId) => {
            setBuild((current) => ({
              ...current,
              equipment: { ...current.equipment, [activeSlot]: itemId },
            }));
            setActiveSlot(undefined);
          }}
          onUnequip={() => {
            setBuild((current) => {
              const equipment = { ...current.equipment };
              delete equipment[activeSlot];
              return { ...current, equipment };
            });
            setActiveSlot(undefined);
          }}
        />
      ) : null}

      {activeSlot === "talisman" ? (
        <TalismanPicker
          build={build}
          onClose={() => setActiveSlot(undefined)}
          onEquip={(itemId) => {
            setBuild((current) => ({
              ...current,
              equipment: { ...current.equipment, talisman: itemId },
            }));
            setActiveSlot(undefined);
          }}
          onUnequip={() => {
            setBuild((current) => {
              const equipment = { ...current.equipment };
              delete equipment.talisman;
              return { ...current, equipment };
            });
            setActiveSlot(undefined);
          }}
        />
      ) : null}
    </main>
  );
}
