# Nightfold social card archive

This directory preserves the source material and approved renders for the
Nightfold social-card system. It is intentionally outside `public/`; nothing in
this archive is served by the site until a separate implementation copies an
approved render into a production asset location.

All hashes are SHA-256 values for the exact archived bytes. Source locations
record where each file came from on 2026-08-12 and are included for provenance;
the repo-local copies are the durable sources of record.

## Approved renders

Both approved social cards are **1200 x 630**, the standard 1.91:1 large-link
preview canvas used by Open Graph and Twitter/X summary cards.

| Archived file | Role | Approval status | Dimensions | SHA-256 | Source location at archive time |
| --- | --- | --- | --- | --- | --- |
| `approved/nightfold-generic-social-card.png` | Generic Nightfold brand card for non-game-specific routes | Approved by the user | 1200 x 630 | `E06A6233F2DE863DB8CA5325E49CB6BC6BF6C5EA705CD691F34B82E3E22ED992` | `C:/Users/andre/.codex/visualizations/2026/08/12/019ff6f4-b061-71d1-870e-5993555eb769/nightfold-brand-card-draft-v2.png` |
| `approved/nightfold-soulframe-social-card.png` | Soulframe-specific card for the Soulframe route family | Approved by the user | 1200 x 630 | `EE99A301BE44F4075953D424A303CD3EDBD7B17D3F589E1D51BD771904A3011D` | `C:/Users/andre/.codex/visualizations/2026/08/12/019ff6f4-b061-71d1-870e-5993555eb769/nightfold-soulframe-card-draft-v3.png` |

## Sources and references

These files are composition inputs or visual references. They are archived for
future revisions and are not approved final social cards by themselves.

| Archived file | Origin and role | Approval status | Dimensions | SHA-256 | Source location at archive time |
| --- | --- | --- | --- | --- | --- |
| `sources/nightfold-warm-forest-reference.png` | User-provided warm forest screenshot; early background-treatment reference | Reference only | 1782 x 948 | `82C29F1F4FAFBA9C76EAD46AC7C3E0825EDEC3AFA33EC56FEA1D15CFDA7CDE06` | `C:/Users/andre/AppData/Local/Temp/codex-clipboard-640d857d-12dc-4437-9d24-b92453917de8.png` |
| `sources/soulframe-nightfold-exterior-tent.png` | User-provided Soulframe Nightfold exterior screenshot | Source only | 1256 x 993 | `BB44DBB13F919A3CCA7102AF90CC2566EF9DCAFF53943A5A56B2260837548F87` | `C:/Users/andre/AppData/Local/Temp/codex-clipboard-c2e39cd2-5704-4b39-ad37-5b43dcc6835c.png` |
| `sources/soulframe-nightfold-doorway-envoy.png` | User-provided doorway/Envoy screenshot; primary scene for the approved Soulframe card | Source only | 1616 x 793 | `02C272B87FFC82E2976DFB3DF6FBB26C3A9BE02802E3BCF68CF6E345B83B9043` | `C:/Users/andre/AppData/Local/Temp/codex-clipboard-ad541613-bab2-4218-a58b-cb04cea9cc40.png` |
| `sources/soulframe-nightfold-interior.png` | User-provided Soulframe Nightfold interior screenshot | Source only | 1594 x 1005 | `16242A9ACDAAC2DC798ABB32E107F9C794CAE1BE78E5C08776DE4B13C711500E` | `C:/Users/andre/AppData/Local/Temp/codex-clipboard-f9f4e350-bbfa-490a-8f16-2a3edd253636.png` |
| `sources/nightfold-folded-silk-background.png` | Generated folded-silk background composited into the approved generic Nightfold card | Source used by approved render | 1731 x 909 | `87E91095554F0633FDE29133817EADF8F2E951A1DED06D967C24158748B4AC5F` | `C:/Users/andre/.codex/generated_images/019ff6f4-b061-71d1-870e-5993555eb769/exec-274af0ab-b0a8-4ff3-81c2-f41720c8aea0.png` |
| `sources/nightfold-celestial-water-background-reference.png` | Earlier generated celestial-water concept explored before the approved generic card; not used in the approved render | Reference only | 1731 x 908 | `5A20B2DBE18B0A6D0E8DB9A2DA8F4FCFE1BCEC1AC68C38695BCB2CD28C09BC89` | `C:/Users/andre/.codex/generated_images/019ff6f4-b061-71d1-870e-5993555eb769/exec-0053b6a5-2441-43d0-a709-899b3015a039.png` |
| `sources/nightfold-wordmark.png` | Exact Nightfold wordmark used in the card compositions | Brand source; not a standalone card | 2035 x 773 | `A08F3A54998E8418976082CA1B12DA47E1A11626761C57000AE9A3CBEC9CF117` | `S:/Localhost/Soulframe/framer/public/brand/nightfold-wordmark.png` |

## Generated-source prompts

Both generated backgrounds were created with the built-in image-generation
workflow. Text and the exact Nightfold wordmark were composited separately; the
model-generated files are backgrounds only.

### Folded-silk background used by the approved generic card

```text
Use case: logo-brand
Asset type: premium 1200x630 generic social-card background for Nightfold
Primary request: Create a distinctive, authored brand backdrop built around the idea of night folding open. A monumental sweep of near-black silk or shadow curves diagonally from the upper-left toward the lower-right, revealing a narrow atmospheric seam of antique gold and deep mineral teal. Below it, black glass water carries restrained gold and cyan reflections. Fine blue-white luminous filaments descend through the darkness, but remain secondary.
Style/medium: cinematic dark-fantasy brand art, refined editorial key art, realistic atmospheric materials, quiet and premium
Composition/framing: wide 1.91:1 landscape; asymmetrical; strongest fold and light seam in the right half; calm, dark negative space across the left-center for an exact wordmark and a short purpose line to be composited later; readable even as a small link preview
Lighting/mood: mysterious, confident, intimate, high depth; rich blacks rather than crushed blacks
Color palette: ink black, midnight blue, deep mineral teal, antique gold, warm ivory highlights
Materials/textures: folded silk shadow, fine luminous threads, black glass water, delicate mist
Constraints: background only; no text; no letters; no logo; no icons; no people; no character; no architecture; no frame; no border; no watermark
Avoid: generic rain photography, bright neon, purple esports gradient, symmetrical portal, central object, washed-out cyan, empty black void, busy star field, lens flare
```

### Earlier celestial-water reference

```text
Use case: logo-brand
Asset type: abstract background for a 1200x630 website social card
Input image: the repository celestial-water image is a style and motif reference only.
Primary request: create a wide, premium Nightfold brand backdrop inspired by the reference's black celestial water, fine descending blue-white filaments, mist, and subtle reflections. The result should feel quiet, mysterious, refined, and spacious rather than like literal weather or a game screenshot.
Composition/framing: landscape 1.91:1 composition; low luminous waterline; subtle diagonal flow and layered depth; calm open central region reserved for a wordmark; darker corners and generous negative space.
Color palette: near-black, midnight blue, restrained icy cyan, and a trace of warm antique gold reflected very subtly in the water.
Materials/textures: silk-like darkness, fine luminous threads, glassy black water, delicate atmospheric haze.
Constraints: background only; no text; no letters; no logo; no icons; no characters; no architecture; no border; no watermark.
Avoid: bright sci-fi neon, purple esports gradients, busy star fields, lens flares, generic technology imagery, high-contrast central object, literal rainstorm photography.
```
