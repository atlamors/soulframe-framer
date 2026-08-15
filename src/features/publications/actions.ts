"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  decodeSoulframeBuildHandoff,
  SOULFRAME_FRAME_HANDOFF_MAX_LENGTH,
} from "../../domain/artifacts/soulframe-codec";
import {
  isPublicationProfileId,
  resolvePublicationProfile,
  type PublicationProfile,
} from "../../domain/publications/profiles";
import type { PublicationProfileId, PublicationState } from "../../domain/publications/types";
import type { SoulframeBuild } from "../../domain/types";
import type { AuthService } from "../../server/contracts/auth";
import type { PublicationService } from "../../server/contracts/publications";
import { getBackendForRequest } from "../../server/composition/backend";
import {
  AuthenticationRequiredError,
} from "../../server/supabase/auth-service";
import {
  PublicationAuthenticationError,
  PublicationInputError,
  PublicationNotFoundError,
} from "../../server/supabase/publication-service";
import {
  publicPublicationPath,
  publisherActionLocation,
  publisherWorkspacePath,
} from "./publisherRoutes";

class PublisherProfileRequiredError extends Error {
  readonly name = "PublisherProfileRequiredError";
}

type PublisherOwnerContext = {
  accountId: string;
  auth: AuthService;
  publications: PublicationService;
};

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseProfileId(value: string): PublicationProfileId {
  if (isPublicationProfileId(value)) return value;
  throw new PublicationInputError("Choose a supported Publication Profile.");
}

function parsePublicationId(value: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new PublicationInputError("The Publication identifier is invalid.");
  }
  return value;
}

function parseState(formData: FormData): PublicationState {
  const value = formString(formData, "state");
  try {
    return JSON.parse(value) as PublicationState;
  } catch {
    throw new PublicationInputError("The draft could not be read. Reload before saving.");
  }
}

function initialState(
  profile: PublicationProfile,
  title: string,
  summary: string,
  classifications: string[],
  attachedFrame: SoulframeBuild | null,
): PublicationState {
  return {
    schemaVersion: 1,
    metadata: {
      title,
      ...(summary.trim() ? { summary } : {}),
      classifications,
    },
    blocks:
      profile.contentKind === "guide"
        ? [
            {
              id: crypto.randomUUID(),
              type: "nightfold.heading",
              schemaVersion: 1,
              data: { level: 2, text: "Introduction" },
            },
          ]
        : attachedFrame
          ? [
              {
                id: crypto.randomUUID(),
                type: "soulframe.build.stage",
                schemaVersion: 1,
                data: {
                  role: "home",
                  name: attachedFrame.name.trim() || "Home",
                  planner: attachedFrame,
                  sharedSections: [],
                },
              },
            ]
          : [],
  };
}

function attachedFrame(
  formData: FormData,
  profile: PublicationProfile,
): SoulframeBuild | null {
  if (profile.contentKind !== "build") return null;
  const encoded = formString(formData, "frame");
  if (!encoded) return null;
  if (encoded.length > SOULFRAME_FRAME_HANDOFF_MAX_LENGTH) {
    throw new PublicationInputError("The attached Frame handoff is too large.");
  }
  try {
    return decodeSoulframeBuildHandoff(encoded);
  } catch (error) {
    throw new PublicationInputError(
      error instanceof Error ? error.message : "The attached Frame is invalid.",
    );
  }
}

async function requirePublisherOwnerContext(): Promise<PublisherOwnerContext> {
  const { auth, publications } = await getBackendForRequest();
  const session = await auth.requireSession();
  return { accountId: session.account.id, auth, publications };
}

async function requireEligiblePublisherContext(): Promise<PublisherOwnerContext> {
  const context = await requirePublisherOwnerContext();
  const profile = await context.auth.getCreatorProfile(context.accountId);
  if (!profile) {
    throw new PublisherProfileRequiredError(
      "Activate a Creator Profile before publishing.",
    );
  }
  if (!profile.publisherEligibility.eligible) {
    throw new PublisherProfileRequiredError(
      "This Creator Profile is not currently eligible to publish.",
    );
  }
  return context;
}

function errorCode(error: unknown): string {
  if (
    error instanceof AuthenticationRequiredError ||
    error instanceof PublicationAuthenticationError
  ) {
    return "sign-in-required";
  }
  if (error instanceof PublisherProfileRequiredError) {
    return "creator-profile-required";
  }
  if (error instanceof PublicationNotFoundError) return "not-found";
  if (error instanceof PublicationInputError) {
    return `input:${error.message}`;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  ) {
    return "slug-unavailable";
  }
  return "unavailable";
}

function publisherLocation(
  publicationId: string | null,
  kind: "error" | "notice",
  value: string,
  profileId: PublicationProfileId | null = null,
): string {
  return publisherActionLocation(profileId, publicationId, kind, value);
}

