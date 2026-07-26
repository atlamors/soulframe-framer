import {
  VIRTUE_IDS,
  type VirtueId,
  type VirtueValues,
} from "./types";

export const MAX_VIRTUE_POINTS = 99;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function allocateByWeight(
  requestedTotal: number,
  weights: VirtueValues,
): VirtueValues {
  const total = clamp(
    Math.round(Number.isFinite(requestedTotal) ? requestedTotal : 0),
    0,
    MAX_VIRTUE_POINTS,
  );
  const weightTotal = VIRTUE_IDS.reduce(
    (sum, virtue) => sum + Math.max(0, weights[virtue]),
    0,
  );
  const normalizedWeights =
    weightTotal === 0
      ? { courage: 1, spirit: 1, grace: 1 }
      : weights;
  const normalizedTotal = weightTotal || 3;
  const exact = Object.fromEntries(
    VIRTUE_IDS.map((virtue) => [
      virtue,
      (Math.max(0, normalizedWeights[virtue]) / normalizedTotal) * total,
    ]),
  ) as VirtueValues;
  const allocated = Object.fromEntries(
    VIRTUE_IDS.map((virtue) => [virtue, Math.floor(exact[virtue])]),
  ) as VirtueValues;
  let remainder =
    total -
    VIRTUE_IDS.reduce((sum, virtue) => sum + allocated[virtue], 0);
  const remainderOrder = [...VIRTUE_IDS].sort(
    (left, right) =>
      exact[right] -
        Math.floor(exact[right]) -
        (exact[left] - Math.floor(exact[left])) ||
      VIRTUE_IDS.indexOf(left) - VIRTUE_IDS.indexOf(right),
  );

  for (const virtue of remainderOrder) {
    if (remainder === 0) break;
    allocated[virtue] += 1;
    remainder -= 1;
  }

  return allocated;
}

export function distributeVirtueTotal(
  total: number,
  current: VirtueValues,
): VirtueValues {
  return allocateByWeight(total, current);
}

export function getVirtueAlignmentPoint(virtues: VirtueValues) {
  const total = VIRTUE_IDS.reduce((sum, virtue) => sum + virtues[virtue], 0);
  const values =
    total === 0 ? { courage: 1, spirit: 1, grace: 1 } : virtues;
  const valueTotal = total || 3;

  return {
    x: (values.spirit * 0.5 + values.grace) / valueTotal,
    y: (values.courage + values.grace) / valueTotal,
  };
}

export function virtuesFromAlignmentPoint(
  total: number,
  requestedX: number,
  requestedY: number,
): VirtueValues {
  const y = clamp(requestedY, 0, 1);
  const minimumX = 0.5 * (1 - y);
  const maximumX = 0.5 * (1 + y);
  const x = clamp(requestedX, minimumX, maximumX);
  const weights: VirtueValues = {
    courage: maximumX - x,
    spirit: 1 - y,
    grace: x - minimumX,
  };

  return allocateByWeight(total, weights);
}

export function shiftVirtueAlignment(
  current: VirtueValues,
  target: VirtueId,
): VirtueValues {
  const donors = VIRTUE_IDS.filter(
    (virtue) => virtue !== target && current[virtue] > 0,
  ).sort((left, right) => current[right] - current[left]);
  const donor = donors[0];
  if (!donor) return current;

  return {
    ...current,
    [donor]: current[donor] - 1,
    [target]: current[target] + 1,
  };
}
