# Account, storage, and P0 backend foundation

**Status:** Approved product and architecture direction  
**Recorded:** 2026-08-05  
**Scope:** P0 account, persistence, authorization, and asset-storage boundaries;
not a final database schema or implementation specification

## Decision

Nightfold will use Supabase for the P0 backend:

- Postgres for structured application data;
- Supabase Auth for account identity and sessions;
- Postgres Row Level Security for ownership and publication access; and
- Supabase Storage for initial object storage when uploaded media becomes
  necessary.

This keeps identity, relational data, authorization, and early asset storage in
one operational system. It is the smallest coherent backend for a solo-operated
product. The architecture should preserve normal Postgres and object-storage
boundaries so individual services can be replaced later without redefining the
domain model.

Supabase's current Free plan is sufficient for development and initial
validation, but Nightfold must not depend on remaining perpetually inside a
free tier. Free-plan limits and pricing are operational facts rather than
product invariants and must be verified on the
[official pricing page](https://supabase.com/pricing) before provisioning or
launch. A paid production baseline should be included in launch economics.

## First principles

- The Framer remains useful without an account.
- Accounts provide continuity, ownership, and publishing identity; they are not
  permission to use the planner.
- Publishing requires durable identity. Planning does not.
- Structured content belongs in Postgres, not object storage.
- Uploaded media belongs in object storage, not database rows.
- P0 contains only the capabilities required to complete the core loop:
  **Frame -> Publish -> Read -> Fork**.
- All game-domain records are bucketed by `game_id`, even while Soulframe is the
  only supported game.

## Authentication

P0 authentication uses social OAuth through:

- Discord as the primary Soulframe-community identity; and
- Google as a broadly available fallback.

Supabase documents both among its supported
[social login providers](https://supabase.com/docs/guides/auth/social-login).
Nightfold will not implement passwords or enterprise SAML/OIDC SSO in P0.
Social OAuth is sufficient for the current consumer product; enterprise SSO
solves a different organizational use case.

An account has a global identity. Its creator profile supplies a unique handle,
display name, provider avatar, and the minimum public attribution needed for a
published Build. Game-owned content remains game-scoped.

## Persistence boundary

The existing anonymous Framer remains local-first. Its browser-saved Frame is
an anonymous working copy, not a temporary account record.

After sign-in, Nightfold offers to import the current local Frame into **My
Frames**. Import must be explicit and must not silently overwrite either the
local Frame or an existing cloud Frame.

```text
Global identity
|-- Account
|-- Auth identities
`-- Creator profile

Game-scoped content
|-- Frame: mutable and usually private
|-- Build draft: authored presentation of a Frame
|-- Build release: durable published snapshot
|-- Fork relationship and source attribution
`-- Asset metadata and object key
```

A separate general-purpose CMS is not required for P0. Build publishing is a
structured product workflow backed by the same database. Guide authoring can
extend that model after its content requirements are understood.

## P0 functions

### Anonymous planning

- Continue browser-local Framer persistence without sign-in.
- Preserve sharing, importing, and explicit forking behavior.

### Accounts and identity

- Sign in with Discord or Google.
- Complete the OAuth callback and maintain a secure session.
- Sign out.
- Create and edit the minimum creator profile.
- Guarantee unique creator handles.
- Delete or anonymize an account according to the final published-content
  retention policy.

### My Frames

- Create, read, update, rename, duplicate, and delete owned Frames.
- Import the current anonymous Frame after sign-in.
- Enforce ownership in the database rather than only in application code.

### Creator publishing

- Represent creator/publisher eligibility, even if access is initially broad.
- Create a Build draft from an owned Frame.
- Preview the reader-facing Build.
- Publish, update, and unpublish through a stable public identity and URL.
- Publish releases as snapshots so later Frame edits do not silently alter the
  public Build.
- Allow anonymous readers to view a published Build.
- Support **Open in Framer** as a personal fork with source attribution.

### Authorization and integrity

- Apply Row Level Security to private, owned, draft, and public records.
- Validate all writes at the server/database boundary.
- Store `game_id`, owner, publication state, and timestamps on applicable
  records.
- Define safe account-deletion behavior before public publishing is enabled.

## Asset storage

P0 should not introduce arbitrary user uploads merely because object storage is
available. Initial publications can use curated game artwork and OAuth-provided
avatars. This avoids prematurely taking on image moderation, file validation,
transformation, quotas, copyright review, and media-library UX.

When uploads become necessary, store the object in Supabase Storage and store
only its metadata, owner, game scope, and object key in Postgres. Bucket access
must use the same ownership rules as the related content. Supabase Storage
supports Postgres-backed
[access policies](https://supabase.com/docs/guides/storage/security/access-control).

Cloudflare R2 remains a credible later destination for high-volume public media,
but introducing it during P0 would add a second permission and operations model
before media volume justifies the separation.

## Designed and stubbed, but not P0

The interface may show disabled **Coming soon** affordances for these approved
future possibilities, but their backend behavior is deferred:

- following creators;
- saving Builds and Guides;
- comments, reactions, and other community participation;
- creator and publication notifications beyond essential system feedback;
- co-authors and collaboration;
- creator analytics;
- arbitrary image uploads and a reusable media library;
- unrestricted rich-text Guide authoring;
- Tier List administration;
- dedicated search infrastructure;
- paid accounts and Patreon linking; and
- enterprise SSO.

## Alternatives considered

Neon Postgres and Auth combined with Cloudflare R2 offers attractive free
allowances and remains a credible modular alternative. Clerk or a self-hosted
auth library could also be paired with a separate database. These approaches
were not selected for P0 because they introduce more provider boundaries,
permission plumbing, or security maintenance without improving the initial core
loop.

The decision favors total operational simplicity over maximizing each isolated
free allowance.

## Next required decision

Before defining tables or implementation APIs, specify the lifecycle and
ownership relationship between:

- a mutable Frame;
- a Build draft;
- a published Build release; and
- a personal fork.

That domain model determines the schema, permissions, autosave behavior,
publisher workflow, release history, attribution, and changelog semantics.
