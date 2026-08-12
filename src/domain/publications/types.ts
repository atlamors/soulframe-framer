import type { PublicationBlock } from "./blocks";
import type { PublicationProfile } from "./profiles";

/** Persisted UTC/offset ISO-8601 text, never an in-memory Date instance. */
export type IsoDateTime = string;

export type PublicationId = string;
export type PublicationOwnerId = string;
export type PublicationProfileId = "soulframe.build" | "soulframe.guide";

export type PublicationStatus =
  | "draft"
  | "published"
  | "unpublished"
  | "deleted";

export interface PublicationMetadata {
  title: string;
  summary?: string;
  coverAssetId?: string;
  classifications: string[];
}

export interface PublicationState {
  schemaVersion: 1;
  metadata: PublicationMetadata;
  /** Semantic blocks in public/editor order. */
  blocks: PublicationBlock[];
}

export interface PublicationDraft {
  publicationId: PublicationId;
  state: PublicationState;
  updatedAt: IsoDateTime;
}

export interface PublicationDraftCheckpoint {
  id: string;
  publicationId: PublicationId;
  checkpointNumber: number;
  state: PublicationState;
  createdAt: IsoDateTime;
}

export interface PublicationRelease {
  id: string;
  publicationId: PublicationId;
  releaseNumber: number;
  /** An immutable snapshot once persisted as a release. */
  state: PublicationState;
  publishedAt: IsoDateTime;
}

export interface PublicationDeletionRecovery {
  deletedAt: IsoDateTime;
  recoverableUntil: IsoDateTime;
}

export interface Publication {
  id: PublicationId;
  ownerId: PublicationOwnerId;
  gameId: string;
  /** Persistence stores this stable key rather than duplicating configuration. */
  profileId: PublicationProfileId;
  /** Complete domain aggregates carry exactly one registry-resolved profile. */
  profile: PublicationProfile;
  slug: string;
  status: PublicationStatus;
  currentReleaseId: string | null;
  draft: PublicationDraft;
  draftCheckpoints: PublicationDraftCheckpoint[];
  releases: PublicationRelease[];
  currentRelease: PublicationRelease | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  firstPublishedAt: IsoDateTime | null;
  deletionRecovery: PublicationDeletionRecovery | null;
}

export interface PublicationRetentionPolicy {
  maxDraftCheckpoints: number;
  maxRetainedReleases: number;
  deletedRecoveryDays: number;
}

/** Configurable operational defaults, not permanent domain invariants. */
export const DEFAULT_PUBLICATION_RETENTION_POLICY = {
  maxDraftCheckpoints: 20,
  maxRetainedReleases: 20,
  deletedRecoveryDays: 30,
} as const satisfies PublicationRetentionPolicy;

export type PublicationValidationPath =
  | "metadata"
  | `metadata.${string}`
  | "blocks"
  | `blocks.${number}`
  | `blocks.${number}.${string}`;

export interface PublicationValidationIssue {
  code: string;
  message: string;
  path: PublicationValidationPath;
}

export type PublicationValidationResult =
  | { valid: true; issues: [] }
  | { valid: false; issues: PublicationValidationIssue[] };

export interface SavePublicationDraftRequest {
  publicationId: PublicationId;
  ownerId: PublicationOwnerId;
  state: PublicationState;
}

export interface PublishPublicationRequest {
  publicationId: PublicationId;
  ownerId: PublicationOwnerId;
}

export interface UnpublishPublicationRequest {
  publicationId: PublicationId;
  ownerId: PublicationOwnerId;
}

export interface DeletePublicationRequest {
  publicationId: PublicationId;
  ownerId: PublicationOwnerId;
}

export interface RestoreDeletedPublicationRequest {
  publicationId: PublicationId;
  ownerId: PublicationOwnerId;
}

export type PublicationRecoverySource =
  | { kind: "draft-checkpoint"; checkpointId: string }
  | { kind: "release"; releaseId: string };

export interface RecoverPublicationDraftRequest {
  publicationId: PublicationId;
  ownerId: PublicationOwnerId;
  /** Recovery copies a retained state forward into the mutable draft. */
  source: PublicationRecoverySource;
}
