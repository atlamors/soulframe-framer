import { describe, expect, it } from "vitest";
import {
  BACKFILL_SENTINEL,
  EnvironmentConfigurationError,
  parseServerEnvironment,
  resolveRuntimeEnvironment,
} from "./environment";

describe("resolveRuntimeEnvironment", () => {
  it("gives NODE_ENV=test precedence", () => {
    expect(
      resolveRuntimeEnvironment({
        NODE_ENV: "test",
        VERCEL_ENV: "unexpected",
      }),
    ).toBe("test");
  });

  it("gives the active Vitest marker precedence", () => {
    expect(
      resolveRuntimeEnvironment({
        NODE_ENV: "production",
        VERCEL_ENV: "unexpected",
        VITEST: "true",
      }),
    ).toBe("test");
  });

  it.each([
    ["production", "production"],
    ["preview", "staging"],
    ["development", "development"],
  ] as const)("maps VERCEL_ENV=%s to %s", (vercelEnvironment, expected) => {
    expect(
      resolveRuntimeEnvironment({
        NODE_ENV: "production",
        VERCEL_ENV: vercelEnvironment,
      }),
    ).toBe(expected);
  });

  it.each([
    ["development", "development"],
    ["production", "production"],
  ] as const)("falls back to NODE_ENV=%s", (nodeEnvironment, expected) => {
    expect(resolveRuntimeEnvironment({ NODE_ENV: nodeEnvironment })).toBe(
      expected,
    );
  });

  it("rejects an unknown nonempty VERCEL_ENV", () => {
    expect(() =>
      resolveRuntimeEnvironment({
        NODE_ENV: "production",
        VERCEL_ENV: "staging",
      }),
    ).toThrow(EnvironmentConfigurationError);
  });

  it.each([{}, { NODE_ENV: "staging" }] as const)(
    "rejects a missing or unknown fallback runtime",
    (source) => {
      expect(() => resolveRuntimeEnvironment(source)).toThrow(
        EnvironmentConfigurationError,
      );
    },
  );
});

describe("parseServerEnvironment", () => {
  const configured = {
    NODE_ENV: "development",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
  } as const;

  it("returns the derived runtime and Supabase configuration", () => {
    expect(parseServerEnvironment(configured)).toEqual({
      runtime: "development",
      supabase: {
        url: "https://example.supabase.co",
        publishableKey: "publishable-key",
      },
    });
  });

  it.each([
    ["NEXT_PUBLIC_SUPABASE_URL", undefined],
    ["NEXT_PUBLIC_SUPABASE_URL", BACKFILL_SENTINEL],
    ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", undefined],
    ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", BACKFILL_SENTINEL],
  ] as const)("rejects %s=%s", (key, value) => {
    expect(() =>
      parseServerEnvironment({ ...configured, [key]: value }),
    ).toThrow(EnvironmentConfigurationError);
  });
});
