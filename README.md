# Soulframe Framer

Soulframe Framer is a native Next.js App Router application and local-first
armor build builder for Soulframe. The first vertical slice lets a player equip
a helm, cuirass, and leggings; enter Courage, Spirit, and Grace; and immediately
see verified armor-scaling results.

The application is intentionally anonymous and client-side. It has no accounts,
database, CMS, or runtime dependency on Google Sheets.

## Current milestone

- 72 verified armor pieces from the canonical `Soulframe Armor Scaling` sheet
- Helm, cuirass, and leggings selection
- 23 Talismans with canonical modifiers and artwork
- Searchable compatible-item catalogue
- Candidate-versus-equipped comparisons
- Physical Defense, Magick Defense, and Stability Increase totals
- PR15-style Courage, Spirit, and Grace alignment control
- Source-based affinity inputs for Envoy Rank, Pact Arts, and permanent Fable
  rewards
- Per-item base and scaling breakdowns
- Verified virtue requirements with met/unmet status
- Base-only results when an armor requirement is unmet
- Complete Avakot-backed armor artwork
- Browser persistence
- Versioned, URL-encoded shareable builds
- Responsive loadout presentation
- Six source-workbook stat and virtue icons

Tempers, configurable attunements, joinery, weapons, and other gear slots are
not calculated yet.

## Requirements

- Node.js `>=22.13.0`
- npm `>=10`

## Local setup

```bash
npm install
npm run dev
```

The development server starts at `http://localhost:3000`. If that port is
already occupied, it automatically uses the next available port.

## Verification commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Architecture

```text
Canonical Google Sheet
        ↓ fresh XLSX export
scripts/import-catalogue.mjs
        ↓ validation + normalization
src/data/armor-catalogue.generated.json
        ↓
Pure domain calculations → UI → localStorage / share URL
```

- `src/domain/types.ts` defines the armor-focused domain model.
- `src/domain/calculation.ts` contains pure scaling and aggregation functions.
- `src/domain/serialization.ts` validates and versions saved/shared builds.
- `src/data/armor-catalogue.generated.json` contains normalized catalogue data.
- `src/data/talismans.generated.json` contains the Avakot-backed Talisman
  catalogue, modifiers, artwork, and provenance.
- `src/data/catalogue-provenance.json` records source identity, checksum, item
  count, icon inventory, and verified formula.
- `app/SoulframeBuilder.tsx` contains the interactive loadout experience.
- `app/globals.css` contains the visual system and responsive layouts.

## Verified calculation

For each defense on each equipped armor piece:

```text
Final defense =
  Base defense
  + INT(0.12 × (
      Courage × Courage pips
      + Spirit × Spirit pips
      + Grace × Grace pips
    ))
```

The source workbook truncates each individual defense increase before the three
defenses are totaled. Base defenses always apply; if an item's Avakot-sourced
virtue requirement is unmet, the complete scaling term is suppressed.

## Updating the catalogue

1. Export the current canonical Google Sheet as XLSX.
2. Keep the export outside the repository, or place it under `data/source/`
   (XLSX files in that directory are ignored).
3. Run:

   ```bash
   npm run import:catalogue -- /absolute/path/to/fresh-export.xlsx
   ```

4. Review the generated JSON and provenance checksum.
5. Run all verification commands.

The importer requires the exact source tabs and headers, validates every packed
defense/pip cell, rejects duplicate IDs, and extracts the six icons from their
anchored positions in the `Refs` tab. Do not hand-edit generated catalogue data;
correct the canonical sheet or the importer instead.

## Build persistence and sharing

Builds use schema version `3` and store only:

- Build name
- Allocated character Virtue values
- Envoy Rank, Pact Art ranks, and permanent Fable reward choices
- Stable armor and Talisman IDs

The active build is stored under `soulframe-framer.build.v3`; version `1` and
`2` builds are migrated automatically. For old builds, Envoy Rank is inferred
from the previous allocatable pool while preserving its allocation ratio. A
valid `build` URL parameter overrides local state and becomes the active
persisted build. Malformed data, unsupported versions, and unknown item IDs are
handled without crashing.

## Data status

Verified:

- Armor names
- Armor slots
- Base Physical, Magick, and Stability values
- Courage, Spirit, and Grace pips for each defense
- Scaling coefficient and truncation order
- Six reference icons
- Armor virtue requirements

Not yet sourced:

- Temper definitions and rolls
- Configurable attunement rules
- Joinery
- Other gear categories

The Avakot-backed artwork manifest is generated with:

```bash
npm run import:armor-images
```

The importer maps the rendered armour index to the canonical local catalogue,
requires exact coverage, resolves each original image through the MediaWiki API,
and records dimensions, MIME type, SHA-1, source page, and attribution metadata
in `src/data/armor-images.generated.json`. The generated artwork is presented
throughout the equipped slots, catalogue, and candidate comparison.

The interactive virtue control uses Avakot's transparent
[`VirtueLith.png`](https://wiki.avakot.org/File:VirtueLith.png) beneath a native
SVG lighting system, selector geometry, and accessible controls. The dynamic
red, green, and blue fields follow the current PR15 allocation UI rather than
using the unrelated inventory-style `VirtueStone` artwork.

Verified virtue requirements are imported separately from Avakot's public
`Module:Data/Armour` source:

```bash
npm run import:armor-requirements
```

The runtime catalogue merges those thresholds with the workbook-derived defense
data. Base defenses always apply; attunement scaling is included only when the
equipped build meets the item's requirement.

Talismans are imported from Avakot's `Category:Talismans` index and the same
equipment data module:

```bash
npm run import:talismans
```

Talisman virtue bonuses contribute to effective virtues before armor
requirements and scaling are evaluated. Flat defensive modifiers are added to
the corresponding build defenses. Listed Attack and Stagger modifiers are
shown without deriving unsupported damage totals.

The affinity model distinguishes between the redistributable pool and fixed
bonuses. The pool is the Envoy's 16 starting points plus one point per Envoy
Rank. Pact Art Virtue nodes contribute `+1`, `+3`, or `+6` at ranks 1–3; The
Shewolf Snared and The Waste Bear can each grant `+1` to a selected Virtue.
Those fixed bonuses and the equipped Talisman affect requirements and scaling,
but dragging the triquetra does not redistribute them.

## Recommended next milestone

Add the approved in-game loadout reference, then expand the data model only
after verified rules are available for the next equipment system.
