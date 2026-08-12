import type { SoulframeBuild } from "../types";
import type { IsoDateTime } from "../publications/types";

export type BuildPlannerArtifactId = string;
export type BuildPlannerArtifactOwnerId = string;

/** Extend this map when a game contributes its planner payload and codec. */
export interface BuildPlannerArtifactPayloadByGame {
  soulframe: SoulframeBuild;
}

export type BuildPlannerArtifactGameId =
  keyof BuildPlannerArtifactPayloadByGame;
export type BuildPlannerArtifactPayload<
  TGameId extends BuildPlannerArtifactGameId = BuildPlannerArtifactGameId,
> = BuildPlannerArtifactPayloadByGame[TGameId];

/**
 * The complete mutable Frame payload. It deliberately has no publisher,
 * publication, release, source-stage, attribution, or lineage fields.
 */
export interface BuildPlannerArtifact<
  TGameId extends BuildPlannerArtifactGameId = BuildPlannerArtifactGameId,
> {
  id: BuildPlannerArtifactId;
  ownerId: BuildPlannerArtifactOwnerId;
  gameId: TGameId;
  name: string;
  schemaVersion: number;
  payload: BuildPlannerArtifactPayload<TGameId>;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export type SaveBuildPlannerArtifactRequest<
  TGameId extends BuildPlannerArtifactGameId = BuildPlannerArtifactGameId,
> =
  | {
      mode: "create";
      ownerId: BuildPlannerArtifactOwnerId;
      gameId: TGameId;
      name: string;
      payload: BuildPlannerArtifactPayload<TGameId>;
    }
  | {
      mode: "update";
      ownerId: BuildPlannerArtifactOwnerId;
      gameId: TGameId;
      artifactId: BuildPlannerArtifactId;
      payload: BuildPlannerArtifactPayload<TGameId>;
    };

export interface SaveAsBuildPlannerArtifactRequest<
  TGameId extends BuildPlannerArtifactGameId = BuildPlannerArtifactGameId,
> {
  ownerId: BuildPlannerArtifactOwnerId;
  gameId: TGameId;
  name: string;
  payload: BuildPlannerArtifactPayload<TGameId>;
}

export interface LoadBuildPlannerArtifactRequest<
  TGameId extends BuildPlannerArtifactGameId = BuildPlannerArtifactGameId,
> {
  ownerId: BuildPlannerArtifactOwnerId;
  gameId: TGameId;
  artifactId: BuildPlannerArtifactId;
}

export type UnsavedLoadDecision = "save" | "discard" | "cancel";

export interface RenameBuildPlannerArtifactRequest {
  ownerId: BuildPlannerArtifactOwnerId;
  gameId: BuildPlannerArtifactGameId;
  artifactId: BuildPlannerArtifactId;
  name: string;
}

export interface DeleteBuildPlannerArtifactRequest {
  ownerId: BuildPlannerArtifactOwnerId;
  gameId: BuildPlannerArtifactGameId;
  artifactId: BuildPlannerArtifactId;
}

export interface BuildPlannerArtifactCodec<
  TGameId extends BuildPlannerArtifactGameId = BuildPlannerArtifactGameId,
> {
  readonly gameId: TGameId;
  readonly currentSchemaVersion: number;
  canonicalize(payload: unknown): BuildPlannerArtifactPayload<TGameId>;
}

/**
 * Repository boundary for explicit user actions. Updates are last-write-wins;
 * no revision token, merge contract, or artifact history is introduced.
 */
export interface BuildPlannerArtifactRepository {
  save(request: SaveBuildPlannerArtifactRequest): Promise<BuildPlannerArtifact>;
  saveAs(request: SaveAsBuildPlannerArtifactRequest): Promise<BuildPlannerArtifact>;
  load(request: LoadBuildPlannerArtifactRequest): Promise<BuildPlannerArtifact | null>;
  rename(request: RenameBuildPlannerArtifactRequest): Promise<BuildPlannerArtifact>;
  delete(request: DeleteBuildPlannerArtifactRequest): Promise<void>;
}
