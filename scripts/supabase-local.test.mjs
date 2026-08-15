import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createLocalDevEnvironment,
  inspectLocalStatus,
  localCommandArguments,
  parseStatusEnvironment,
  readLocalStatus,
  runLocalAction,
  runLocalDev,
} from "./supabase-local.mjs";

const localStatusOutput = [
  'API_URL="http://127.0.0.1:54321"',
  'ANON_KEY="local-anon"',
  "",
].join("\n");
const silentLogger = { error() {}, log() {} };

test("local launcher package scripts load .env.local", () => {
  const packageJson = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  const expectedScripts = {
    dev: "node --env-file-if-exists=.env.local scripts/supabase-local.mjs dev",
    "supabase:local:start":
      "node --env-file-if-exists=.env.local scripts/supabase-local.mjs start",
    "supabase:local:status":
      "node --env-file-if-exists=.env.local scripts/supabase-local.mjs status",
    "supabase:local:stop":
      "node --env-file-if-exists=.env.local scripts/supabase-local.mjs stop",
    "supabase:local:reset":
      "node --env-file-if-exists=.env.local scripts/supabase-local.mjs reset",
    "supabase:local:test":
      "node --env-file-if-exists=.env.local scripts/supabase-local.mjs test",
  };

  for (const [name, expected] of Object.entries(expectedScripts)) {
    assert.equal(packageJson.scripts[name], expected, name);
  }
});

function createChild({ automatic = true, code = 0, error, signal = null } = {}) {
  const child = new EventEmitter();
  child.killCalls = [];
  child.kill = (...arguments_) => {
    child.killCalls.push(arguments_);
    queueMicrotask(() => child.emit("exit", null, "SIGTERM"));
    return true;
  };

  if (automatic) {
    queueMicrotask(() => {
      if (error) child.emit("error", error);
      else child.emit("exit", code, signal);
    });
  }

  return child;
}

async function waitUntil(predicate) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.fail("Timed out waiting for the mocked lifecycle state.");
}

test("parses quoted and unquoted Supabase status values", () => {
  assert.deepEqual(
    parseStatusEnvironment(
      'API_URL="http://127.0.0.1:54321"\nANON_KEY=local-anon\nIGNORED LINE\n',
    ),
    {
      API_URL: "http://127.0.0.1:54321",
      ANON_KEY: "local-anon",
    },
  );
});

test("fails closed when local status fails", () => {
  assert.throws(
    () =>
      readLocalStatus({
        spawnSyncImplementation: () => ({ status: 1, stdout: "" }),
      }),
    /Local Supabase is not running/u,
  );
});

test("status inspection distinguishes absence from a CLI launch failure", () => {
  assert.deepEqual(
    inspectLocalStatus({
      spawnSyncImplementation: () => ({ status: 1, stdout: "" }),
    }),
    { running: false, exitCode: 1 },
  );
  assert.throws(
    () =>
      inspectLocalStatus({
        spawnSyncImplementation: () => ({
          error: new Error("ENOENT"),
          status: null,
        }),
      }),
    /could not be started: ENOENT/u,
  );
  assert.throws(
    () =>
      inspectLocalStatus({
        spawnSyncImplementation: () => ({ status: null }),
      }),
    /did not exit normally/u,
  );
});

test("rejects incomplete or non-local status", () => {
  assert.throws(
    () => createLocalDevEnvironment('API_URL="http://127.0.0.1:54321"'),
    /PUBLISHABLE_KEY or ANON_KEY/u,
  );
  assert.throws(
    () =>
      createLocalDevEnvironment(
        'API_URL="https://paid-project.supabase.co"\nANON_KEY="cloud-key"',
      ),
    /non-local Supabase API_URL/u,
  );
});

test("local status overrides ambient cloud values passed to Next.js", () => {
  const environment = createLocalDevEnvironment(
    [
      'API_URL="http://127.0.0.1:54321"',
      'PUBLISHABLE_KEY="local-publishable"',
      'ANON_KEY="local-anon"',
    ].join("\n"),
    {
      NEXT_PUBLIC_SUPABASE_URL: "https://paid-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "cloud-publishable",
      SUPABASE_ANON_KEY: "cloud-anon",
      SUPABASE_SECRET_KEY: "cloud-secret",
      SUPABASE_SERVICE_ROLE_KEY: "cloud-service-role",
      UNRELATED: "preserved",
    },
  );

  assert.equal(environment.NEXT_PUBLIC_SUPABASE_URL, "http://127.0.0.1:54321");
  assert.equal(
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "local-publishable",
  );
  assert.equal(environment.SUPABASE_ANON_KEY, "");
  assert.equal(environment.SUPABASE_SECRET_KEY, "");
  assert.equal(environment.SUPABASE_SERVICE_ROLE_KEY, "");
  assert.equal(environment.UNRELATED, "preserved");
});

