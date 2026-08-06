# Nightfold product platform

**Status:** Product direction  
**Recorded:** 2026-08-05  
**Scope:** Information architecture and product model, not an implementation
specification

## Decision

Nightfold will initially serve two connected use cases through Soulframe:

1. A private, personal planner for players configuring and optimizing their own
   Soulframe loadouts.
2. A publishing platform for Soulframe creators explaining, distributing, and
   maintaining builds for their audiences.

The existing Framer remains an immersive planning workspace. Creator
publishing, public build consumption, discovery, and editorial content will be
separate product surfaces built around it rather than inserted into the Framer
workspace.

## Why this direction

The current Framer is effective at answering:

> What happens if I change this part of my build?

It provides direct configuration, calculations, requirement feedback,
optimization, warnings, item comparisons, and acquisition context. These are
the correct capabilities for a player working on a personal build and remain a
core product advantage.

A publishing product must also answer:

> What should I build, why does it work, who is it for, and why should I trust
> the author?

A creator does not publish only a configuration. They publish an argument that
a collection of choices forms a coherent build, together with guidance for
understanding, acquiring, playing, and adapting it. Nightfold should combine
that creator judgment with structured mechanical evidence from the Framer.

This changes the product boundary, not the validity of the existing Framer.
The Framer becomes Nightfold's planning engine and principal differentiator;
it is no longer expected to be the entire website.

## Product language

The approved user-facing terminology is:

- **Frame:** A personal or creator-owned Soulframe loadout that remains mutable.
- **Build:** A published Frame presented for other players to understand and
  use.
- **Guide:** Authored educational content about Soulframe that is not required
  to originate from a Frame.
- **Framer:** The workspace used to configure, calculate, compare, and optimize
  a Frame.
- **Frame Publisher:** The creator workspace used to explain, preview, version,
  and publish a Frame as a Build.
- **Personal fork:** A player-owned Frame derived from a published Build.
- **Canonical build:** The creator-controlled published Build from which player
  forks originate.

**Publication** remains an internal system term rather than a navigation label.
Detailed domain and database names remain provisional until their schemas are
designed.

## Product surfaces

### Framer

The existing Framer remains a dedicated, immersive workspace for:

- configuring virtues, equipment, weapons, Pacts, Arts, Runes, and Totems;
- understanding live calculations and requirement failures;
- comparing candidates with equipped choices;
- optimizing a personal configuration;
- saving and sharing Frames;
- creating variants or progression snapshots; and
- opening an existing Frame in the Publisher.

The Framer should not become a long-form content-management page. Publishing
actions inside it should remain contextual, such as annotating a choice,
capturing a variant, or selecting **Publish Frame**.

### Frame Publisher

The Frame Publisher begins with an existing Frame. It adds the editorial and
release information needed to teach the build:

- title and concise build thesis;
- intended audience, difficulty, goals, and tags;
- game patch and Nightfold data version;
- strengths and tradeoffs;
- how the build plays and how it works;
- essential, recommended, budget, and aspirational choices;
- annotations attached to relevant equipment or decisions;
- progression milestones and build variants;
- video and external resources;
- changelog and release notes; and
- draft, preview, publish, update, and unpublish controls.

Mechanical content must be generated from Framer data. Creators should not
manually re-enter equipment, statistics, requirements, or acquisition data in
the Publisher.

### Published build page

A published Build is a reader-first page rather than an editable planner. It
should present:

- title, author, version, freshness, and classification;
- a concise explanation of the build;
- key statistics, requirements, and known warnings;
- equipment, Arts, enhancements, and variants;
- creator annotations attached to the choices they explain;
- progression and acquisition guidance;
- strengths, tradeoffs, playstyle, and mechanics;
- video and external resources;
- changelog and release history; and
- attribution and links to the creator's channels.

The principal conversion action is **Open in Framer**. This creates a personal
fork without modifying the creator's canonical Build.

Secondary actions may include following updates, comparing the Build with a
personal Frame, saving it for later, sharing it, and visiting the creator.

### Builds

The Builds surface is the public discovery library. It will eventually support
search, filters, classifications, freshness, creator attribution, and curated
collections. It is the index for published Build pages, not a second publishing
system.

### Starter Builds

Starter Builds reuse the same Build model and publishing pipeline. They are a
curated view of Builds classified as beginner-accessible, affordable, or
appropriate for early progression. They are not a separate content type.

A starter Build may contain early, intermediate, and endgame variants while
remaining one canonical publication.

### Tier List

Tier Lists are editorial rankings with explicit criteria and reasoning. Entries
should connect to relevant Builds, Guides, and creator explanations rather than
exist as isolated scores.

### Guides

Guides are Nightfold's second primary public content type alongside Builds.
They contain educational material about mechanics, progression, acquisition,
systems, or general strategy and can link into the Framer and relevant
published Builds where appropriate.

