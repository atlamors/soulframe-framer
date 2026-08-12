import "server-only";

import type { Metadata } from "next";
import { headers } from "next/headers";
import { cache } from "react";
import { extractPublicationSearchableText } from "../../../domain/publications/blocks";
import { resolvePublicationProfile } from "../../../domain/publications/profiles";
import type { PublicationProfileId } from "../../../domain/publications/types";
import type { PublicPublication } from "../../../server/contracts/publications";
import { getBackendForRequest } from "../../../server/composition/backend";

export const loadPublicPublication = cache(
  async (
    profileId: PublicationProfileId,
    slug: string,
  ): Promise<PublicPublication | null> => {
    const profile = resolvePublicationProfile(profileId);
    const service = (await getBackendForRequest()).publications;
    return service.loadPublic({ gameId: profile.gameId, profileId: profile.id, slug });
  },
);

export function publicDescription(publication: PublicPublication): string {
  const summary = publication.release.state.metadata.summary?.trim();
  if (summary) return summary;
  const searchable = extractPublicationSearchableText(
    publication.release.state.blocks,
  );
  return searchable.slice(0, 157).trimEnd() || "A Soulframe Publication on Nightfold.";
}

async function absolutePublicUrl(pathname: string): Promise<string> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    requestHeaders.get("host") ||
    "localhost:3000";
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$)/.test(host)
        ? "http"
        : "https";
  return new URL(pathname, `${protocol}://${host}`).toString();
}

export async function createPublicPublicationMetadata(
  publication: PublicPublication,
): Promise<Metadata> {
  const kind = publication.profile.contentKind === "build" ? "Build" : "Guide";
  const title = publication.release.state.metadata.title;
  const description = publicDescription(publication);
  const pathname = `/${publication.gameId}/${publication.profile.routeSegment}/${publication.slug}`;
  const canonical = await absolutePublicUrl(pathname);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: "Nightfold",
      publishedTime: publication.firstPublishedAt,
      modifiedTime: publication.updatedAt,
      authors: [`@${publication.creatorHandle}`],
      tags: publication.release.state.metadata.classifications,
      images: [
        {
          url: "/social/cards/soulframe-v1.png",
          width: 1200,
          height: 630,
          alt: "Nightfold — Soulframe builds, guides, and community knowledge",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: "/social/cards/soulframe-v1.png",
          width: 1200,
          height: 630,
          alt: "Nightfold — Soulframe builds, guides, and community knowledge",
        },
      ],
    },
  };
}

export async function publicPublicationUrl(
  publication: PublicPublication,
): Promise<string> {
  return absolutePublicUrl(
    `/${publication.gameId}/${publication.profile.routeSegment}/${publication.slug}`,
  );
}