function submittedProfileId(formData: FormData): PublicationProfileId | null {
  const value = formString(formData, "profileId");
  return isPublicationProfileId(value) ? value : null;
}

export async function createPublicationAction(formData: FormData) {
  const submittedFrame = formString(formData, "frame");
  const preservedFrame =
    submittedFrame.length > 0 &&
    submittedFrame.length <= SOULFRAME_FRAME_HANDOFF_MAX_LENGTH
      ? submittedFrame
      : null;
  let target: string;
  try {
    const context = await requireEligiblePublisherContext();
    const profileId = parseProfileId(formString(formData, "profileId"));
    const profile = resolvePublicationProfile(profileId);
    const frame = attachedFrame(formData, profile);
    const publication = await context.publications.create({
      ownerId: context.accountId,
      gameId: profile.gameId,
      profileId: profile.id,
      slug: formString(formData, "slug"),
      initialState: initialState(
        profile,
        formString(formData, "title"),
        formString(formData, "summary"),
        formString(formData, "classifications")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        frame,
      ),
    });
    revalidatePath("/soulframe/publisher");
    target = publisherLocation(publication.id, "notice", "created", profile.id);
  } catch (error) {
    const search = new URLSearchParams({ error: errorCode(error) });
    const preservedInputs = [
      ["profile", formString(formData, "profileId"), 64],
      ["title", formString(formData, "title"), 160],
      ["slug", formString(formData, "slug"), 100],
      ["summary", formString(formData, "summary"), 320],
      ["classifications", formString(formData, "classifications"), 500],
    ] as const;
    for (const [key, value, maximumLength] of preservedInputs) {
      if (value && value.length <= maximumLength) search.set(key, value);
    }
    if (preservedFrame) search.set("frame", preservedFrame);
    target = `/soulframe/publisher/new?${search}`;
  }
  redirect(target);
}

export type CreateSoulframeBuildActionState = {
  status: "idle" | "error";
  message: string;
};
export type CreatePublicationActionState = CreateSoulframeBuildActionState;

function createSoulframeBuildErrorMessage(error: unknown): string {
  const code = errorCode(error);
  return code.startsWith("input:")
    ? code.slice("input:".length)
    : code === "slug-unavailable"
      ? "That route slug is already in use."
      : code === "sign-in-required"
        ? "Sign in to create this Build."
        : code === "creator-profile-required"
          ? "An eligible Creator Profile is required to create this Build."
          : "The Build draft could not be created. Please try again.";
}

export async function createSoulframeBuildFromStateAction(
  _previousState: CreateSoulframeBuildActionState,
  formData: FormData,
): Promise<CreateSoulframeBuildActionState> {
  let target: string;
  try {
    const context = await requireEligiblePublisherContext();
    const profile = resolvePublicationProfile("soulframe.build");
    const publication = await context.publications.create({
      ownerId: context.accountId,
      gameId: profile.gameId,
      profileId: profile.id,
      slug: formString(formData, "slug"),
      initialState: parseState(formData),
    });
    revalidatePath("/soulframe/publisher");
    target = publisherLocation(publication.id, "notice", "created", profile.id);
  } catch (error) {
    return {
      status: "error",
      message: createSoulframeBuildErrorMessage(error),
    };
  }
  redirect(target);
}

export async function createAndPublishSoulframeBuildFromStateAction(
  _previousState: CreateSoulframeBuildActionState,
  formData: FormData,
): Promise<CreateSoulframeBuildActionState> {
  let context: PublisherOwnerContext;
  let publicationId: string;
  try {
    context = await requireEligiblePublisherContext();
    const profile = resolvePublicationProfile("soulframe.build");
    const publication = await context.publications.create({
      ownerId: context.accountId,
      gameId: profile.gameId,
      profileId: profile.id,
      slug: formString(formData, "slug"),
      initialState: parseState(formData),
    });
    publicationId = publication.id;
  } catch (error) {
    return {
      status: "error",
      message: createSoulframeBuildErrorMessage(error),
    };
  }

  let published = false;
  try {
    await context.publications.publish({
      ownerId: context.accountId,
      publicationId,
    });
    published = true;
  } catch {
    // The new private draft is preserved and opened below for recovery.
  }

  const target = publisherLocation(
    publicationId,
    published ? "notice" : "error",
    published ? "published" : "created-not-published",
    "soulframe.build",
  );

  try {
    revalidatePath(`/soulframe/publisher/${publicationId}`);
    revalidatePath("/soulframe/publisher");
    if (published) {
      revalidatePath("/soulframe/builds");
      revalidatePath("/soulframe/guides");
    }
  } finally {
    redirect(target);
  }
}

