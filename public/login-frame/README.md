# Soulframe login input frame SVG kit

This directory contains a native-pixel, reference-traced reconstruction of the
ornamental input frames shown on Soulframe's login screen. Long rails remain
mathematically straight while the distinctive corner and folded-leaf contours
follow the screenshot geometry.

## Assembled frames

- `input-frame-neutral.svg` — muted antique-gold frame.
- `input-frame-focused.svg` — amber focused frame.
- `component-sheet.svg` — visual inventory of both frames and all modular
  pieces.

Both assembled frames use a `432 × 58` view box, matching the reference
component's native proportions. They may be scaled to any
width while preserving their aspect ratio:

```html
<img
  src="/login-frame/input-frame-neutral.svg"
  alt=""
  width="432"
  height="58"
/>
```

Use the neutral asset normally and swap to the focused asset when the field has
focus:

```css
.login-field {
  background: center / 100% 100% no-repeat
    url("/login-frame/input-frame-neutral.svg");
}

.login-field:focus-within {
  background-image: url("/login-frame/input-frame-focused.svg");
}
```

## Modular pieces

- `leaf-left.svg`
- `leaf-right.svg`
- `corner-top-left.svg`
- `corner-top-right.svg`
- `corner-bottom-left.svg`
- `corner-bottom-right.svg`
- `pattern-top.svg`
- `pattern-bottom.svg`
- `pattern-left.svg`
- `pattern-right.svg`

The corner and edge files are designed as mirrored pairs with matching join
geometry. The horizontal and vertical pattern assets can be repeated along a
custom-sized frame without stretching the rope motif.
