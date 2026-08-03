"use client";

import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useId } from "react";
import Image from "next/image";
import { PACT_ART_BONUS_BY_RANK } from "@/src/domain/affinity";
import {
  getVirtueAlignmentPoint,
  shiftVirtueAlignment,
  virtuesFromAlignmentPoint,
} from "@/src/domain/virtue-alignment";
import {
  VIRTUE_IDS,
  type AffinitySources,
  type SoulframeBuild,
  type VirtueId,
  type VirtueValues,
} from "@/src/domain/types";
import {
  TRIQUETRA_BOUNDS,
  TRIQUETRA_PATH,
  TRIQUETRA_VIEWBOX_SIZE,
  virtueMeta,
} from "../constants";
import { SCREEN_READER_ONLY_CLASS_NAME } from "../components/accessibilityClassNames";
import {
  VIRTUE_PIP_CLASS_NAMES,
  VIRTUE_PIP_IMAGE_CLASS_NAME,
} from "../components/virtuePipClassNames";
import {
  ALIGNMENT_NODE_CLASS_NAMES,
  VIRTUE_ALIGNMENT_CLASS_NAMES,
  VIRTUE_PRISM_LAYER_CLASS_NAMES,
} from "../components/affinityClassNames";
import { StatIcon } from "../components/primitives";
import { AffinitySourceInputs } from "./AffinitySourceInputs";

type VirtueAlignmentVisuals = {
  alignmentWeights: VirtueValues;
  artX: number;
  artY: number;
  figureStyle: CSSProperties;
  selectorColor: string;
};

type VirtuePrismInteraction = {
  ariaLabel: string;
  onKeyDown: (event: ReactKeyboardEvent<SVGSVGElement>) => void;
  onPointerDown: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerMove: (event: ReactPointerEvent<SVGSVGElement>) => void;
};

function PactBondSummary({ values }: { values: VirtueValues }) {
  const label = VIRTUE_IDS.map(
    (virtue) => `${virtueMeta[virtue].label} +${values[virtue]}`,
  ).join(", ");

  return (
    <div className={VIRTUE_ALIGNMENT_CLASS_NAMES.pactBond}>
      <small className={VIRTUE_ALIGNMENT_CLASS_NAMES.pactBondLabel}>
        Pact Bond
      </small>
      <span
        className={VIRTUE_ALIGNMENT_CLASS_NAMES.pactBondValues}
        aria-label={`Pact Bond affinity bonuses: ${label}`}
      >
        {VIRTUE_IDS.map((virtue) => (
          <span
            className={VIRTUE_ALIGNMENT_CLASS_NAMES.pactBondValue}
            title={virtueMeta[virtue].label}
            key={virtue}
          >
            <span className={VIRTUE_PIP_CLASS_NAMES[virtue]} aria-hidden="true">
              <Image
                className={VIRTUE_PIP_IMAGE_CLASS_NAME}
                src={virtueMeta[virtue].icon}
                alt=""
                width={18}
                height={18}
                unoptimized
              />
            </span>
            <strong>+{values[virtue]}</strong>
          </span>
        ))}
      </span>
    </div>
  );
}

function getVirtueAlignmentVisuals(
  virtues: VirtueValues,
): VirtueAlignmentVisuals {
  const total = VIRTUE_IDS.reduce((sum, virtue) => sum + virtues[virtue], 0);
  const alignmentPoint = getVirtueAlignmentPoint(virtues);
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

  return {
    alignmentWeights,
    artX,
    artY,
    figureStyle: {
      "--alignment-x": `${(artX / TRIQUETRA_VIEWBOX_SIZE) * 100}%`,
      "--alignment-y": `${(artY / TRIQUETRA_VIEWBOX_SIZE) * 100}%`,
    } as CSSProperties,
    selectorColor,
  };
}

