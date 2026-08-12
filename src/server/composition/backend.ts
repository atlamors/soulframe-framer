import type { BuildPlannerArtifactService } from "../contracts/artifacts";
import type { AuthService } from "../contracts/auth";
import type { DiscoveryService } from "../contracts/discovery";
import type { PublicationService } from "../contracts/publications";
import type { VotingService } from "../contracts/voting";
import { cache } from "react";
import { parseServerEnvironment } from "../config/environment";
import { createSupabaseArtifactService } from "../supabase/artifact-service";
import { createSupabaseAuthService } from "../supabase/auth-service";
import { createSupabaseDiscoveryService } from "../supabase/discovery-service";
import { createSupabasePublicationService } from "../supabase/publication-service";
import { createServerSupabaseClient } from "../supabase/server";
import { createSupabaseVotingService } from "../supabase/voting-service";

export interface NightfoldBackend {
  auth: AuthService;
  artifacts: BuildPlannerArtifactService;
  publications: PublicationService;
  voting: VotingService;
  discovery: DiscoveryService;
}

/** The request-service construction point; product requests always use Supabase. */
export const getBackendForRequest = cache(async (): Promise<NightfoldBackend> => {
  const environment = parseServerEnvironment(process.env);
  const client = await createServerSupabaseClient(environment);
  const auth = createSupabaseAuthService(client);
  return {
    auth,
    artifacts: createSupabaseArtifactService(client, auth),
    publications: createSupabasePublicationService(client, auth),
    voting: createSupabaseVotingService(client, auth),
    discovery: createSupabaseDiscoveryService(client),
  };
});
