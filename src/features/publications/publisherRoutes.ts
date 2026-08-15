import type { PublicationProfileId } from "../../domain/publications/types";

type NewBuildQueryValue = string | string[] | undefined;

export type NewBuildPublisherQuery = {
  frame?: NewBuildQueryValue;
  title?: NewBuildQueryValue;
  slug?: NewBuildQueryValue;
  summary?: NewBuildQueryValue;
  classifications?: NewBuildQueryValue;
  error?: NewBuildQueryValue;
};

const NEW_BUILD_QUERY_LIMITS = {
  frame: 32_000,
  title: 160,
  slug: 100,
  summary: 320,
  classifications: 500,
  error: 500,
} as const satisfies Record<keyof NewBuildPublisherQuery, number>;

function firstBoundedQueryValue(
  value: NewBuildQueryValue,
  maximum: number,
): string {
  const first = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  return first.length <= maximum ? first : "";
}

/** Preserves only bounded Build-prefill fields across authentication/profile gates. */
export function newBuildPublisherReturnPath(
  query: NewBuildPublisherQuery,
): string {
  const search = new URLSearchParams();
  for (const key of Object.keys(NEW_BUILD_QUERY_LIMITS) as Array<
    keyof NewBuildPublisherQuery
  >) {
    const value = firstBoundedQueryValue(
      query[key],
      NEW_BUILD_QUERY_LIMITS[key],
    );
    if (value) search.set(key, value);
  }
  const pathname = "/soulframe/publisher/builds/new";
  return search.size ? `${pathname}?${search}` : pathname;
}

export function publisherWorkspacePath(profileId: PublicationProfileId): string {
  return `/soulframe/publisher/${profileId === "soulframe.build" ? "builds" : "guides"}`;
}

export function publisherNewPath(profileId: PublicationProfileId): string {
  return `${publisherWorkspacePath(profileId)}/new`;
}

export function publisherEditPath(
  profileId: PublicationProfileId,
  id: string,
): string {
  return `${publisherWorkspacePath(profileId)}/${encodeURIComponent(id)}`;
}

export function publisherActionLocation(
  profileId: PublicationProfileId | null,
  publicationId: string | null,
  kind: "error" | "notice",
  value: string,
): string {
  const pathname = publicationId
    ? profileId
      ? publisherEditPath(profileId, publicationId)
      : `/soulframe/publisher/${encodeURIComponent(publicationId)}`
    : profileId
      ? publisherWorkspacePath(profileId)
      : "/soulframe/publisher";
  return `${pathname}?${new URLSearchParams({ [kind]: value })}`;
}

export function publicPublicationPath(
  profileId: PublicationProfileId,
  slug: string,
): string {
  const segment = profileId === "soulframe.build" ? "builds" : "guides";
  return `/soulframe/${segment}/${encodeURIComponent(slug)}`;
}

export function publisherProfileForSegment(
  segment: string,
): PublicationProfileId | null {
  if (segment === "builds") return "soulframe.build";
  if (segment === "guides") return "soulframe.guide";
  return null;
}

export type PublisherActionMessage = {
  tone: "success" | "error";
  text: string;
};

export function publisherActionMessage(
  notice: string | undefined,
  error: string | undefined,
): PublisherActionMessage | undefined {
  if (error) {
    if (error === "sign-in-required") {
      return { tone: "error", text: "Sign in to continue editing." };
    }
    if (error === "creator-profile-required") {
      return {
        tone: "error",
        text: "An eligible Creator Profile is required to publish.",
      };
    }
    if (error === "not-found") {
      return { tone: "error", text: "This publication is unavailable." };
    }
    if (error === "created-not-published") {
      return {
        tone: "error",
        text: "The private draft was created, but publishing failed. Review it and try Publish again.",
      };
    }
    if (error === "saved-not-published") {
      return {
        tone: "error",
        text: "Your changes were saved, but the publication was not updated. Review it and try Publish again.",
      };
    }
    if (error.startsWith("input:")) {
      return { tone: "error", text: error.slice("input:".length) };
    }
    return {
      tone: "error",
      text: "The action could not be completed. Please try again.",
    };
  }

  if (notice === "created") {
    return { tone: "success", text: "Private draft created." };
  }
  if (notice === "saved") {
    return { tone: "success", text: "Draft saved." };
  }
  if (notice === "checkpointed") {
    return { tone: "success", text: "Saved-draft checkpoint created." };
  }
  if (notice === "published") {
    return {
      tone: "success",
      text: "Published. Your latest changes are live.",
    };
  }
  if (notice === "unpublished") {
    return {
      tone: "success",
      text: "Unpublished. This piece is no longer publicly visible.",
    };
  }
  if (notice === "archived") {
    return {
      tone: "success",
      text: "Archived. You can restore it during the recovery window.",
    };
  }
  if (notice === "restored") {
    return { tone: "success", text: "Restored to your private workspace." };
  }
  return undefined;
}