test("Next env loading cannot restore masked cloud credentials", () => {
  const environment = createLocalDevEnvironment(
    'API_URL="http://127.0.0.1:54321"\nANON_KEY="local-anon"',
    process.env,
  );
  const syntheticEnvFile = [
    "SUPABASE_SECRET_KEY=cloud-secret",
    "SUPABASE_SERVICE_ROLE_KEY=cloud-service-role",
    "SUPABASE_PRODUCTION_DB_PASSWORD=cloud-db-password",
    "NEXT_PUBLIC_SUPABASE_URL=https://paid-project.supabase.co",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=cloud-publishable",
    "UNRELATED_FROM_ENV_FILE=loaded",
  ].join("\n");
  const script = `
    import nextEnvironment from "@next/env";
    const { processEnv } = nextEnvironment;
    processEnv(
      [{ path: ".env.local", contents: process.env.SYNTHETIC_ENV_FILE, env: {} }],
      process.cwd(),
      console,
      true,
    );
    process.stdout.write(JSON.stringify({
      secret: process.env.SUPABASE_SECRET_KEY,
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
      databasePassword: process.env.SUPABASE_PRODUCTION_DB_PASSWORD,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      unrelated: process.env.UNRELATED_FROM_ENV_FILE,
    }));
  `;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", script],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...environment, SYNTHETIC_ENV_FILE: syntheticEnvFile },
      shell: false,
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    secret: "",
    serviceRole: "",
    databasePassword: "",
    url: "http://127.0.0.1:54321",
    publishableKey: "local-anon",
    unrelated: "loaded",
  });
});

test("routes every explicit lifecycle action to the local CLI command", () => {
  assert.deepEqual(localCommandArguments("start"), ["start"]);
  assert.deepEqual(localCommandArguments("status"), ["status"]);
  assert.deepEqual(localCommandArguments("stop"), ["stop"]);
  assert.deepEqual(localCommandArguments("reset"), ["db", "reset", "--local"]);
  assert.deepEqual(localCommandArguments("test"), ["test", "db", "--local"]);
  assert.throws(() => localCommandArguments("link"), /Usage/u);
});

test("dev leaves an already-running stack untouched", async () => {
  const calls = [];

  const exitCode = await runLocalDev({
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: "https://paid-project.supabase.co",
    },
    logger: silentLogger,
    signalEmitter: new EventEmitter(),
    spawnSyncImplementation: (command, arguments_, options) => {
      calls.push({ command, arguments_, options, type: "sync" });
      return { status: 0, stdout: localStatusOutput };
    },
    spawnImplementation: (command, arguments_, options) => {
      calls.push({ command, arguments_, options, type: "async" });
      return createChild();
    },
  });

  assert.equal(exitCode, 0);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].arguments_.slice(-3), [
    "status",
    "--output",
    "env",
  ]);
  assert.match(calls[1].arguments_[0], /next-dev\.mjs$/u);
  assert.equal(
    calls[1].options.env.NEXT_PUBLIC_SUPABASE_URL,
    "http://127.0.0.1:54321",
  );
  assert.equal(calls.some((call) => call.arguments_.at(-1) === "stop"), false);
});

