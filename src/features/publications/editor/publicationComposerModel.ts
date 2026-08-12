import type { PublicationState, PublicationStatus } from "../../../domain/publications/types";

export function canonicalPublicationSlug(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100).replace(/-+$/g, "");
}

export function isValidPublicationSlug(value: string): boolean {
  return value.length >= 3 && value.length <= 100 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value);
}

export type PublicationLifecycle = {
  visibility: "Draft" | "Published" | "Unpublished";
  detail: "Not saved" | "Unsaved changes" | "Saved" | "All changes live" | "Saved changes not live";
  publishLabel: "Publish" | "Update publication" | "Republish";
  publishNeeded: boolean;
};

export function publicationLifecycle(status: PublicationStatus | null, editor: PublicationState, storedDraft: PublicationState | null, currentRelease: PublicationState | null): PublicationLifecycle {
  const editorMatchesDraft = storedDraft !== null && JSON.stringify(editor) === JSON.stringify(storedDraft);
  const draftMatchesRelease = storedDraft !== null && currentRelease !== null && JSON.stringify(storedDraft) === JSON.stringify(currentRelease);
  if (status === null) {
    return {
      visibility: "Draft",
      detail: "Not saved",
      publishLabel: "Publish",
      publishNeeded: true,
    };
  }
  if (status === "draft") {
    return {
      visibility: "Draft",
      detail: editorMatchesDraft ? "Saved" : "Unsaved changes",
      publishLabel: "Publish",
      publishNeeded: true,
    };
  }
  if (status === "published") {
    const releaseCurrent = editorMatchesDraft && draftMatchesRelease;
    return {
      visibility: "Published",
      detail: !editorMatchesDraft
        ? "Unsaved changes"
        : draftMatchesRelease
          ? "All changes live"
          : "Saved changes not live",
      publishLabel: "Update publication",
      publishNeeded: !releaseCurrent,
    };
  }
  return {
    visibility: "Unpublished",
    detail: editorMatchesDraft ? "Saved" : "Unsaved changes",
    publishLabel: "Republish",
    publishNeeded: true,
  };
}
