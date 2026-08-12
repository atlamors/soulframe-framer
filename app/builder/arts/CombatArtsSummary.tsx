"use client";

import { combatArtByName } from "@/src/data/arts";
import { weaponById } from "@/src/data/weapons";
import {
  getArtPointsSpent,
  normalizeCombatArtAllocation,
} from "@/src/domain/arts";
import {
  WEAPON_HAND_SLOTS,
  type SoulframeBuild,
  type WeaponHandSlot,
} from "@/src/domain/types";
import { formatArtRankOutcome } from "./ArtAllocationList";

export const NO_COMBAT_ART_RANKS_LABEL = "No ranks allocated";

export interface CombatArtSummaryRank {
  nodeId: string;
  name: string;
  rank: number;
  maxRank: number;
  outcome: string | null;
}

export interface CombatArtSummaryEntry {
  name: string;
  pointsSpent: number;
  allocatedRanks: CombatArtSummaryRank[];
  sourceSlots: WeaponHandSlot[];
  openSlot: WeaponHandSlot;
}

export function getCombatArtSummaryEntries(
  build: SoulframeBuild,
): CombatArtSummaryEntry[] {
  const entries = new Map<string, CombatArtSummaryEntry>();

  for (const slot of WEAPON_HAND_SLOTS) {
    const weaponId = build.equipment[slot];
    const artName = weaponId ? weaponById.get(weaponId)?.combatArt : undefined;
    const art = artName ? combatArtByName.get(artName) : undefined;
    if (!artName || !art) continue;

    const existing = entries.get(artName);
    if (existing) {
      existing.sourceSlots.push(slot);
      continue;
    }

    const allocation = normalizeCombatArtAllocation(
      artName,
      build.combatArts[artName] ?? {},
    ).value;
    const allocatedRanks = art.nodes.flatMap((node) => {
      const rank = allocation[node.id] ?? 0;
      return rank > 0
        ? [{
            nodeId: node.id,
            name: node.name,
            rank,
            maxRank: node.maxRank,
            outcome: formatArtRankOutcome(node, rank),
          }]
        : [];
    });

    entries.set(artName, {
      name: artName,
      pointsSpent: getArtPointsSpent(art.nodes, allocation),
      allocatedRanks,
      sourceSlots: [slot],
      openSlot: slot,
    });
  }

  return [...entries.values()];
}

const SOURCE_SLOT_LABELS = {
  mainHand: "Main hand",
  offHand: "Off hand",
} as const satisfies Record<WeaponHandSlot, string>;

export function CombatArtsSummary({
  build,
  onSelect,
}: {
  build: SoulframeBuild;
  onSelect: (slot: WeaponHandSlot) => void;
}) {
  const entries = getCombatArtSummaryEntries(build);
  if (entries.length === 0) return null;

  return (
    <section
      className="mt-3 min-w-0"
      aria-label="Equipped Combat Art summary"
    >
      <header className="mb-2 px-0.5">
        <strong className="font-sans text-2xs font-bold uppercase tracking-wider text-ink-soft">
          Combat Arts
        </strong>
      </header>
      <div className="grid min-w-0 grid-cols-1 gap-2 mobile-wide:grid-cols-2">
        {entries.map((entry) => {
          const sourceLabel = entry.sourceSlots
            .map((slot) => SOURCE_SLOT_LABELS[slot])
            .join(" + ");
          return (
            <button
              type="button"
              className="group flex min-h-11 min-w-0 flex-col rounded-sm border border-line/45 bg-surface-deep/55 p-3 text-left text-ink-soft transition-colors hover:border-line-bright/65 hover:bg-surface-raised focus-visible:border-gold-bright focus-visible:bg-surface-raised focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none"
              aria-label={`Configure ${entry.name} Combat Art from ${sourceLabel}`}
              onClick={() => onSelect(entry.openSlot)}
              key={entry.name}
            >
              <span className="flex w-full min-w-0 items-start justify-between gap-3">
                <span className="min-w-0">
                  <strong className="truncate font-display text-lg font-normal leading-tight text-gold-bright">
                    {entry.name}
                  </strong>
                </span>
                <span className="flex flex-none flex-col items-end gap-0.5">
                  <strong className="font-display text-xl font-normal leading-none lining-nums tabular-nums text-ink">
                    {entry.pointsSpent}
                  </strong>
                  <small className="font-sans text-[0.625rem] font-bold uppercase tracking-wide text-ink-muted">
                    Points invested
                  </small>
                </span>
              </span>

              <span className="mt-2 grid w-full min-w-0 gap-1 border-t border-line/30 pt-2">
                {entry.allocatedRanks.length > 0 ? (
                  entry.allocatedRanks.map((allocated) => (
                    <span
                      className="flex min-w-0 items-baseline justify-between gap-2"
                      key={allocated.nodeId}
                    >
                      <strong className="min-w-0 truncate font-sans text-xs font-semibold text-ink-soft">
                        {allocated.outcome ?? allocated.name}
                      </strong>
                      <small className="flex-none font-sans text-[0.625rem] font-bold uppercase tracking-wide text-ink-muted">
                        Rank {allocated.rank} / {allocated.maxRank}
                      </small>
                    </span>
                  ))
                ) : (
                  <span className="font-sans text-xs text-ink-muted">
                    {NO_COMBAT_ART_RANKS_LABEL}
                  </span>
                )}
              </span>

              <span className="mt-2 flex w-full items-center justify-between gap-2 font-sans text-2xs font-bold uppercase tracking-wider text-ink-muted group-hover:text-gold-bright">
                <span>{sourceLabel}</span>
                <span aria-hidden="true">Configure →</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