test("dev starts, verifies, and stops only its own stack in order", async () => {
  const calls = [];
  let statusChecks = 0;

  const exitCode = await runLocalDev({
    logger: silentLogger,
    signalEmitter: new EventEmitter(),
    spawnSyncImplementation: (_command, arguments_) => {
      calls.push(arguments_.includes("--output") ? "status" : "unknown-sync");
      statusChecks += 1;
      return statusChecks === 1
        ? { status: 1, stdout: "" }
        : { status: 0, stdout: localStatusOutput };
    },
    spawnImplementation: (_command, arguments_) => {
      const action = arguments_.at(-1);
      calls.push(action === "start" || action === "stop" ? action : "next");
      return createChild();
    },
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(calls, ["status", "start", "status", "next", "stop"]);
});

test("a failed preflight launch does not attempt to start Supabase", async () => {
  let spawnCalls = 0;

  await assert.rejects(
    runLocalDev({
      logger: silentLogger,
      signalEmitter: new EventEmitter(),
      spawnSyncImplementation: () => ({
        error: new Error("spawn blocked"),
        status: null,
      }),
      spawnImplementation: () => {
        spawnCalls += 1;
        return createChild();
      },
    }),
    /could not be started: spawn blocked/u,
  );
  assert.equal(spawnCalls, 0);
});

test("ownership begins only after a successful start", async () => {
  const actions = [];

  await assert.rejects(
    runLocalDev({
      logger: silentLogger,
      signalEmitter: new EventEmitter(),
      spawnSyncImplementation: () => ({ status: 1, stdout: "" }),
      spawnImplementation: (_command, arguments_) => {
        actions.push(arguments_.at(-1));
        return createChild({ code: 7 });
      },
    }),
    (error) => error.exitCode === 7,
  );
  assert.deepEqual(actions, ["start"]);
});

test("a signal during a failed start wins without claiming ownership", async () => {
  const actions = [];
  const signalEmitter = new EventEmitter();
  let startChild;

  const lifecycle = runLocalDev({
    logger: silentLogger,
    signalEmitter,
    spawnSyncImplementation: () => ({ status: 1, stdout: "" }),
    spawnImplementation: (_command, arguments_) => {
      const action = arguments_.at(-1);
      actions.push(action === "start" || action === "stop" ? action : "next");
      if (action === "start") {
        startChild = createChild({ automatic: false });
        return startChild;
      }
      return createChild();
    },
  });

  await waitUntil(() => startChild);
  signalEmitter.emit("SIGINT");
  startChild.emit("exit", null, "SIGINT");

  assert.equal(await lifecycle, 130);
  assert.deepEqual(actions, ["start"]);
  assert.equal(signalEmitter.listenerCount("SIGINT"), 0);
  assert.equal(signalEmitter.listenerCount("SIGTERM"), 0);
});

test("post-start status and environment failures clean up the owned stack", async () => {
  const actions = [];
  let statusChecks = 0;

  await assert.rejects(
    runLocalDev({
      logger: silentLogger,
      signalEmitter: new EventEmitter(),
      spawnSyncImplementation: () => {
        statusChecks += 1;
        return statusChecks === 1
          ? { status: 1, stdout: "" }
          : {
              status: 0,
              stdout: 'API_URL="http://127.0.0.1:54321"\n',
            };
      },
      spawnImplementation: (_command, arguments_) => {
        actions.push(arguments_.at(-1));
        return createChild();
      },
    }),
    /PUBLISHABLE_KEY or ANON_KEY/u,
  );
  assert.deepEqual(actions, ["start", "stop"]);
});

test("a synchronous Next spawn failure cleans up the owned stack", async () => {
  const actions = [];
  let statusChecks = 0;

  await assert.rejects(
    runLocalDev({
      logger: silentLogger,
      signalEmitter: new EventEmitter(),
      spawnSyncImplementation: () => {
        statusChecks += 1;
        return statusChecks === 1
          ? { status: 1, stdout: "" }
          : { status: 0, stdout: localStatusOutput };
      },
      spawnImplementation: (_command, arguments_) => {
        const action = arguments_.at(-1);
        actions.push(action === "start" || action === "stop" ? action : "next");
        if (action !== "start" && action !== "stop") {
          throw new Error("next spawn threw");
        }
        return createChild();
      },
    }),
    /Next\.js development launcher could not be started: next spawn threw/u,
  );
  assert.deepEqual(actions, ["start", "next", "stop"]);
});

test("an asynchronous Next spawn error cleans up exactly once", async () => {
  const actions = [];
  let statusChecks = 0;

  await assert.rejects(
    runLocalDev({
      logger: silentLogger,
      signalEmitter: new EventEmitter(),
      spawnSyncImplementation: () => {
        statusChecks += 1;
        return statusChecks === 1
          ? { status: 1, stdout: "" }
          : { status: 0, stdout: localStatusOutput };
      },
      spawnImplementation: (_command, arguments_) => {
        const action = arguments_.at(-1);
        actions.push(action === "start" || action === "stop" ? action : "next");
        return action === "start" || action === "stop"
          ? createChild()
          : createChild({ error: new Error("next spawn error") });
      },
    }),
    /Next\.js development launcher could not be started: next spawn error/u,
  );
  assert.deepEqual(actions, ["start", "next", "stop"]);
});

test("Ctrl+C on Windows terminates Next without POSIX signal forwarding", async () => {
  const actions = [];
  const signalEmitter = new EventEmitter();
  let nextChild;
  let statusChecks = 0;

  const lifecycle = runLocalDev({
    logger: silentLogger,
    platform: "win32",
    signalEmitter,
    spawnSyncImplementation: () => {
      statusChecks += 1;
      return statusChecks === 1
        ? { status: 1, stdout: "" }
        : { status: 0, stdout: localStatusOutput };
    },
    spawnImplementation: (_command, arguments_) => {
      const action = arguments_.at(-1);
      actions.push(action === "start" || action === "stop" ? action : "next");
      if (action === "start" || action === "stop") return createChild();
      nextChild = createChild({ automatic: false });
      return nextChild;
    },
  });

  await waitUntil(() => nextChild);
  signalEmitter.emit("SIGINT");
  signalEmitter.emit("SIGINT");

  assert.equal(await lifecycle, 130);
  assert.deepEqual(nextChild.killCalls, [[]]);
  assert.equal(actions.filter((action) => action === "stop").length, 1);
  assert.equal(signalEmitter.listenerCount("SIGINT"), 0);
  assert.equal(signalEmitter.listenerCount("SIGTERM"), 0);
});

test("a post-start signal skips Next and awaits exactly one cleanup", async () => {
  const actions = [];
  const signalEmitter = new EventEmitter();
  let statusChecks = 0;
  let stopChild;
  let settled = false;

  const lifecycle = runLocalDev({
    logger: silentLogger,
    signalEmitter,
    spawnSyncImplementation: () => {
      statusChecks += 1;
      actions.push("status");
      if (statusChecks === 1) return { status: 1, stdout: "" };

      signalEmitter.emit("SIGTERM");
      signalEmitter.emit("SIGTERM");
      return { status: 0, stdout: localStatusOutput };
    },
    spawnImplementation: (_command, arguments_) => {
      const action = arguments_.at(-1);
      if (action === "start") {
        actions.push("start");
        return createChild();
      }
      if (action === "stop") {
        actions.push("stop");
        stopChild = createChild({ automatic: false });
        return stopChild;
      }

      actions.push("next");
      return createChild();
    },
  });
  lifecycle.finally(() => {
    settled = true;
  });

  await waitUntil(() => stopChild);
  assert.equal(settled, false);
  assert.deepEqual(actions, ["status", "start", "status", "stop"]);
  stopChild.emit("exit", 0, null);

  assert.equal(await lifecycle, 143);
  assert.equal(actions.filter((action) => action === "stop").length, 1);
  assert.equal(actions.includes("next"), false);
  assert.equal(signalEmitter.listenerCount("SIGINT"), 0);
  assert.equal(signalEmitter.listenerCount("SIGTERM"), 0);
});

test("SIGTERM is forwarded on POSIX and returns the conventional exit code", async () => {
  const signalEmitter = new EventEmitter();
  let nextChild;

  const lifecycle = runLocalDev({
    logger: silentLogger,
    platform: "linux",
    signalEmitter,
    spawnSyncImplementation: () => ({
      status: 0,
      stdout: localStatusOutput,
    }),
    spawnImplementation: () => {
      nextChild = createChild({ automatic: false });
      return nextChild;
    },
  });

  await waitUntil(() => nextChild);
  signalEmitter.emit("SIGTERM");

  assert.equal(await lifecycle, 143);
  assert.deepEqual(nextChild.killCalls, [["SIGTERM"]]);
});

test("dev preserves a Next exit code and awaits owned-stack cleanup", async () => {
  let statusChecks = 0;
  let stopChild;
  let settled = false;

  const lifecycle = runLocalDev({
    logger: silentLogger,
    signalEmitter: new EventEmitter(),
    spawnSyncImplementation: () => {
      statusChecks += 1;
      return statusChecks === 1
        ? { status: 1, stdout: "" }
        : { status: 0, stdout: localStatusOutput };
    },
    spawnImplementation: (_command, arguments_) => {
      const action = arguments_.at(-1);
      if (action === "stop") {
        stopChild = createChild({ automatic: false });
        return stopChild;
      }
      return createChild({ code: action === "start" ? 0 : 23 });
    },
  });
  lifecycle.finally(() => {
    settled = true;
  });

  await waitUntil(() => stopChild);
  assert.equal(settled, false);
  stopChild.emit("exit", 0, null);

  assert.equal(await lifecycle, 23);
  assert.equal(settled, true);
});

test("runLocalAction delegates dev to the asynchronous lifecycle", async () => {
  const result = await runLocalAction("dev", {
    spawnSyncImplementation: () => ({
      status: 0,
      stdout: localStatusOutput,
    }),
    spawnImplementation: () => createChild(),
  });

  assert.equal(result, 0);
});
