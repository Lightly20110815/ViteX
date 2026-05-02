# ViteX Design Variants — Usage Guide

## Quick Preview

Open `public/designs.html` in your browser for a visual gallery of all 8 variants.

## How to Apply a Variant

### Easy (shared DOM structure)
Variants 1 (Neon Noir), 3 (Wabi-Sabi), 5 (Brutalist), 6 (Film Memory), 7 (Liquid Glass)
share the same HTML structure as the current default. To apply:

```bash
# Example: switch to Wabi-Sabi
cp .planning/design-variants/03-wabi-sabi/styles.css src/styles.css
npx vite  # Preview
```

### Complex (custom HTML layout)
Variants 2 (Swiss Grid), 4 (Bento Gallery), 8 (Ink Studio)
have custom page layouts. To apply:

```bash
# Example: switch to Ink Studio
cp .planning/design-variants/08-ink-studio/styles.css src/styles.css
cp .planning/design-variants/08-ink-studio/index.html index.html
# You may need to adjust src/main.ts for new DOM selectors
npx vite
```

## Variant Compatibility Matrix

| Variant | Shared DOM | Custom Layout | Notes |
|---------|-----------|---------------|-------|
| 01 Neon Noir | ✓ | — | Current default design |
| 02 Swiss Grid | — | ✓ sidebar + 2-col grid | Needs sidebar nav support |
| 03 Wabi-Sabi | ✓ | — | Drop-in CSS replacement |
| 04 Bento Gallery | — | ✓ bento hero grid | Needs hero-grid elements |
| 05 Brutalist | ✓ | — | Drop-in CSS replacement |
| 06 Film Memory | ✓ | — | Drop-in CSS replacement |
| 07 Liquid Glass | — | ✓ needs orb divs | Add orb divs to index.html |
| 08 Ink Studio | — | ✓ sticky rail layout | Needs rail-profile element |

## Design Tokens Reference

All variants use CSS custom properties for theming. Key tokens:
- `--bg-*` — Background colors
- `--text-*` — Text colors (primary/secondary/tertiary)
- `--accent*` — Accent colors and glow effects
- `--glass-*` — Glassmorphism card settings
- `--font-*` — Font family stacks
- `--radius-*` — Border radius scale
- `--transition*` — Animation timing

## Creating New Variants

Each variant needs:
1. `styles.css` — Complete stylesheet (no @import of other variants)
2. `index.html` — Only if layout differs from default
3. Register in `COMPARISON.md`
