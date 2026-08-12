import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BuildPlannerArtifactCodecError,
  parseBuildPlannerArtifactGameId,
  resolveBuildPlannerArtifactCodec,
} from "../../domain/artifacts/soulframe-codec";
import type {
  BuildPlannerArtifact,
  BuildPlannerArtifactGameId,
  BuildPlannerArtifactPayload,
  SaveBuildPlannerArtifactRequest,
} from "../../domain/artifacts/types";
import { validateBuildPlannerArtifact } from "../../domain/artifacts/validation";
import type { BuildPlannerArtifactService } from "../contracts/artifacts";
import type { AuthService } from "../contracts/auth";

const ARTIFACT_COLUMNS =
  "id,owner_id,game_id,name,schema_version,payload,created_at,updated_at";

type UnknownRow = Record<string, unknown>;

export class ArtifactOwnershipError extends Error {
  readonly name = "ArtifactOwnershipError";
}

export class ArtifactNotFoundError extends Error {
  readonly name = "ArtifactNotFoundError";
}

export class ArtifactDataError extends Error {
  readonly name = "ArtifactDataError";
}

export class ArtifactValidationError extends Error {
  readonly name = "ArtifactValidationError";
}

function isRow(value: unknown): value is UnknownRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(row: UnknownRow, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new ArtifactDataError(`Artifact data is missing ${key}.`);
  }
  return value;
}

function canonicalizePayload(
  gameId: BuildPlannerArtifactGameId,
  payload: unknown,
  source: "request" | "stored",
): BuildPlannerArtifactPayload {
  const reject = (message: string): never => {
    if (source === "stored") throw new ArtifactDataError(message);
    throw new ArtifactValidationError(message);
  };

  try {
    return resolveBuildPlannerArtifactCodec(gameId).canonicalize(payload);
  } catch (error) {
    return reject(
      error instanceof BuildPlannerArtifactCodecError
        ? error.message
        : "The Frame payload is invalid.",
    );
  }
}

function mapArtifact(value: unknown): BuildPlannerArtifact {
  if (!isRow(value)) {
    throw new ArtifactDataError("Supabase returned an invalid artifact row.");
  }
  let gameId: BuildPlannerArtifactGameId;
  try {
    gameId = parseBuildPlannerArtifactGameId(value.game_id);
  } catch (error) {
    throw new ArtifactDataError(
      error instanceof Error ? error.message : "The stored Frame game is invalid.",
    );
  }
  const codec = resolveBuildPlannerArtifactCodec(gameId);
  const schemaVersion = value.schema_version;
  if (
    typeof schemaVersion !== "number" ||
    !Number.isSafeInteger(schemaVersion) ||
    schemaVersion !== codec.currentSchemaVersion
  ) {
    throw new ArtifactDataError(
      "The stored Frame uses an unsupported schema or payload.",
    );
  }
  const payload = canonicalizePayload(gameId, value.payload, "stored");

  const artifact: BuildPlannerArtifact = {
    id: requiredString(value, "id"),
    ownerId: requiredString(value, "owner_id"),
    gameId,
    name: requiredString(value, "name"),
    schemaVersion,
    payload,
    createdAt: requiredString(value, "created_at"),
    updatedAt: requiredString(value, "updated_at"),
  };
  const validation = validateBuildPlannerArtifact(artifact, codec);
  if (!validation.valid) {
    throw new ArtifactDataError(validation.issues[0].message);
  }
  return artifact;
}

function validateName(name: string): string {
  const normalized = name.trim();
  if (normalized.length < 1 || normalized.length > 120) {
    throw new ArtifactValidationError(
      "Frame name must be between 1 and 120 characters.",
    );
  }
  return normalized;
}

function validatePayload(
  gameId: BuildPlannerArtifactGameId,
  payload: unknown,
): BuildPlannerArtifactPayload {
  return canonicalizePayload(gameId, payload, "request");
}

export function createSupabaseArtifactService(
  client: SupabaseClient,
  auth: AuthService,
): BuildPlannerArtifactService {
  async function requireOwner(ownerId: string) {
    const session = await auth.requireSession();
    if (session.account.id !== ownerId) {
      throw new ArtifactOwnershipError(
        "The authenticated account does not own this request.",
      );
    }
    return session.account.id;
  }

  async function createArtifact(
    ownerId: string,
    gameId: BuildPlannerArtifactGameId,
    name: string,
    payloadValue: unknown,
  ) {
    const authenticatedOwnerId = await requireOwner(ownerId);
    const codec = resolveBuildPlannerArtifactCodec(gameId);
    const payload = validatePayload(gameId, payloadValue);
    const { data, error } = await client
      .from("build_planner_artifacts")
      .insert({
        owner_id: authenticatedOwnerId,
        game_id: gameId,
        name: validateName(name),
        schema_version: codec.currentSchemaVersion,
        payload,
      })
      .select(ARTIFACT_COLUMNS)
      .single();
    if (error) throw error;
    return mapArtifact(data);
  }

  return {
    async list(request) {
      const authenticatedOwnerId = await requireOwner(request.ownerId);
      const { data, error } = await client
        .from("build_planner_artifacts")
        .select(ARTIFACT_COLUMNS)
        .eq("owner_id", authenticatedOwnerId)
        .eq("game_id", request.gameId)
        .order("updated_at", { ascending: false })
        .order("id", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapArtifact);
    },

    async save(request: SaveBuildPlannerArtifactRequest) {
      if (request.mode === "create") {
        return createArtifact(request.ownerId, request.gameId, request.name, request.payload);
      }

      const authenticatedOwnerId = await requireOwner(request.ownerId);
      const codec = resolveBuildPlannerArtifactCodec(request.gameId);
      const payload = validatePayload(request.gameId, request.payload);
      const { data, error } = await client
        .from("build_planner_artifacts")
        .update({
          schema_version: codec.currentSchemaVersion,
          payload,
        })
        .eq("id", request.artifactId)
        .eq("owner_id", authenticatedOwnerId)
        .eq("game_id", request.gameId)
        .select(ARTIFACT_COLUMNS)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new ArtifactNotFoundError("Frame not found.");
      return mapArtifact(data);
    },

    async saveAs(request) {
      return createArtifact(request.ownerId, request.gameId, request.name, request.payload);
    },

    async load(request) {
      const authenticatedOwnerId = await requireOwner(request.ownerId);
      const { data, error } = await client
        .from("build_planner_artifacts")
        .select(ARTIFACT_COLUMNS)
        .eq("id", request.artifactId)
        .eq("owner_id", authenticatedOwnerId)
        .eq("game_id", request.gameId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapArtifact(data) : null;
    },

    async rename(request) {
      const authenticatedOwnerId = await requireOwner(request.ownerId);
      const { data, error } = await client
        .from("build_planner_artifacts")
        .update({ name: validateName(request.name) })
        .eq("id", request.artifactId)
        .eq("owner_id", authenticatedOwnerId)
        .eq("game_id", request.gameId)
        .select(ARTIFACT_COLUMNS)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new ArtifactNotFoundError("Frame not found.");
      return mapArtifact(data);
    },

    async delete(request) {
      const authenticatedOwnerId = await requireOwner(request.ownerId);
      const { data, error } = await client
        .from("build_planner_artifacts")
        .delete()
        .eq("id", request.artifactId)
        .eq("owner_id", authenticatedOwnerId)
        .eq("game_id", request.gameId)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new ArtifactNotFoundError("Frame not found.");
    },
  };
}
