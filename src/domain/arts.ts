import {
  combatArtByName,
  pactArtTreeByPactId,
} from "../data/arts";
import {
  VIRTUE_IDS,
  type ArtAllocation,
  type ArtNodeDefinition,
  type Pact,
  type PactArtRank,
  type VirtueValues,
} from "./types";

export const STANDARD_PACT_ART_POINT_CAP = 30;
export const WYLD_PACT_ART_POINT_CAP = 60;

export interface NormalizedArtAllocation {
  value: ArtAllocation;
  pointsSpent: number;
  changed: boolean;
}

export interface AllocatedArtEffect {
  id: string;
  source: string;
  text: string;
  rank: number;
  maxRank: number;
  mechanicStatus: ArtNodeDefinition["mechanicStatus"];
}

function readRank(value: unknown, maxRank: number) {
  return typeof value === "number" && Number.isInteger(value)
    ? Math.max(0, Math.min(maxRank, value))
    : 0;
}

export function getArtNodePointCost(node: ArtNodeDefinition, rank: number) {
  return node.rankCosts
    .slice(0, readRank(rank, node.maxRank))
    .reduce((sum, cost) => sum + cost, 0);
}

export function getArtPointsSpent(
  nodes: readonly ArtNodeDefinition[],
  allocation: ArtAllocation,
) {
  return nodes.reduce(
    (sum, node) => sum + getArtNodePointCost(node, allocation[node.id] ?? 0),
    0,
  );
}

export function normalizeArtAllocation(
  allocation: unknown,
  nodes: readonly ArtNodeDefinition[],
  pointCap = Number.POSITIVE_INFINITY,
): NormalizedArtAllocation {
  const source =
    typeof allocation === "object" && allocation !== null && !Array.isArray(allocation)
      ? (allocation as Record<string, unknown>)
      : {};
  const value: ArtAllocation = {};
  let pointsSpent = 0;

  for (const node of nodes) {
    const requestedRank = readRank(source[node.id], node.maxRank);
    let acceptedRank = 0;
    for (let rank = 1; rank <= requestedRank; rank += 1) {
      const cost = node.rankCosts[rank - 1] ?? 0;
      if (pointsSpent + cost > pointCap) break;
      pointsSpent += cost;
      acceptedRank = rank;
    }
    if (acceptedRank > 0) value[node.id] = acceptedRank;
  }

  const suppliedEntries = Object.entries(source).filter(([, rank]) => rank !== 0);
  const normalizedEntries = Object.entries(value);
  const changed =
    suppliedEntries.length !== normalizedEntries.length ||
    normalizedEntries.some(([id, rank]) => source[id] !== rank);

  return { value, pointsSpent, changed };
}

export function getPactArtPointCap(pact?: Pick<Pact, "variant"> | null) {
  return pact?.variant === "wyld"
    ? WYLD_PACT_ART_POINT_CAP
    : STANDARD_PACT_ART_POINT_CAP;
}

export function createDefaultPactArtAllocation(
  pact?: Pick<Pact, "id" | "variant"> | null,
): ArtAllocation {
  if (!pact || pact.variant !== "wyld") return {};
  const tree = pactArtTreeByPactId.get(pact.id);
  if (!tree) return {};
  return normalizeArtAllocation(
    Object.fromEntries(tree.nodes.map((node) => [node.id, node.maxRank])),
    tree.nodes,
    WYLD_PACT_ART_POINT_CAP,
  ).value;
}

export function normalizePactArtAllocation(
  pact: Pick<Pact, "id" | "variant"> | undefined,
  allocation: unknown,
): NormalizedArtAllocation {
  const tree = pact ? pactArtTreeByPactId.get(pact.id) : undefined;
  if (!tree) {
    return {
      value: {},
      pointsSpent: 0,
      changed:
        typeof allocation !== "object" ||
        allocation === null ||
        Object.keys(allocation).length > 0,
    };
  }
  return normalizeArtAllocation(
    allocation,
    tree.nodes,
    getPactArtPointCap(pact),
  );
}

