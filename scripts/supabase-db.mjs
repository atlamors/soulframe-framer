import { existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const CLI_VERSION = "2.112.0";
const BACKFILL_SENTINEL = "__BACKFILL__";
const TARGETS = new Set(["staging", "production"]);
const ACTIONS = new Set(["dry-run", "push"]);
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

function fail(message) {
  throw new Error(message);
}

function configuredValue(name) {
  const value = process.env[name];
  const normalized = value?.trim();
  if (!normalized || normalized === BACKFILL_SENTINEL) {
    fail(`${name} is required and must not use the backfill sentinel.`);
  }
  return value;
}

function optionalProjectRef(name) {
  const normalized = process.env[name]?.trim();
  if (!normalized || normalized === BACKFILL_SENTINEL) return null;
  return normalized;
}

function rejectGenericTargetCredentials() {
  for (const name of ["SUPABASE_PROJECT_ID", "SUPABASE_DB_PASSWORD"]) {
    const value = process.env[name]?.trim();
    if (value && value !== BACKFILL_SENTINEL) {
      fail(
        `${name} is ambiguous locally; use only target-specific deployment variables.`,
      );
    }
  }
}

function requireSupabaseLayout() {
  const configPath = fileURLToPath(
    new URL("../supabase/config.toml", import.meta.url),
  );
  const migrationsPath = fileURLToPath(
    new URL("../supabase/migrations/", import.meta.url),
  );
  if (!existsSync(configPath) || !existsSync(migrationsPath)) {
    fail("The Supabase config and migrations layout is required.");
  }
  if (!statSync(migrationsPath).isDirectory()) {
    fail("The Supabase migrations path must be a directory.");
  }
}

function runSupabase(arguments_, childEnvironment) {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(
    executable,
    ["--yes", `supabase@${CLI_VERSION}`, ...arguments_],
    {
      cwd: repositoryRoot,
      env: childEnvironment,
      shell: false,
      stdio: "inherit",
    },
  );
  if (result.error) fail("The Supabase CLI process could not be started.");
  if (result.status !== 0) {
    const error = new Error("The Supabase CLI command failed.");
    error.exitCode = result.status ?? 1;
    throw error;
  }
}

function main() {
  const [target, action, ...extraArguments] = process.argv.slice(2);
  if (!TARGETS.has(target) || !ACTIONS.has(action)) {
    fail("Usage: supabase-db.mjs <staging|production> <dry-run|push>.");
  }
  if (action === "dry-run" && extraArguments.length !== 0) {
    fail("Dry-run accepts no additional arguments.");
  }
  if (
    action === "push" &&
    (extraArguments.length !== 1 ||
      extraArguments[0] !== `--confirm=${target}`)
  ) {
    fail(`Push requires the exact confirmation --confirm=${target}.`);
  }

  requireSupabaseLayout();
  rejectGenericTargetCredentials();

  const prefix = `SUPABASE_${target.toUpperCase()}`;
  const projectRef = configuredValue(`${prefix}_PROJECT_ID`).trim();
  const databasePassword = configuredValue(`${prefix}_DB_PASSWORD`);
  const accessToken = configuredValue("SUPABASE_ACCESS_TOKEN");
  const otherTarget = target === "staging" ? "PRODUCTION" : "STAGING";
  const otherProjectRef = optionalProjectRef(
    `SUPABASE_${otherTarget}_PROJECT_ID`,
  );
  if (otherProjectRef === projectRef) {
    fail("Staging and production project references must be distinct.");
  }

  const childEnvironment = {
    ...process.env,
    SUPABASE_ACCESS_TOKEN: accessToken,
    SUPABASE_DB_PASSWORD: databasePassword,
  };
  for (const name of [
    "SUPABASE_STAGING_PROJECT_ID",
    "SUPABASE_STAGING_DB_PASSWORD",
    "SUPABASE_PRODUCTION_PROJECT_ID",
    "SUPABASE_PRODUCTION_DB_PASSWORD",
  ]) {
    delete childEnvironment[name];
  }

  runSupabase(["link", "--project-ref", projectRef], childEnvironment);
  runSupabase(["migration", "list", "--linked"], childEnvironment);
  runSupabase(["db", "push", "--linked", "--dry-run"], childEnvironment);
  if (action === "push") {
    runSupabase(["db", "push", "--linked"], childEnvironment);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Deployment failed.");
  process.exitCode =
    error && typeof error === "object" && "exitCode" in error
      ? error.exitCode
      : 1;
}
