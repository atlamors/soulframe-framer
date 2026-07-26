import {
  VIRTUE_IDS,
  type AffinitySources,
  type VirtueId,
  type VirtueValues,
} from "./types";

export const BASE_AFFINITY_POINTS = 16;
export const MAX_ENVOY_RANK = 99;
export const MAX_ALLOCATABLE_AFFINITY =
  BASE_AFFINITY_POINTS + MAX_ENVOY_RANK;
export const PACT_ART_BONUS_BY_RANK = [0, 1, 3, 6] as const;

export const EMPTY_AFFINITY_SOURCES: AffinitySources = {
  envoyRank: 0,
  pactArts: { courage: 0, spirit: 0, grace: 0 },
  fables: {
    shewolf: null,
    wasteBear: null,
  },
};

export function getAllocatableAffinity(sources: AffinitySources) {
  return BASE_AFFINITY_POINTS + sources.envoyRank;
}

export function getAffinityBonuses(
  sources: AffinitySources,
): VirtueValues {
  const bonuses = Object.fromEntries(
    VIRTUE_IDS.map((virtue) => [
      virtue,
      PACT_ART_BONUS_BY_RANK[sources.pactArts[virtue]],
    ]),
  ) as VirtueValues;

  for (const virtue of Object.values(sources.fables)) {
    if (virtue) bonuses[virtue] += 1;
  }

  return bonuses;
}

export function inferAffinitySources(virtues: VirtueValues): AffinitySources {
  const total = VIRTUE_IDS.reduce(
    (sum, virtue) => sum + virtues[virtue],
    0,
  );

  return {
    ...EMPTY_AFFINITY_SOURCES,
    pactArts: { ...EMPTY_AFFINITY_SOURCES.pactArts },
    fables: { ...EMPTY_AFFINITY_SOURCES.fables },
    envoyRank: Math.min(
      MAX_ENVOY_RANK,
      Math.max(0, total - BASE_AFFINITY_POINTS),
    ),
  };
}

export function addVirtueValues(
  ...values: readonly VirtueValues[]
): VirtueValues {
  return Object.fromEntries(
    VIRTUE_IDS.map((virtue: VirtueId) => [
      virtue,
      values.reduce((sum, value) => sum + value[virtue], 0),
    ]),
  ) as VirtueValues;
}
