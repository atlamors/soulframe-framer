import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import net from "node:net";

const DEFAULT_PORT = 3000;
const MAX_PORT = 65_535;

function parsePreferredPort(value) {
  const port = Number.parseInt(value ?? String(DEFAULT_PORT), 10);

  if (!Number.isInteger(port) || port < 1 || port > MAX_PORT) {
    throw new Error(`PORT must be an integer between 1 and ${MAX_PORT}.`);
  }

  return port;
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.unref();
    server.once("error", () => resolve(false));
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort(preferredPort) {
  for (let port = preferredPort; port <= MAX_PORT; port += 1) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`No available port found at or above ${preferredPort}.`);
}

const preferredPort = parsePreferredPort(process.env.PORT);
const port = await findAvailablePort(preferredPort);

if (port !== preferredPort) {
  console.log(`Port ${preferredPort} is busy; starting Next.js on port ${port}.`);
}

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const next = spawn(process.execPath, [nextBin, "dev", "--port", String(port)], {
  env: process.env,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => next.kill(signal));
}

next.once("error", (error) => {
  console.error(error);
  process.exit(1);
});

next.once("exit", (code) => {
  process.exit(code ?? 1);
});
