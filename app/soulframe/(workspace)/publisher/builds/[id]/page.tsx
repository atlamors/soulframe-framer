import { notFound, redirect } from "next/navigation";
import { PublisherEditor } from "@/src/features/publications/editor/PublisherEditor";
import { publisherActionMessage } from "@/src/features/publications/publisherRoutes";
import { getBackendForRequest } from "@/src/server/composition/backend";

export const dynamic = "force-dynamic";

type QueryValue = string | string[] | undefined;

function firstValue(value: QueryValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BuildEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: QueryValue; error?: QueryValue }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const route = `/soulframe/publisher/builds/${encodeURIComponent(id)}`;
  const { auth, publications } = await getBackendForRequest();
  const session = await auth.getSession();
  if (!session) {
    redirect(`/auth/sign-in?${new URLSearchParams({ next: route })}`);
  }

  const profile = await auth.getCreatorProfile(session.account.id);
  if (!profile) {
    redirect(`/soulframe/profile?${new URLSearchParams({ next: route })}`);
  }

  const publication = await publications.loadOwned({
    ownerId: session.account.id,
    publicationId: id,
  });
  if (
    !publication ||
    publication.profileId !== "soulframe.build" ||
    publication.status === "deleted"
  ) {
    notFound();
  }

  return (
    <PublisherEditor
      publication={publication}
      canPublish={profile.publisherEligibility.eligible}
      message={publisherActionMessage(
        firstValue(query.notice),
        firstValue(query.error),
      )}
    />
  );
}
