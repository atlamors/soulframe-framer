import type {
  BuildPlannerArtifact,
  BuildPlannerArtifactGameId,
  BuildPlannerArtifactOwnerId,
  DeleteBuildPlannerArtifactRequest,
  LoadBuildPlannerArtifactRequest,
  RenameBuildPlannerArtifactRequest,
  SaveAsBuildPlannerArtifactRequest,
  SaveBuildPlannerArtifactRequest,
} from "../../domain/artifacts/types";

export interface ListBuildPlannerArtifactsRequest {
  ownerId: BuildPlannerArtifactOwnerId;
  gameId: BuildPlannerArtifactGameId;
}

export interface BuildPlannerArtifactService {
  list(
    request: ListBuildPlannerArtifactsRequest,
  ): Promise<readonly BuildPlannerArtifact[]>;
  save(request: SaveBuildPlannerArtifactRequest): Promise<BuildPlannerArtifact>;
  saveAs(
    request: SaveAsBuildPlannerArtifactRequest,
  ): Promise<BuildPlannerArtifact>;
  load(
    request: LoadBuildPlannerArtifactRequest,
  ): Promise<BuildPlannerArtifact | null>;
  rename(
    request: RenameBuildPlannerArtifactRequest,
  ): Promise<BuildPlannerArtifact>;
  delete(request: DeleteBuildPlannerArtifactRequest): Promise<void>;
}
