import { VIRTUE_IDS } from "@/src/domain/types";
import type { VirtueValues } from "@/src/domain/types";
import { virtueMeta } from "../constants";

export function formatDelta(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}

export function formatVirtueVector(values: VirtueValues) {
  return VIRTUE_IDS.flatMap((virtue) =>
    values[virtue] > 0
      ? `${virtueMeta[virtue].label.slice(0, 1)}${values[virtue]}`
      : [],
  ).join(" · ");
}
