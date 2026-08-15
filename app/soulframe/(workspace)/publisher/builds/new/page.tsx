import { redirect } from "next/navigation";
import { DEFAULT_BUILD } from "@/app/builder/constants";
import {
  decodeSoulframeBuildHandoff,
  SOULFRAME_FRAME_HANDOFF_MAX_LENGTH,
} from "@/src/domain/artifacts/soulframe-codec";
import type { SoulframeBuild } from "@/src/domain/types";
import { SoulframeBuildComposer } from "@/src/features/publications/editor/SoulframeBuildComposer";
import { createInitialSoulframeBuildState } from "@/src/features/publications/editor/soulframeBuildComposerModel";
import {
  newBuildPublisherReturnPath,
  publisherActionMessage,
  type NewBuildPublisherQuery,
} from "@/src/features/publications/publisherRoutes";
import { getBackendForRequest } from "@/src/server/composition/backend";

export const dynamic = "force-dynamic";

type QueryValue = string | string[] | undefined;

function bounded(value: QueryValue, maximum: number): string {
  const first = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  return first.length <= maximum ? first : "";
}

export default async function NewBuildPage({
  searchParams,
}: {
  searchParams: Promise<NewBuildPublisherQuery>;
}) {
  const query = await searchParams;
  const route = newBuildPublisherReturnPath(query);
  const { auth } = await getBackendForRequest();
  const session = await auth.getSession();
  if (!session) {
    redirect(`/auth/sign-in?${new URLSearchParams({ next: route })}`);
  }

  const profile = await auth.getCreatorProfile(session.account.id);
  if (!profile || !profile.publisherEligibility.eligible) {
    redirect(`/soulframe/profile?${new URLSearchParams({ next: route })}`);
  }

  const submittedFrame = Array.isArray(query.frame)
    ? (query.frame[0] ?? "")
    : (query.frame ?? "");
  let planner: SoulframeBuild = DEFAULT_BUILD;
  let frameError: string | null = null;
  if (submittedFrame.length > SOULFRAME_FRAME_HANDOFF_MAX_LENGTH) {
    frameError = "The Frame handoff is too large. Return to the Framer and try again.";
  } else if (submittedFrame) {
    try {
      planner = decodeSoulframeBuildHandoff(submittedFrame);
    } catch (error) {
      frameError =
        error instanceof Error ? error.message : "The attached Frame is invalid.";
    }
  }

  const title = bounded(query.title, 160);
  const summary = bounded(query.summary, 320);
  const state = createInitialSoulframeBuildState(
    {
      title,
      ...(summary ? { summary } : {}),
      classifications: bounded(query.classifications, 500)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    },
    planner,
  );

  return (
    <SoulframeBuildComposer
      mode="new"
      initialState={state}
      initialSlug={bounded(query.slug, 100)}
      canPublish
      message={
        frameError
          ? { tone: "error", text: frameError }
          : publisherActionMessage(undefined, bounded(query.error, 500))
      }
    />
  );
}
