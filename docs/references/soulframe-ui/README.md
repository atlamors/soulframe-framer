# Soulframe UI references

User-provided in-game screenshots retained as visual references for
`soulframe-framer`. These files belong in project documentation rather than
`public/`: they guide typography, borders, ornament, spacing, color, and
interaction design, but must not be loaded by the production application.

## Inventory

| File | Native size | Useful reference details |
| --- | ---: | --- |
| `loadout-selector.png` | 503 × 81 | Selected field, dropdown affordance, feather action, stitched borders |
| `feather-slot.png` | 135 × 125 | Compact square slot, active gold state, hanging corner flourish |
| `rename-loadout-dialog.png` | 772 × 370 | Modal hierarchy, title plaque, input field, button treatment |
| `rope-nine-slice-dialog.png` | 772 × 370 | Thin braided outer frame, rounded rope elbows, native gold cadence |
| `item-tooltip-panel.png` | 1062 × 468 | Leaf corner ornament, heading placement, dense descriptive typography |
| `player-hud-bar.png` | 790 × 157 | Rank medallion, player-name hierarchy, resource alignment, end flourish |
| `item-details-panel.png` | 635 × 833 | Equipment-stat hierarchy, icons, section spacing, temper slots |

## Usage

- Treat these as source references, not ready-to-ship assets.
- Preserve the original files without cropping, recoloring, or recompression.
- Derive new vectors and UI components in application-owned source files.
- When implementing a referenced detail, record the relevant screenshot in the
  component or pull-request notes so future revisions can be compared against
  the same source.

Captured from user-provided clipboard images on 2026-07-26.
