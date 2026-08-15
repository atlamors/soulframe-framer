import { armorCatalogue } from "../../data/catalogue";
import { pactCatalogue } from "../../data/pacts";
import { joineryCatalogue } from "../../data/joineries";
import { runeCatalogue } from "../../data/runes";
import { talismanCatalogue } from "../../data/talismans";
import { totemCatalogue } from "../../data/totems";
import { temperCatalogue } from "../../data/tempers";
import { weaponCatalogue } from "../../data/weapons";
import {
  BUILD_SCHEMA_VERSION,
  deserializeBuild,
  parseStoredBuild,
  type BuildCatalogue,
} from "../serialization";
import type {
  BuildPlannerArtifactCodec,
  BuildPlannerArtifactGameId,
} from "./types";

const SOULFRAME_BUILD_CATALOGUE: BuildCatalogue = {
  armor: armorCatalogue,
  talismans: talismanCatalogue,
  weapons: weaponCatalogue,
  pacts: pactCatalogue,
  runes: runeCatalogue,
  totems: totemCatalogue,
  tempers: temperCatalogue,
  joineries: joineryCatalogue,
};

export const SOULFRAME_FRAME_HANDOFF_MAX_LENGTH = 32_000;

const SOULFRAME_PAYLOAD_KEYS = new Set([
  "schemaVersion",
  "name",
  "virtues",
  "affinitySources",
  "equipment",
  "pact",
  "combatArts",
  "weaponEnhancements",
]);
const FORBIDDEN_PUBLICATION_LINEAGE_KEYS = new Set([
  "attribution",
  "lineage",
  "ownerid",
  "publicationid",
  "publisher",
  "releaseid",
  "sourceartifactid",
  "sourcestageid",
]);

export class BuildPlannerArtifactCodecError extends Error {
  readonly name = "BuildPlannerArtifactCodecError";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findPublicationLineageKey(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findPublicationLineageKey(item);
      if (found) return found;
    }
    return null;
  }
  if (!isRecord(value)) return null;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_PUBLICATION_LINEAGE_KEYS.has(key.toLowerCase())) return key;
    const found = findPublicationLineageKey(nested);
    if (found) return found;
  }
  return null;
}

function canonicalizeSoulframePayload(payload: unknown) {
  if (!isRecord(payload)) {
    throw new BuildPlannerArtifactCodecError("The Frame payload must be an object.");
  }
  const unknownKey = Object.keys(payload).find(
    (key) => !SOULFRAME_PAYLOAD_KEYS.has(key),
  );
  if (unknownKey) {
    throw new BuildPlannerArtifactCodecError(
      `The Frame payload contains unsupported field ${unknownKey}.`,
    );
  }
  const lineageKey = findPublicationLineageKey(payload);
  if (lineageKey) {
    throw new BuildPlannerArtifactCodecError(
      `The Frame payload cannot contain publication field ${lineageKey}.`,
    );
  }

  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(payload);
  } catch {
    throw new BuildPlannerArtifactCodecError(
      "The Frame payload is not serializable.",
    );
  }
  if (serialized === undefined) {
    throw new BuildPlannerArtifactCodecError(
      "The Frame payload is not serializable.",
    );
  }

  const parsed = parseStoredBuild(serialized, SOULFRAME_BUILD_CATALOGUE);
  if (!parsed.ok) throw new BuildPlannerArtifactCodecError(parsed.error);
  if (
    parsed.sourceSchemaVersion !== 5 &&
    parsed.sourceSchemaVersion !== BUILD_SCHEMA_VERSION
  ) {
    throw new BuildPlannerArtifactCodecError(
      `Stored Frame artifacts must use Soulframe schema version 5 or ${BUILD_SCHEMA_VERSION}.`,
    );
  }
  return parsed.build;
}

export const SOULFRAME_BUILD_PLANNER_ARTIFACT_CODEC = {
  gameId: "soulframe",
  currentSchemaVersion: BUILD_SCHEMA_VERSION,
  canonicalize: canonicalizeSoulframePayload,
} as const satisfies BuildPlannerArtifactCodec<"soulframe">;

export function decodeSoulframeBuildHandoff(encoded: string) {
  const decoded = deserializeBuild(encoded, SOULFRAME_BUILD_CATALOGUE);
  if (!decoded.ok) throw new BuildPlannerArtifactCodecError(decoded.error);
  if (decoded.sourceSchemaVersion !== BUILD_SCHEMA_VERSION) {
    throw new BuildPlannerArtifactCodecError(
      `Publisher creation accepts only a current schema-v${BUILD_SCHEMA_VERSION} Frame handoff.`,
    );
  }
  return decoded.build;
}

const BUILD_PLANNER_ARTIFACT_CODECS = {
  soulframe: SOULFRAME_BUILD_PLANNER_ARTIFACT_CODEC,
} as const satisfies {
  [TGameId in BuildPlannerArtifactGameId]: BuildPlannerArtifactCodec<TGameId>;
};

export function resolveBuildPlannerArtifactCodec<
  TGameId extends BuildPlannerArtifactGameId,
>(gameId: TGameId): BuildPlannerArtifactCodec<TGameId> {
  const codec = BUILD_PLANNER_ARTIFACT_CODECS[gameId];
  if (!codec) {
    throw new BuildPlannerArtifactCodecError(
      `No Build Planner Artifact codec is registered for ${gameId}.`,
    );
  }
  return codec as BuildPlannerArtifactCodec<TGameId>;
}

export function parseBuildPlannerArtifactGameId(
  value: unknown,
): BuildPlannerArtifactGameId {
  if (typeof value === "string" && value in BUILD_PLANNER_ARTIFACT_CODECS) {
    return value as BuildPlannerArtifactGameId;
  }
  throw new BuildPlannerArtifactCodecError(
    "The Build Planner Artifact has an unsupported game.",
  );
}
