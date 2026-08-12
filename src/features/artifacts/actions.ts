"use server";

import type {
  BuildPlannerArtifact,
  DeleteBuildPlannerArtifactRequest,
  LoadBuildPlannerArtifactRequest,
  RenameBuildPlannerArtifactRequest,
  SaveAsBuildPlannerArtifactRequest,
  SaveBuildPlannerArtifactRequest,
} from "../../domain/artifacts/types";
import type { ListBuildPlannerArtifactsRequest } from "../../server/contracts/artifacts";
import { getBackendForRequest } from "../../server/composition/backend";
import { AuthenticationRequiredError } from "../../server/supabase/auth-service";
import {
  ArtifactDataError,
  ArtifactNotFoundError,
  ArtifactOwnershipError,
  ArtifactValidationError,
} from "../../server/supabase/artifact-service";

export type ArtifactActionErrorCode =
  | "authentication-required"
  | "forbidden"
  | "not-found"
  | "invalid-artifact"
  | "persistence-unavailable";

export type ArtifactActionResult<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      error: { code: ArtifactActionErrorCode; message: string };
    };

function errorResult(error: unknown): ArtifactActionResult<never> {
  if (error instanceof AuthenticationRequiredError) {
    return {
      ok: false,
      error: { code: "authentication-required", message: "Sign in is required." },
    };
  }
  if (error instanceof ArtifactOwnershipError) {
    return {
      ok: false,
      error: { code: "forbidden", message: "This Frame belongs to another account." },
    };
  }
  if (error instanceof ArtifactNotFoundError) {
    return {
      ok: false,
      error: { code: "not-found", message: error.message },
    };
  }
  if (
    error instanceof ArtifactValidationError ||
    error instanceof ArtifactDataError
  ) {
    return {
      ok: false,
      error: { code: "invalid-artifact", message: error.message },
    };
  }
  return {
    ok: false,
    error: {
      code: "persistence-unavailable",
      message: "Cloud Frame storage is unavailable. Your local Frame is unchanged.",
    },
  };
}

async function runArtifactAction<T>(
  operation: () => Promise<T>,
): Promise<ArtifactActionResult<T>> {
  try {
    return { ok: true, value: await operation() };
  } catch (error) {
    return errorResult(error);
  }
}

export async function listBuildPlannerArtifactsAction(
  request: ListBuildPlannerArtifactsRequest,
): Promise<ArtifactActionResult<readonly BuildPlannerArtifact[]>> {
  return runArtifactAction(async () => {
    const service = (await getBackendForRequest()).artifacts;
    return service.list(request);
  });
}

export async function saveBuildPlannerArtifactAction(
  request: SaveBuildPlannerArtifactRequest,
): Promise<ArtifactActionResult<BuildPlannerArtifact>> {
  return runArtifactAction(async () => {
    const service = (await getBackendForRequest()).artifacts;
    return service.save(request);
  });
}

export async function saveAsBuildPlannerArtifactAction(
  request: SaveAsBuildPlannerArtifactRequest,
): Promise<ArtifactActionResult<BuildPlannerArtifact>> {
  return runArtifactAction(async () => {
    const service = (await getBackendForRequest()).artifacts;
    return service.saveAs(request);
  });
}

export async function loadBuildPlannerArtifactAction(
  request: LoadBuildPlannerArtifactRequest,
): Promise<ArtifactActionResult<BuildPlannerArtifact | null>> {
  return runArtifactAction(async () => {
    const service = (await getBackendForRequest()).artifacts;
    return service.load(request);
  });
}

export async function renameBuildPlannerArtifactAction(
  request: RenameBuildPlannerArtifactRequest,
): Promise<ArtifactActionResult<BuildPlannerArtifact>> {
  return runArtifactAction(async () => {
    const service = (await getBackendForRequest()).artifacts;
    return service.rename(request);
  });
}

export async function deleteBuildPlannerArtifactAction(
  request: DeleteBuildPlannerArtifactRequest,
): Promise<ArtifactActionResult<null>> {
  return runArtifactAction(async () => {
    const service = (await getBackendForRequest()).artifacts;
    await service.delete(request);
    return null;
  });
}
