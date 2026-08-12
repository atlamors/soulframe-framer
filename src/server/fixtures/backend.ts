import type { BuildPlannerArtifactService } from "../contracts/artifacts";
import type { AuthService } from "../contracts/auth";
import type { DiscoveryService } from "../contracts/discovery";
import type { PublicationService } from "../contracts/publications";
import type { VotingService } from "../contracts/voting";
import type { NightfoldBackend } from "../composition/backend";

export class FixtureAuthenticationRequiredError extends Error {
  readonly name = "FixtureAuthenticationRequiredError";
}

const authenticationRequired = (): never => {
  throw new FixtureAuthenticationRequiredError(
    "The empty fixture backend has no authenticated account.",
  );
};

const auth: AuthService = {
  getSession: async () => null,
  requireSession: async () => authenticationRequired(),
  beginOAuth: async () => authenticationRequired(),
  exchangeOAuthCode: async () => authenticationRequired(),
  signOut: async () => undefined,
  getCreatorProfile: async () => null,
  activateCreatorProfile: async () => authenticationRequired(),
  updateCreatorProfile: async () => authenticationRequired(),
};

const artifacts: BuildPlannerArtifactService = {
  list: async () => [],
  save: async () => authenticationRequired(),
  saveAs: async () => authenticationRequired(),
  load: async () => null,
  rename: async () => authenticationRequired(),
  delete: async () => authenticationRequired(),
};

const publications: PublicationService = {
  create: async () => authenticationRequired(),
  listOwned: async () => [],
  loadOwned: async () => null,
  loadDraft: async () => null,
  saveDraft: async () => authenticationRequired(),
  createDraftCheckpoint: async () => authenticationRequired(),
  listDraftCheckpoints: async () => [],
  recoverDraft: async () => authenticationRequired(),
  publish: async () => authenticationRequired(),
  unpublish: async () => authenticationRequired(),
  delete: async () => authenticationRequired(),
  restoreDeleted: async () => authenticationRequired(),
  loadPublic: async () => null,
};

const voting: VotingService = {
  toggle: async () => authenticationRequired(),
  getState: async (request) => ({
    publicationId: request.publicationId,
    active: false,
    count: 0,
  }),
  getCount: async () => 0,
};

const discovery: DiscoveryService = {
  list: async () => ({ items: [], nextCursor: null }),
};

/** Deterministic, empty, local-only backend; it contains no page publications. */
export function createFixtureBackend(): NightfoldBackend {
  return { auth, artifacts, publications, voting, discovery };
}
