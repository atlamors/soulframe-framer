import type {
  BuildPlannerArtifact,
  BuildPlannerArtifactCodec,
  BuildPlannerArtifactGameId,
} from "./types";

export interface ArtifactValidationIssue {
  code: string;
  message: string;
  path: "gameId" | "name" | "schemaVersion" | "payload";
}

export type ArtifactValidationResult =
  | { valid: true; issues: [] }
  | { valid: false; issues: ArtifactValidationIssue[] };

export function validateBuildPlannerArtifact<
  TGameId extends BuildPlannerArtifactGameId,
>(
  artifact: Pick<
    BuildPlannerArtifact<TGameId>,
    "gameId" | "name" | "schemaVersion" | "payload"
  >,
  codec: BuildPlannerArtifactCodec<TGameId>,
): ArtifactValidationResult {
  const issues: ArtifactValidationIssue[] = [];

  if (artifact.gameId !== codec.gameId) {
    issues.push({ code: "artifact-game-mismatch", message: "The Frame game does not match its payload codec.", path: "gameId" });
  }
  if (!artifact.name.trim()) {
    issues.push({ code: "artifact-name-required", message: "A Frame name is required.", path: "name" });
  }
  if (artifact.schemaVersion !== codec.currentSchemaVersion) {
    issues.push({ code: "artifact-schema-unsupported", message: "The Frame uses an unsupported schema version.", path: "schemaVersion" });
  }
  try {
    codec.canonicalize(artifact.payload);
  } catch (error) {
    issues.push({ code: "artifact-payload-invalid", message: error instanceof Error ? error.message : "The Frame payload is invalid.", path: "payload" });
  }

  return issues.length === 0
    ? { valid: true, issues: [] }
    : { valid: false, issues };
}
