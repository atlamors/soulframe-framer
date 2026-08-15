
# Soulframe Framer

## Local development

The default development path uses the repository-pinned Supabase CLI and a
local Supabase stack. Docker must already be running; the npm scripts do not
manage Docker itself.

```powershell
npm install
npm run dev
```

`npm run dev` owns the normal local lifecycle: it checks the stack, starts it
when absent, verifies its local API URL and publishable/anon key, and then
launches Next.js. When Next.js exits normally or the wrapper handles Ctrl+C or a
supported termination signal, it stops only the stack that command started.
Normal `supabase stop` preserves local data. If the stack was already running,
the wrapper leaves it untouched when Next.js exits.

Supabase values in `.env.local` are never used as a fallback for this flow, and
ambient Supabase credentials are masked before the Next.js child starts so
Next.js cannot reload cloud-only values from its env files. An uncatchable
`SIGKILL`, process crash, or machine failure cannot guarantee automatic cleanup;
use `npm run supabase:local:stop` if a wrapper-owned stack remains afterward.

Local stack commands:

```powershell
npm run supabase:local:start   # Start the local stack
npm run supabase:local:status  # Show local service status
npm run supabase:local:stop    # Stop the local stack
npm run supabase:local:reset   # Recreate the local database and apply seed data
npm run supabase:local:test    # Run local database tests
```

Discord OAuth is enabled for local development. Add
`SUPABASE_AUTH_DISCORD_CLIENT_ID` and `SUPABASE_AUTH_DISCORD_SECRET` to
`.env.local`, and register
`http://127.0.0.1:54321/auth/v1/callback` as an allowed redirect in the Discord
application. Twitch remains disabled in the local config.

## Remote staging and production

Remote staging and production are separate, explicit workflows. Configure
their target-specific variables from `.env.example` only when using the remote
database dry-run or emergency-push scripts. The local lifecycle and default
development commands do not link to or fall back to either remote project.

Never reuse one project reference for staging and production. Remote pushes
require the exact target confirmation accepted by `scripts/supabase-db.mjs`.
