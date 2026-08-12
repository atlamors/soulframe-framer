"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthProvider, AuthService } from "../../server/contracts/auth";
import { getBackendForRequest } from "../../server/composition/backend";
import {
  AuthenticationRequiredError,
  CreatorHandleUnavailableError,
  CreatorProfileValidationError,
} from "../../server/supabase/auth-service";

export type CreatorProfileActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function sanitizeLocalNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/soulframe";
  }
  try {
    const base = new URL("https://nightfold.invalid");
    const candidate = new URL(value, base);
    if (candidate.origin !== base.origin) return "/soulframe";
    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return "/soulframe";
  }
}

function sanitizeOptionalPublisherNextPath(
  value: FormDataEntryValue | null,
): string | null {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  try {
    const base = new URL("https://nightfold.invalid");
    const candidate = new URL(value, base);
    if (candidate.origin !== base.origin || candidate.hash) return null;
    if (candidate.pathname === "/soulframe/publisher") {
      return `${candidate.pathname}${candidate.search}`;
    }
    if (candidate.pathname === "/soulframe/publisher/new") {
      return `${candidate.pathname}${candidate.search}`;
    }
    if (/^\/soulframe\/publisher\/(builds|guides)(?:\/[^/]+)?$/.test(candidate.pathname)) {
      return `${candidate.pathname}${candidate.search}`;
    }
    if (
      /^\/soulframe\/publisher\/[^/]+$/.test(candidate.pathname) &&
      !candidate.search
    ) {
      return candidate.pathname;
    }
  } catch {
    return null;
  }
  return null;
}

async function requireAuthService(): Promise<AuthService> {
  return (await getBackendForRequest()).auth;
}

async function requestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = (
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  )
    ?.split(",")[0]
    .trim();
  if (!host) throw new Error("The request origin is unavailable.");

  const originHeader = requestHeaders.get("origin");
  if (originHeader) {
    const origin = new URL(originHeader);
    if (
      (origin.protocol === "https:" || origin.protocol === "http:") &&
      origin.host === host
    ) {
      return origin.origin;
    }
    throw new Error("The request origin does not match its host.");
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim() ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  if (protocol !== "http" && protocol !== "https") {
    throw new Error("The request protocol is invalid.");
  }
  return new URL(`${protocol}://${host}`).origin;
}

async function beginOAuth(provider: AuthProvider, formData: FormData) {
  const next = sanitizeLocalNextPath(formData.get("next"));
  let redirectUrl: string;
  try {
    const callbackUrl = new URL("/auth/callback", await requestOrigin());
    callbackUrl.searchParams.set("next", next);
    const service = await requireAuthService();
    const result = await service.beginOAuth({
      provider,
      redirectTo: callbackUrl.toString(),
    });
    redirectUrl = result.redirectUrl;
  } catch {
    const errorUrl = new URL("/auth/sign-in", "https://nightfold.invalid");
    errorUrl.searchParams.set("next", next);
    errorUrl.searchParams.set("error", "oauth_unavailable");
    redirect(`${errorUrl.pathname}${errorUrl.search}`);
  }
  redirect(redirectUrl!);
}

export async function signInWithDiscordAction(formData: FormData) {
  return beginOAuth("discord", formData);
}

export async function signInWithTwitchAction(formData: FormData) {
  return beginOAuth("twitch", formData);
}

export async function signOutAction() {
  const service = await requireAuthService();
  await service.signOut();
  redirect("/soulframe");
}

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function profileErrorState(error: unknown): CreatorProfileActionState {
  if (error instanceof CreatorHandleUnavailableError) {
    return { status: "error", message: error.message };
  }
  if (error instanceof CreatorProfileValidationError) {
    return { status: "error", message: error.message };
  }
  if (error instanceof AuthenticationRequiredError) {
    return { status: "error", message: "Sign in to manage a Creator Profile." };
  }
  return {
    status: "error",
    message: "The Creator Profile could not be saved. Please try again.",
  };
}

export async function activateCreatorProfileAction(
  _previousState: CreatorProfileActionState,
  formData: FormData,
): Promise<CreatorProfileActionState> {
  const next = sanitizeOptionalPublisherNextPath(formData.get("next"));
  try {
    const service = await requireAuthService();
    const session = await service.requireSession();
    await service.activateCreatorProfile({
      accountId: session.account.id,
      handle: formString(formData, "handle"),
      displayName: formString(formData, "displayName"),
    });
    revalidatePath("/soulframe/profile");
  } catch (error) {
    return profileErrorState(error);
  }
  if (next) redirect(next);
  return { status: "success", message: "Creator Profile activated." };
}

export async function updateCreatorProfileAction(
  _previousState: CreatorProfileActionState,
  formData: FormData,
): Promise<CreatorProfileActionState> {
  const next = sanitizeOptionalPublisherNextPath(formData.get("next"));
  try {
    const service = await requireAuthService();
    const session = await service.requireSession();
    await service.updateCreatorProfile({
      accountId: session.account.id,
      displayName: formString(formData, "displayName"),
      bio: formString(formData, "bio"),
    });
    revalidatePath("/soulframe/profile");
  } catch (error) {
    return profileErrorState(error);
  }
  if (next) redirect(next);
  return { status: "success", message: "Creator Profile updated." };
}
