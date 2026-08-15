import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const supabasePackageRoot = dirname(require.resolve("supabase/package.json"));
const supabaseCliEntry = join(supabasePackageRoot, "dist", "supabase.js");
const nextDevEntry = fileURLToPath(new URL("./next-dev.mjs", import.meta.url));
const CLI_EXIT_FAILURE = Symbol("local CLI exit failure");

const LOCAL_COMMANDS = new Map([
  ["start", ["start"]],
  ["status", ["status"]],
  ["stop", ["stop"]],
  ["reset", ["db", "reset", "--local"]],
  ["test", ["test", "db", "--local"]],
]);
const REMOTE_ENVIRONMENT_NAMES = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_PROJECT_ID",
  "SUPABASE_DB_PASSWORD",
  "SUPABASE_STAGING_PROJECT_ID",
  "SUPABASE_STAGING_DB_PASSWORD",
  "SUPABASE_PRODUCTION_PROJECT_ID",
  "SUPABASE_PRODUCTION_DB_PASSWORD",
  "SUPABASE_AUTH_DISCORD_CLIENT_ID",
  "SUPABASE_AUTH_DISCORD_SECRET",
  "SUPABASE_AUTH_TWITCH_CLIENT_ID",
  "SUPABASE_AUTH_TWITCH_SECRET",
  "POSTGRES_DATABASE",
  "POSTGRES_HOST",
  "POSTGRES_PASSWORD",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_USER",
];

function fail(message, exitCode = 1) {
  const error = new Error(message);
  error.exitCode = exitCode;
  throw error;
}

export function localCommandArguments(action) {
  const arguments_ = LOCAL_COMMANDS.get(action);
  if (!arguments_) {
    fail("Usage: supabase-local.mjs <dev|start|status|stop|reset|test>.");
  }
  return [...arguments_];
}

function decodeStatusValue(value) {
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      fail("Supabase status returned an invalid quoted value.");
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  return value;
}

export function parseStatusEnvironment(output) {
  const values = {};

  for (const rawLine of output.split(/\r?\n/u)) {
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/u.exec(rawLine.trim());
    if (!match) continue;
    values[match[1]] = decodeStatusValue(match[2].trim());
  }

  return values;
}

function requireLocalApiUrl(value) {
  if (!value) fail("The local Supabase status did not report API_URL.");

  let url;
  try {
    url = new URL(value);
  } catch {
    fail("The local Supabase status reported an invalid API_URL.");
  }

  const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);
  if (!localHosts.has(url.hostname)) {
    fail("Refusing to start development with a non-local Supabase API_URL.");
  }

  return value;
}

export function createLocalDevEnvironment(statusOutput, environment = {}) {
  const status = parseStatusEnvironment(statusOutput);
  const apiUrl = requireLocalApiUrl(status.API_URL);
  const publishableKey = status.PUBLISHABLE_KEY || status.ANON_KEY;

  if (!publishableKey) {
    fail(
      "The local Supabase status did not report PUBLISHABLE_KEY or ANON_KEY.",
    );
  }

  const localEnvironment = { ...environment };
  for (const name of Object.keys(localEnvironment)) {
    if (name.startsWith("SUPABASE_") || name.startsWith("NEXT_PUBLIC_SUPABASE_")) {
      localEnvironment[name] = "";
    }
  }
  for (const name of REMOTE_ENVIRONMENT_NAMES) localEnvironment[name] = "";

  return {
    ...localEnvironment,
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  };
}

