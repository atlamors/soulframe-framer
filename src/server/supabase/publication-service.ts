import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PUBLICATION_BLOCK_REGISTRY,
  validatePublicationBlocks,
  type BuildStageBlock,
  type BuildSupportingBlock,
  type HeadingBlock,
  type PublicationBlock,
  type RichTextBlock,
} from "../../domain/publications/blocks";
import {
  isPublicationProfileId,
  resolvePublicationProfile,
  type PublicationProfile,
} from "../../domain/publications/profiles";
import type {
  Publication,
  PublicationDeletionRecovery,
  PublicationDraft,
  PublicationDraftCheckpoint,
  PublicationRelease,
  SavePublicationDraftRequest,
  PublicationState,
  PublicationStatus,
} from "../../domain/publications/types";
import {
  BuildPlannerArtifactCodecError,
  resolveBuildPlannerArtifactCodec,
} from "../../domain/artifacts/soulframe-codec";
import type { AuthService } from "../contracts/auth";
import type {
  CreatePublicationRequest,
  PublicPublication,
  PublicPublicationRelease,
  PublicationService,
} from "../contracts/publications";

const PUBLICATION_COLUMNS =
  "id,owner_id,game_id,profile_id,slug,status,current_release_id,first_published_at,latest_published_at,deleted_at,recoverable_until,created_at,updated_at,vote_count";
const DRAFT_COLUMNS = "publication_id,state,updated_at";
const CHECKPOINT_COLUMNS =
  "id,publication_id,checkpoint_number,state,created_at";
const RELEASE_COLUMNS =
  "id,publication_id,release_number,state,published_at";
const PUBLIC_RELEASE_COLUMNS = "id,publication_id,state,published_at";

type UnknownRow = Record<string, unknown>;

export class PublicationAuthenticationError extends Error {
  readonly name = "PublicationAuthenticationError";
}

export class PublicationNotFoundError extends Error {
  readonly name = "PublicationNotFoundError";
}

export class PublicationDataError extends Error {
  readonly name = "PublicationDataError";
}

export class PublicationInputError extends Error {
  readonly name = "PublicationInputError";
}

function isRow(value: unknown): value is UnknownRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapRow(value: unknown): UnknownRow {
  if (isRow(value)) return value;
  if (Array.isArray(value) && value.length === 1 && isRow(value[0])) {
    return value[0];
  }
  throw new PublicationDataError("Supabase returned an invalid publication row.");
}

function requiredString(row: UnknownRow, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new PublicationDataError(`Publication data is missing ${key}.`);
  }
  return value;
}

function nullableString(row: UnknownRow, key: string): string | null {
  const value = row[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new PublicationDataError(`Publication data has an invalid ${key}.`);
  }
  return value;
}

function requiredNumber(row: UnknownRow, key: string): number {
  const value = row[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new PublicationDataError(`Publication data has an invalid ${key}.`);
  }
  return value;
}

function asProfile(value: unknown): PublicationProfile {
  if (isPublicationProfileId(value)) return resolvePublicationProfile(value);
  throw new PublicationDataError("Publication data has an unknown profile.");
}

function asStatus(value: unknown): PublicationStatus {
  if (
    value === "draft" ||
    value === "published" ||
    value === "unpublished" ||
    value === "deleted"
  ) {
    return value;
  }
  throw new PublicationDataError("Publication data has an unknown status.");
}

function assertExactKeys(
  value: UnknownRow,
  allowed: readonly string[],
  label: string,
): void {
  const allowedKeys = new Set(allowed);
  const unknownKey = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unknownKey) {
    throw new PublicationDataError(
      `${label} contains unsupported field ${unknownKey}.`,
    );
  }
}

type ParsedPublicationState = {
  schemaVersion: 1;
  metadata: PublicationState["metadata"];
  blocks: unknown[];
};

