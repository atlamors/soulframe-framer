# Stat Sheet Parchment Exploration

Status: parked for later design work.

## Source references

- `source-parchment-bell-icon.png`
- `source-parchment-star-icon.png`

These are the original Soulframe references for the off-white parchment,
rough black ink, and restrained red folk filigree.

## Current valid direction

The scalable construction must use two independent layers:

1. One continuous parchment substrate covering the complete component.
2. A transparent nine-slice overlay containing only black and red ink.

Current large proof assets:

- `../../../../public/textures/stat-sheet-parchment-surface-draft.png`
- `../../../../public/ornaments/stat-sheet-frame-ink-nine-slice-lg-draft.png`

The proof render is currently in
`tmp/imagegen/stat-sheet-parchment-single-surface-proof.png`.

## Superseded experiments

Do not use the baked-parchment nine-slice frames or the separately
color-matched center textures. Two independent parchment images create a
visible material seam even when their average colors are similar.

The superseded files remain preserved for comparison:

- `public/ornaments/stat-sheet-parchment-nine-slice-*.png`
- `public/textures/stat-sheet-parchment-center-*.png`

## Resume point

Before integration:

1. Confirm the large single-surface proof.
2. Derive medium and small ink-only optical overlays.
3. Promote approved assets out of draft naming.
4. Apply them through Tailwind utilities and design tokens.