function runCli(arguments_, options, spawnSyncImplementation) {
  return spawnSyncImplementation(
    process.execPath,
    [supabaseCliEntry, ...arguments_],
    {
      cwd: repositoryRoot,
      shell: false,
      ...options,
    },
  );
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function failCliExit(message, exitCode) {
  const error = new Error(message);
  error.exitCode = exitCode;
  error[CLI_EXIT_FAILURE] = true;
  throw error;
}

export function inspectLocalStatus({
  environment = process.env,
  spawnSyncImplementation = spawnSync,
} = {}) {
  const result = runCli(
    ["status", "--output", "env"],
    {
      encoding: "utf8",
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
    },
    spawnSyncImplementation,
  );

  if (result.error) {
    fail(
      `The repository-pinned Supabase CLI could not be started: ${errorMessage(result.error)}`,
    );
  }
  if (typeof result.status !== "number") {
    fail("The repository-pinned Supabase status check did not exit normally.");
  }

  return result.status === 0
    ? { running: true, output: result.stdout }
    : { running: false, exitCode: result.status };
}

export function readLocalStatus({
  environment = process.env,
  spawnSyncImplementation = spawnSync,
} = {}) {
  const status = inspectLocalStatus({ environment, spawnSyncImplementation });
  if (!status.running) {
    fail(
      "Local Supabase is not running. Start it with `npm run supabase:local:start`.",
      status.exitCode,
    );
  }

  return status.output;
}

function waitForChild(child) {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (result) => {
      if (settled) return;
      settled = true;
      child.off("error", onError);
      child.off("exit", onExit);
      resolve(result);
    };
    const onError = (error) => settle({ type: "error", error });
    const onExit = (code, signal) =>
      settle({ type: "exit", code, signal });

    child.once("error", onError);
    child.once("exit", onExit);
  });
}

async function runCliAsync(
  arguments_,
  { environment, spawnImplementation },
) {
  let child;
  try {
    child = spawnImplementation(
      process.execPath,
      [supabaseCliEntry, ...arguments_],
      {
        cwd: repositoryRoot,
        env: environment,
        shell: false,
        stdio: "inherit",
      },
    );
  } catch (error) {
    fail(
      `The repository-pinned Supabase CLI could not be started: ${errorMessage(error)}`,
    );
  }

  const result = await waitForChild(child);
  if (result.type === "error") {
    fail(
      `The repository-pinned Supabase CLI could not be started: ${errorMessage(result.error)}`,
    );
  }
  if (result.code !== 0) {
    failCliExit("The local Supabase command failed.", result.code ?? 1);
  }
}

function signalExitCode(signal) {
  return { SIGHUP: 129, SIGINT: 130, SIGTERM: 143 }[signal] ?? 1;
}

function installTerminationHandlers({
  logger,
  platform,
  signalEmitter,
}) {
  let child;
  let childTerminationRequested = false;
  let receivedSignal;
  const handlers = new Map();

  const requestChildTermination = () => {
    if (!child || !receivedSignal || childTerminationRequested) return;
    childTerminationRequested = true;

    try {
      // Windows does not implement POSIX signal forwarding. child.kill()
      // requests process termination there without claiming to relay SIGINT
      // or SIGTERM; POSIX platforms receive the original signal.
      const requested =
        platform === "win32" ? child.kill() : child.kill(receivedSignal);
      if (!requested) {
        logger.error(
          `Could not request Next.js termination after ${receivedSignal}.`,
        );
      }
    } catch (error) {
      logger.error(
        `Could not request Next.js termination after ${receivedSignal}: ${errorMessage(error)}`,
      );
    }
  };

  for (const signal of ["SIGINT", "SIGTERM"]) {
    const handler = () => {
      if (receivedSignal) return;
      receivedSignal = signal;
      requestChildTermination();
    };
    handlers.set(signal, handler);
    signalEmitter.on(signal, handler);
  }

  return {
    attach(childToTerminate) {
      child = childToTerminate;
      requestChildTermination();
    },
    get receivedSignal() {
      return receivedSignal;
    },
    remove() {
      for (const [signal, handler] of handlers) {
        signalEmitter.off(signal, handler);
      }
    },
  };
}