function parseStateShape(value: unknown): ParsedPublicationState {
  if (!isRow(value) || value.schemaVersion !== 1) {
    throw new PublicationDataError("Publication state uses an unsupported schema.");
  }
  assertExactKeys(value, ["schemaVersion", "metadata", "blocks"], "Publication state");
  const metadata = value.metadata;
  if (!isRow(metadata) || !Array.isArray(value.blocks)) {
    throw new PublicationDataError("Publication state has an invalid shape.");
  }
  assertExactKeys(
    metadata,
    ["title", "summary", "coverAssetId", "classifications"],
    "Publication metadata",
  );
  if (
    typeof metadata.title !== "string" ||
    (metadata.summary !== undefined && typeof metadata.summary !== "string") ||
    (metadata.coverAssetId !== undefined &&
      typeof metadata.coverAssetId !== "string") ||
    !Array.isArray(metadata.classifications) ||
    !metadata.classifications.every((item) => typeof item === "string")
  ) {
    throw new PublicationDataError("Publication metadata has an invalid shape.");
  }
  return {
    schemaVersion: 1,
    metadata: {
      title: metadata.title,
      ...(metadata.summary !== undefined ? { summary: metadata.summary } : {}),
      ...(metadata.coverAssetId !== undefined
        ? { coverAssetId: metadata.coverAssetId }
        : {}),
      classifications: [...metadata.classifications],
    },
    blocks: [...value.blocks],
  };
}

function requiredBlockId(value: UnknownRow): string {
  if (typeof value.id !== "string" || !value.id.trim()) {
    throw new PublicationDataError("Every Publication block requires a stable identifier.");
  }
  return value.id;
}

function canonicalizeSupportingBlock(value: unknown): BuildSupportingBlock {
  const block = canonicalizeBlock(value);
  if (block.type !== "nightfold.heading" && block.type !== "nightfold.rich-text") {
    throw new PublicationDataError(
      "Build supporting sections allow only Heading and Rich Text blocks.",
    );
  }
  return block;
}

function canonicalizeBlock(value: unknown): PublicationBlock {
  if (!isRow(value)) {
    throw new PublicationDataError("Publication blocks must be objects.");
  }
  assertExactKeys(value, ["id", "type", "schemaVersion", "data"], "Publication block");
  const id = requiredBlockId(value);
  if (value.schemaVersion !== 1 || typeof value.type !== "string") {
    throw new PublicationDataError("A Publication block uses an unsupported schema.");
  }
  if (!(value.type in PUBLICATION_BLOCK_REGISTRY) || !isRow(value.data)) {
    throw new PublicationDataError("The Publication contains an unregistered block type.");
  }

  if (value.type === "nightfold.heading") {
    assertExactKeys(value.data, ["level", "text"], "Heading block data");
    if (
      (value.data.level !== 2 && value.data.level !== 3 && value.data.level !== 4) ||
      typeof value.data.text !== "string"
    ) {
      throw new PublicationDataError("A Heading block has invalid data.");
    }
    return {
      id,
      type: "nightfold.heading",
      schemaVersion: 1,
      data: { level: value.data.level, text: value.data.text },
    } satisfies HeadingBlock;
  }

  if (value.type === "nightfold.rich-text") {
    assertExactKeys(value.data, ["document"], "Rich Text block data");
    if (!Array.isArray(value.data.document)) {
      throw new PublicationDataError("A Rich Text block has invalid data.");
    }
    return {
      id,
      type: "nightfold.rich-text",
      schemaVersion: 1,
      data: { document: value.data.document as RichTextBlock["data"]["document"] },
    } satisfies RichTextBlock;
  }

  const stageData = value.data;
  const role = stageData.role;
  if (role !== "home" && role !== "variant") {
    throw new PublicationDataError("A Build stage must be Home or Variant.");
  }
  assertExactKeys(
    stageData,
    role === "home"
      ? ["role", "name", "planner", "sharedSections"]
      : ["role", "name", "planner", "sections"],
    "Build stage data",
  );
  if (typeof stageData.name !== "string") {
    throw new PublicationDataError("A Build stage name is invalid.");
  }
  let planner;
  try {
    planner = resolveBuildPlannerArtifactCodec("soulframe").canonicalize(
      stageData.planner,
    );
  } catch (error) {
    throw new PublicationDataError(
      error instanceof BuildPlannerArtifactCodecError
        ? error.message
        : "A stage Frame is invalid.",
    );
  }

  if (role === "home") {
    if (!Array.isArray(stageData.sharedSections)) {
      throw new PublicationDataError("Home supporting sections must be an ordered list.");
    }
    const sharedSections = stageData.sharedSections.map((section) => {
      if (!isRow(section)) {
        throw new PublicationDataError("A Home supporting section is invalid.");
      }
      assertExactKeys(section, ["id", "blocks"], "Home supporting section");
      if (typeof section.id !== "string" || !Array.isArray(section.blocks)) {
        throw new PublicationDataError("A Home supporting section is invalid.");
      }
      return {
        id: section.id,
        blocks: section.blocks.map(canonicalizeSupportingBlock),
      };
    });
    return {
      id,
      type: "soulframe.build.stage",
      schemaVersion: 1,
      data: { role, name: stageData.name, planner, sharedSections },
    } satisfies BuildStageBlock;
  }

  if (!Array.isArray(stageData.sections)) {
    throw new PublicationDataError("Variant section choices must be an ordered list.");
  }
  const sections = stageData.sections.map((section) => {
    if (!isRow(section) || typeof section.sectionId !== "string") {
      throw new PublicationDataError("A Variant section choice is invalid.");
    }
    if (section.mode === "inherit") {
      assertExactKeys(section, ["sectionId", "mode"], "Inherited Variant section");
      return { sectionId: section.sectionId, mode: "inherit" as const };
    }
    if (section.mode === "override" && Array.isArray(section.blocks)) {
      assertExactKeys(section, ["sectionId", "mode", "blocks"], "Overridden Variant section");
      return {
        sectionId: section.sectionId,
        mode: "override" as const,
        blocks: section.blocks.map(canonicalizeSupportingBlock),
      };
    }
    throw new PublicationDataError("A Variant section must inherit or override.");
  });
  return {
    id,
    type: "soulframe.build.stage",
    schemaVersion: 1,
    data: { role, name: stageData.name, planner, sections },
  } satisfies BuildStageBlock;
}

