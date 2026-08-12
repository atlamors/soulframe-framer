import {
  VIRTUE_IDS,
  type VirtueId,
  type VirtueValues,
} from "./types";
import {
  MAX_ALLOCATABLE_AFFINITY,
  MIN_BASE_VIRTUE_VALUE,
} from "./affinity";

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

interface AlignmentPoint {
  x: number;
  y: number;
}

const TRIANGLE_VERTICES = [
  { x: 0.5, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
] as const;

function closestPointOnSegment(
  point: AlignmentPoint,
  start: AlignmentPoint,
  end: AlignmentPoint,
): AlignmentPoint {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const lengthSquared = segmentX ** 2 + segmentY ** 2;
  const projection =
    ((point.x - start.x) * segmentX +
      (point.y - start.y) * segmentY) /
    lengthSquared;
  const amount = clamp(projection, 0, 1);

  return {
    x: start.x + segmentX * amount,
    y: start.y + segmentY * amount,
  };
}

export function projectVirtueAlignmentPoint(
  requestedX: number,
  requestedY: number,
): AlignmentPoint {
  const point = {
    x: Number.isFinite(requestedX) ? requestedX : 0.5,
    y: Number.isFinite(requestedY) ? requestedY : 2 / 3,
  };
  const inside =
    point.y >= 0 &&
    point.y <= 1 &&
    point.x >= 0.5 * (1 - point.y) &&
    point.x <= 0.5 * (1 + point.y);

  if (inside) return point;

  const candidates = TRIANGLE_VERTICES.map((vertex, index) =>
    closestPointOnSegment(
      point,
      vertex,
      TRIANGLE_VERTICES[(index + 1) % TRIANGLE_VERTICES.length],
    ),
  );

  return candidates.reduce((closest, candidate) => {
    const closestDistance =
      (closest.x - point.x) ** 2 + (closest.y - point.y) ** 2;
    const candidateDistance =
      (candidate.x - point.x) ** 2 + (candidate.y - point.y) ** 2;
    return candidateDistance < closestDistance ? candidate : closest;
  });
}

function allocateByWeight(
  requestedTotal: number,
  weights: VirtueValues,
): VirtueValues {
  const total = clamp(
    Math.round(Number.isFinite(requestedTotal) ? requestedTotal : 0),
    0,
    MAX_ALLOCATABLE_AFFINITY,
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
  const normalizedTotal = clamp(
    Math.round(Number.isFinite(total) ? total : 0),
    MIN_BASE_VIRTUE_VALUE * VIRTUE_IDS.length,
    MAX_ALLOCATABLE_AFFINITY,
  );
  const allocated = allocateByWeight(
    normalizedTotal - MIN_BASE_VIRTUE_VALUE * VIRTUE_IDS.length,
    Object.fromEntries(
      VIRTUE_IDS.map((virtue) => [
        virtue,
        Math.max(0, current[virtue] - MIN_BASE_VIRTUE_VALUE),
      ]),
    ) as VirtueValues,
  );

  return Object.fromEntries(
    VIRTUE_IDS.map((virtue) => [
      virtue,
      allocated[virtue] + MIN_BASE_VIRTUE_VALUE,
    ]),
  ) as VirtueValues;
}

export function getVirtueAlignmentPoint(virtues: VirtueValues) {
  const values = Object.fromEntries(
    VIRTUE_IDS.map((virtue) => [
      virtue,
      Math.max(0, virtues[virtue] - MIN_BASE_VIRTUE_VALUE),
    ]),
  ) as VirtueValues;
  const total = VIRTUE_IDS.reduce((sum, virtue) => sum + values[virtue], 0);
  const geometryValues =
    total === 0 ? { courage: 1, spirit: 1, grace: 1 } : values;
  const valueTotal = total || VIRTUE_IDS.length;

  return {
    x: (geometryValues.spirit * 0.5 + geometryValues.grace) / valueTotal,
    y: (geometryValues.courage + geometryValues.grace) / valueTotal,
  };
}

export function virtuesFromAlignmentPoint(
  total: number,
  requestedX: number,
  requestedY: number,
): VirtueValues {
  const { x, y } = projectVirtueAlignmentPoint(requestedX, requestedY);
  const minimumX = 0.5 * (1 - y);
  const maximumX = 0.5 * (1 + y);
  const weights: VirtueValues = {
    courage: maximumX - x,
    spirit: 1 - y,
    grace: x - minimumX,
  };

  const normalizedTotal = clamp(
    Math.round(Number.isFinite(total) ? total : 0),
    MIN_BASE_VIRTUE_VALUE * VIRTUE_IDS.length,
    MAX_ALLOCATABLE_AFFINITY,
  );
  const allocated = allocateByWeight(
    normalizedTotal - MIN_BASE_VIRTUE_VALUE * VIRTUE_IDS.length,
    weights,
  );

  return Object.fromEntries(
    VIRTUE_IDS.map((virtue) => [
      virtue,
      allocated[virtue] + MIN_BASE_VIRTUE_VALUE,
    ]),
  ) as VirtueValues;
}

export function shiftVirtueAlignment(
  current: VirtueValues,
  target: VirtueId,
): VirtueValues {
  const donors = VIRTUE_IDS.filter(
    (virtue) =>
      virtue !== target && current[virtue] > MIN_BASE_VIRTUE_VALUE,
  ).sort((left, right) => current[right] - current[left]);
  const donor = donors[0];
  if (!donor) return current;

  return {
    ...current,
    [donor]: current[donor] - 1,
    [target]: current[target] + 1,
  };
}
