import { NextResponse } from "next/server";
import { getBackendForRequest } from "../../../src/server/composition/backend";

function sanitizeLocalNextPath(value: string | null): string {
  if (!value?.startsWith("/")) return "/soulframe";
  try {
    const base = new URL("https://nightfold.invalid");
    const candidate = new URL(value, base);
    if (candidate.origin !== base.origin) return "/soulframe";
    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return "/soulframe";
  }
}

function privateRedirect(url: URL) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeLocalNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    try {
      const { auth } = await getBackendForRequest();
      await auth.exchangeOAuthCode({ code });
      return privateRedirect(new URL(next, requestUrl.origin));
    } catch {
      // The sign-in page communicates the bounded callback failure.
    }
  }

  const errorUrl = new URL("/auth/sign-in", requestUrl.origin);
  errorUrl.searchParams.set("next", next);
  errorUrl.searchParams.set("error", "oauth_callback_failed");
  return privateRedirect(errorUrl);
}
