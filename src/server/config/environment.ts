export const BACKFILL_SENTINEL = "__BACKFILL__";

export type RuntimeEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production";

export interface ServerEnvironment {
  runtime: RuntimeEnvironment;
  supabase: {
    url: string;
    publishableKey: string;
  };
}

export class EnvironmentConfigurationError extends Error {
  readonly name = "EnvironmentConfigurationError";
}

function requireConfiguredValue(
  source: Readonly<Record<string, string | undefined>>,
  key: string,
): string {
  const value = source[key]?.trim();
  if (!value || value === BACKFILL_SENTINEL) {
    throw new EnvironmentConfigurationError(
      `${key} is required and must not use the backfill sentinel.`,
    );
  }
  return value;
}

export function resolveRuntimeEnvironment(
  source: Readonly<Record<string, string | undefined>>,
): RuntimeEnvironment {
  if (source.NODE_ENV?.trim() === "test" || source.VITEST?.trim() === "true") {
    return "test";
  }

  const vercelEnvironment = source.VERCEL_ENV?.trim();
  if (vercelEnvironment) {
    if (vercelEnvironment === "production") return "production";
    if (vercelEnvironment === "preview") return "staging";
    if (vercelEnvironment === "development") return "development";
    throw new EnvironmentConfigurationError(
      "VERCEL_ENV must be production, preview, or development when set.",
    );
  }

  const nodeEnvironment = source.NODE_ENV?.trim();
  if (nodeEnvironment === "development") return "development";
  if (nodeEnvironment === "production") return "production";
  throw new EnvironmentConfigurationError(
    "Runtime cannot be derived from NODE_ENV or VERCEL_ENV.",
  );
}

/** Runtime is derived; the product request backend is always Supabase. */
export function parseServerEnvironment(
  source: Readonly<Record<string, string | undefined>>,
): ServerEnvironment {
  return {
    runtime: resolveRuntimeEnvironment(source),
    supabase: {
      url: requireConfiguredValue(source, "NEXT_PUBLIC_SUPABASE_URL"),
      publishableKey: requireConfiguredValue(
        source,
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      ),
    },
  };
}
