import { notFound, redirect } from "next/navigation";
import { publisherEditPath } from "@/src/features/publications/publisherRoutes";
import { getBackendForRequest } from "@/src/server/composition/backend";

export const dynamic = "force-dynamic";

type QueryValue = string | string[] | undefined;

function firstValue(value: QueryValue): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function PublisherEditCompatibilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: QueryValue; error?: QueryValue }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const legacyPath = `/soulframe/publisher/${encodeURIComponent(id)}`;
  const { auth, publications } = await getBackendForRequest();
  const session = await auth.getSession();

  if (!session) {
    redirect(
      `/auth/sign-in?${new URLSearchParams({ next: legacyPath })}`,
    );
  }

  const publication = await publications.loadOwned({
    ownerId: session.account.id,
    publicationId: id,
  });
  if (!publication || publication.status === "deleted") notFound();

  const forwarded = new URLSearchParams();
  const notice = firstValue(query.notice);
  const error = firstValue(query.error);
  if (notice) forwarded.set("notice", notice);
  if (error) forwarded.set("error", error);

  redirect(
    `${publisherEditPath(publication.profileId, id)}${forwarded.size ? `?${forwarded}` : ""}`,
  );
}
