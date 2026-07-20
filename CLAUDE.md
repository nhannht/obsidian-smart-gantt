# CLAUDE.md

## Design source of truth

The Smart Gantt logo master lives in `assets/smart-gantt-logo.sketch`. The Sketch
file is the design source of truth; do not create a DESIGN.md.

Structure map:

- Page `Logo`
  - `App Icon 64` (64x64): rounded backing radius 14, linear gradient
    `#8b5cf6 -> #6d28d9`, three white gantt bars (opacity 1 / 0.85 / 0.7)
  - `Icon 512` (512x512): the same design at 8x, backing radius 112
  - `Glyph mono 100 (Obsidian addIcon)` (100x100): bars only, no backing;
    matches the `addIcon("smart-gantt", ...)` SVG registered in `main.tsx`

The same mark is used by:

- in-app icon: `addIcon("smart-gantt", ...)` in `main.tsx` (ribbon + both views)
- website favicon: `site/public/favicon.svg` on the `docs` branch
- website nav/footer: `LogoMark` in `site/src/components/Icons.tsx` (docs branch)

Any change to the mark starts in the Sketch file, then propagates to those three
places in the same change.
