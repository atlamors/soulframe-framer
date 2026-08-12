import { redirect } from "next/navigation";
import type { PublicationState } from "@/src/domain/publications/types";
import { SoulframeGuideComposer } from "@/src/features/publications/editor/SoulframeGuideComposer";
import { publisherActionMessage } from "@/src/features/publications/publisherRoutes";
import { getBackendForRequest } from "@/src/server/composition/backend";

export const dynamic = "force-dynamic";

type QueryValue = string | string[] | undefined;
type NewGuideQuery = {
  title?: QueryValue;
  slug?: QueryValue;
  summary?: QueryValue;
  classifications?: QueryValue;
  error?: QueryValue;
};

function bounded(value: QueryValue, maximum: number): string {
  const first = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  return first.length <= maximum ? first : "";
}

export default async function NewGuidePage({
  searchParams,
}: {
  searchParams: Promise<NewGuideQuery>;
}) {
  const query = await searchParams;
  const route = "/soulframe/publisher/guides/new";
  const { auth } = await getBackendForRequest();
  const session = await auth.getSession();
  if (!session) {
    redirect(`/auth/sign-in?${new URLSearchParams({ next: route })}`);
  }

  const profile = await auth.getCreatorProfile(session.account.id);
  if (!profile || !profile.publisherEligibility.eligible) {
    redirect(`/soulframe/profile?${new URLSearchParams({ next: route })}`);
  }

  const summary = bounded(query.summary, 320);
  const state: PublicationState = {
    schemaVersion: 1,
    metadata: {
      title: bounded(query.title, 160),
      ...(summary ? { summary } : {}),
      classifications: bounded(query.classifications, 500)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    },
    blocks: [
      {
        id: crypto.randomUUID(),
        type: "nightfold.heading",
        schemaVersion: 1,
        data: { level: 2, text: "Introduction" },
      },
      {
        id: crypto.randomUUID(),
        type: "nightfold.rich-text",
        schemaVersion: 1,
        data: { document: [{ type: "paragraph", content: "" }] },
      },
    ],
  };

  return (
    <SoulframeGuideComposer
      mode="new"
      initialState={state}
      initialSlug={bounded(query.slug, 100)}
      canPublish
      message={publisherActionMessage(
        undefined,
        bounded(query.error, 500),
      )}
    />
  );
}