export async function runLocalDev({
  environment = process.env,
  logger = console,
  platform = process.platform,
  signalEmitter = process,
  spawnImplementation = spawn,
  spawnSyncImplementation = spawnSync,
} = {}) {
  let ownsStack = false;
  let cleanupPromise;
  let terminationHandlers;
  let primaryError;
  let cleanupError;
  let nextExitCode = 1;

  const cleanupOwnedStack = () => {
    if (!ownsStack) return Promise.resolve();
    cleanupPromise ??= (async () => {
      logger.log("Stopping the local Supabase stack started by npm run dev...");
      await runCliAsync(["stop"], { environment, spawnImplementation });
      ownsStack = false;
    })();
    return cleanupPromise;
  };

  try {
    const preflight = inspectLocalStatus({
      environment,
      spawnSyncImplementation,
    });
    terminationHandlers = installTerminationHandlers({
      logger,
      platform,
      signalEmitter,
    });
    let statusOutput;

    if (preflight.running) {
      logger.log(
        "Local Supabase is already running; npm run dev will leave it running.",
      );
      statusOutput = preflight.output;
    } else {
      logger.log("Starting the local Supabase stack for npm run dev...");
      let startSucceeded = false;
      try {
        await runCliAsync(["start"], { environment, spawnImplementation });
        startSucceeded = true;
      } catch (error) {
        if (
          !terminationHandlers.receivedSignal ||
          !error?.[CLI_EXIT_FAILURE]
        ) {
          throw error;
        }
      }
      ownsStack = startSucceeded;

      if (startSucceeded && !terminationHandlers.receivedSignal) {
        const startedStatus = inspectLocalStatus({
          environment,
          spawnSyncImplementation,
        });
        if (!terminationHandlers.receivedSignal && !startedStatus.running) {
          fail(
            "The local Supabase stack started but did not become healthy.",
            startedStatus.exitCode,
          );
        }
        statusOutput = startedStatus.running ? startedStatus.output : undefined;
      }
    }

    if (!terminationHandlers.receivedSignal) {
      const nextEnvironment = createLocalDevEnvironment(
        statusOutput,
        environment,
      );

      if (!terminationHandlers.receivedSignal) {
        let child;
        try {
          child = spawnImplementation(process.execPath, [nextDevEntry], {
            cwd: repositoryRoot,
            env: nextEnvironment,
            shell: false,
            stdio: "inherit",
          });
        } catch (error) {
          fail(
            `The Next.js development launcher could not be started: ${errorMessage(error)}`,
          );
        }

        terminationHandlers.attach(child);
        const childResult = await waitForChild(child);
        if (childResult.type === "error") {
          fail(
            `The Next.js development launcher could not be started: ${errorMessage(childResult.error)}`,
          );
        }

        nextExitCode = terminationHandlers.receivedSignal
          ? signalExitCode(terminationHandlers.receivedSignal)
          : childResult.code ?? signalExitCode(childResult.signal);
      }
    }
  } catch (error) {
    primaryError = error;
  }

  try {
    await cleanupOwnedStack();
  } catch (error) {
    cleanupError = error;
  } finally {
    terminationHandlers?.remove();
  }

  if (terminationHandlers?.receivedSignal && !primaryError) {
    nextExitCode = signalExitCode(terminationHandlers.receivedSignal);
  }

  if (primaryError) {
    if (cleanupError) {
      logger.error(`Local Supabase cleanup also failed: ${errorMessage(cleanupError)}`);
    }
    throw primaryError;
  }
  if (cleanupError) throw cleanupError;

  return nextExitCode;
}

export function runLocalAction(
  action,
  {
    environment = process.env,
    spawnImplementation = spawn,
    spawnSyncImplementation = spawnSync,
  } = {},
) {
  if (action === "dev") {
    return runLocalDev({
      environment,
      spawnImplementation,
      spawnSyncImplementation,
    });
  }

  const result = runCli(
    localCommandArguments(action),
    { env: environment, stdio: "inherit" },
    spawnSyncImplementation,
  );
  if (result.error) {
    fail(
      `The repository-pinned Supabase CLI could not be started: ${errorMessage(result.error)}`,
    );
  }
  if (result.status !== 0) {
    fail("The local Supabase command failed.", result.status ?? 1);
  }
  return result;
}

function isMainModule() {
  return process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
}

if (isMainModule()) {
  try {
    const [action, ...extraArguments] = process.argv.slice(2);
    if (!action || extraArguments.length !== 0) {
      fail("Usage: supabase-local.mjs <dev|start|status|stop|reset|test>.");
    }
    const exitCode = await runLocalAction(action);
    if (typeof exitCode === "number") process.exitCode = exitCode;
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Local Supabase command failed.");
    process.exitCode =
      error && typeof error === "object" && "exitCode" in error
        ? error.exitCode
        : 1;
  }
}
