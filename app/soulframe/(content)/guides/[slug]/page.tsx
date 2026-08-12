import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicationRenderer } from "@/src/features/publications/rendering/PublicationRenderer";
import {
  createPublicPublicationMetadata,
  loadPublicPublication,
  publicPublicationUrl,
} from "@/src/features/publications/rendering/public-reading";
import { VoteButton } from "@/src/features/voting/VoteButton";
import { getBackendForRequest } from "@/src/server/composition/backend";

export const dynamic = "force-dynamic";

type GuidePageProps = { params: Promise<{ slug: string }> };

async function requireGuide(slug: string) {
  const publication = await loadPublicPublication("soulframe.guide", slug);
  if (!publication) notFound();
  return publication;
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  return createPublicPublicationMetadata(await requireGuide(slug));
}

export default async function PublicGuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const publication = await requireGuide(slug);
  const [canonicalUrl, backend] = await Promise.all([
    publicPublicationUrl(publication),
    getBackendForRequest(),
  ]);
  const session = await backend.auth.getSession();
  let voteState: { active: boolean; count: number } | null = null;
  if (session) {
    try {
      voteState = await backend.voting.getState({
        accountId: session.account.id,
        publicationId: publication.id,
      });
    } catch {
      voteState = null;
    }
  }
  const detailPath = `/soulframe/guides/${publication.slug}`;
  return (
    <PublicationRenderer
      publication={publication}
      canonicalUrl={canonicalUrl}
      voteControl={
        <VoteButton
          publicationId={publication.id}
          initialActive={voteState?.active ?? false}
          initialCount={voteState?.count ?? publication.voteCount}
          signedIn={session !== null}
          signInHref={`/auth/sign-in?${new URLSearchParams({ next: detailPath })}`}
        />
      }
    />
  );
}
