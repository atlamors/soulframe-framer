# Segmented rope nine-slice border

The two state assets are:

- Active:
  [`public/ornaments/rope-nine-slice.svg`](../../public/ornaments/rope-nine-slice.svg)
- Inactive:
  [`public/ornaments/rope-nine-slice-inactive.svg`](../../public/ornaments/rope-nine-slice-inactive.svg)

Both have transparent centers and geometry-identical `96 × 96` view boxes
divided into fixed `16 × 16` corner slices and repeatable edge slices.

The pixel reference is
[`docs/references/soulframe-ui/rope-nine-slice-dialog.png`](../references/soulframe-ui/rope-nine-slice-dialog.png).

```css
.soulframe-rope-border {
  /* The element supplies its own panel fill. */
  background: #211f1f;
  border: 8px solid transparent;
  border-image-source: url("/ornaments/rope-nine-slice.svg");
  border-image-slice: 16;
  border-image-width: 8px;
  border-image-repeat: round;
}

.soulframe-rope-border[data-state="inactive"] {
  border-image-source: url("/ornaments/rope-nine-slice-inactive.svg");
}

.soulframe-rope-border[data-state="active"] {
  border-image-source: url("/ornaments/rope-nine-slice.svg");
}
```

Use `round`, not `stretch`: each edge contains one complete irregular sequence
of beveled rope links, and round repetition preserves their proportions while
distributing any remaining space evenly. Keep the rendered border between
`6px` and `10px`; outside that range the source design either loses its small
twist highlights or becomes heavier than the in-game reference.