function canonicalizeState(
  profile: PublicationProfile,
  value: unknown,
  mode: "draft" | "publishable" | "stored-draft" | "stored-release",
): PublicationState {
  const stored = mode === "stored-draft" || mode === "stored-release";
  const draft = mode === "draft" || mode === "stored-draft";
  const reject = (message: string): never => {
    if (stored) throw new PublicationDataError(message);
    throw new PublicationInputError(message);
  };
  let state: ParsedPublicationState;
  let blocks: PublicationBlock[];
  try {
    state = parseStateShape(value);
    blocks = state.blocks.map(canonicalizeBlock);
  } catch (error) {
    if (stored) throw error;
    throw new PublicationInputError(
      error instanceof Error ? error.message : "Publication state is invalid.",
    );
  }

  const title = state.metadata.title.trim();
  if ((!draft && title.length < 1) || title.length > 160) {
    return reject(
      draft
        ? "Publication title must be 160 characters or fewer."
        : "Publication title must be between 1 and 160 characters.",
    );
  }
  if ((state.metadata.summary?.length ?? 0) > 320) {
    return reject(
      "Publication summary must be 320 characters or fewer.",
    );
  }

  const issues = validatePublicationBlocks(profile, blocks).filter(
    (issue) =>
      !draft ||
      ![
        "soulframe.build.stage-minimum",
        "build-home-stage-count",
        "nightfold.heading-minimum",
      ].includes(issue.code),
  );
  if (issues.length > 0) {
    const message = issues[0]?.message ?? "Publication blocks are invalid.";
    return reject(message);
  }

  return {
    schemaVersion: 1,
    metadata: {
      title,
      ...(state.metadata.summary?.trim()
        ? { summary: state.metadata.summary.trim() }
        : {}),
      ...(state.metadata.coverAssetId
        ? { coverAssetId: state.metadata.coverAssetId }
        : {}),
      classifications: state.metadata.classifications
        .map((item) => item.trim())
        .filter(Boolean),
    },
    blocks,
  };
}

function mapDraft(value: unknown, profile: PublicationProfile): PublicationDraft {
  if (!isRow(value)) {
    throw new PublicationDataError("Supabase returned an invalid draft row.");
  }
  return {
    publicationId: requiredString(value, "publication_id"),
    state: canonicalizeState(profile, value.state, "stored-draft"),
    updatedAt: requiredString(value, "updated_at"),
  };
}

