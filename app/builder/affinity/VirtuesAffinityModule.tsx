"use client";
import type { AffinitySources, SoulframeBuild, VirtueValues } from "@/src/domain/types";
import { VirtueAlignment } from "./VirtueAlignment";

export function VirtuesAffinityModule({ build, bonuses, presentation = "default", showSourceControls = true, onVirtuesChange, onSourcesChange }: {
  build: SoulframeBuild;
  bonuses: VirtueValues;
  presentation?: "default" | "foundation";
  showSourceControls?: boolean;
  onVirtuesChange: (v: VirtueValues) => void;
  onSourcesChange: (s: AffinitySources) => void;
}) {
  return <VirtueAlignment virtues={build.virtues} bonuses={bonuses} sources={build.affinitySources}
    presentation={presentation} showSourceControls={showSourceControls} onChange={onVirtuesChange} onSourcesChange={onSourcesChange} />;
}
