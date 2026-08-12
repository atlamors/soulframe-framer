import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  parseServerEnvironment,
  type ServerEnvironment,
} from "../config/environment";

export type SupabaseServerEnvironment = ServerEnvironment;

export function getSupabaseServerEnvironment(): SupabaseServerEnvironment {
  return parseServerEnvironment(process.env);
}

/** Creates one request-scoped, cookie-backed client using no privileged key. */
export async function createServerSupabaseClient(
  environment: SupabaseServerEnvironment = getSupabaseServerEnvironment(),
) {
  const cookieStore = await cookies();

  return createServerClient(
    environment.supabase.url,
    environment.supabase.publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies. Proxy refreshes them.
          }
        },
      },
    },
  );
}
