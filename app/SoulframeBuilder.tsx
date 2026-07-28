"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  ArrowDownAZ,
  ArrowRight,
  ArrowUpAZ,
  ArrowUpDown,
  ChevronDown,
  ExternalLink,
  Gauge,
  Hammer,
  ListFilter,
  Sparkles,
  Sword,
} from "lucide-react";
import { armorById, armorCatalogue } from "@/src/data/catalogue";
import { armorDropById } from "@/src/data/armor-drops";
import { armorImageById } from "@/src/data/armor-images";
import {
  dropLocationMapAsset,
  dropLocationMapBySourceUrl,
  dropLocationMapCuratedIcons,
  type DropLocationMap,
} from "@/src/data/drop-location-maps";
import {
  talismanById,
  talismanCatalogue,
} from "@/src/data/talismans";
import {
  releasedWeaponCatalogue,
  weaponById,
  weaponCatalogue,
} from "@/src/data/weapons";
import { weaponDropById } from "@/src/data/weapon-drops";
import {
  calculateBuild,
  calculateItemContribution,
  meetsArmorRequirement,
} from "@/src/domain/calculation";
import {
  BUILD_SCHEMA_VERSION,
  LEGACY_STORAGE_KEYS,
  STORAGE_KEY,
  deserializeBuild,
  parseStoredBuild,
  serializeBuild,
} from "@/src/domain/serialization";
import {
  distributeVirtueTotal,
  getVirtueAlignmentPoint,
  shiftVirtueAlignment,
  virtuesFromAlignmentPoint,
} from "@/src/domain/virtue-alignment";
import {
  MAX_ENVOY_RANK,
  PACT_ART_BONUS_BY_RANK,
  getAllocatableAffinity,
} from "@/src/domain/affinity";
import {
  optimizeAffinityForArmor,
  optimizeArmorForAffinity,
  type AffinityOptimization,
  type ArmorOptimization,
} from "@/src/domain/optimization";
import {
  ARMOR_SLOTS,
  DEFENSE_IDS,
  VIRTUE_IDS,
  type AffinitySources,
  type ArmorItem,
  type ArmorSlot,
  type DefenseId,
  type EquipmentSlot,
  type ItemContribution,
  type PactArtRank,
  type SoulframeBuild,
  type Talisman,
  type Weapon,
  type WeaponHandSlot,
  type WeaponLevelStats,
  type VirtueId,
  type VirtueValues,
} from "@/src/domain/types";

const DEFAULT_BUILD: SoulframeBuild = {
  schemaVersion: BUILD_SCHEMA_VERSION,
  name: "First Envoy",
  virtues: { courage: 12, spirit: 11, grace: 11 },
  affinitySources: {
    envoyRank: 18,
    pactArts: { courage: 0, spirit: 0, grace: 0 },
    fables: { shewolf: null, wasteBear: null },
  },
  equipment: {
    helm: "helm-arbearers-mask",
    cuirass: "cuirass-arbearers-pauncher",
    leggings: "leggings-arbearers-braes",
    talisman: "talisman-prelude-honour",
    mainHand: "weapon-farilwyd",
    offHand: "weapon-precklies",
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

const ENVOY_RANK_OPTIONS = Array.from(
  { length: MAX_ENVOY_RANK + 1 },
  (_, rank) => rank,
);

const slotMeta: Record<
  ArmorSlot,
  { label: string; index: string; prompt: string }
> = {
  helm: { label: "Helm", index: "I", prompt: "Frame the crown" },
  cuirass: { label: "Cuirass", index: "II", prompt: "Frame the core" },
  leggings: { label: "Leggings", index: "III", prompt: "Frame the stride" },
};

const weaponSlotMeta: Record<
  WeaponHandSlot,
  { label: string; index: string; prompt: string }
> = {
  mainHand: { label: "Main Hand", index: "I", prompt: "Choose primary weapon" },
  offHand: { label: "Off Hand", index: "II", prompt: "Choose sidearm" },
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
  sources,
  onChange,
  onSourcesChange,
  onOptimize,
}: {
  virtues: SoulframeBuild["virtues"];
  bonuses: VirtueValues;
  sources: AffinitySources;
  onChange: (virtues: VirtueValues) => void;
  onSourcesChange: (sources: AffinitySources) => void;
  onOptimize: () => void;
}) {
  const total = VIRTUE_IDS.reduce((sum, virtue) => sum + virtues[virtue], 0);
  const alignmentPoint = getVirtueAlignmentPoint(virtues);
  const effectiveVirtues = Object.fromEntries(
    VIRTUE_IDS.map((virtue) => [
      virtue,
      virtues[virtue] + bonuses[virtue],
    ]),
  ) as VirtueValues;
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
        <span className="sr-only" aria-live="polite">
          Allocated: Courage {virtues.courage}, Spirit {virtues.spirit}, Grace{" "}
          {virtues.grace}. Effective: Courage {effectiveVirtues.courage},
          Spirit {effectiveVirtues.spirit}, Grace {effectiveVirtues.grace}.
        </span>
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
              aria-label={`Allocated Courage ${virtues.courage}, Spirit ${virtues.spirit}, Grace ${virtues.grace}. Effective Courage ${effectiveVirtues.courage}, Spirit ${effectiveVirtues.spirit}, Grace ${effectiveVirtues.grace}`}
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
            const effective = effectiveVirtues[virtue];
            return (
              <span
                className={`alignment-node alignment-node-${virtue} tone-${meta.tone}`}
                aria-hidden="true"
                key={virtue}
              >
                <StatIcon src={meta.icon} label={meta.label} size="small" />
                <span>
                  <small>{meta.label}</small>
                  <span className="alignment-node-value">
                    <strong>{effective}</strong>
                    {bonuses[virtue] > 0 ? (
                      <em>(+{bonuses[virtue]})</em>
                    ) : null}
                  </span>
                </span>
              </span>
            );
          })}
          <div className="alignment-total-control">
            <small>Base Affinity Points</small>
            <span>
              <strong>{total}</strong>
            </span>
          </div>
        </div>
      </div>
      <AffinitySourceInputs
        sources={sources}
        onChange={onSourcesChange}
      />
      <button
        type="button"
        className="optimization-trigger optimization-trigger-affinity"
        onClick={onOptimize}
      >
        <Sparkles aria-hidden="true" />
        Optimize for Gear
      </button>
    </>
  );
}

