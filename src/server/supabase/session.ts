import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { parseServerEnvironment } from "../config/environment";

/**
 * Refreshes an existing cookie session without making authentication a
 * prerequisite. Authorization remains at server/RLS boundaries.
 */
export async function refreshSupabaseSession(request: NextRequest) {
  const environment = parseServerEnvironment(process.env);
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    environment.supabase.url,
    environment.supabase.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, responseHeaders = {}) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(responseHeaders).forEach(([name, value]) => {
            response.headers.set(name, value);
          });
        },
      },
    },
  );

  // Supabase requires this immediately after client creation in Proxy.
  await supabase.auth.getClaims();
  // Also cover @supabase/ssr releases predating setAll response headers.
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Expires", "0");
  response.headers.set("Pragma", "no-cache");
  return response;
}
