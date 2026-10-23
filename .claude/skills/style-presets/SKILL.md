---
name: style-presets
description: Pick, apply or create a style preset (design tokens + component rules) for an app. Use when choosing a look for a new app, when the owner names a preset or describes a style ("like X", a screenshot, a mood), or when adding a new saved look to the starter.
---

# style-presets

A preset is two files in `src/styles/presets/`: `<name>.css` (tokens on `:root`) and `<name>.rules.md` (how components look and behave), plus an entry in `presets.json`. Tailwind utilities exist only for these tokens (`src/styles/index.css` removes the default palette), so a preset fully determines the look.

## Pick an existing preset

1. Read `presets.json`. Match the description's words against each preset's `keywords`; `clean-light` is the default when nothing matches.
2. Apply: `npm run preset -- <name>`. Then set `theme_color` in `vite.config.ts` and `<meta name="theme-color">` in `index.html` to the preset's `themeColor`, and regenerate icons with that colour.
3. Read `<name>.rules.md` before building UI. Follow it literally: radii, shadows, density, motion, copy tone, component shapes.
4. Both colour modes must look finished for `mode: auto` presets. Check that no screen hard-codes white/black and that text stays readable on `bg-muted`.

## Create a new preset from a reference

Inputs: a screenshot, a link, a brand, or adjectives. Do not copy a brand's exact palette or type; derive a look that matches the mood.

1. Decide: light-first, dark-only, or auto. Pick a primary hue (oklch hue angle), a neutral tint (slight hue in greys reads warmer or cooler), a radius (4 / 6 / 12 px), a density (`--space-unit` 0.25rem default, 0.27 airy, 0.23 tight), and whether depth comes from shadows or borders.
2. Copy the closest existing css file to `<name>.css`. Change every token; keep every token name (other presets, components and `index.css` depend on them). Use `light-dark()` for colours in `auto` mode. Keep contrast: foreground on background ≥ 7:1, muted-foreground ≥ 4.5:1, primary-foreground on primary ≥ 4.5:1.
3. Write `<name>.rules.md` using the same headings as the existing rules files: personality, use when, mode, theme_color, layout and density, type, color, shape/depth/borders, motion, components, copy tone. Be concrete (class names), not adjectives.
4. Add the entry to `presets.json` with `keywords` the matcher can use.
5. Verify: `npm run preset -- <name>`, `npm run build:preview`, screenshot `/` (the styleguide) at phone width in both modes (see `docs/recipes/preview.md`), and publish it as an artifact so the owner can see it on their phone.
6. If the preset is meant for reuse, add it to `app-starter` too (same files) so future apps can pick it by name.

## Effects (glass, aurora, gradients, motion)

The effects layer (`src/styles/effects.css`) is driven entirely by preset tokens; see `_tokens.md`:

- **Surfaces:** `--shell-*` (header + tab bar) and `--card-*` (Card) decide the material. Point them at the `--glass-*` tokens for a liquid-glass frame and cards, as `aurora-glass` does. Components never change.
- **Backdrop:** `--backdrop-image` / `--backdrop-animation` / `--backdrop-noise` render once behind the app (`app-backdrop` in AppShell). `none` / `0` turns it off.
- **Utilities for screens:** `glass`, `glass-strong`, `glass-edge`, `bg-aurora`, `text-gradient`, `skeleton`, `animate-fade-up`, `animate-float`, `ease-soft`, `ease-spring`.
- **Rules of use:** one signature move per screen; glass only on shell, cards, heroes and floating controls (never list rows); one animated layer per screen; reduced motion is automatic; contrast on glass checked in both modes. Each preset's rules file says what is allowed.

To add effects to a new preset: copy the token block from `aurora-glass.css` (surfaces, glass, aurora, backdrop, motion), tune colours and blur, and write the matching section in its rules file.

## Design pass

After tokens and rules are applied and the first screens exist, run the design pass before calling the look done:

1. If a dedicated design skill is listed in this session (for example `design-forge`, which bundles Impeccable, Vercel's web guidelines and UI UX Pro Max), load it and apply its critique to the screens, within the preset's rules.
2. Otherwise, or in addition, walk `docs/design-pass.md` (hierarchy, rhythm, type, colour, surfaces, motion, states, touch, copy, the template smell test) and fix what it finds.
3. Record what changed in `docs/BUILD_LOG.md` under "Design pass".

## Never

- Add a colour utility outside the token set, an arbitrary `shadow-[…]`, or a per-component hex value. Add a token to every preset instead.
- Introduce a web font without a `<link>` in `index.html` and a note in the rules file; system stacks are the default for speed.