function AffinitySourceInputs({
  sources,
  onChange,
}: {
  sources: AffinitySources;
  onChange: (sources: AffinitySources) => void;
}) {
  type SourcePanel = "pact" | "fables";

  const [activePanel, setActivePanel] = useState<SourcePanel>();
  const sourceMenuRef = useRef<HTMLElement>(null);
  const pactTriggerRef = useRef<HTMLButtonElement>(null);
  const fablesTriggerRef = useRef<HTMLButtonElement>(null);
  const pactSummary = VIRTUE_IDS.map(
    (virtue) =>
      `${virtueMeta[virtue].label[0]}${PACT_ART_BONUS_BY_RANK[sources.pactArts[virtue]]}`,
  ).join(" ");
  const fableCounts = Object.values(sources.fables).reduce(
    (counts, virtue) => {
      if (virtue) counts[virtue] += 1;
      return counts;
    },
    { courage: 0, spirit: 0, grace: 0 } as VirtueValues,
  );
  const fableSummary =
    VIRTUE_IDS.flatMap((virtue) =>
      fableCounts[virtue]
        ? [`${virtueMeta[virtue].label[0]}+${fableCounts[virtue]}`]
        : [],
    ).join(" ") || "None";

  useEffect(() => {
    if (!activePanel) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !sourceMenuRef.current?.contains(event.target)
      ) {
        setActivePanel(undefined);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const activeTrigger = {
        pact: pactTriggerRef.current,
        fables: fablesTriggerRef.current,
      }[activePanel];
      setActivePanel(undefined);
      window.requestAnimationFrame(() => activeTrigger?.focus());
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activePanel]);

  const updatePactArt = (virtue: VirtueId, rank: PactArtRank) => {
    onChange({
      ...sources,
      pactArts: { ...sources.pactArts, [virtue]: rank },
    });
  };

  const updateFable = (
    fable: keyof AffinitySources["fables"],
    value: string,
  ) => {
    onChange({
      ...sources,
      fables: {
        ...sources.fables,
        [fable]: value === "" ? null : (value as VirtueId),
      },
    });
  };

  return (
    <section
      className="affinity-sources"
      aria-labelledby="affinity-sources-title"
      ref={sourceMenuRef}
    >
      <header>
        <span id="affinity-sources-title">Affinity Sources</span>
      </header>

      <div className="affinity-source-buttons">
        <label className="affinity-rank-source">
          <span>Envoy Rank</span>
          <select
            value={sources.envoyRank}
            aria-label={`Envoy Rank, current maximum ${MAX_ENVOY_RANK}`}
            onChange={(event) =>
              onChange({
                ...sources,
                envoyRank: Number(event.target.value),
              })
            }
          >
            {ENVOY_RANK_OPTIONS.map((rank) => (
              <option value={rank} key={rank}>
                {rank}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          ref={pactTriggerRef}
          aria-expanded={activePanel === "pact"}
          aria-controls="affinity-pact-panel"
          onClick={() =>
            setActivePanel((current) =>
              current === "pact" ? undefined : "pact",
            )
          }
        >
          <span>Pact Arts</span>
          <strong className="affinity-source-summary">{pactSummary}</strong>
        </button>
        <button
          type="button"
          ref={fablesTriggerRef}
          aria-expanded={activePanel === "fables"}
          aria-controls="affinity-fables-panel"
          onClick={() =>
            setActivePanel((current) =>
              current === "fables" ? undefined : "fables",
            )
          }
        >
          <span>Fables</span>
          <strong className="affinity-source-summary">{fableSummary}</strong>
        </button>
      </div>

      {activePanel === "pact" ? (
        <div
          className="affinity-popover affinity-popover-pact"
          id="affinity-pact-panel"
        >
          {VIRTUE_IDS.map((virtue) => (
            <label key={virtue}>
              <span>{virtueMeta[virtue].label}</span>
              <select
                value={sources.pactArts[virtue]}
                aria-label={`${virtueMeta[virtue].label} Pact Art rank`}
                onChange={(event) =>
                  updatePactArt(
                    virtue,
                    Number(event.target.value) as PactArtRank,
                  )
                }
              >
                {PACT_ART_BONUS_BY_RANK.map((bonus, rank) => (
                  <option value={rank} key={rank}>
                    {rank === 0 ? "None" : `Rank ${rank} · +${bonus}`}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      {activePanel === "fables" ? (
        <div
          className="affinity-popover affinity-popover-fables"
          id="affinity-fables-panel"
        >
          {(
            [
              ["shewolf", "Shewolf Snared"],
              ["wasteBear", "Waste Bear"],
            ] as const
          ).map(([fable, label]) => (
            <label key={fable}>
              <span>{label}</span>
              <select
                value={sources.fables[fable] ?? ""}
                aria-label={`${label} Virtue reward`}
                onChange={(event) => updateFable(fable, event.target.value)}
              >
                <option value="">Not earned</option>
                {VIRTUE_IDS.map((virtue) => (
                  <option value={virtue} key={virtue}>
                    +1 {virtueMeta[virtue].label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}
    </section>
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

function WeaponArtwork({
  item,
  preview = false,
  sizes,
  fallback,
}: {
  item?: Weapon;
  preview?: boolean;
  sizes: string;
  fallback: string;
}) {
  if (!item) {
    return <span className="armor-art-fallback">{fallback}</span>;
  }

  return (
    <Image
      className="armor-art-image weapon-art-image"
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

function getChargedWeaponStat(stats: WeaponLevelStats) {
  const candidates: Array<[keyof WeaponLevelStats, string]> = [
    ["chargedAttack", "Charged Attack"],
    ["chargedShot", "Charged Shot"],
    ["fullChargedCast", "Charged Cast"],
    ["perfectThrow", "Perfect Throw"],
    ["throw", "Throw"],
    ["orbit", "Orbit"],
  ];
  for (const [key, label] of candidates) {
    if (stats[key] !== undefined) {
      return { key, label, value: stats[key] };
    }
  }

  // Farilwyd is currently the only released Avakot record whose secondary
  // attack is absent. Its in-game panel displays the standard 2× heavy value.
  return stats.attack === undefined
    ? {
        key: "chargedAttack" as const,
        label: "Charged Attack",
        value: undefined,
      }
    : {
        key: "chargedAttack" as const,
        label: "Charged Attack",
        value: stats.attack * 2,
      };
}

function meetsWeaponRequirements(item: Weapon, virtues: VirtueValues) {
  return VIRTUE_IDS.every(
    (virtue) => virtues[virtue] >= item.requirements[virtue],
  );
}

function getWeaponDamage(item: Weapon, virtues: VirtueValues) {
  const baseAttack = item.stats.level0.attack;
  const charged = getChargedWeaponStat(item.stats.level0);
  const naturalGracePips =
    item.attunement.grace > 0 ? item.attunement.grace + 0.6 : 0;
  const rawAttunement =
    0.5 *
    (virtues.courage * item.attunement.courage +
      virtues.spirit * item.attunement.spirit +
      virtues.grace * naturalGracePips);
  const rarityMultiplier =
    item.rarity === "Common" &&
    !["Vasp-IV", "Rivt-II", "Clivers"].includes(item.name)
      ? 1
      : 1.5;
  const requirementMet = meetsWeaponRequirements(item, virtues);
  const primaryBonus =
    requirementMet && baseAttack !== undefined
      ? Math.floor(Math.min(rawAttunement, baseAttack * rarityMultiplier))
      : 0;
  let secondaryBonus = 0;

  if (requirementMet && baseAttack !== undefined) {
    if (charged.key === "chargedAttack") {
      secondaryBonus = primaryBonus * 2;
    } else {
      const capMultiplier =
        charged.key === "chargedShot"
          ? 2.5
          : charged.key === "fullChargedCast"
            ? 4.5
            : 1.5;
      secondaryBonus = Math.floor(
        Math.min(
          rawAttunement,
          baseAttack * capMultiplier * rarityMultiplier,
        ),
      );
    }
  }

  return {
    requirementMet,
    primary: {
      base: baseAttack,
      bonus: primaryBonus,
      total:
        baseAttack === undefined ? undefined : baseAttack + primaryBonus,
    },
    secondary: {
      key: charged.key,
      label: charged.label,
      base: charged.value,
      bonus: secondaryBonus,
      total:
        charged.value === undefined
          ? undefined
          : charged.value + secondaryBonus,
    },
    stagger: item.stats.level0.stagger,
  };
}

function getWeaponDamageRows(item?: Weapon, virtues?: VirtueValues) {
  const stats = item?.stats.level0;
  const calculated =
    item && virtues ? getWeaponDamage(item, virtues) : undefined;
  const charged = stats
    ? getChargedWeaponStat(stats)
    : { label: "Charged Attack", value: undefined };

  return [
    {
      id: "attack",
      label: "Attack",
      bonus: calculated?.primary.bonus,
      value: calculated?.primary.total ?? stats?.attack,
    },
    {
      id: "charged",
      label: calculated?.secondary.label ?? charged.label,
      bonus: calculated?.secondary.bonus,
      value: calculated?.secondary.total ?? charged.value,
    },
    {
      id: "stagger",
      label: "Stagger",
      bonus: undefined,
      value: calculated?.stagger ?? stats?.stagger,
    },
    {
      id: "smite",
      label: "Smite",
      bonus: undefined,
      value: item?.stats.smite.display || undefined,
    },
  ];
}

function VirtuePipStrip({
  values,
  className = "",
}: {
  values: VirtueValues;
  className?: string;
}) {
  const pips = VIRTUE_IDS.flatMap((virtue) =>
    Array.from({ length: values[virtue] }, (_, index) => ({
      virtue,
      id: `${virtue}-${index}`,
    })),
  );

  return (
    <span
      className={`virtue-pip-strip ${className}`.trim()}
      aria-label={formatVirtueVector(values) || "No pips"}
    >
      {pips.length ? (
        pips.map(({ virtue, id }) => (
          <span
            className={`armor-pip is-${virtue}`}
            key={id}
            title={`${virtueMeta[virtue].label} pip`}
          >
            <Image
              src={virtueMeta[virtue].icon}
              alt=""
              width={18}
              height={18}
              unoptimized
            />
          </span>
        ))
      ) : (
        <span className="armor-no-pips">—</span>
      )}
    </span>
  );
}

function WeaponPrimaryHud({
  item,
  virtues,
}: {
  item: Weapon;
  virtues: VirtueValues;
}) {
  const damage = getWeaponDamage(item, virtues);
  const requirementText = VIRTUE_IDS.flatMap((virtue) =>
    item.requirements[virtue] > 0
      ? `${item.requirements[virtue]} ${virtueMeta[virtue].label}`
      : [],
  ).join(" · ");
  const stats = [
    {
      id: "primary",
      label: "Attack",
      icon: <Sword aria-hidden="true" />,
      base: damage.primary.base,
      bonus: damage.primary.bonus,
      value: damage.primary.total,
    },
    {
      id: "secondary",
      label: damage.secondary.label,
      icon: <Hammer aria-hidden="true" />,
      base: damage.secondary.base,
      bonus: damage.secondary.bonus,
      value: damage.secondary.total,
    },
    {
      id: "stagger",
      label: "Stagger",
      icon: <Gauge aria-hidden="true" />,
      base: damage.stagger,
      bonus: 0,
      value: damage.stagger,
    },
  ];

  return (
    <section className="weapon-primary-hud" aria-label="Current weapon damage">
      <header>
        <span>Weapon Damage</span>
        <span>Current Virtues</span>
      </header>
      <div className="weapon-primary-grid">
        {stats.map((stat) => (
          <div className="weapon-primary-stat" key={stat.id}>
            <small>{stat.label}</small>
            <span className="weapon-primary-value">
              <span className="weapon-primary-icon">{stat.icon}</span>
              <strong>{stat.value ?? "—"}</strong>
            </span>
            <em>
              Base {stat.base ?? "—"}
              {stat.bonus ? ` · +${stat.bonus} Virtue` : ""}
            </em>
          </div>
        ))}
      </div>
      <footer className="weapon-primary-meta">
        <span>
          <small>Attunement Pips</small>
          <VirtuePipStrip values={item.attunement} />
        </span>
        <span>
          <small>Requirement</small>
          <strong
            className={
              damage.requirementMet
                ? "weapon-requirement-met"
                : "weapon-requirement-unmet"
            }
          >
            {requirementText ? `Requires ${requirementText}` : "None"}
          </strong>
        </span>
        <span>
          <small>Smite</small>
          <strong>{item.stats.smite.display || "—"}</strong>
        </span>
      </footer>
    </section>
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
          : `Requires ${requirement.value} ${meta.label}`}
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
      className={`equipment-slot equipment-slot-${slot}`}
      onClick={onOpen}
      aria-expanded={isActive}
      aria-haspopup="dialog"
      aria-label={`${meta.label}: ${
        item?.name ?? "empty"
      }.${defenseSummary}${requirementSummary} Change item.`}
    >
      <span className="slot-art" aria-hidden="true">
        <ArmorArtwork
          key={item?.id ?? `${slot}-empty`}
          item={item}
          fallback={meta.index}
          sizes="(max-width: 680px) 58px, 78px"
        />
      </span>
      <span className="slot-copy">
        <span className="slot-label">{meta.label}</span>
        <strong>{item?.name ?? meta.prompt}</strong>
        {contribution ? (
          <span className="slot-defense-stats" aria-hidden="true">
            {DEFENSE_IDS.map((defense) => (
              <span
                className="slot-defense-stat"
                title={defenseMeta[defense].label}
                key={defense}
              >
                <Image
                  src={defenseMeta[defense].icon}
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                />
                <b>{contribution.defenses[defense].total}</b>
              </span>
            ))}
          </span>
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
  isActive,
  onOpen,
}: {
  item?: Talisman;
  isActive: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="equipment-slot equipment-slot-talisman"
      onClick={onOpen}
      aria-expanded={isActive}
      aria-haspopup="dialog"
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

function WeaponEquipmentSlot({
  slot,
  item,
  isActive,
  onOpen,
}: {
  slot: WeaponHandSlot;
  item?: Weapon;
  isActive: boolean;
  onOpen: () => void;
}) {
  const meta = weaponSlotMeta[slot];
  const attack = item?.stats.level0.attack;

  return (
    <button
      type="button"
      className={`equipment-slot equipment-slot-${
        slot === "mainHand" ? "weapon-1" : "weapon-2"
      }`}
      onClick={onOpen}
      aria-expanded={isActive}
      aria-haspopup="dialog"
      aria-label={`${meta.label}: ${item?.name ?? "empty"}. Change weapon.`}
    >
      <span className="slot-art" aria-hidden="true">
        <WeaponArtwork
          item={item}
          fallback={meta.index}
          sizes="(max-width: 680px) 58px, 78px"
        />
      </span>
      <span className="slot-copy">
        <span className="slot-label">{meta.label}</span>
        <strong>{item?.name ?? meta.prompt}</strong>
        {item ? (
          <span className="slot-weapon-summary">
            {item.combatArt}
            {attack !== undefined ? ` · ${attack} attack` : ""}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function WeaponDamagePanel({
  hand,
  index,
  item,
  virtues,
}: {
  hand: "Main Hand" | "Off Hand";
  index: 1 | 2;
  item?: Weapon;
  virtues: VirtueValues;
}) {
  const stats = getWeaponDamageRows(item, virtues);

  return (
    <section
      className="weapon-damage-panel"
      aria-label={`${hand} damage for ${item?.name ?? "an empty slot"}.`}
    >
      <header className="weapon-damage-header">
        <span>{hand}</span>
        <strong>{item?.name ?? "Unframed"}</strong>
        <span className="weapon-damage-rank" aria-hidden="true">
          <small>✦ ✦ ✦</small>
          <b>{item ? 0 : index === 1 ? "I" : "II"}</b>
        </span>
      </header>
      <div className="weapon-damage-stats">
        {stats.map((stat) => (
          <div className="weapon-damage-row" key={stat.id}>
            <span>{stat.label}</span>
            <em aria-hidden="true">
              {stat.bonus ? `(+${stat.bonus})` : ""}
            </em>
            <strong>{stat.value ?? "—"}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatVirtueVector(values: VirtueValues) {
  return VIRTUE_IDS.flatMap((virtue) =>
    values[virtue] > 0
      ? `${virtueMeta[virtue].label.slice(0, 1)}${values[virtue]}`
      : [],
  ).join(" · ");
}

function CatalogueContextMenu({
  idPrefix,
  activeFilterCount,
  filteredCount,
  totalCount,
  onClearFilters,
  filters,
  sort,
}: {
  idPrefix: string;
  activeFilterCount: number;
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
  filters: ReactNode;
  sort: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<"filters" | "sort" | null>(null);

  useEffect(() => {
    if (!openMenu) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, [openMenu]);

  return (
    <div
      className="catalogue-context-menu"
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && openMenu) {
          event.preventDefault();
          event.stopPropagation();
          setOpenMenu(null);
        }
      }}
    >
      <div className="catalogue-context-toolbar">
        <button
          type="button"
          className={openMenu === "filters" ? "is-active" : ""}
          aria-expanded={openMenu === "filters"}
          aria-controls={`${idPrefix}-filters`}
          onClick={() =>
            setOpenMenu((current) =>
              current === "filters" ? null : "filters",
            )
          }
        >
          <ListFilter aria-hidden="true" />
          <span>Filter</span>
          {activeFilterCount ? (
            <b aria-label={`${activeFilterCount} active filters`}>
              {activeFilterCount}
            </b>
          ) : null}
        </button>
        <button
          type="button"
          className={openMenu === "sort" ? "is-active" : ""}
          aria-expanded={openMenu === "sort"}
          aria-controls={`${idPrefix}-sort`}
          onClick={() =>
            setOpenMenu((current) => (current === "sort" ? null : "sort"))
          }
        >
          <ArrowUpDown aria-hidden="true" />
          <span>Sort</span>
        </button>
        <small>
          {filteredCount} of {totalCount}
        </small>
      </div>

      {openMenu === "filters" ? (
        <div
          className="catalogue-controls catalogue-context-popover"
          id={`${idPrefix}-filters`}
          role="dialog"
          aria-label="Filter options"
        >
          <div className="catalogue-control-heading">
            <span>
              <ListFilter aria-hidden="true" />
              Filters
            </span>
            <button
              type="button"
              className="catalogue-clear"
              onClick={onClearFilters}
              disabled={activeFilterCount === 0}
            >
              Clear
            </button>
          </div>
          {filters}
        </div>
      ) : null}

      {openMenu === "sort" ? (
        <div
          className="catalogue-controls catalogue-context-popover is-sort"
          id={`${idPrefix}-sort`}
          role="dialog"
          aria-label="Sort options"
        >
          <div className="catalogue-sort-heading">
            <ArrowUpDown aria-hidden="true" />
            Sort
          </div>
          {sort}
        </div>
      ) : null}
    </div>
  );
}

function WeaponPicker({
  slot,
  build,
  onClose,
  onEquip,
  onUnequip,
}: {
  slot: WeaponHandSlot;
  build: SoulframeBuild;
  onClose: () => void;
  onEquip: (itemId: string) => void;
  onUnequip: () => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
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
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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

  const level0Rows = candidate ? getWeaponDamageRows(candidate) : [];
  const level30Rows = candidate
    ? getWeaponDamageRows({
        ...candidate,
        stats: {
          ...candidate.stats,
          level0: candidate.stats.level30,
        },
      })
    : [];

  return (
    <div className="picker-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={panelRef}
        className="picker-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="weapon-picker-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="picker-header">
          <h2 id="weapon-picker-title">
            Choose {weaponSlotMeta[slot].label}
          </h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close weapon picker"
          >
            ×
          </button>
        </header>

        <div className="picker-body">
          <aside className="catalogue-column">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search weapons</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${compatibleItems.length} ${
                  slot === "mainHand" ? "weapons" : "sidearms"
                }`}
              />
            </label>
            <CatalogueContextMenu
              idPrefix="weapon-catalogue"
              activeFilterCount={activeFilterCount}
              filteredCount={filteredItems.length}
              totalCount={compatibleItems.length}
              onClearFilters={clearFilters}
              filters={
                <div className="catalogue-filters">
                <select
                  aria-label="Filter weapons by Attunement Virtue"
                  value={pipFilter}
                  onChange={(event) =>
                    setPipFilter(event.target.value as "all" | VirtueId)
                  }
                >
                  <option value="all">All pips</option>
                  {VIRTUE_IDS.map((virtue) => (
                    <option value={virtue} key={virtue}>
                      {virtueMeta[virtue].label} pips
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter weapons by Combat Art"
                  value={artFilter}
                  onChange={(event) => setArtFilter(event.target.value)}
                >
                  <option value="all">All arts</option>
                  {artOptions.map((art) => (
                    <option value={art} key={art}>
                      {art}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter weapons by rarity"
                  value={rarityFilter}
                  onChange={(event) => setRarityFilter(event.target.value)}
                >
                  <option value="all">All rarities</option>
                  {rarityOptions.map((rarity) => (
                    <option value={rarity} key={rarity}>
                      {rarity}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter weapons by origin"
                  value={originFilter}
                  onChange={(event) => setOriginFilter(event.target.value)}
                >
                  <option value="all">All origins</option>
                  {originOptions.map((origin) => (
                    <option value={origin} key={origin}>
                      {origin}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter weapons by requirement status"
                  value={requirementFilter}
                  onChange={(event) =>
                    setRequirementFilter(
                      event.target.value as typeof requirementFilter,
                    )
                  }
                >
                  <option value="all">All requirements</option>
                  <option value="met">Requirement met</option>
                  <option value="unmet">Requirement unmet</option>
                  <option value="none">No requirement</option>
                </select>
                </div>
              }
              sort={
                <div className="catalogue-sort">
                <select
                  aria-label="Sort weapons"
                  value={sortKey}
                  onChange={(event) =>
                    changeSort(event.target.value as typeof sortKey)
                  }
                >
                  <option value="name">Name</option>
                  <option value="primary">Current light damage</option>
                  <option value="secondary">Current heavy damage</option>
                  <option value="stagger">Stagger</option>
                  <option value="smite">Smite chance</option>
                  <option value="art">Combat Art</option>
                  <option value="rarity">Rarity</option>
                  <option value="origin">Origin</option>
                </select>
                <button
                  type="button"
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
                    <ArrowUpAZ aria-hidden="true" />
                  ) : (
                    <ArrowDownAZ aria-hidden="true" />
                  )}
                </button>
                </div>
              }
            />
            <div className="item-list" role="listbox" aria-label="Weapons">
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
                      <WeaponArtwork
                        item={item}
                        fallback={weaponSlotMeta[slot].index}
                        sizes="44px"
                      />
                    </span>
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        {item.combatArt} · {item.origin}
                      </small>
                    </span>
                    <span className="item-list-side">
                      <span className="item-list-total">
                        {weaponSortValue(item)}
                      </span>
                      {item.id === currentItem?.id ? (
                        <span className="equipped-chip">Equipped</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
              {filteredItems.length === 0 ? (
                <div className="empty-search">
                  <strong>No weapons found</strong>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="comparison-column">
            {candidate ? (
              <>
                <div className="comparison-heading">
                  <span className="candidate-art" aria-hidden="true">
                    <WeaponArtwork
                      item={candidate}
                      fallback={weaponSlotMeta[slot].index}
                      preview
                      sizes="112px"
                    />
                  </span>
                  <div className="armor-comparison-copy">
                    <h3>{candidate.name}</h3>
                    <p>
                      {candidate.rarity} · {candidate.combatArt} ·{" "}
                      {candidate.damageType}
                    </p>
                    <a
                      className="avakot-item-link"
                      href={candidate.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Avakot
                      <ExternalLink aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <WeaponPrimaryHud
                  item={candidate}
                  virtues={buildCalculation.effectiveVirtues}
                />

                <details className="armor-breakdown-disclosure weapon-breakdown-disclosure">
                  <summary>
                    <span>
                      <strong>Level Progression</strong>
                      <small>Base damage at rank 0 and rank 30</small>
                    </span>
                    <ChevronDown aria-hidden="true" />
                  </summary>
                  <div className="weapon-stat-table">
                    <div className="weapon-stat-head">
                      <span>Damage</span>
                      <span>Lvl 0</span>
                      <span>Lvl 30</span>
                    </div>
                    {level0Rows.map((row, rowIndex) => (
                      <div className="weapon-stat-row" key={row.id}>
                        <span>{row.label}</span>
                        <strong>{row.value ?? "—"}</strong>
                        <strong>{level30Rows[rowIndex]?.value ?? "—"}</strong>
                      </div>
                    ))}
                  </div>
                </details>

                <WeaponDropTable item={candidate} />

                <p className="weapon-description">{candidate.description}</p>

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
                      : `Equip ${weaponSlotMeta[slot].label}`}
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

function ArmorBaseOverview({
  item,
  contribution,
  comparison,
}: {
  item: ArmorItem;
  contribution: ItemContribution;
  comparison?: ItemContribution;
}) {
  const totalDelta = comparison
    ? contribution.total - comparison.total
    : undefined;

  return (
    <section className="armor-base-overview" aria-label="Base armor and pips">
      <header>
        <span>Armor Defense</span>
      </header>
      <div className="armor-base-grid">
        {DEFENSE_IDS.map((defense) => {
          const profile = item.defenses[defense];
          const result = contribution.defenses[defense];
          const pips = VIRTUE_IDS.flatMap((virtue) =>
            Array.from({ length: profile.pips[virtue] }, (_, index) => ({
              virtue,
              id: `${virtue}-${index}`,
            })),
          );

          return (
            <div className="armor-base-stat" key={defense}>
              <small className="armor-stat-label">
                {defenseMeta[defense].shortLabel}
              </small>
              <span className="armor-stat-value">
                <StatIcon
                  src={defenseMeta[defense].icon}
                  label={defenseMeta[defense].label}
                  size="regular"
                />
                <strong>{result.total}</strong>
              </span>
              <em>
                Base {result.base} · +{result.scaling} Virtue
              </em>
              <span
                className="armor-pip-strip"
                aria-label={formatVirtueVector(profile.pips) || "No pips"}
              >
                {pips.length ? (
                  pips.map(({ virtue, id }) => (
                    <span
                      className={`armor-pip is-${virtue}`}
                      key={id}
                      title={`${virtueMeta[virtue].label} pip`}
                    >
                      <Image
                        src={virtueMeta[virtue].icon}
                        alt=""
                        width={18}
                        height={18}
                        unoptimized
                      />
                    </span>
                  ))
                ) : (
                  <span className="armor-no-pips">—</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <footer className="armor-overview-total">
        <span>
          <small>Total Armor</small>
          <strong>{contribution.total}</strong>
        </span>
        {totalDelta !== undefined && totalDelta !== 0 ? (
          <span>
            <small>Overall Change</small>
            <strong
              className={
                totalDelta > 0
                  ? "delta-positive"
                  : totalDelta < 0
                    ? "delta-negative"
                    : "delta-neutral"
              }
            >
              {formatDelta(totalDelta)}
            </strong>
          </span>
        ) : null}
      </footer>
    </section>
  );
}

function ArmorDropTable({ item }: { item: ArmorItem }) {
  const sources = armorDropById.get(item.id)?.sources ?? [];

  return (
    <section className="armor-drop-section" aria-labelledby="armor-drop-title">
      <header>
        <h4 id="armor-drop-title">Drop Sources</h4>
        <small>{sources.length ? `${sources.length} recorded` : "Avakot"}</small>
      </header>
      {sources.length ? (
        <div className="armor-drop-table" role="table" aria-label="Drop sources">
          <div className="armor-drop-row armor-drop-head" role="row">
            <span role="columnheader">Source</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">Drop</span>
          </div>
          {sources.map((source) => (
            <div
              className="armor-drop-row"
              role="row"
              key={`${source.tableId}-${source.sourceName}-${source.level}`}
            >
              <DropLocationLink
                sourceName={source.sourceName}
                sourceUrl={source.sourceUrl}
              />
              <span role="cell">{source.category || "Source"}</span>
              <span role="cell">
                {source.fragment ? "Fragment" : "Item"}
                {source.quantity !== "1" ? ` ×${source.quantity}` : ""}
                {source.level ? ` · Lv ${source.level}` : ""}
                {source.note ? <small>{source.note}</small> : null}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="armor-drop-empty">
          No drop source is currently recorded by Avakot.
        </p>
      )}
    </section>
  );
}

function WeaponDropTable({ item }: { item: Weapon }) {
  const sources = weaponDropById.get(item.id)?.sources ?? [];

  return (
    <section className="armor-drop-section" aria-labelledby="weapon-drop-title">
      <header>
        <h4 id="weapon-drop-title">Drop Locations</h4>
        <small>{sources.length ? `${sources.length} recorded` : "Avakot"}</small>
      </header>
      {sources.length ? (
        <div
          className="armor-drop-table"
          role="table"
          aria-label="Weapon drop locations"
        >
          <div className="armor-drop-row armor-drop-head" role="row">
            <span role="columnheader">Source</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">Location</span>
          </div>
          {sources.map((source) => (
            <div
              className="armor-drop-row"
              role="row"
              key={`${source.tableId}-${source.sourceName}-${source.level}`}
            >
              <span className="drop-source-cell" role="cell">
                <a href={source.sourceUrl} target="_blank" rel="noreferrer">
                  {source.sourceName}
                  <ExternalLink aria-hidden="true" />
                </a>
              </span>
              <span role="cell">{source.category || "Source"}</span>
              <DropLocationLink
                sourceName={source.sourceName}
                sourceUrl={source.sourceUrl}
                display="location"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="armor-drop-empty">
          No drop location is currently recorded by Avakot.
        </p>
      )}
    </section>
  );
}

function DropLocationLink({
  sourceName,
  sourceUrl,
  display = "source",
}: {
  sourceName: string;
  sourceUrl: string;
  display?: "source" | "location";
}) {
  const mapLocations =
    dropLocationMapBySourceUrl
      .get(sourceUrl)
      ?.locations.filter(
        (location) =>
          location.xPercent !== null && location.yPercent !== null,
      ) ?? [];
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [hoverPoint, setHoverPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const location = mapLocations[selectedLocation] ?? mapLocations[0];
  const tooltipPosition =
    hoverPoint && typeof window !== "undefined"
      ? {
          left: Math.max(
            12,
            Math.min(hoverPoint.x + 16, window.innerWidth - 332),
          ),
          top:
            hoverPoint.y + 16 + 354 > window.innerHeight
              ? Math.max(12, hoverPoint.y - 366)
              : hoverPoint.y + 16,
        }
      : null;

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen]);

  const updateHoverPoint = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !mapLocations.length) return;
    setHoverPoint({ x: event.clientX, y: event.clientY });
  };
  const locationLabel = location?.coordinateName || location?.markerName;

  return (
    <span
      className={`drop-source-cell ${
        display === "location" ? "drop-location-cell" : ""
      }`}
      role="cell"
      onPointerEnter={updateHoverPoint}
      onPointerMove={updateHoverPoint}
      onPointerLeave={() => setHoverPoint(null)}
    >
      {display === "source" ? (
        <a href={sourceUrl} target="_blank" rel="noreferrer">
          {sourceName}
          <ExternalLink aria-hidden="true" />
        </a>
      ) : null}
      {location ? (
        <>
          <button
            type="button"
            className={
              display === "location"
                ? "drop-location-trigger"
                : "drop-map-trigger"
            }
            aria-label={`Open ${sourceName} location map`}
            aria-expanded={lightboxOpen}
            onClick={() => {
              setHoverPoint(null);
              setLightboxOpen(true);
            }}
            onFocus={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setHoverPoint({ x: rect.right, y: rect.bottom });
            }}
            onBlur={() => setHoverPoint(null)}
          >
            {display === "location" ? (
              <>
                <span className="drop-location-marker" aria-hidden="true">
                  <DropMarkerIcon location={location} sourceName={sourceName} />
                </span>
                <span>
                  {locationLabel}
                  {mapLocations.length > 1
                    ? ` +${mapLocations.length - 1}`
                    : ""}
                </span>
              </>
            ) : (
              <DropMarkerIcon location={location} sourceName={sourceName} />
            )}
          </button>
          {tooltipPosition && hoverPoint && !lightboxOpen
            ? createPortal(
                <aside
                  className="drop-map-tooltip"
                  role="tooltip"
                  style={tooltipPosition}
                >
                  <header>
                    <span>{location.markerName || "Location Map"}</span>
                    <strong>{location.coordinateName || sourceName}</strong>
                  </header>
                  <LocalMapView
                    location={location}
                    sourceName={sourceName}
                    zoom={4.5}
                    className="drop-map-tooltip-map"
                  />
                  <small>Click the marker to expand</small>
                </aside>,
                document.body,
              )
            : null}
          {lightboxOpen
            ? createPortal(
                <div
                  className="drop-map-lightbox-backdrop"
                  role="presentation"
                  onMouseDown={() => setLightboxOpen(false)}
                >
                  <section
                    className="drop-map-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="drop-map-lightbox-title"
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <header>
                      <div>
                        <span>{location.markerName || "Location Map"}</span>
                        <h2 id="drop-map-lightbox-title">
                          {location.coordinateName || sourceName}
                        </h2>
                      </div>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label="Close location map"
                        onClick={() => setLightboxOpen(false)}
                      >
                        ×
                      </button>
                    </header>
                    <LocalMapView
                      location={location}
                      sourceName={sourceName}
                      zoom={2.4}
                      className="drop-map-lightbox-map"
                    />
                    <footer>
                      {mapLocations.length > 1 ? (
                        <span
                          className="drop-map-pages"
                          aria-label="Map locations"
                        >
                          {mapLocations.map((mapLocation, index) => (
                            <button
                              type="button"
                              className={
                                index === selectedLocation ? "is-active" : ""
                              }
                              key={mapLocation.mapUrl}
                              aria-label={`Show location ${index + 1}`}
                              onClick={() => setSelectedLocation(index)}
                            >
                              {index + 1}
                            </button>
                          ))}
                        </span>
                      ) : (
                        <span />
                      )}
                      <div>
                        <small>
                          {Math.round(location.x ?? 0)},{" "}
                          {Math.round(location.y ?? 0)}
                        </small>
                        <a
                          href={location.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View source map
                          <ExternalLink aria-hidden="true" />
                        </a>
                      </div>
                    </footer>
                  </section>
                </div>,
                document.body,
              )
            : null}
        </>
      ) : display === "location" ? (
        <span className="drop-location-unmapped">Not mapped</span>
      ) : null}
    </span>
  );
}

function getDropMarkerIcon(
  location: DropLocationMap,
  sourceName: string,
) {
  if (sourceName.toLowerCase().includes("cogah")) {
    return dropLocationMapCuratedIcons.cogah;
  }
  return location.markerIconUrl || dropLocationMapCuratedIcons.agari;
}

function DropMarkerIcon({
  location,
  sourceName,
}: {
  location: DropLocationMap;
  sourceName: string;
}) {
  return (
    <Image
      src={getDropMarkerIcon(location, sourceName)}
      alt=""
      fill
      sizes="32px"
    />
  );
}

function LocalMapView({
  location,
  sourceName,
  zoom,
  className,
}: {
  location: DropLocationMap;
  sourceName: string;
  zoom: number;
  className: string;
}) {
  const x = (location.xPercent ?? 50) / 100;
  const y = (location.yPercent ?? 50) / 100;
  const canvasSize = zoom * 100;
  const left = Math.min(0, Math.max(100 - canvasSize, 50 - x * canvasSize));
  const top = Math.min(0, Math.max(100 - canvasSize, 50 - y * canvasSize));

  return (
    <div className={`drop-map-frame ${className}`}>
      <div
        className="drop-map-canvas"
        style={{
          height: `${canvasSize}%`,
          left: `${left}%`,
          top: `${top}%`,
          width: `${canvasSize}%`,
        }}
      >
        <Image
          src={dropLocationMapAsset}
          alt=""
          fill
          sizes={className.includes("lightbox") ? "900px" : "480px"}
        />
        <span
          className="drop-map-pin"
          style={{
            left: `${location.xPercent}%`,
            top: `${location.yPercent}%`,
          }}
          aria-label={location.coordinateName || sourceName}
        >
          <DropMarkerIcon location={location} sourceName={sourceName} />
        </span>
      </div>
    </div>
  );
}

function ItemStatDetails({
  contribution,
  comparison,
}: {
  contribution: ItemContribution;
  comparison?: ItemContribution;
}) {
  return (
    <div className="item-stat-table">
      <div className="item-stat-head">
        <span>Defense</span>
        <span>Base</span>
        <span>Virtue</span>
        <span>Final</span>
        {comparison ? <span>Δ</span> : null}
      </div>
      {DEFENSE_IDS.map((defense) => {
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
              <span>{defenseMeta[defense].shortLabel}</span>
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
  const [pipFilter, setPipFilter] = useState<"all" | VirtueId>("all");
  const [requirementFilter, setRequirementFilter] = useState<
    "all" | "met" | "unmet" | "none"
  >("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [armorSetFilter, setArmorSetFilter] = useState("all");
  const [sortKey, setSortKey] = useState<
    "name" | "total" | DefenseId | "rarity" | "armorSet"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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
            <CatalogueContextMenu
              idPrefix="armor-catalogue"
              activeFilterCount={activeFilterCount}
              filteredCount={filteredItems.length}
              totalCount={compatibleItems.length}
              onClearFilters={clearFilters}
              filters={
                <div className="catalogue-filters">
                <select
                  aria-label="Filter armor by pip Virtue"
                  value={pipFilter}
                  onChange={(event) =>
                    setPipFilter(event.target.value as "all" | VirtueId)
                  }
                >
                  <option value="all">All pips</option>
                  {VIRTUE_IDS.map((virtue) => (
                    <option value={virtue} key={virtue}>
                      {virtueMeta[virtue].label} pips
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter armor by rarity"
                  value={rarityFilter}
                  onChange={(event) => setRarityFilter(event.target.value)}
                >
                  <option value="all">All rarities</option>
                  {rarityOptions.map((rarity) => (
                    <option value={rarity} key={rarity}>
                      {rarity}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter armor by set"
                  value={armorSetFilter}
                  onChange={(event) => setArmorSetFilter(event.target.value)}
                >
                  <option value="all">All sets</option>
                  {armorSetOptions.map((armorSet) => (
                    <option value={armorSet} key={armorSet}>
                      {armorSet}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter armor by requirement status"
                  value={requirementFilter}
                  onChange={(event) =>
                    setRequirementFilter(
                      event.target.value as typeof requirementFilter,
                    )
                  }
                >
                  <option value="all">All requirements</option>
                  <option value="met">Requirement met</option>
                  <option value="unmet">Requirement unmet</option>
                  <option value="none">No requirement</option>
                </select>
                </div>
              }
              sort={
                <div className="catalogue-sort">
                <select
                  aria-label="Sort armor"
                  value={sortKey}
                  onChange={(event) =>
                    changeSort(event.target.value as typeof sortKey)
                  }
                >
                  <option value="name">Name</option>
                  <option value="total">Current total defense</option>
                  <option value="physicalDefense">Current physical</option>
                  <option value="magickDefense">Current magick</option>
                  <option value="stabilityIncrease">Current stability</option>
                  <option value="rarity">Rarity</option>
                  <option value="armorSet">Armor Set</option>
                </select>
                <button
                  type="button"
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
                    <ArrowUpAZ aria-hidden="true" />
                  ) : (
                    <ArrowDownAZ aria-hidden="true" />
                  )}
                </button>
                </div>
              }
            />
            <div className="item-list" role="listbox" aria-label="Compatible armor">
              {filteredItems.map((item) => {
                const isCandidate = item.id === candidate?.id;
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
                      <small>
                        {item.rarity} · {item.armorSet}
                      </small>
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
                      <span className="item-list-total">
                        {armorSortValue(item)}
                      </span>
                      {item.id === currentItem?.id ? (
                        <span className="equipped-chip">Equipped</span>
                      ) : null}
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
                  <div className="armor-comparison-copy">
                    <h3>{candidate.name}</h3>
                    <div className="armor-heading-actions">
                      <RequirementBadge
                        item={candidate}
                        virtues={buildCalculation.effectiveVirtues}
                      />
                      {candidatePageUrl ? (
                        <a
                          className="avakot-item-link"
                          href={candidatePageUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View on Avakot
                          <ExternalLink aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                <ArmorBaseOverview
                  item={candidate}
                  contribution={candidateContribution}
                  comparison={currentContribution}
                />

                <details className="armor-breakdown-disclosure">
                  <summary>
                    <span>
                      <strong>Calculation Breakdown</strong>
                      <small>Base armor + virtue scaling</small>
                    </span>
                    <ChevronDown aria-hidden="true" />
                  </summary>
                  <ItemStatDetails
                    contribution={candidateContribution}
                    comparison={currentContribution}
                  />
                </details>

                <ArmorDropTable item={candidate} />

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

type OptimizationResult = AffinityOptimization | ArmorOptimization;

function OptimizationLightbox({
  result,
  onApply,
  onClose,
}: {
  result: OptimizationResult;
  onApply: () => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isAffinity = result.kind === "affinity";
  const title = isAffinity
    ? "Optimize for Gear"
    : "Optimize Armor for Affinity";
  const currentMetRequirements = result.currentCalculation.items.filter(
    (item) => item.requirementMet,
  ).length;
  const recommendedMetRequirements =
    result.recommendedCalculation.items.filter(
      (item) => item.requirementMet,
    ).length;
  const armorRows = ARMOR_SLOTS.flatMap((slot) => {
    const currentItemId = result.currentBuild.equipment[slot];
    const recommendedItemId = result.recommendedBuild.equipment[slot];
    const recommendedItem = recommendedItemId
      ? armorById.get(recommendedItemId)
      : undefined;
    if (!recommendedItem) return [];
    const currentItem = currentItemId ? armorById.get(currentItemId) : undefined;
    const currentTotal = currentItem
      ? calculateItemContribution(
          currentItem,
          result.currentCalculation.effectiveVirtues,
        ).total
      : 0;
    const recommendedContribution = calculateItemContribution(
      recommendedItem,
      result.recommendedCalculation.effectiveVirtues,
    );

    return [
      {
        slot,
        currentItem,
        recommendedItem,
        currentTotal,
        recommendedTotal: recommendedContribution.total,
        requirementMet: recommendedContribution.requirementMet,
      },
    ];
  });

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="optimization-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="optimization-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="optimization-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="optimization-header">
          <div>
            <span>
              <Sparkles aria-hidden="true" />
              Armor only
            </span>
            <h2 id="optimization-title">{title}</h2>
            <p>
              {isAffinity
                ? "Recommended base affinity for your equipped armor."
                : "Recommended armor for your current effective affinity."}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="icon-button"
            aria-label="Close optimization preview"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="optimization-summary">
          {isAffinity ? (
            <div className="optimization-affinity-values">
              {VIRTUE_IDS.map((virtue) => (
                <div className={`tone-${virtueMeta[virtue].tone}`} key={virtue}>
                  <StatIcon
                    src={virtueMeta[virtue].icon}
                    label={virtueMeta[virtue].label}
                    size="small"
                  />
                  <span>
                    <small>{virtueMeta[virtue].label}</small>
                    <strong>
                      {result.currentBuild.virtues[virtue]}
                      <ArrowRight aria-hidden="true" />
                      <b>{result.recommendedBuild.virtues[virtue]}</b>
                    </strong>
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="optimization-metrics">
            <div>
              <small>Armor Defense</small>
              <strong>
                {result.currentCalculation.armorDefense}
                <ArrowRight aria-hidden="true" />
                <b>{result.recommendedCalculation.armorDefense}</b>
              </strong>
              <em>
                {formatDelta(
                  result.recommendedCalculation.armorDefense -
                    result.currentCalculation.armorDefense,
                )}
              </em>
            </div>
            <div>
              <small>Requirements Met</small>
              <strong>
                {currentMetRequirements}
                <ArrowRight aria-hidden="true" />
                <b>{recommendedMetRequirements}</b>
              </strong>
              <em>of {armorRows.length}</em>
            </div>
          </div>
        </div>

        <div className="optimization-armor-grid">
          {armorRows.map((row) => {
            const changed = row.currentItem?.id !== row.recommendedItem.id;
            const delta = row.recommendedTotal - row.currentTotal;
            return (
              <article className="optimization-armor-card" key={row.slot}>
                <div className="optimization-armor-art">
                  <ArmorArtwork
                    item={row.recommendedItem}
                    fallback={slotMeta[row.slot].index}
                    sizes="120px"
                  />
                </div>
                <div className="optimization-armor-copy">
                  <small>{slotMeta[row.slot].label}</small>
                  <strong>{row.recommendedItem.name}</strong>
                  {changed && row.currentItem ? (
                    <span>Replaces {row.currentItem.name}</span>
                  ) : (
                    <span>{changed ? "Fills empty slot" : "Keep equipped"}</span>
                  )}
                  <div>
                    <span>{row.currentTotal}</span>
                    <ArrowRight aria-hidden="true" />
                    <b>{row.recommendedTotal}</b>
                    <em className={delta > 0 ? "delta-positive" : "delta-neutral"}>
                      {formatDelta(delta)}
                    </em>
                  </div>
                  <span
                    className={
                      row.requirementMet
                        ? "optimization-compatible"
                        : "optimization-incompatible"
                    }
                  >
                    {row.requirementMet ? "Compatible" : "Base defense only"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="optimization-footer">
          <p>
            {result.changed
              ? isAffinity
                ? "Only base affinity allocation will change."
                : "Weapons and Talismans will not change."
              : "Your current build already matches this recommendation."}
          </p>
          <div>
            <button
              type="button"
              className="button button-quiet"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button-primary"
              disabled={!result.changed}
              onClick={onApply}
            >
              {result.changed
                ? isAffinity
                  ? "Apply Affinity"
                  : "Equip Recommended Armor"
                : "Already Optimized"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

export function SoulframeBuilder() {
  const [build, setBuild] = useState<SoulframeBuild>(DEFAULT_BUILD);
  const [buildNameDraft, setBuildNameDraft] = useState(DEFAULT_BUILD.name);
  const [isEditingBuildName, setIsEditingBuildName] = useState(false);
  const [activeSlot, setActiveSlot] = useState<EquipmentSlot>();
  const [optimizationMode, setOptimizationMode] = useState<
    "affinity" | "armor"
  >();
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<string>();
  const buildNameInputRef = useRef<HTMLInputElement>(null);
  const calculation = useMemo(
    () => calculateBuild(build, armorCatalogue, talismanCatalogue),
    [build],
  );
  const optimizationResult = useMemo<OptimizationResult | undefined>(() => {
    if (optimizationMode === "affinity") {
      return optimizeAffinityForArmor(
        build,
        armorCatalogue,
        talismanCatalogue,
      );
    }
    if (optimizationMode === "armor") {
      return optimizeArmorForAffinity(
        build,
        armorCatalogue,
        talismanCatalogue,
      );
    }
    return undefined;
  }, [build, optimizationMode]);
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
        weapons: weaponCatalogue,
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
        LEGACY_STORAGE_KEYS.map((key) =>
          window.localStorage.getItem(key),
        ).find((value) => value !== null);
      if (stored) {
        const result = parseStoredBuild(stored, {
          armor: armorCatalogue,
          talismans: talismanCatalogue,
          weapons: weaponCatalogue,
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
    for (const key of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
  }, [build, hydrated]);

  useEffect(() => {
    if (!isEditingBuildName) return;
    buildNameInputRef.current?.focus();
    buildNameInputRef.current?.select();
  }, [isEditingBuildName]);

  const updateVirtues = (virtues: VirtueValues) => {
    setBuild((current) => ({
      ...current,
      virtues,
    }));
  };

  const updateAffinitySources = (affinitySources: AffinitySources) => {
    setBuild((current) => ({
      ...current,
      affinitySources,
      virtues: distributeVirtueTotal(
        getAllocatableAffinity(affinitySources),
        current.virtues,
      ),
    }));
  };

  const commitBuildName = () => {
    setBuild((current) => ({ ...current, name: buildNameDraft }));
    setIsEditingBuildName(false);
  };

  const handleBuildNameKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitBuildName();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setBuildNameDraft(build.name);
      setIsEditingBuildName(false);
    }
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
      <header className="topbar">
        <a className="brand" href="#" aria-label="Soulframe Framer home">
          <h1>
            <Image
              className="brand-wordmark"
              src="/brand/framer-wordmark-v2.png"
              alt="Framer"
              width={2017}
              height={780}
              priority
              unoptimized
            />
          </h1>
          <p>The Soulframe build planner</p>
        </a>
        <div
          className={`build-name-control ${
            isEditingBuildName ? "is-editing" : ""
          }`}
        >
          <div className="build-name-frame">
            {isEditingBuildName ? (
              <input
                ref={buildNameInputRef}
                id="build-name-value"
                className="build-name"
                value={buildNameDraft}
                maxLength={80}
                aria-label="Build name"
                onBlur={commitBuildName}
                onChange={(event) => setBuildNameDraft(event.target.value)}
                onKeyDown={handleBuildNameKeyDown}
              />
            ) : (
              <span
                id="build-name-value"
                className="build-name-display"
                title={build.name}
              >
                {build.name}
              </span>
            )}
          </div>
          <button
            type="button"
            className="build-name-edit"
            aria-controls="build-name-value"
            aria-label={
              isEditingBuildName
                ? "Finish editing build name"
                : "Edit build name"
            }
            aria-pressed={isEditingBuildName}
            onMouseDown={(event) => {
              if (isEditingBuildName) event.preventDefault();
            }}
            onClick={() => {
              if (isEditingBuildName) {
                commitBuildName();
              } else {
                setBuildNameDraft(build.name);
                setIsEditingBuildName(true);
              }
            }}
          >
            <Image
              src="/icons/edit-feather.svg"
              alt=""
              aria-hidden="true"
              width={40}
              height={48}
              unoptimized
            />
          </button>
        </div>
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
          </header>
          <VirtueAlignment
            virtues={build.virtues}
            bonuses={calculation.bonusVirtues}
            sources={build.affinitySources}
            onChange={updateVirtues}
            onSourcesChange={updateAffinitySources}
            onOptimize={() => setOptimizationMode("affinity")}
          />
        </aside>

        <div className="loadout-stage">
          <div className="loadout-optimization">
            <button
              type="button"
              className="optimization-trigger optimization-trigger-gear"
              onClick={() => setOptimizationMode("armor")}
            >
              <Sparkles aria-hidden="true" />
              Optimize Armor for Affinity
            </button>
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
                isActive={activeSlot === slot}
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
            isActive={activeSlot === "talisman"}
            onOpen={() => setActiveSlot("talisman")}
          />
          {(["mainHand", "offHand"] as const).map((slot) => (
            <WeaponEquipmentSlot
              key={slot}
              slot={slot}
              item={
                build.equipment[slot]
                  ? weaponById.get(build.equipment[slot]!)
                  : undefined
              }
              isActive={activeSlot === slot}
              onOpen={() => setActiveSlot(slot)}
            />
          ))}
        </div>

        <aside className="stats-rail">
          <header className="workspace-heading">
            <span>Build defense</span>
          </header>
          <div
            className="defense-hud"
            aria-label={`${calculation.total} total defense`}
          >
            <div className="defense-hud-plaque">
              {DEFENSE_IDS.map((defense) => (
                <div
                  className="defense-hud-stat"
                  title={defenseMeta[defense].label}
                  key={defense}
                >
                  <Image
                    src={defenseMeta[defense].icon}
                    alt=""
                    aria-hidden="true"
                    width={32}
                    height={32}
                    unoptimized
                  />
                  <span className="sr-only">
                    {defenseMeta[defense].label}
                  </span>
                  <strong>{calculation.defenses[defense]}</strong>
                </div>
              ))}
            </div>

            <div className="defense-hud-crest" aria-hidden="true">
              {[
                "shield-bg",
                "shield-bg-art",
                "shield-border",
                "filigree",
              ].map((layer) => (
                <Image
                  className={`defense-hud-layer defense-hud-layer-${layer}`}
                  src={`/icons/armor-crest/${layer}.svg`}
                  alt=""
                  width={160}
                  height={180}
                  unoptimized
                  draggable={false}
                  key={layer}
                />
              ))}
              <strong className="defense-hud-total">
                {calculation.total}
              </strong>
            </div>
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

          <section className="build-damage">
            <header className="workspace-heading build-damage-heading">
              <span>Build damage</span>
            </header>
            <div className="build-damage-panels">
              <WeaponDamagePanel
                hand="Main Hand"
                index={1}
                virtues={calculation.effectiveVirtues}
                item={
                  build.equipment.mainHand
                    ? weaponById.get(build.equipment.mainHand)
                    : undefined
                }
              />
              <WeaponDamagePanel
                hand="Off Hand"
                index={2}
                virtues={calculation.effectiveVirtues}
                item={
                  build.equipment.offHand
                    ? weaponById.get(build.equipment.offHand)
                    : undefined
                }
              />
            </div>
          </section>

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
        <span>
          <a href="https://wiki.avakot.org/Armour" target="_blank" rel="noreferrer">
            Armour
          </a>
          {" · "}
          <a href="https://wiki.avakot.org/Weapons" target="_blank" rel="noreferrer">
            Weapons ↗
          </a>
        </span>
      </footer>

      {activeSlot && ARMOR_SLOTS.includes(activeSlot as ArmorSlot) ? (
        <ItemPicker
          slot={activeSlot as ArmorSlot}
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

      {activeSlot === "mainHand" || activeSlot === "offHand" ? (
        <WeaponPicker
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

      {optimizationResult ? (
        <OptimizationLightbox
          result={optimizationResult}
          onClose={() => setOptimizationMode(undefined)}
          onApply={() => {
            setBuild(optimizationResult.recommendedBuild);
            setOptimizationMode(undefined);
            setNotice(
              optimizationResult.kind === "affinity"
                ? "Affinity optimized for the equipped armor."
                : "Recommended armor equipped. Weapons and Talismans were preserved.",
            );
          }}
        />
      ) : null}
    </main>
  );
}