export function createDefaultCombatArtAllocation(): ArtAllocation {
  return {};
}

export function normalizeCombatArtAllocation(
  artName: string,
  allocation: unknown,
): NormalizedArtAllocation {
  const art = combatArtByName.get(artName);
  if (!art) {
    return {
      value: {},
      pointsSpent: 0,
      changed:
        typeof allocation !== "object" ||
        allocation === null ||
        Object.keys(allocation).length > 0,
    };
  }
  return normalizeArtAllocation(allocation, art.nodes);
}

export function normalizeActiveCombatArtAllocations(
  allocations: unknown,
  activeArtNames: readonly string[],
) {
  const source =
    typeof allocations === "object" && allocations !== null && !Array.isArray(allocations)
      ? (allocations as Record<string, unknown>)
      : {};
  const value: Record<string, ArtAllocation> = {};
  let changed = Object.keys(source).some((name) => !activeArtNames.includes(name));

  for (const artName of [...new Set(activeArtNames)]) {
    if (!combatArtByName.has(artName)) continue;
    const normalized = normalizeCombatArtAllocation(artName, source[artName]);
    value[artName] = normalized.value;
    changed ||= normalized.changed || !(artName in source);
  }

  return { value, changed };
}

export function getPactVirtueArtRanks(
  pactId: string | null,
  allocation: ArtAllocation,
) {
  const tree = pactId ? pactArtTreeByPactId.get(pactId) : undefined;
  return Object.fromEntries(
    VIRTUE_IDS.map((virtue) => {
      const node = tree?.nodes.find(
        (candidate) => candidate.kind === "virtue" && candidate.virtue === virtue,
      );
      return [virtue, readRank(node ? allocation[node.id] : 0, 3) as PactArtRank];
    }),
  ) as Record<(typeof VIRTUE_IDS)[number], PactArtRank>;
}

export function getPactArtVirtueBonuses(
  pactId: string | null,
  allocation: ArtAllocation,
): VirtueValues {
  const tree = pactId ? pactArtTreeByPactId.get(pactId) : undefined;
  return Object.fromEntries(
    VIRTUE_IDS.map((virtue) => {
      const node = tree?.nodes.find(
        (candidate) => candidate.kind === "virtue" && candidate.virtue === virtue,
      );
      const rank = node ? readRank(allocation[node.id], node.maxRank) : 0;
      const value = rank > 0 ? node?.rankValues?.[rank - 1] : 0;
      return [virtue, typeof value === "number" ? value : 0];
    }),
  ) as VirtueValues;
}

function formatAllocatedEffect(
  node: ArtNodeDefinition,
  rank: number,
  source: string,
): AllocatedArtEffect {
  const rankValue = node.rankValues?.[rank - 1];
  const suffix = rankValue === undefined ? "" : ` Current rank: ${rankValue}.`;
  return {
    id: node.id,
    source,
    text: `${node.description}${suffix}`,
    rank,
    maxRank: node.maxRank,
    mechanicStatus: node.mechanicStatus,
  };
}

export function getAllocatedPactArtEffects(
  pactId: string | null,
  pactName: string,
  allocation: ArtAllocation,
) {
  const tree = pactId ? pactArtTreeByPactId.get(pactId) : undefined;
  if (!tree) return [];
  return tree.nodes.flatMap((node) => {
    const rank = readRank(allocation[node.id], node.maxRank);
    return rank > 0
      ? [formatAllocatedEffect(node, rank, `${pactName} · Pact Art`)]
      : [];
  });
}

export function getAllocatedCombatArtEffects(
  artName: string,
  allocation: ArtAllocation,
) {
  const art = combatArtByName.get(artName);
  if (!art) return [];
  return art.nodes.flatMap((node) => {
    const rank = readRank(allocation[node.id], node.maxRank);
    return rank > 0
      ? [formatAllocatedEffect(node, rank, `${artName} · Combat Art`)]
      : [];
  });
}
