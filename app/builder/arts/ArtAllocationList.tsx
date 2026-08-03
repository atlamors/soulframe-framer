"use client";

import Image from "next/image";
import {
  getArtNodePointCost,
  getArtPointsSpent,
  normalizeArtAllocation,
} from "@/src/domain/arts";
import type {
  ArtAllocation,
  ArtNodeDefinition,
} from "@/src/domain/types";
import {
  ART_ALLOCATION_CLASS_NAMES,
  ART_ALLOCATION_ROW_INDENT_CLASS_NAMES,
} from "./artAllocationClassNames";

const VIRTUE_LABELS = {
  courage: "Courage",
  spirit: "Spirit",
  grace: "Grace",
} as const;

export function formatArtRankOutcome(
  node: ArtNodeDefinition,
  rank: number,
): string | null {
  const valueIndex = rank > 0 ? rank - 1 : 0;
  const rankValue = node.rankValues?.[valueIndex];
  if (rankValue === undefined) return null;

  const value =
    node.virtue && typeof rankValue === "number"
      ? `${rankValue >= 0 ? "+" : ""}${rankValue} ${VIRTUE_LABELS[node.virtue]}`
      : String(rankValue);
  return `${node.name} (${value})`;
}

export function ArtAllocationList({
  label,
  nodes,
  allocation,
  pointCap,
  onChange,
  onReset,
  getIcon,
}: {
  label: string;
  nodes: readonly ArtNodeDefinition[];
  allocation: ArtAllocation;
  pointCap?: number;
  onChange: (allocation: ArtAllocation) => void;
  onReset: () => void;
  getIcon?: (node: ArtNodeDefinition) => string | undefined;
}) {
  const pointsSpent = getArtPointsSpent(nodes, allocation);
  const isEmpty = pointsSpent === 0;

  const setRank = (node: ArtNodeDefinition, nextRank: number) => {
    const next = { ...allocation };
    if (nextRank <= 0) delete next[node.id];
    else next[node.id] = nextRank;
    onChange(normalizeArtAllocation(next, nodes, pointCap).value);
  };

  return (
    <section className={ART_ALLOCATION_CLASS_NAMES.root} aria-label={label}>
      <header className={ART_ALLOCATION_CLASS_NAMES.summary}>
        <span className={ART_ALLOCATION_CLASS_NAMES.summaryCopy}>
          <small className={ART_ALLOCATION_CLASS_NAMES.summaryLabel}>
            Art point level
          </small>
          <strong className={ART_ALLOCATION_CLASS_NAMES.summaryValue}>
            {pointsSpent}
            {pointCap === undefined ? " spent" : ` / ${pointCap}`}
          </strong>
        </span>
        <button
          type="button"
          className={ART_ALLOCATION_CLASS_NAMES.reset}
          onClick={onReset}
          disabled={isEmpty && pointCap === undefined}
        >
          Reset current tree
        </button>
      </header>
      <div className={ART_ALLOCATION_CLASS_NAMES.list}>
        {nodes.map((node) => {
          const rank = allocation[node.id] ?? 0;
          const nextCost =
            rank < node.maxRank
              ? getArtNodePointCost(node, rank + 1) -
                getArtNodePointCost(node, rank)
              : 0;
          const canIncrease =
            rank < node.maxRank &&
            (pointCap === undefined || pointsSpent + nextCost <= pointCap);
          const icon = getIcon?.(node) ??
            (node.virtue ? `/icons/${node.virtue}.png` : undefined);
          const outcome = formatArtRankOutcome(node, rank);
          return (
            <article
              className={`${ART_ALLOCATION_CLASS_NAMES.row} ${ART_ALLOCATION_ROW_INDENT_CLASS_NAMES[node.kind]}`}
              data-art-kind={node.kind}
              key={node.id}
            >
              <span className={ART_ALLOCATION_CLASS_NAMES.art} aria-hidden="true">
                {icon ? (
                  <Image
                    className={ART_ALLOCATION_CLASS_NAMES.image}
                    src={icon}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                  />
                ) : (
                  "✦"
                )}
              </span>
              <span className={ART_ALLOCATION_CLASS_NAMES.copy}>
                <small className={ART_ALLOCATION_CLASS_NAMES.meta}>
                  {node.kind === "virtue"
                    ? "Virtue"
                    : node.kind === "passive"
                      ? "Pact passive"
                      : node.kind === "combat"
                        ? "Combat Art"
                        : "General Art"}
                </small>
                <strong className={ART_ALLOCATION_CLASS_NAMES.name}>
                  {node.name}
                </strong>
                <span className={ART_ALLOCATION_CLASS_NAMES.description}>
                  {node.description}
                </span>
                {node.mechanicStatus === "descriptive" ? (
                  <small className={ART_ALLOCATION_CLASS_NAMES.unmodeled}>
                    Conditional or descriptive; not added to unconditional totals.
                  </small>
                ) : null}
              </span>
              <span className={ART_ALLOCATION_CLASS_NAMES.trailing}>
                {outcome ? (
                  <small className={ART_ALLOCATION_CLASS_NAMES.outcome}>
                    {outcome}
                  </small>
                ) : null}
                <span
                  className={ART_ALLOCATION_CLASS_NAMES.controls}
                  role="group"
                  aria-label={`${node.name} rank ${rank} of ${node.maxRank}`}
                >
                  <button
                    type="button"
                    className={ART_ALLOCATION_CLASS_NAMES.control}
                    onClick={() => setRank(node, rank - 1)}
                    disabled={rank === 0}
                    aria-label={`Decrease ${node.name}`}
                  >
                    −
                  </button>
                  <strong className={ART_ALLOCATION_CLASS_NAMES.rank}>
                    {rank} / {node.maxRank}
                  </strong>
                  <button
                    type="button"
                    className={ART_ALLOCATION_CLASS_NAMES.control}
                    onClick={() => setRank(node, rank + 1)}
                    disabled={!canIncrease}
                    aria-label={`Increase ${node.name}`}
                  >
                    +
                  </button>
                </span>
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
