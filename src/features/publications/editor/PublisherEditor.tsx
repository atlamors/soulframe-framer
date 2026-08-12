"use client";

import type { Publication } from "../../../domain/publications/types";
import { SoulframeBuildComposer } from "./SoulframeBuildComposer";
import { SoulframeGuideComposer } from "./SoulframeGuideComposer";

export function PublisherEditor({
  publication,
  canPublish,
  message,
}: {
  publication: Publication;
  canPublish: boolean;
  message?: { tone: "success" | "error"; text: string };
}) {
  if (publication.profile.blockSchemaKey === "soulframe.build.v1") {
    return (
      <SoulframeBuildComposer
        mode="persisted"
        publicationId={publication.id}
        status={publication.status}
        currentRelease={publication.currentRelease?.state ?? null}
        initialState={publication.draft.state}
        initialSlug={publication.slug}
        canPublish={canPublish}
        message={message}
      />
    );
  }

  return (
    <SoulframeGuideComposer
      mode="persisted"
      publicationId={publication.id}
      status={publication.status}
      currentRelease={publication.currentRelease?.state ?? null}
      initialState={publication.draft.state}
      initialSlug={publication.slug}
      canPublish={canPublish}
      message={message}
    />
  );
}