/** Generic composer command; creation is deliberately private unless Publish is selected. */
export async function createPublicationFromStateAction(
  previous: CreatePublicationActionState,
  formData: FormData,
) {
  const profileId = formString(formData, "profileId");
  if (profileId === "soulframe.build") {
    return createSoulframeBuildFromStateAction(previous, formData);
  }
  let target: string;
  try {
    const context = await requireEligiblePublisherContext();
    const profile = resolvePublicationProfile(parseProfileId(profileId));
    const publication = await context.publications.create({
      ownerId: context.accountId,
      gameId: profile.gameId,
      profileId: profile.id,
      slug: formString(formData, "slug"),
      initialState: parseState(formData),
    });
    revalidatePath("/soulframe/publisher");
    target = publisherLocation(publication.id, "notice", "created", profile.id);
  } catch (error) {
    return {
      status: "error" as const,
      message: createSoulframeBuildErrorMessage(error),
    };
  }
  redirect(target);
}

export async function createAndPublishPublicationFromStateAction(
  previous: CreatePublicationActionState,
  formData: FormData,
) {
  const profileId = formString(formData, "profileId");
  if (profileId === "soulframe.build") {
    return createAndPublishSoulframeBuildFromStateAction(previous, formData);
  }

  let context: PublisherOwnerContext;
  let publicationId: string;
  try {
    context = await requireEligiblePublisherContext();
    const profile = resolvePublicationProfile(parseProfileId(profileId));
    const publication = await context.publications.create({
      ownerId: context.accountId,
      gameId: profile.gameId,
      profileId: profile.id,
      slug: formString(formData, "slug"),
      initialState: parseState(formData),
    });
    publicationId = publication.id;
  } catch (error) {
    return {
      status: "error" as const,
      message: createSoulframeBuildErrorMessage(error),
    };
  }

  let published = false;
  try {
    await context.publications.publish({
      ownerId: context.accountId,
      publicationId,
    });
    published = true;
  } catch {
    // Creation succeeded, so keep and open the captured private draft.
  }

  const target = publisherLocation(
    publicationId,
    published ? "notice" : "error",
    published ? "published" : "created-not-published",
    parseProfileId(profileId),
  );
  try {
    revalidatePath(`/soulframe/publisher/${publicationId}`);
    revalidatePath("/soulframe/publisher");
    if (published) {
      revalidatePath("/soulframe/builds");
      revalidatePath("/soulframe/guides");
    }
  } finally {
    redirect(target);
  }
}

async function saveSubmittedDraft(
  context: PublisherOwnerContext,
  formData: FormData,
  publicationId: string,
) {
  const draft = await context.publications.saveDraft({
    ownerId: context.accountId,
    publicationId,
    state: parseState(formData),
  });
  return { publicationId, draft };
}

export async function savePublicationDraftAction(formData: FormData) {
  const profileId = submittedProfileId(formData);
  let publicationId: string | null = null;
  let target: string;
  try {
    const context = await requirePublisherOwnerContext();
    publicationId = parsePublicationId(formString(formData, "publicationId"));
    await saveSubmittedDraft(context, formData, publicationId);
    revalidatePath(`/soulframe/publisher/${publicationId}`);
    target = publisherLocation(publicationId, "notice", "saved", profileId);
  } catch (error) {
    target = publisherLocation(publicationId, "error", errorCode(error), profileId);
  }
  redirect(target);
}

export async function checkpointPublicationDraftAction(formData: FormData) {
  const profileId = submittedProfileId(formData);
  let publicationId: string | null = null;
  let target: string;
  try {
    const context = await requirePublisherOwnerContext();
    publicationId = parsePublicationId(formString(formData, "publicationId"));
    await context.publications.createDraftCheckpoint({
      ownerId: context.accountId,
      publicationId,
    });
    revalidatePath(`/soulframe/publisher/${publicationId}`);
    target = publisherLocation(publicationId, "notice", "checkpointed", profileId);
  } catch (error) {
    target = publisherLocation(publicationId, "error", errorCode(error), profileId);
  }
  redirect(target);
}

export async function publishPublicationAction(formData: FormData) {
  const profileId = submittedProfileId(formData);
  let publicationId: string | null = null;
  let target: string;
  try {
    const context = await requireEligiblePublisherContext();
    publicationId = parsePublicationId(formString(formData, "publicationId"));
    await context.publications.publish({
      ownerId: context.accountId,
      publicationId,
    });
    revalidatePath(`/soulframe/publisher/${publicationId}`);
    revalidatePath("/soulframe/builds");
    revalidatePath("/soulframe/guides");
    target = publisherLocation(publicationId, "notice", "published", profileId);
  } catch (error) {
    target = publisherLocation(publicationId, "error", errorCode(error), profileId);
  }
  redirect(target);
}