### Creators

Creator pages establish authorship, trust, attribution, external channels, and
a durable collection of a creator's Builds and Guides. Creator discovery is a
core part of the publishing model, not merely account administration.

### Account

The approved primary account destinations are:

- **My Frames:** The account owner's mutable Soulframe loadouts.
- **My Builds:** Builds published or being prepared by the account owner.
- **My Guides:** Guides authored or being prepared by the account owner.
- **Profile:** The account owner's public identity and profile management.

Secondary account utilities such as saved content, following, notifications,
and settings remain possible but are not part of this terminology decision.

## Information architecture

The approved Soulframe-first surface structure is:

```text
/
└── /soulframe
    ├── /soulframe/framer
    ├── /soulframe/publisher
    ├── /soulframe/tier-list
    ├── /soulframe/starter-builds
    ├── /soulframe/builds
    │   └── /soulframe/builds/[slug]
    ├── /soulframe/guides
    │   └── /soulframe/guides/[slug]
    └── /soulframe/creators
        └── /soulframe/creators/[handle]
```

Game product routes always follow `/{game}/{page}`. Account identity is global,
but game-facing account destinations remain inside the active game's namespace.

The Account area includes the approved destinations below. Their exact URLs are
not yet decided:

```text
Account
├── My Frames
├── My Builds
├── My Guides
└── Profile
```

While Soulframe is Nightfold's only game, `/` may redirect to `/soulframe`. If
Nightfold later supports multiple games, `/` can become a global platform home
or game selector without redefining the Soulframe section.

The public content model has two primary types: Builds and Guides. The approved
navigation hierarchy and shell are recorded in
[Nightfold navigation shell](ui/navigation-shell.md). The final public label
for the publishing tool remains open.

## Creator-to-player loop

The intended product loop is:

1. A creator develops and validates a Frame in the Framer.
2. The creator opens that Frame in the Publisher.
3. The creator adds explanation, annotations, variants, progression, and
   release metadata.
4. The creator previews and publishes a canonical Build.
5. A player discovers and reads the Build.
6. The player opens the Build in the Framer, creating a personal fork.
7. Nightfold explains how the player's version differs from the canonical
   Build.
8. The creator publishes later releases, and followers can understand or adopt
   those updates without losing their personal changes.

The connection between a canonical Build and personal forks is a primary
product opportunity. It enables difference tracking, safe substitutions,
requirement feedback, update awareness, and guided migration between releases.

## Product and business thesis

A standalone personal calculator tends to produce episodic use. Publishing
adds recurring supply, discovery, and return behavior:

- creators return to update and maintain Builds;
- creator distribution brings new players to canonical Build pages;
- public Builds and Guides create durable, indexable entry points;
- players fork published Builds into personal Frames;
- personal investment and creator updates encourage return visits; and
- creator profiles accumulate trust and an ongoing audience.

The creator is an acquisition channel, the published Build is a discovery and
education surface, and the Framer is the conversion and retention mechanism.

Nightfold must give creators more than hosting. Its value should come from
reducing publishing and maintenance work while strengthening attribution and
credibility. Candidate creator benefits include:

- automatically generated mechanical sections;
- validation against current game data;
- visible freshness and compatibility signals;
- one canonical link with version history;
- reusable variants and progression stages;
- generated acquisition guidance;
- embeds and share cards;
- creator attribution and outbound channel links; and
- analytics for views, forks, follows, and common player substitutions.

Published content should remain freely readable during early growth. Potential
paid creator capabilities such as advanced analytics, private drafts, branded
profiles, collaboration, scheduled releases, and custom embeds should be
evaluated only after the core creator-player loop is proven.

## Platform scope and expansion strategy

Nightfold should first become the strongest possible product for the Soulframe
community. Depth comes before breadth: adding games cannot compensate for
failing to serve the initial community exceptionally well.

Nightfold is multi-game in its platform architecture but Soulframe-specific in
its current product experience. Accounts, creator identity, publishing, CMS,
discovery, community systems, and other global interfaces should remain
game-agnostic. Each game section should define its own immersive visual shell,
terminology, navigation options, planners, content presentation, and mechanical
data model.

The platform should preserve inexpensive expansion boundaries such as a game
identifier on game-owned records and versioned game-specific data. It should
not weaken the current Soulframe experience with premature game selectors or a
generic universal planner.

Nightfold should avoid data and platform debt while consciously accepting that
adding another game would require changes to site structure and design. Those
changes are bounded expansion costs, alongside the unavoidable work of
understanding and implementing the new game's mechanics.

## Product principles

### Consistent frame, game-specific contents

The global frame stays consistent while the active game determines what
appears inside it.

Do:

- use the logo as a reliable escape hatch, with its exact destination still to
  be decided;
- keep the menu in the same place and preserve the same hierarchy across game
  sections;