function mapCheckpoint(
  value: unknown,
  profile: PublicationProfile,
): PublicationDraftCheckpoint {
  if (!isRow(value)) {
    throw new PublicationDataError("Supabase returned an invalid checkpoint row.");
  }
  return {
    id: requiredString(value, "id"),
    publicationId: requiredString(value, "publication_id"),
    checkpointNumber: requiredNumber(value, "checkpoint_number"),
    state: canonicalizeState(profile, value.state, "stored-draft"),
    createdAt: requiredString(value, "created_at"),
  };
}

function mapRelease(
  value: unknown,
  profile: PublicationProfile,
): PublicationRelease {
  if (!isRow(value)) {
    throw new PublicationDataError("Supabase returned an invalid release row.");
  }
  return {
    id: requiredString(value, "id"),
    publicationId: requiredString(value, "publication_id"),
    releaseNumber: requiredNumber(value, "release_number"),
    state: canonicalizeState(profile, value.state, "stored-release"),
    publishedAt: requiredString(value, "published_at"),
  };
}

function mapPublicRelease(
  value: unknown,
  profile: PublicationProfile,
): PublicPublicationRelease {
  if (!isRow(value)) {
    throw new PublicationDataError("Supabase returned an invalid public release row.");
  }
  return {
    id: requiredString(value, "id"),
    publicationId: requiredString(value, "publication_id"),
    state: canonicalizeState(profile, value.state, "stored-release"),
    publishedAt: requiredString(value, "published_at"),
  };
}

function deletionRecovery(row: UnknownRow): PublicationDeletionRecovery | null {
  const deletedAt = nullableString(row, "deleted_at");
  const recoverableUntil = nullableString(row, "recoverable_until");
  if (deletedAt === null && recoverableUntil === null) return null;
  if (deletedAt === null || recoverableUntil === null) {
    throw new PublicationDataError("Publication recovery data is incoherent.");
  }
  return { deletedAt, recoverableUntil };
}

function normalizeSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  if (
    normalized.length < 3 ||
    normalized.length > 100 ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(normalized)
  ) {
    throw new PublicationInputError(
      "Slug must use 3–100 lowercase letters, numbers, or hyphens.",
    );
  }
  return normalized;
}

