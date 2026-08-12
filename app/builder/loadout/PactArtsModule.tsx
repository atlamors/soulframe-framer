"use client";
import { pactById } from "@/src/data/pacts";
import type { ArtAllocation, SoulframeBuild } from "@/src/domain/types";
import { PactPicker } from "../pickers/pact/PactPicker";
import { PactBanner } from "./PactBanner";

export function PactArtsModule({ build, isOpen, allocations, presentation = "default", onOpen, onClose, onEquip, onAllocationChange, onResetAllocation }: {
  build: SoulframeBuild; isOpen: boolean; allocations: Record<string, ArtAllocation>; onOpen: () => void; onClose: () => void;
  onEquip: (id: string) => void; onAllocationChange: (id: string, value: ArtAllocation) => void;
  presentation?: "default" | "foundation";
  onResetAllocation?: (id: string) => void;
}) {
  const pact = build.pact.itemId ? pactById.get(build.pact.itemId) : undefined;
  const resetAllocation = (id: string) => onResetAllocation ? onResetAllocation(id) : onAllocationChange(id, {});

  return <><PactBanner pact={pact} artAllocation={build.pact.artAllocation} isActive={isOpen}
    presentation={presentation} onOpen={onOpen} />
    {isOpen ? <PactPicker currentId={build.pact.itemId} allocations={allocations} onClose={onClose} onEquip={onEquip}
      onAllocationChange={onAllocationChange} onResetAllocation={resetAllocation} /> : null}</>;
}
