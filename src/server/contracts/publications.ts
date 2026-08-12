import type {
  DeletePublicationRequest,
  IsoDateTime,
  Publication,
  PublicationDraft,
  PublicationDraftCheckpoint,
  PublicationId,
  PublicationOwnerId,
  PublicationProfileId,
  PublicationRelease,
  PublicationState,
  PublishPublicationRequest,
  RecoverPublicationDraftRequest,
  RestoreDeletedPublicationRequest,
  SavePublicationDraftRequest,
  UnpublishPublicationRequest,
} from "../../domain/publications/types";
import type { PublicationProfile } from "../../domain/publications/profiles";

export interface CreatePublicationRequest {
  ownerId: PublicationOwnerId;
  gameId: string;
  profileId: PublicationProfileId;
  slug: string;
  initialState: PublicationState;
}

export interface OwnedPublicationRequest {
  ownerId: PublicationOwnerId;
  publicationId: PublicationId;
}

export interface ListOwnedPublicationsRequest {
  ownerId: PublicationOwnerId;
  includeDeleted?: boolean;
}

export type CreateDraftCheckpointRequest = OwnedPublicationRequest;

export interface PublicPublicationRequest {
  gameId: string;
  profileId: PublicationProfileId;
  slug: string;
}

/** Immutable public release projection; internal ordering is not serialized. */
export interface PublicPublicationRelease {
  id: string;
  publicationId: PublicationId;
  state: PublicationState;
  publishedAt: IsoDateTime;
}

/** Public-reader projection: it cannot carry a private draft or checkpoints. */
export interface PublicPublication {
  id: PublicationId;
  ownerId: PublicationOwnerId;
  creatorHandle: string;
  gameId: string;
  profileId: PublicationProfileId;
  profile: PublicationProfile;
  slug: string;
  release: PublicPublicationRelease;
  firstPublishedAt: IsoDateTime;
  updatedAt: IsoDateTime;
  voteCount: number;
}

export interface PublicationService {
  create(request: CreatePublicationRequest): Promise<Publication>;
  listOwned(
    request: ListOwnedPublicationsRequest,
  ): Promise<readonly Publication[]>;
  loadOwned(request: OwnedPublicationRequest): Promise<Publication | null>;
  loadDraft(request: OwnedPublicationRequest): Promise<PublicationDraft | null>;
  saveDraft(request: SavePublicationDraftRequest): Promise<PublicationDraft>;
  createDraftCheckpoint(
    request: CreateDraftCheckpointRequest,
  ): Promise<PublicationDraftCheckpoint>;
  listDraftCheckpoints(
    request: OwnedPublicationRequest,
  ): Promise<readonly PublicationDraftCheckpoint[]>;
  recoverDraft(request: RecoverPublicationDraftRequest): Promise<PublicationDraft>;
  publish(request: PublishPublicationRequest): Promise<PublicationRelease>;
  unpublish(request: UnpublishPublicationRequest): Promise<Publication>;
  delete(request: DeletePublicationRequest): Promise<Publication>;
  restoreDeleted(
    request: RestoreDeletedPublicationRequest,
  ): Promise<Publication>;
  loadPublic(request: PublicPublicationRequest): Promise<PublicPublication | null>;
}
