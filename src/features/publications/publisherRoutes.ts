import type { PublicationProfileId } from "../../domain/publications/types";

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
  return undefined;
}
