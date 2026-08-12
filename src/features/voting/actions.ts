"use server";

import { revalidatePath } from "next/cache";
import { getBackendForRequest } from "../../server/composition/backend";
import { AuthenticationRequiredError } from "../../server/supabase/auth-service";
import {
  PublicationOwnerVoteError,
  VoteAuthenticationError,
  VotePublicationNotFoundError,
} from "../../server/supabase/voting-service";

export type VoteActionState = {
  publicationId: string;
  active: boolean;
  count: number;
  error: string | null;
};

function publicationId(formData: FormData): string {
  const value = formData.get("publicationId");
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new Error("The Publication identifier is invalid.");
  }
  return value;
}

export async function togglePublicationVoteAction(
  previous: VoteActionState,
  formData: FormData,
): Promise<VoteActionState> {
  let id = previous.publicationId;
  try {
    id = publicationId(formData);
    const { auth, voting } = await getBackendForRequest();
    const session = await auth.requireSession();
    const state = await voting.toggle({
      accountId: session.account.id,
      publicationId: id,
    });
    revalidatePath("/soulframe/builds");
    revalidatePath("/soulframe/guides");
    return { ...state, error: null };
  } catch (error) {
    let message = "The vote could not be changed. Please try again.";
    if (
      error instanceof AuthenticationRequiredError ||
      error instanceof VoteAuthenticationError
    ) {
      message = "Sign in to upvote this Publication.";
    } else if (error instanceof PublicationOwnerVoteError) {
      message = error.message;
    } else if (error instanceof VotePublicationNotFoundError) {
      message = "This Publication is no longer available for voting.";
    }
    return { ...previous, publicationId: id, error: message };
  }
}
