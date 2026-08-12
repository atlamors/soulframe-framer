"use client";

import { createBrowserClient } from "@supabase/ssr";
import { BACKFILL_SENTINEL } from "../config/environment";

export class BrowserSupabaseConfigurationError extends Error {
  readonly name = "BrowserSupabaseConfigurationError";
}

function requirePublicEnvironmentValue(
  value: string | undefined,
  name: string,
): string {
  const configured = value?.trim();
  if (!configured || configured === BACKFILL_SENTINEL) {
    throw new BrowserSupabaseConfigurationError(
      `${name} is required and must not use the backfill sentinel.`,
    );
  }
  return configured;
}

/** Browser client boundary. Only explicitly public values can enter the bundle. */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    requirePublicEnvironmentValue(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    ),
    requirePublicEnvironmentValue(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
  );
}
