import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AccountIdentity,
  ActivateCreatorProfileRequest,
  AuthService,
  AuthSession,
  BeginOAuthRequest,
  CreatorProfile,
  ExchangeOAuthCodeRequest,
  UpdateCreatorProfileRequest,
} from "../contracts/auth";

type UnknownRow = Record<string, unknown>;

export class AuthenticationRequiredError extends Error {
  readonly name = "AuthenticationRequiredError";
}

export class AuthDataError extends Error {
  readonly name = "AuthDataError";
}

export class CreatorHandleUnavailableError extends Error {
  readonly name = "CreatorHandleUnavailableError";
}

export class CreatorProfileValidationError extends Error {
  readonly name = "CreatorProfileValidationError";
}

function isRow(value: unknown): value is UnknownRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(row: UnknownRow, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new AuthDataError(`Auth data is missing ${key}.`);
  }
  return value;
}

function optionalString(row: UnknownRow, key: string): string | null {
  const value = row[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new AuthDataError(`Auth data has an invalid ${key}.`);
  }
  return value;
}

function unwrapRow(value: unknown): UnknownRow {
  if (isRow(value)) return value;
  if (Array.isArray(value) && value.length === 1 && isRow(value[0])) {
    return value[0];
  }
  throw new AuthDataError("Supabase returned an invalid auth row.");
}

function mapAccount(rowValue: unknown): AccountIdentity {
  const row = unwrapRow(rowValue);
  return {
    id: requiredString(row, "id"),
    email: optionalString(row, "email"),
    displayName: optionalString(row, "display_name"),
    createdAt: requiredString(row, "created_at"),
  };
}

function mapCreatorProfile(rowValue: unknown): CreatorProfile {
  const row = unwrapRow(rowValue);
  const publisherEligible = row.publisher_eligible;
  if (typeof publisherEligible !== "boolean") {
    throw new AuthDataError(
      "Creator Profile data has invalid publisher eligibility.",
    );
  }

  return {
    accountId: requiredString(row, "account_id"),
    handle: requiredString(row, "handle"),
    displayName: requiredString(row, "display_name"),
    bio: optionalString(row, "bio"),
    activatedAt: requiredString(row, "activated_at"),
    publisherEligibility: publisherEligible
      ? { eligible: true }
      : { eligible: false, reason: "publisher-disabled" },
  };
}

function validateHandle(handle: string): string {
  const normalized = handle.trim().toLowerCase();
  if (
    normalized.length < 3 ||
    normalized.length > 30 ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(normalized)
  ) {
    throw new CreatorProfileValidationError(
      "Use 3–30 lowercase letters, numbers, or hyphens without a leading or trailing hyphen.",
    );
  }
  return normalized;
}

function validateDisplayName(displayName: string): string {
  const normalized = displayName.trim();
  if (normalized.length < 1 || normalized.length > 120) {
    throw new CreatorProfileValidationError(
      "Display name must be between 1 and 120 characters.",
    );
  }
  return normalized;
}

function validateBio(bio: string | null): string | null {
  if (bio === null) return null;
  const normalized = bio.trim();
  if (normalized.length > 1000) {
    throw new CreatorProfileValidationError(
      "Bio must be 1,000 characters or fewer.",
    );
  }
  return normalized.length === 0 ? null : normalized;
}

function isHandleUniqueViolation(error: {
  code?: string | null;
  message?: string;
  details?: string;
}): boolean {
  if (error.code !== "23505") return false;
  const description = `${error.message ?? ""} ${error.details ?? ""}`;
  return (
    description.includes("creator_profiles_handle_unique_idx") ||
    description.includes("lower(handle)")
  );
}

export function createSupabaseAuthService(client: SupabaseClient): AuthService {
  async function getSession(): Promise<AuthSession | null> {
    const { data: claimsData, error: claimsError } =
      await client.auth.getClaims();
    if (claimsError || !claimsData?.claims) return null;

    const claims = claimsData.claims as Record<string, unknown>;
    const accountId = claims.sub;
    const expiresAtSeconds = claims.exp;
    if (
      typeof accountId !== "string" ||
      typeof expiresAtSeconds !== "number" ||
      !Number.isFinite(expiresAtSeconds)
    ) {
      return null;
    }

    const { data, error } = await client
      .from("accounts")
      .select("id,email,display_name,created_at")
      .eq("id", accountId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      throw new AuthDataError(
        "The authenticated account projection is unavailable.",
      );
    }

    return {
      account: mapAccount(data),
      expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
    };
  }

  async function requireSession(): Promise<AuthSession> {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationRequiredError("Sign in is required.");
    }
    return session;
  }

  async function requireMatchingAccount(accountId: string) {
    const session = await requireSession();
    if (session.account.id !== accountId) {
      throw new AuthenticationRequiredError(
        "The authenticated account does not match this request.",
      );
    }
    return session;
  }

  return {
    getSession,
    requireSession,

    async beginOAuth(request: BeginOAuthRequest) {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: request.provider,
        options: { redirectTo: request.redirectTo },
      });
      if (error) throw error;
      if (!data.url) {
        throw new AuthDataError("Supabase did not return an OAuth redirect.");
      }
      return { redirectUrl: data.url };
    },

    async exchangeOAuthCode(request: ExchangeOAuthCodeRequest) {
      if (!request.code) {
        throw new AuthDataError("OAuth authorization code is required.");
      }

      const { error } = await client.auth.exchangeCodeForSession(request.code);
      if (error) throw error;
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },

    async getCreatorProfile(accountId: string) {
      await requireMatchingAccount(accountId);
      const { data, error } = await client.rpc(
        "get_current_creator_profile",
      );
      if (error) throw error;
      if (data === null) return null;
      const row = unwrapRow(data);
      return row.account_id === null ? null : mapCreatorProfile(row);
    },

    async activateCreatorProfile(request: ActivateCreatorProfileRequest) {
      await requireMatchingAccount(request.accountId);
      const { data, error } = await client.rpc("activate_creator_profile", {
        p_handle: validateHandle(request.handle),
        p_display_name: validateDisplayName(request.displayName),
      });
      if (error) {
        if (isHandleUniqueViolation(error)) {
          throw new CreatorHandleUnavailableError(
            "That creator handle is already in use.",
          );
        }
        throw error;
      }
      return mapCreatorProfile(data);
    },

    async updateCreatorProfile(request: UpdateCreatorProfileRequest) {
      await requireMatchingAccount(request.accountId);
      const displayName =
        request.displayName === undefined
          ? null
          : validateDisplayName(request.displayName);
      const setBio = request.bio !== undefined;
      const bio = setBio ? validateBio(request.bio ?? null) : null;
      const { data, error } = await client.rpc("update_creator_profile", {
        p_display_name: displayName,
        p_bio: bio,
        p_set_bio: setBio,
      });
      if (error) throw error;
      return mapCreatorProfile(data);
    },
  };
}
