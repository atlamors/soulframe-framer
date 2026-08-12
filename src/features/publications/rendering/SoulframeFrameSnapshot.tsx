import { armorById } from "@/src/data/catalogue";
import { pactById } from "@/src/data/pacts";
import { talismanById } from "@/src/data/talismans";
import { weaponById } from "@/src/data/weapons";
import type { SoulframeBuild } from "@/src/domain/types";

const equipmentSlots = [
  ["helm", "Helm"],
  ["cuirass", "Cuirass"],
  ["leggings", "Leggings"],
  ["talisman", "Talisman"],
  ["mainHand", "Main Hand"],
  ["offHand", "Off Hand"],
] as const;

function equipmentName(
  slot: (typeof equipmentSlots)[number][0],
  itemId: string | undefined,
): string {
  if (!itemId) return "Unassigned";
  if (slot === "talisman") return talismanById.get(itemId)?.name ?? itemId;
  if (slot === "mainHand" || slot === "offHand") {
    return weaponById.get(itemId)?.name ?? itemId;
  }
  return armorById.get(itemId)?.name ?? itemId;
}

export function SoulframeFrameDisplay({
  planner,
}: {
  planner: SoulframeBuild;
}) {
  return (
    <section
      aria-label={`${planner.name} planner summary`}
      className="border border-line/65 bg-surface-deep/85 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-sans text-2xs font-bold uppercase tracking-[0.16em] text-gold">
            Frame
          </p>
          <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-gold-bright">
            {planner.name}
          </h3>
        </div>
        <dl className="grid grid-cols-3 gap-px border border-line/55 bg-line/55 font-sans text-xs text-ink-muted">
          {(["courage", "spirit", "grace"] as const).map((virtue) => (
            <div key={virtue} className="min-w-16 bg-surface px-3 py-2 text-center">
              <dt className="text-3xs font-bold uppercase tracking-wider">{virtue}</dt>
              <dd className="mt-0.5 text-base font-bold text-gold-bright">{planner.virtues[virtue]}</dd>
            </div>
          ))}
        </dl>
      </div>

      <dl className="mt-5 grid gap-px border border-line/55 bg-line/55 sm:grid-cols-2">
        {equipmentSlots.map(([slot, label]) => (
          <div
            key={slot}
            className="flex min-h-12 min-w-0 items-center justify-between gap-3 bg-surface px-3 font-sans text-sm"
          >
            <dt className="text-ink-muted">{label}</dt>
            <dd className="truncate text-right font-bold text-ink-soft">
              {equipmentName(slot, planner.equipment[slot])}
            </dd>
          </div>
        ))}
        <div className="flex min-h-12 min-w-0 items-center justify-between gap-3 bg-surface px-3 font-sans text-sm">
          <dt className="text-ink-muted">Pact</dt>
          <dd className="truncate text-right font-bold text-ink-soft">
            {planner.pact.itemId
              ? pactById.get(planner.pact.itemId)?.name ?? planner.pact.itemId
              : "Unassigned"}
          </dd>
        </div>
        <div className="flex min-h-12 min-w-0 items-center justify-between gap-3 bg-surface px-3 font-sans text-sm">
          <dt className="text-ink-muted">Envoy Rank</dt>
          <dd className="font-bold text-ink-soft">
            {planner.affinitySources.envoyRank}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export const SoulframeFrameSnapshot = SoulframeFrameDisplay;
