import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DiscoveryOrder,
  DiscoveryPublication,
  DiscoveryRequest,
  DiscoveryService,
} from "../contracts/discovery";
import type { PublicationProfileId } from "../../domain/publications/types";
import {
  isPublicationProfileId,
  resolvePublicationProfile,
} from "../../domain/publications/profiles";

type UnknownRow = Record<string, unknown>;

type DiscoveryCursor = {
  version: 1;
  offset: number;
  order: DiscoveryOrder;
  gameId: string;
  profileId: PublicationProfileId;
};

export class DiscoveryInputError extends Error {
  readonly name = "DiscoveryInputError";
}

export class DiscoveryDataError extends Error {
  readonly name = "DiscoveryDataError";
}

function isRow(value: unknown): value is UnknownRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(row: UnknownRow, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new DiscoveryDataError(`Discovery data is missing ${key}.`);
  }
  return value;
}

function nullableString(row: UnknownRow, key: string): string | null {
  const value = row[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new DiscoveryDataError(`Discovery data has an invalid ${key}.`);
  }
  return value;
}

function requiredNumber(row: UnknownRow, key: string): number {
  const value = row[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new DiscoveryDataError(`Discovery data has an invalid ${key}.`);
  }
  return value;
}

function profileId(value: unknown): PublicationProfileId {
  if (isPublicationProfileId(value)) return value;
  throw new DiscoveryDataError("Discovery returned an unknown profile.");
}

function classifications(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new DiscoveryDataError("Discovery returned invalid classifications.");
  }
  return value;
}

function encodeCursor(cursor: DiscoveryCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeCursor(
  value: string | undefined,
  request: Omit<DiscoveryCursor, "version" | "offset">,
): number {
  if (value === undefined) return 0;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as unknown;
    if (
      !isRow(parsed) ||
      parsed.version !== 1 ||
      typeof parsed.offset !== "number" ||
      !Number.isSafeInteger(parsed.offset) ||
      parsed.offset < 0 ||
      parsed.order !== request.order ||
      parsed.gameId !== request.gameId ||
      parsed.profileId !== request.profileId
    ) {
      throw new Error("cursor mismatch");
    }
    return parsed.offset;
  } catch {
    throw new DiscoveryInputError("The discovery cursor is invalid or stale.");
  }
}

function mapPublication(value: unknown): DiscoveryPublication {
  if (!isRow(value)) {
    throw new DiscoveryDataError("Supabase returned an invalid discovery row.");
  }
  return {
    publicationId: requiredString(value, "publication_id"),
    profileId: profileId(value.profile_id),
    gameId: requiredString(value, "game_id"),
    slug: requiredString(value, "slug"),
    creatorHandle: requiredString(value, "creator_handle"),
    title: requiredString(value, "title"),
    summary: nullableString(value, "summary"),
    coverAssetId: nullableString(value, "cover_asset_id"),
    classifications: classifications(value.classifications),
    firstPublishedAt: requiredString(value, "first_published_at"),
    latestPublishedAt: requiredString(value, "latest_published_at"),
    voteCount: requiredNumber(value, "vote_count"),
  };
}

export function createSupabaseDiscoveryService(
  client: SupabaseClient,
): DiscoveryService {
  return {
    async list(request) {
      if (!Number.isInteger(request.limit) || request.limit < 1 || request.limit > 100) {
        throw new DiscoveryInputError("Discovery limit must be between 1 and 100.");
      }
      if (
        request.order !== "trending" &&
        request.order !== "top" &&
        request.order !== "new"
      ) {
        throw new DiscoveryInputError("Choose Trending, Top, or New.");
      }
      const profile = resolvePublicationProfile(request.profileId);
      if (profile.gameId !== request.gameId) {
        throw new DiscoveryInputError(
          "The discovery game does not match its Publication Profile.",
        );
      }
      const cursorContext = {
        order: request.order,
        gameId: request.gameId,
        profileId: request.profileId,
      } as const;
      const offset = decodeCursor(request.cursor, cursorContext);
      const { data, error } = await client.rpc("discover_publications", {
        p_game_id: request.gameId,
        p_profile_id: request.profileId,
        p_order: request.order,
        p_limit: request.limit,
        p_offset: offset,
      });
      if (error) throw error;
      if (!Array.isArray(data)) {
        throw new DiscoveryDataError("Supabase returned an invalid discovery page.");
      }
      const items = data.map(mapPublication);
      if (
        items.some(
          (item) =>
            item.gameId !== request.gameId ||
            item.profileId !== request.profileId ||
            resolvePublicationProfile(item.profileId).gameId !== item.gameId,
        )
      ) {
        throw new DiscoveryDataError(
          "Discovery returned Publication data outside the requested game/profile.",
        );
      }
      return {
        items,
        nextCursor:
          items.length === request.limit
            ? encodeCursor({
                version: 1,
                offset: offset + request.limit,
                ...cursorContext,
              })
            : null,
      };
    },
  };
}
