import Link from "next/link";
import type { ReactNode } from "react";
import type { PublicPublication } from "../../../server/contracts/publications";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function PublicationHeader({
  publication,
  kind,
  voteControl,
}: {
  publication: PublicPublication;
  kind: "Build" | "Guide";
  voteControl: ReactNode;
}) {
  const metadata = publication.release.state.metadata;
  return (
    <header className="border-b border-line/60 pb-7">
      <nav aria-label="Breadcrumb" className="font-sans text-xs text-ink-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/soulframe/framer"
              className="min-h-11 py-3 text-gold no-underline hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus"
            >
              Soulframe
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{kind}s</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-soft">
            {metadata.title}
          </li>
        </ol>
      </nav>

      <p className="mt-6 font-sans text-2xs font-bold uppercase tracking-[0.18em] text-gold">
        Soulframe {kind}
      </p>
      <h1 className="mt-2 max-w-4xl font-display text-4xl uppercase tracking-wide text-gold-bright sm:text-5xl">
        {metadata.title}
      </h1>
      {metadata.summary ? (
        <p className="mt-4 max-w-3xl font-sans text-base leading-7 text-ink-soft">
          {metadata.summary}
        </p>
      ) : null}

      <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-sans text-xs text-ink-muted">
        <div className="flex gap-1.5">
          <dt>Creator</dt>
          <dd className="font-bold text-ink-soft">@{publication.creatorHandle}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Published</dt>
          <dd>
            <time dateTime={publication.firstPublishedAt}>
              {formatDate(publication.firstPublishedAt)}
            </time>
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Updated on</dt>
          <dd>
            <time dateTime={publication.release.publishedAt}>
              {formatDate(publication.release.publishedAt)}
            </time>
          </dd>
        </div>
      </dl>

      <div className="mt-5">{voteControl}</div>

      {metadata.classifications.length > 0 ? (
        <ul aria-label="Classifications" className="mt-5 flex flex-wrap gap-2">
          {metadata.classifications.map((classification) => (
            <li
              key={classification}
              className="border border-line/60 bg-surface-deep px-2.5 py-1 font-sans text-2xs uppercase tracking-wide text-ink-muted"
            >
              {classification}
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}

export function PublicationStructuredData({
  publication,
  canonicalUrl,
  guideSections = [],
}: {
  publication: PublicPublication;
  canonicalUrl: string;
  guideSections?: readonly { name: string; anchor: string }[];
}) {
  const isBuild = publication.profile.contentKind === "build";
  const metadata = publication.release.state.metadata;
  const publicationData = isBuild
    ? {
        "@type": "CreativeWork",
        "@id": canonicalUrl,
        name: metadata.title,
        description: metadata.summary,
        genre: "Soulframe Build",
        about: { "@type": "VideoGame", name: "Soulframe" },
      }
    : {
        "@type": "TechArticle",
        "@id": canonicalUrl,
        headline: metadata.title,
        description: metadata.summary,
        about: { "@type": "VideoGame", name: "Soulframe" },
        hasPart: guideSections.map((section) => ({
          "@type": "WebPageElement",
          name: section.name,
          url: `${canonicalUrl}#${section.anchor}`,
        })),
      };
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...publicationData,
        url: canonicalUrl,
        datePublished: publication.firstPublishedAt,
        dateModified: publication.release.publishedAt,
        author: { "@type": "Person", name: `@${publication.creatorHandle}` },
        keywords: metadata.classifications,
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Soulframe",
            item: new URL("/soulframe/framer", canonicalUrl).toString(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: metadata.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(structuredData).replace(/</g, "\\u003c")}
    </script>
  );
}