/** Saves the submitted editor snapshot before producing an immutable release. */
export async function saveAndPublishPublicationAction(formData: FormData) {
  const profileId = submittedProfileId(formData);
  let publicationId: string | null = null;
  let context: PublisherOwnerContext;
  try {
    context = await requireEligiblePublisherContext();
    publicationId = parsePublicationId(formString(formData, "publicationId"));
    await saveSubmittedDraft(context, formData, publicationId);
  } catch (error) {
    redirect(publisherLocation(publicationId, "error", errorCode(error), profileId));
  }

  let published = false;
  try {
    await context.publications.publish({
      ownerId: context.accountId,
      publicationId,
    });
    published = true;
  } catch {
    // The submitted state is safely persisted even when its release fails.
  }

  const target = publisherLocation(
    publicationId,
    published ? "notice" : "error",
    published ? "published" : "saved-not-published",
    profileId,
  );
  try {
    revalidatePath(`/soulframe/publisher/${publicationId}`);
    revalidatePath("/soulframe/publisher");
    if (published) {
      revalidatePath("/soulframe/builds");
      revalidatePath("/soulframe/guides");
    }
  } finally {
    redirect(target);
  }
}

export async function unpublishPublicationAction(formData: FormData) {
  const profileId = submittedProfileId(formData);
  let publicationId: string | null = null;
  let target: string;
  try {
    const context = await requirePublisherOwnerContext();
    publicationId = parsePublicationId(formString(formData, "publicationId"));
    await context.publications.unpublish({
      ownerId: context.accountId,
      publicationId,
    });
    revalidatePath(`/soulframe/publisher/${publicationId}`);
    revalidatePath("/soulframe/builds");
    revalidatePath("/soulframe/guides");
    target = publisherLocation(publicationId, "notice", "unpublished", profileId);
  } catch (error) {
    target = publisherLocation(publicationId, "error", errorCode(error), profileId);
  }
  redirect(target);
}

function publisherWorkspaceLocation(
  profileId: PublicationProfileId,
  kind: "error" | "notice",
  value: string,
): string {
  return `${publisherWorkspacePath(profileId)}?${new URLSearchParams({ [kind]: value })}`;
}

function revalidatePublicationRoutes(
  profileId: PublicationProfileId,
  slug: string,
) {
  revalidatePath(publisherWorkspacePath(profileId));
  revalidatePath(profileId === "soulframe.build" ? "/soulframe/builds" : "/soulframe/guides");
  revalidatePath(publicPublicationPath(profileId, slug));
}

export async function archivePublicationAction(formData: FormData) {
  let profileId: PublicationProfileId | null = null;
  let target: string;
  try {
    const context = await requirePublisherOwnerContext();
    const publicationId = parsePublicationId(formString(formData, "publicationId"));
    const publication = await context.publications.loadOwned({
      ownerId: context.accountId,
      publicationId,
    });
    if (!publication) throw new PublicationNotFoundError("Publication not found.");
    profileId = publication.profileId;
    if (publication.status === "published") {
      throw new PublicationInputError("Unpublish before archiving.");
    }
    if (publication.status !== "draft" && publication.status !== "unpublished") {
      throw new PublicationInputError("Only a private publication can be archived.");
    }
    await context.publications.delete({
      ownerId: context.accountId,
      publicationId,
    });
    revalidatePublicationRoutes(publication.profileId, publication.slug);
    target = publisherWorkspaceLocation(publication.profileId, "notice", "archived");
  } catch (error) {
    target = profileId
      ? publisherWorkspaceLocation(profileId, "error", errorCode(error))
      : publisherLocation(null, "error", errorCode(error));
  }
  redirect(target);
}

export async function restorePublicationAction(formData: FormData) {
  let profileId: PublicationProfileId | null = null;
  let target: string;
  try {
    const context = await requirePublisherOwnerContext();
    const publicationId = parsePublicationId(formString(formData, "publicationId"));
    const publication = await context.publications.loadOwned({
      ownerId: context.accountId,
      publicationId,
    });
    if (!publication) throw new PublicationNotFoundError("Publication not found.");
    profileId = publication.profileId;
    if (publication.status !== "deleted" || !publication.deletionRecovery) {
      throw new PublicationInputError("This publication is not archived.");
    }
    if (Date.parse(publication.deletionRecovery.recoverableUntil) <= Date.now()) {
      throw new PublicationInputError("The archive recovery window has expired.");
    }
    await context.publications.restoreDeleted({
      ownerId: context.accountId,
      publicationId,
    });
    revalidatePublicationRoutes(publication.profileId, publication.slug);
    target = publisherWorkspaceLocation(publication.profileId, "notice", "restored");
  } catch (error) {
    target = profileId
      ? publisherWorkspaceLocation(profileId, "error", errorCode(error))
      : publisherLocation(null, "error", errorCode(error));
  }
  redirect(target);
}
