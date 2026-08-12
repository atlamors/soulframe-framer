"use client";

import { combatArtByName } from "@/src/data/arts";
import { weaponById } from "@/src/data/weapons";
import { normalizeCombatArtAllocation } from "@/src/domain/arts";
import type { ArtAllocation, SoulframeBuild, WeaponHandSlot } from "@/src/domain/types";
import { ArtAllocationList } from "./ArtAllocationList";

export function CombatArtsModule({ build, slots, onAllocationChange, onReset }: {
  build: SoulframeBuild;
  slots: readonly WeaponHandSlot[];
  onAllocationChange: (artName: string, allocation: ArtAllocation) => void;
  onReset?: (artName: string) => void;
}) {
  const arts = [...new Set(slots.flatMap((slot) => {
    const id = build.equipment[slot];
    const name = id ? weaponById.get(id)?.combatArt : undefined;
    return name && combatArtByName.has(name) ? [name] : [];
  }))];
  if (!arts.length) return <p className="p-4 text-sm text-ink-soft">No source-verified Combat Art tree is available for the equipped weapons.</p>;
  return <>{arts.map((name) => {
    const art = combatArtByName.get(name)!;
    return <ArtAllocationList key={name} label={`${name} Combat Arts`} nodes={art.nodes}
      allocation={build.combatArts[name] ?? {}}
      onChange={(value) => onAllocationChange(name, normalizeCombatArtAllocation(name, value).value)}
      onReset={() => onReset ? onReset(name) : onAllocationChange(name, {})} />;
  })}</>;
}
