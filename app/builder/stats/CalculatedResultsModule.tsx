import { ChevronDown } from "lucide-react";
import { joineryById } from "@/src/data/joineries";
import { weaponById } from "@/src/data/weapons";
import { resolveValidWeaponJoinery } from "@/src/domain/weapon-configuration";
import {
  DEFENSE_IDS,
  VIRTUE_IDS,
  type BuildCalculation,
  type SoulframeBuild,
} from "@/src/domain/types";
import { defenseMeta, virtueMeta } from "../constants";
import { WeaponPrimaryHud } from "../loadout/WeaponPrimaryHud";
import { ActiveBuildEffects } from "./ActiveBuildEffects";

export function CalculatedResultsModule({
  build,
  calculation,
}: {
  build: SoulframeBuild;
  calculation: BuildCalculation;
}) {
  const weapons = (["mainHand", "offHand"] as const).flatMap((slot) => {
    const id = build.equipment[slot];
    const weapon = id ? weaponById.get(id) : undefined;
    const joinery = resolveValidWeaponJoinery(
      build.weaponEnhancements[slot].joineryId,
      weapon,
      joineryById,
    );
    return weapon
      ? [
          {
            slot,
            weapon,
            joinery,
            craftwork: build.weaponEnhancements[slot].craftwork,
            temperIds: build.weaponEnhancements[slot].tempers,
          },
        ]
      : [];
  });
  const weaponGridClassName =
    weapons.length > 1
      ? "grid grid-cols-1 gap-2 compact-desktop:grid-cols-2"
      : "grid grid-cols-1 gap-2";

  return (
    <details className="group/results rounded-md border border-line/40 bg-surface-deep/35">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 border-b border-transparent px-3.5 font-sans text-sm font-bold text-ink-soft transition-colors hover:bg-control/35 hover:text-ink focus-visible:bg-control/35 focus-visible:text-ink focus-visible:outline-none focus-visible:shadow-focus group-open/results:border-line/35 motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">Calculated Results</span>
        {calculation.warnings.length > 0 ? (
          <small className="rounded-sm bg-warning/10 px-2 py-1 font-sans text-2xs font-bold uppercase tracking-wide text-warning">
            {calculation.warnings.length} {calculation.warnings.length === 1 ? "warning" : "warnings"}
          </small>
        ) : null}
        <ChevronDown
          className="size-4 flex-none text-ink-muted transition-transform group-open/results:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>

      <div className="space-y-3 p-3">
        <div
          className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line/35 bg-line/35 mobile-wide:grid-cols-3 compact-desktop:grid-cols-6"
          aria-label="Derived build statistics"
        >
          {VIRTUE_IDS.map((id) => (
            <div className="min-w-0 bg-control/35 px-2.5 py-2" key={id}>
              <small className="block truncate font-sans text-2xs font-bold uppercase tracking-wide text-ink-muted">
                {virtueMeta[id].label}
              </small>
              <strong className="mt-0.5 block font-display text-lg font-normal leading-none lining-nums tabular-nums text-ink">
                {calculation.effectiveVirtues[id]}
              </strong>
            </div>
          ))}
          {DEFENSE_IDS.map((id) => (
            <div className="min-w-0 bg-control/35 px-2.5 py-2" key={id}>
              <small className="block truncate font-sans text-2xs font-bold uppercase tracking-wide text-ink-muted">
                {defenseMeta[id].label}
              </small>
              <strong className="mt-0.5 block font-display text-lg font-normal leading-none lining-nums tabular-nums text-ink">
                {calculation.defenses[id]}
              </strong>
            </div>
          ))}
        </div>

        {weapons.length > 0 ? (
          <div className={weaponGridClassName}>
            {weapons.map(({ slot, weapon, joinery, craftwork, temperIds }) => (
              <WeaponPrimaryHud
                craftwork={craftwork}
                key={slot}
                item={weapon}
                joinery={joinery}
                temperIds={temperIds}
                virtues={calculation.effectiveVirtues}
              />
            ))}
          </div>
        ) : null}

        <ActiveBuildEffects build={build} mobileStatsState="expanded" />

        {calculation.warnings.length > 0 ? (
          <ul className="list-disc space-y-1 border-t border-line/30 pt-3 pl-5 font-sans text-xs leading-5 text-warning">
            {calculation.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
