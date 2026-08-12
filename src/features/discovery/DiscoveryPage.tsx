import "server-only";

import Link from "next/link";
import type { DiscoveryOrder, DiscoveryPage as DiscoveryResult } from "../../server/contracts/discovery";
import type { PublicationProfileId } from "../../domain/publications/types";
import { resolvePublicationProfile } from "../../domain/publications/profiles";
import {
  DiscoveryInputError,
} from "../../server/supabase/discovery-service";
import { getBackendForRequest } from "../../server/composition/backend";

export type DiscoverySearchParams = {
  order?: string | string[];
  cursor?: string | string[];
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function order(value: string | undefined): DiscoveryOrder {
  return value === "top" || value === "new" ? value : "trending";
}

function routeSegment(profileId: PublicationProfileId): "builds" | "guides" {
  return resolvePublicationProfile(profileId).routeSegment;
}

function listingUrl(
  profileId: PublicationProfileId,
  selectedOrder: DiscoveryOrder,
  cursor?: string,
): string {
  const search = new URLSearchParams({ order: selectedOrder });
  if (cursor) search.set("cursor", cursor);
  return `/soulframe/${routeSegment(profileId)}?${search}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export async function DiscoveryPage({
  profileId,
  searchParams,
}: {
  profileId: PublicationProfileId;
  searchParams: DiscoverySearchParams;
}) {
  const selectedOrder = order(first(searchParams.order));
  const profile = resolvePublicationProfile(profileId);
  const backend = await getBackendForRequest();
  const kind = profile.contentKind === "build" ? "Builds" : "Guides";
  let result: DiscoveryResult = { items: [], nextCursor: null };
  let error: string | null = null;

  try {
    result = await backend.discovery.list({
      order: selectedOrder,
      gameId: profile.gameId,
      profileId: profile.id,
      limit: 20,
      cursor: first(searchParams.cursor),
    });
  } catch (caught) {
    error =
      caught instanceof DiscoveryInputError
        ? caught.message
        : `${kind} discovery is temporarily unavailable. Please try again.`;
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] px-4 py-10 text-ink sm:px-6">
      <div>
        <header className="border-b border-line/70 pb-6">
          <p className="font-sans text-2xs font-bold uppercase tracking-[0.18em] text-gold">
            Soulframe community
          </p>
          <h1 className="mt-2 font-display text-4xl uppercase tracking-wide text-gold-bright">
            {kind}
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-ink-soft">
            Browse published {kind.toLowerCase()} by recent momentum,
            total community upvotes, or publication date.
          </p>
        </header>

        <nav aria-label={`${kind} discovery order`} className="mt-6 flex flex-wrap gap-2">
          {(["trending", "top", "new"] as const).map((candidate) => (
            <Link
              key={candidate}
              href={listingUrl(profileId, candidate)}
              aria-current={candidate === selectedOrder ? "page" : undefined}
              className={`inline-flex min-h-11 items-center border px-4 font-sans text-sm font-bold uppercase tracking-wide no-underline ${candidate === selectedOrder ? "border-gold bg-control-hover text-gold-bright" : "border-line text-ink-soft"}`}
            >
              {candidate}
            </Link>
          ))}
        </nav>

        {error ? (
          <p role="alert" className="mt-6 border border-red-400/50 p-4 font-sans text-sm text-red-200">{error}</p>
        ) : result.items.length === 0 ? (
          <p className="mt-6 border border-line/70 bg-surface p-5 font-sans text-sm text-ink-muted">
            No published {kind.toLowerCase()} match this discovery view.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {result.items.map((item) => (
              <article key={item.publicationId} className="border border-line/70 bg-surface p-5 shadow-panel">
                <p className="font-sans text-2xs font-bold uppercase tracking-[0.16em] text-gold">
                  @{item.creatorHandle} · {item.voteCount} upvotes
                </p>
                <h2 className="mt-2 font-display text-2xl uppercase tracking-wide text-gold-bright">
                  <Link href={`/soulframe/${routeSegment(item.profileId)}/${item.slug}`} className="text-inherit no-underline hover:text-gold focus-visible:outline-none focus-visible:shadow-focus">
                    {item.title}
                  </Link>
                </h2>
                {item.summary ? <p className="mt-3 font-sans text-sm leading-6 text-ink-soft">{item.summary}</p> : null}
                <dl className="mt-4 grid grid-cols-2 gap-2 font-sans text-xs text-ink-muted">
                  <div><dt className="uppercase tracking-wide">Published</dt><dd className="mt-1 text-ink-soft">{formatDate(item.firstPublishedAt)}</dd></div>
                  <div><dt className="uppercase tracking-wide">Updated</dt><dd className="mt-1 text-ink-soft">{formatDate(item.latestPublishedAt)}</dd></div>
                </dl>
                {item.classifications.length > 0 ? (
                  <p className="mt-4 font-sans text-xs text-ink-muted">{item.classifications.join(" · ")}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}

        {result.nextCursor ? (
          <Link href={listingUrl(profileId, selectedOrder, result.nextCursor)} className="mt-6 inline-flex min-h-11 items-center border border-line px-4 font-sans text-sm font-bold uppercase text-ink no-underline">
            Next page
          </Link>
        ) : null}
      </div>
    </main>
  );
}
