import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthService } from "../contracts/auth";
import type { PublicationVoteState, VotingService } from "../contracts/voting";

type UnknownRow = Record<string, unknown>;

export class VoteAuthenticationError extends Error {
  readonly name = "VoteAuthenticationError";
}

export class VotePublicationNotFoundError extends Error {
  readonly name = "VotePublicationNotFoundError";
}

export class PublicationOwnerVoteError extends Error {
  readonly name = "PublicationOwnerVoteError";
}

export class VoteDataError extends Error {
  readonly name = "VoteDataError";
}

function isRow(value: unknown): value is UnknownRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapRow(value: unknown): UnknownRow {
  if (isRow(value)) return value;
  if (Array.isArray(value) && value.length === 1 && isRow(value[0])) {
    return value[0];
  }
  throw new VoteDataError("Supabase returned an invalid vote row.");
}

function voteCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new VoteDataError("Supabase returned an invalid vote count.");
  }
  return value;
}

function ownerVoteError(error: { message?: string | null; details?: string | null }): boolean {
  return `${error.message ?? ""} ${error.details ?? ""}`.includes(
    "publication owners cannot vote for their own publications",
  );
}

export function createSupabaseVotingService(
  client: SupabaseClient,
  auth: AuthService,
): VotingService {
  async function requireAccount(accountId: string): Promise<void> {
    const session = await auth.requireSession();
    if (session.account.id !== accountId) {
      throw new VoteAuthenticationError(
        "The authenticated account does not match this vote request.",
      );
    }
  }

  async function getCount(publicationId: string): Promise<number> {
    const { data, error } = await client
      .from("publications")
      .select("vote_count")
      .eq("id", publicationId)
      .eq("status", "published")
      .eq("is_valid", true)
      .is("deleted_at", null)
      .not("current_release_id", "is", null)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      throw new VotePublicationNotFoundError(
        "The published Publication is unavailable for voting.",
      );
    }
    return voteCount(unwrapRow(data).vote_count);
  }

  return {
    async toggle(request) {
      await requireAccount(request.accountId);
      const { data, error } = await client.rpc("toggle_publication_vote", {
        p_publication_id: request.publicationId,
      });
      if (error) {
        if (ownerVoteError(error)) {
          throw new PublicationOwnerVoteError(
            "Creators cannot vote for their own Publications.",
          );
        }
        throw error;
      }
      const row = unwrapRow(data);
      if (typeof row.active !== "boolean") {
        throw new VoteDataError("Supabase returned an invalid vote state.");
      }
      return {
        publicationId: request.publicationId,
        active: row.active,
        count: voteCount(row.vote_count),
      } satisfies PublicationVoteState;
    },

    async getState(request) {
      await requireAccount(request.accountId);
      const [count, vote] = await Promise.all([
        getCount(request.publicationId),
        client
          .from("publication_votes")
          .select("publication_id")
          .eq("publication_id", request.publicationId)
          .eq("voter_id", request.accountId)
          .maybeSingle(),
      ]);
      if (vote.error) throw vote.error;
      return {
        publicationId: request.publicationId,
        active: vote.data !== null,
        count,
      };
    },

    async getCount(request) {
      return getCount(request.publicationId);
    },
  };
}