export function createSupabasePublicationService(
  client: SupabaseClient,
  auth: AuthService,
): PublicationService {
  async function requireOwner(ownerId: string): Promise<string> {
    const session = await auth.requireSession();
    if (session.account.id !== ownerId) {
      throw new PublicationAuthenticationError(
        "The authenticated account does not own this publication request.",
      );
    }
    return session.account.id;
  }

  async function loadPublicationRow(
    publicationId: string,
    ownerId: string,
  ): Promise<UnknownRow | null> {
    const { data, error } = await client
      .from("publications")
      .select(PUBLICATION_COLUMNS)
      .eq("id", publicationId)
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (error) throw error;
    if (data === null) return null;
    if (!isRow(data)) {
      throw new PublicationDataError("Supabase returned an invalid publication row.");
    }
    return data;
  }

  async function hydratePublication(row: UnknownRow): Promise<Publication> {
    const id = requiredString(row, "id");
    const profile = asProfile(row.profile_id);
    const gameId = requiredString(row, "game_id");
    if (profile.gameId !== gameId) {
      throw new PublicationDataError(
        "The Publication game does not match its registered profile.",
      );
    }
    const [{ data: draftData, error: draftError }, checkpoints, releases] =
      await Promise.all([
        client
          .from("publication_drafts")
          .select(DRAFT_COLUMNS)
          .eq("publication_id", id)
          .single(),
        client
          .from("publication_draft_checkpoints")
          .select(CHECKPOINT_COLUMNS)
          .eq("publication_id", id)
          .order("checkpoint_number", { ascending: false }),
        client
          .from("publication_releases")
          .select(RELEASE_COLUMNS)
          .eq("publication_id", id)
          .order("release_number", { ascending: false }),
      ]);
    if (draftError) throw draftError;
    if (checkpoints.error) throw checkpoints.error;
    if (releases.error) throw releases.error;

    const mappedReleases = (releases.data ?? []).map((release) =>
      mapRelease(release, profile),
    );
    const currentReleaseId = nullableString(row, "current_release_id");
    const currentRelease =
      currentReleaseId === null
        ? null
        : mappedReleases.find((release) => release.id === currentReleaseId) ??
          null;
    if (currentReleaseId !== null && currentRelease === null) {
      throw new PublicationDataError("The current release could not be loaded.");
    }

    return {
      id,
      ownerId: requiredString(row, "owner_id"),
      gameId,
      profileId: profile.id,
      profile,
      slug: requiredString(row, "slug"),
      status: asStatus(row.status),
      currentReleaseId,
      draft: mapDraft(draftData, profile),
      draftCheckpoints: (checkpoints.data ?? []).map((checkpoint) =>
        mapCheckpoint(checkpoint, profile),
      ),
      releases: mappedReleases,
      currentRelease,
      createdAt: requiredString(row, "created_at"),
      updatedAt: requiredString(row, "updated_at"),
      firstPublishedAt: nullableString(row, "first_published_at"),
      deletionRecovery: deletionRecovery(row),
    };
  }

  async function requireOwnedPublication(
    ownerId: string,
    publicationId: string,
  ): Promise<Publication> {
    const row = await loadPublicationRow(publicationId, ownerId);
    if (!row) throw new PublicationNotFoundError("Publication not found.");
    return hydratePublication(row);
  }

  async function createPublication(
    request: CreatePublicationRequest,
  ): Promise<Publication> {
    const ownerId = await requireOwner(request.ownerId);
    const profile = resolvePublicationProfile(request.profileId);
    if (profile.gameId !== request.gameId) {
      throw new PublicationInputError(
        "The Publication game does not match the selected profile.",
      );
    }
    const initialState = canonicalizeState(
      profile,
      request.initialState,
      "draft",
    );
    const { data, error } = await client.rpc("create_publication", {
      p_game_id: request.gameId,
      p_profile_id: profile.id,
      p_slug: normalizeSlug(request.slug),
      p_initial_state: initialState,
    });
    if (error) throw error;
    const row = unwrapRow(data);
    return requireOwnedPublication(ownerId, requiredString(row, "id"));
  }

  async function savePublicationDraft(
    request: SavePublicationDraftRequest,
  ): Promise<PublicationDraft> {
    const publication = await requireOwnedPublication(
      await requireOwner(request.ownerId),
      request.publicationId,
    );
    const state = canonicalizeState(
      publication.profile,
      request.state,
      "draft",
    );
    const { data, error } = await client.rpc("save_publication_draft", {
      p_publication_id: publication.id,
      p_state: state,
    });
    if (error) throw error;
    return mapDraft(unwrapRow(data), publication.profile);
  }

  return {
    async create(request: CreatePublicationRequest) {
      return createPublication(request);
    },

    async listOwned(request) {
      const ownerId = await requireOwner(request.ownerId);
      let query = client
        .from("publications")
        .select(PUBLICATION_COLUMNS)
        .eq("owner_id", ownerId)
        .order("updated_at", { ascending: false })
        .order("id", { ascending: true });
      if (!request.includeDeleted) query = query.neq("status", "deleted");
      const { data, error } = await query;
      if (error) throw error;
      return Promise.all(
        (data ?? []).map((row) => {
          if (!isRow(row)) {
            throw new PublicationDataError(
              "Supabase returned an invalid publication row.",
            );
          }
          return hydratePublication(row);
        }),
      );
    },

    async loadOwned(request) {
      const ownerId = await requireOwner(request.ownerId);
      const row = await loadPublicationRow(request.publicationId, ownerId);
      return row ? hydratePublication(row) : null;
    },

    async loadDraft(request) {
      const publication = await requireOwnedPublication(
        await requireOwner(request.ownerId),
        request.publicationId,
      );
      return publication.draft;
    },

    async saveDraft(request) {
      return savePublicationDraft(request);
    },

    async createDraftCheckpoint(request) {
      const publication = await requireOwnedPublication(
        await requireOwner(request.ownerId),
        request.publicationId,
      );
      const { data, error } = await client.rpc(
        "create_publication_checkpoint",
        { p_publication_id: publication.id },
      );
      if (error) throw error;
      return mapCheckpoint(unwrapRow(data), publication.profile);
    },

    async listDraftCheckpoints(request) {
      const publication = await requireOwnedPublication(
        await requireOwner(request.ownerId),
        request.publicationId,
      );
      return publication.draftCheckpoints;
    },

    async recoverDraft(request) {
      const publication = await requireOwnedPublication(
        await requireOwner(request.ownerId),
        request.publicationId,
      );
      const { data, error } = await client.rpc("recover_publication_draft", {
        p_publication_id: publication.id,
        p_source_kind: request.source.kind,
        p_source_id:
          request.source.kind === "draft-checkpoint"
            ? request.source.checkpointId
            : request.source.releaseId,
      });
      if (error) throw error;
      return mapDraft(unwrapRow(data), publication.profile);
    },

    async publish(request) {
      const publication = await requireOwnedPublication(
        await requireOwner(request.ownerId),
        request.publicationId,
      );
      canonicalizeState(
        publication.profile,
        publication.draft.state,
        "publishable",
      );
      const { data, error } = await client.rpc("publish_publication", {
        p_publication_id: publication.id,
      });
      if (error) throw error;
      return mapRelease(unwrapRow(data), publication.profile);
    },

    async unpublish(request) {
      const ownerId = await requireOwner(request.ownerId);
      await requireOwnedPublication(ownerId, request.publicationId);
      const { error } = await client.rpc("unpublish_publication", {
        p_publication_id: request.publicationId,
      });
      if (error) throw error;
      return requireOwnedPublication(ownerId, request.publicationId);
    },

    async delete(request) {
      const ownerId = await requireOwner(request.ownerId);
      await requireOwnedPublication(ownerId, request.publicationId);
      const { error } = await client.rpc("soft_delete_publication", {
        p_publication_id: request.publicationId,
      });
      if (error) throw error;
      return requireOwnedPublication(ownerId, request.publicationId);
    },

    async restoreDeleted(request) {
      const ownerId = await requireOwner(request.ownerId);
      await requireOwnedPublication(ownerId, request.publicationId);
      const { error } = await client.rpc("restore_deleted_publication", {
        p_publication_id: request.publicationId,
      });
      if (error) throw error;
      return requireOwnedPublication(ownerId, request.publicationId);
    },

    async loadPublic(request) {
      const { data: publicationData, error: publicationError } = await client
        .from("publications")
        .select(PUBLICATION_COLUMNS)
        .eq("game_id", request.gameId)
        .eq("profile_id", request.profileId)
        .eq("slug", request.slug)
        .eq("status", "published")
        .maybeSingle();
      if (publicationError) throw publicationError;
      if (!publicationData) return null;
      if (!isRow(publicationData)) {
        throw new PublicationDataError("Supabase returned invalid public data.");
      }
      const currentReleaseId = nullableString(
        publicationData,
        "current_release_id",
      );
      if (!currentReleaseId) return null;
      const profile = asProfile(publicationData.profile_id);
      const gameId = requiredString(publicationData, "game_id");
      if (profile.gameId !== gameId || profile.id !== request.profileId) {
        throw new PublicationDataError(
          "Public Publication game/profile data is inconsistent.",
        );
      }
      const [{ data: releaseData, error: releaseError }, creator] =
        await Promise.all([
          client
            .from("publication_releases")
            .select(PUBLIC_RELEASE_COLUMNS)
            .eq("id", currentReleaseId)
            .single(),
          client
            .from("public_creator_profiles")
            .select("handle")
            .eq("account_id", requiredString(publicationData, "owner_id"))
            .single(),
        ]);
      if (releaseError) throw releaseError;
      if (creator.error) throw creator.error;
      if (!isRow(creator.data)) {
        throw new PublicationDataError("Creator attribution is unavailable.");
      }
      const firstPublishedAt = nullableString(
        publicationData,
        "first_published_at",
      );
      if (!firstPublishedAt) {
        throw new PublicationDataError("Public publication dates are invalid.");
      }
      return {
        id: requiredString(publicationData, "id"),
        ownerId: requiredString(publicationData, "owner_id"),
        creatorHandle: requiredString(creator.data, "handle"),
        gameId,
        profileId: profile.id,
        profile,
        slug: requiredString(publicationData, "slug"),
        release: mapPublicRelease(releaseData, profile),
        firstPublishedAt,
        updatedAt: requiredString(publicationData, "latest_published_at"),
        voteCount: requiredNumber(publicationData, "vote_count"),
      } satisfies PublicPublication;
    },
  };
}
