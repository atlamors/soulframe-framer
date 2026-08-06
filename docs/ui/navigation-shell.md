# Nightfold navigation shell

**Status:** Approved product and UI direction  
**Recorded:** 2026-08-05  
**Scope:** Navigation content, chrome structure, and responsive invariants; not
an implementation specification

## Decision

Nightfold will begin with a Mobalytics-style shell adapted for a single-game
product:

- one persistent desktop header;
- one persistent game-specific desktop navigation rail;
- no game picker while Soulframe is the only supported game; and
- a compact mobile header whose menu exposes the same navigation hierarchy in
  a labeled drawer.

Nightfold must not render an empty game-switching row or a second desktop
header in anticipation of future games. When another game is added, a game
picker can be introduced into the existing header. Changing the active game
will change the navigation rail, terminology, contextual tools, and immersive
visual treatment without redefining the global shell.

All product surfaces use a game-first route namespace:

```text
/{game}/{page}
```

The initial Framer route is therefore `/soulframe/framer`, not `/framer`.
While Soulframe is the only supported game, `/` may redirect to `/soulframe`.

## Navigation content

The Soulframe navigation is grouped by intent. These groups organize the
information architecture; they do not require nested menus or reduced
visibility.

### Explore

- Tier List
- Starter Builds
- Builds
- Guides
- Creators

### Create

- Framer
- Frame Publisher

### Manage

- My Frames
- My Builds
- My Guides
- Profile

All approved destinations remain directly accessible. Navigation is not the
complete sitemap, but high-value destinations should not be hidden merely to
make the chrome appear simpler.

## Global utilities

### AI\* contextual tool

AI\* is Nightfold's persistent star-icon entry point for context-specific
tools.

- Its placement and icon remain consistent.
- Its underlying tool changes according to the active game and product
  surface.
- Inside the Framer, AI\* provides build optimization.
- It must not behave like one generic chatbot applied indiscriminately to every
  surface.
- Tools that have not been implemented may use disabled, coming-soon treatment.

The exact AI\* tool assigned to each surface should be designed with that
surface rather than decided globally.

### Alerts

Alerts remain accessible through the top chrome. They may eventually include
build updates, creator activity, publication status, account activity, and
community notifications. Unimplemented categories may use appropriate
coming-soon treatment.

### Account

The account control provides sign-in when anonymous and account identity,
settings, and sign-out when authenticated.

The account control does not replace the Manage destinations. My Frames, My
Builds, My Guides, and Profile remain directly available through the primary
navigation.

## Desktop shell

The initial desktop shell contains one header above the page canvas and a
game-specific navigation rail beside it:

```text
┌──────────────────── Single header ───────────────────────────┐
│ Logo or context                         AI*  Alerts  Account │
├──────────────┬───────────────────────────────────────────────┤
│ Soulframe    │                                               │
│ navigation   │                Page content                   │
│ rail         │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

The desktop rail starts icon-only. Every destination must retain an accessible
name and a discoverable visible label, such as a tooltip. Whether the rail can
also expand is a later interaction decision; the default presentation is not.

The rail remains in the same location and preserves the same hierarchy across
game sections, while its destinations are defined by the active game. The
Framer may reduce the visual weight of the rail and header, but it must retain
orientation and the same underlying navigation logic.

Global search is not currently required. Search should remain contextual
within content-heavy surfaces such as Builds, Guides, and Creators until a
genuine global search need exists.

## Mobile shell

Mobile changes the presentation, not the content or hierarchy:

```text
[Menu]                 [Logo]                 [AI*] [Alerts] [Account]
```

The desktop rail becomes a labeled navigation drawer containing the same
Explore, Create, and Manage destinations. Mobile controls may become more
compact, but AI\*, Alerts, and Account must remain accessible from the top
chrome.

## Chrome principles

- The logo is a reliable escape hatch; its exact destination remains open.
- Account access and global utilities stay in consistent positions.
- The active game and current section remain apparent.
- Important destinations are not hidden through unnecessary nesting.
- Immersive tools may reduce chrome without introducing different navigation
  logic.
- The shell does not expose a game switcher before another game exists.
- The interface does not reserve visible empty space for hypothetical future
  controls.
- Users should not need to understand Nightfold's platform architecture to
  navigate it.

## Visual references

The current reference direction is:

- Mobalytics for navigation structure and responsive transformation;
- Miruro for compact chrome, HUD controls, and metadata-chip grammar;
- Maxroll for tonal restraint and editorial content composition; and
- Soulframe for the game section's immersive artwork, motifs, and identity.

These are reference patterns rather than templates. Nightfold should develop a
coherent visual system rather than visibly assembling parts of other products.

## Open decisions

- exact desktop logo placement and escape destination;
- whether the icon-only desktop rail can expand to show persistent labels;
- whether Explore, Create, and Manage appear as visible labels;
- final public label for Frame Publisher;
- precise mobile utility sizing and spacing;
- AI\* tool mapping for each game and product surface; and
- detailed alert contents and interaction behavior.