- make menu options specific to the active game;
- keep account access and global utilities consistent;
- make the active game and current section apparent; and
- allow immersive tools to reduce chrome without removing orientation.

Do not:

- force every game into identical navigation options;
- move fundamental controls between game sections;
- duplicate global and game navigation;
- introduce a game switcher before another game exists;
- let site chrome compete with immersive workspaces; or
- require users to understand the platform architecture to navigate it.

### Navigation expresses priority

Navigation is not the sitemap. Primary navigation should contain only frequent,
important destinations and should distinguish exploring content, creating
content, and managing an account.

The active location must remain clear. Immersive modes may reduce the chrome,
but they should not introduce different navigation logic. Mobile navigation
may change presentation while preserving the same hierarchy. Features that do
not yet provide real utility should appear contextually rather than as
premature placeholders in primary navigation.

### Preserve the Framer's identity

Do not flatten the Framer into a generic dashboard or force the full website
navigation into its working canvas. The surrounding website can use
conventional navigation and content patterns while the Framer remains an
immersive studio with a lightweight exit, save state, build identity, and
publishing action.

### One source of mechanical truth

Planner calculations and structured build data should drive published
mechanical sections. The Publisher must not create a parallel manually entered
representation that can drift from the Frame.

### Reader and editor are different modes

Shared content should open in a reader-oriented Build page. Editing requires an
explicit owner action or a personal fork. A public URL should not silently place
every visitor into an editable workspace.

### Canonical releases are stable

A creator's unpublished edits must not silently change an already published
Build. Publishing creates a stable release with a date, version, and changelog.
Personal forks retain their own state when later releases appear.

### Structured guidance before an unrestricted CMS

Begin with a small number of purposeful fields and contextual annotations.
Avoid copying a large generic rich-text publishing form before creator needs and
content supply justify it.

### Creator ownership and attribution

Creator identity, authorship, external links, and canonical ownership should be
prominent. Nightfold should amplify creator distribution rather than obscure or
extract it.

### Shared content types, curated views

Starter Builds and other collections should be classifications of published
Builds wherever possible. Avoid separate data models and publishing workflows
for content that differs only by audience or curation.

## Suggested delivery sequence

This sequence records product dependencies, not committed milestones.

### Foundation

- Establish the Soulframe section at a stable route with shared public site
  navigation; `/` may redirect there while Soulframe is the only game.
- Move the existing tool to the dedicated `/soulframe/framer` route.
- Introduce a local multi-Frame library with create, rename, duplicate, delete,
  import, and export actions.
- Separate read and edit modes.
- Add minimal publication metadata and a public Build-page prototype.
- Support **Open in Framer** as an explicit personal fork.

These capabilities can be validated locally before accounts, public persistence,
or community systems are introduced.

### Creator publishing

- Add creator identity and ownership.
- Add Publisher drafts, previews, structured guide fields, contextual
  annotations, variants, and progression.
- Add stable published releases and changelogs.
- Add the Builds library and creator profiles.
- Seed the library with a small set of high-quality creator publications.

### Player continuity

- Track canonical Build ancestry on personal forks.
- Compare a personal Frame with its source Build.
- Surface creator updates and release differences.
- Support following, saving, and safe migration between releases.
- Add explainable recommendations and acquisition checklists.

### Ecosystem expansion

- Add Starter Builds as a curated Build view.
- Add Guides and Tier Lists with links into Builds and the Framer.
- Evaluate creator analytics, embeds, collaboration, and paid creator tooling.
- Add broader community features only after sufficient creator supply exists.

## Explicit non-decisions

This document does not yet decide:

- detailed account, content, release, asset, and Row Level Security schemas;
- search, analytics, or production hosting architecture;
- moderation and creator-verification policy;
- whether publishing is open to everyone or initially invitation-based;
- the final public name of Frame Publisher or Creator Studio;
- detailed Build, publication, release, variant, and fork schemas;
- monetization tiers or pricing;
- ranking methodology for Tier Lists; or
- the exact visual system used by public content pages.

Those decisions should follow focused product and technical specifications. In
particular, authentication, persistence, permissions, moderation, and public
publishing introduce materially higher implementation risk than the current
local-first Framer and must be planned accordingly.

The approved P0 account, persistence, and asset-storage direction is recorded
in [Account, storage, and P0 backend foundation](architecture/account-storage-p0.md).

## Success criteria for the direction

The direction is working when:

- a player can still use the Framer without participating in publishing;
- a creator can turn a validated Frame into a useful publication without
  duplicating mechanical data;
- a reader can understand a Build without entering an editor;
- a reader can deliberately fork a Build into a private Frame;
- creator attribution and release freshness are unambiguous;
- personal changes remain intact when a creator updates the canonical Build;
  and
- Builds, Starter Builds, Tier Lists, Guides, and Creators reinforce one shared
  ecosystem rather than becoming disconnected products.