function VirtuePrism({
  className,
  interaction,
  markerClassName,
  priority = false,
  visuals,
}: {
  className: string;
  interaction?: VirtuePrismInteraction;
  markerClassName: string;
  priority?: boolean;
  visuals: VirtueAlignmentVisuals;
}) {
  const instanceId = useId().replaceAll(":", "");
  const clipId = `${instanceId}-virtue-vector-clip`;
  const maskId = `${instanceId}-virtue-stone-mask`;
  const spiritLightId = `${instanceId}-spirit-light`;
  const courageLightId = `${instanceId}-courage-light`;
  const graceLightId = `${instanceId}-grace-light`;
  const selectorLightId = `${instanceId}-selector-light`;
  const bloomId = `${instanceId}-virtue-bloom`;
  const fieldOpacity = (weight: number) => 0.08 + Math.sqrt(weight) * 0.82;

  return (
    <div
      className={className}
      style={interaction ? undefined : visuals.figureStyle}
      aria-hidden={interaction ? undefined : "true"}
    >
      <Image
        className={VIRTUE_PRISM_LAYER_CLASS_NAMES.unlit}
        src="/virtue-lith-unlit.png"
        alt=""
        aria-hidden="true"
        width={512}
        height={512}
        draggable={false}
        unoptimized
        priority={priority}
      />
      <svg
        className={VIRTUE_PRISM_LAYER_CLASS_NAMES.lighting}
        viewBox={`0 0 ${TRIQUETRA_VIEWBOX_SIZE} ${TRIQUETRA_VIEWBOX_SIZE}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={TRIQUETRA_PATH} />
          </clipPath>
          <mask
            id={maskId}
            mask-type="alpha"
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
            id={spiritLightId}
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
            id={courageLightId}
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
            id={graceLightId}
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
            id={selectorLightId}
            gradientUnits="userSpaceOnUse"
            cx={visuals.artX}
            cy={visuals.artY}
            r="112"
          >
            <stop offset="0" stopColor="#fffce8" stopOpacity="1" />
            <stop
              offset="0.12"
              stopColor={visuals.selectorColor}
              stopOpacity="0.94"
            />
            <stop
              offset="0.48"
              stopColor={visuals.selectorColor}
              stopOpacity="0.42"
            />
            <stop
              offset="1"
              stopColor={visuals.selectorColor}
              stopOpacity="0"
            />
          </radialGradient>
          <filter
            id={bloomId}
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
        <g clipPath={`url(#${clipId})`} mask={`url(#${maskId})`}>
          <rect
            className={VIRTUE_ALIGNMENT_CLASS_NAMES.lightField}
            width={TRIQUETRA_VIEWBOX_SIZE}
            height={TRIQUETRA_VIEWBOX_SIZE}
            fill={`url(#${spiritLightId})`}
            opacity={fieldOpacity(visuals.alignmentWeights.spirit)}
          />
          <rect
            className={VIRTUE_ALIGNMENT_CLASS_NAMES.lightField}
            width={TRIQUETRA_VIEWBOX_SIZE}
            height={TRIQUETRA_VIEWBOX_SIZE}
            fill={`url(#${courageLightId})`}
            opacity={fieldOpacity(visuals.alignmentWeights.courage)}
          />
          <rect
            className={VIRTUE_ALIGNMENT_CLASS_NAMES.lightField}
            width={TRIQUETRA_VIEWBOX_SIZE}
            height={TRIQUETRA_VIEWBOX_SIZE}
            fill={`url(#${graceLightId})`}
            opacity={fieldOpacity(visuals.alignmentWeights.grace)}
          />
          <rect
            className={VIRTUE_ALIGNMENT_CLASS_NAMES.selectorLight}
            width={TRIQUETRA_VIEWBOX_SIZE}
            height={TRIQUETRA_VIEWBOX_SIZE}
            fill={`url(#${selectorLightId})`}
            filter={`url(#${bloomId})`}
          />
        </g>
      </svg>
      <Image
        className={VIRTUE_PRISM_LAYER_CLASS_NAMES.detail}
        src="/virtue-lith-unlit.png"
        alt=""
        aria-hidden="true"
        width={512}
        height={512}
        draggable={false}
        unoptimized
      />
      {interaction ? (
        <svg
          className={VIRTUE_ALIGNMENT_CLASS_NAMES.interaction}
          viewBox={`0 0 ${TRIQUETRA_VIEWBOX_SIZE} ${TRIQUETRA_VIEWBOX_SIZE}`}
          role="group"
          aria-roledescription="virtue alignment control"
          aria-describedby="alignment-instructions"
          aria-label={interaction.ariaLabel}
          tabIndex={0}
          onKeyDown={interaction.onKeyDown}
          onPointerDown={interaction.onPointerDown}
          onPointerMove={interaction.onPointerMove}
        >
          <path
            d={TRIQUETRA_PATH}
            fill="rgba(255, 255, 255, 0.001)"
            pointerEvents="fill"
            stroke="none"
          />
        </svg>
      ) : null}
      <span className={markerClassName} aria-hidden="true">
        <i className={VIRTUE_ALIGNMENT_CLASS_NAMES.markerDot} />
      </span>
    </div>
  );
}

export function VirtueAlignmentPreview({
  virtues,
}: {
  virtues: VirtueValues;
}) {
  return (
    <VirtuePrism
      className={VIRTUE_ALIGNMENT_CLASS_NAMES.preview}
      markerClassName={VIRTUE_ALIGNMENT_CLASS_NAMES.previewMarker}
      visuals={getVirtueAlignmentVisuals(virtues)}
    />
  );
}

export function VirtueAlignment({
  virtues,
  bonuses,
  sources,
  onChange,
  onSourcesChange,
}: {
  virtues: SoulframeBuild["virtues"];
  bonuses: VirtueValues;
  sources: AffinitySources;
  onChange: (virtues: VirtueValues) => void;
  onSourcesChange: (sources: AffinitySources) => void;
}) {
  const total = VIRTUE_IDS.reduce((sum, virtue) => sum + virtues[virtue], 0);
  const effectiveVirtues = Object.fromEntries(
    VIRTUE_IDS.map((virtue) => [
      virtue,
      virtues[virtue] + bonuses[virtue],
    ]),
  ) as VirtueValues;
  const pactBondValues = Object.fromEntries(
    VIRTUE_IDS.map((virtue) => [
      virtue,
      PACT_ART_BONUS_BY_RANK[sources.pactArts[virtue]],
    ]),
  ) as VirtueValues;
  const visuals = getVirtueAlignmentVisuals(virtues);
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
      <div
        className={VIRTUE_ALIGNMENT_CLASS_NAMES.figure}
        style={visuals.figureStyle}
      >
        <p
          className={SCREEN_READER_ONLY_CLASS_NAME}
          id="alignment-instructions"
        >
          Drag or click within the triangle to distribute the total point pool.
          Use Arrow Up for Spirit, Arrow Left for Courage, or Arrow Right for
          Grace.
        </p>
        <span className={SCREEN_READER_ONLY_CLASS_NAME} aria-live="polite">
          Allocated: Courage {virtues.courage}, Spirit {virtues.spirit}, Grace{" "}
          {virtues.grace}. Effective: Courage {effectiveVirtues.courage},
          Spirit {effectiveVirtues.spirit}, Grace {effectiveVirtues.grace}.
        </span>
        <div className={VIRTUE_ALIGNMENT_CLASS_NAMES.map}>
          <VirtuePrism
            className={VIRTUE_ALIGNMENT_CLASS_NAMES.prismStack}
            interaction={{
              ariaLabel: `Allocated Courage ${virtues.courage}, Spirit ${virtues.spirit}, Grace ${virtues.grace}. Effective Courage ${effectiveVirtues.courage}, Spirit ${effectiveVirtues.spirit}, Grace ${effectiveVirtues.grace}`,
              onKeyDown: handleAlignmentKey,
              onPointerDown: handlePointerDown,
              onPointerMove: handlePointerMove,
            }}
            markerClassName={VIRTUE_ALIGNMENT_CLASS_NAMES.marker}
            priority
            visuals={visuals}
          />
          {figureOrder.map((virtue) => {
            const meta = virtueMeta[virtue];
            const effective = effectiveVirtues[virtue];
            return (
              <span
                className={ALIGNMENT_NODE_CLASS_NAMES[virtue]}
                aria-hidden="true"
                key={virtue}
              >
                <StatIcon src={meta.icon} label={meta.label} size="small" />
                <span className={VIRTUE_ALIGNMENT_CLASS_NAMES.nodeCopy}>
                  <small className={VIRTUE_ALIGNMENT_CLASS_NAMES.nodeLabel}>
                    {meta.label}
                  </small>
                  <span className={VIRTUE_ALIGNMENT_CLASS_NAMES.nodeValue}>
                    <strong className={VIRTUE_ALIGNMENT_CLASS_NAMES.nodeStrong}>
                      {effective}
                    </strong>
                    {bonuses[virtue] > 0 ? (
                      <em className={VIRTUE_ALIGNMENT_CLASS_NAMES.nodeBonus}>
                        (+{bonuses[virtue]})
                      </em>
                    ) : null}
                  </span>
                </span>
              </span>
            );
          })}
          <div className={VIRTUE_ALIGNMENT_CLASS_NAMES.total}>
            <small className={VIRTUE_ALIGNMENT_CLASS_NAMES.totalLabel}>
              Base Affinity Points
            </small>
            <span className={VIRTUE_ALIGNMENT_CLASS_NAMES.totalValueRow}>
              <strong className={VIRTUE_ALIGNMENT_CLASS_NAMES.totalValue}>
                {total}
              </strong>
            </span>
            <PactBondSummary values={pactBondValues} />
          </div>
        </div>
      </div>
      <div className={VIRTUE_ALIGNMENT_CLASS_NAMES.mobileControls}>
        <div className={VIRTUE_ALIGNMENT_CLASS_NAMES.mobileTotal}>
          <small className={VIRTUE_ALIGNMENT_CLASS_NAMES.mobileTotalLabel}>
            Base Affinity Points
          </small>
          <strong className={VIRTUE_ALIGNMENT_CLASS_NAMES.mobileTotalValue}>
            {total}
          </strong>
          <PactBondSummary values={pactBondValues} />
        </div>
        <AffinitySourceInputs sources={sources} onChange={onSourcesChange} />
      </div>
    </>
  );
}
