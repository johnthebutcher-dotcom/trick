# Design pass

Run this after the first build of any screen and before calling a feature done. It is the fallback when no dedicated design skill is loaded; when one is (for example `design-forge`, which bundles Impeccable, Vercel's web guidelines and UI UX Pro Max), load it and let it drive the critique, then still tick the list below. The preset's `*.rules.md` always wins on specifics.

## 1. One idea per screen

- What is the single thing this screen is for? It should be the largest, highest-contrast element and the first thing the eye lands on.
- Hierarchy comes from size, weight and space first; colour last. If everything is bold, nothing is.
- At most one primary button visible at a time. Secondary actions are quiet.

## 2. Rhythm

- Spacing on the 4px grid, and consistent: the same gap between the same kinds of things everywhere (`space-y-4` inside cards, `space-y-8` between sections).
- Everything aligns to one left edge within a column. Centred layouts only for empty states, onboarding and heroes.
- Gutters match the preset (`px-4` / `px-5`); content never touches the screen edge.

## 3. Type

- Three sizes per screen at most (title, body, caption). Weights: regular and semibold; bold only in bold presets.
- Line length 45–75 characters; `leading-relaxed` for paragraphs; headings `tracking-tight` and `text-wrap: balance` (already global).
- Numbers that matter get the display size; labels go small and quiet above them.

## 4. Colour

- The primary colour appears on the primary action, active state and focus, and almost nowhere else. The neutrals carry the design.
- Status colours mean status. A red button is a destructive action, not "important".
- Both modes checked for `auto` presets. Nothing hard-codes white or black.

## 5. Surfaces and depth

- One elevation story per screen: either borders or shadows (the preset decides), never both on the same element.
- No card inside a card. Lists go inside one card with dividers.
- Glass, gradients and animated backdrops are a preset's signature move and appear where the rules say, not on every element.

## 6. Motion

- Motion explains something: arrival (fade-up), feedback (press), continuity (shared position). Decorative motion is limited to the backdrop.
- 150–200 ms for feedback, 300–450 ms for entrances, `ease-soft`; `ease-spring` only in playful presets. Reduced motion is respected automatically.

## 7. States

- Loading, empty, error (with retry), offline and first-run are designed, not default. Skeletons mirror the content's shape.
- Forms: every field has a label; errors appear under the field and say what to do; the submit button shows progress.

## 8. Touch and reach

- Targets ≥ 44 px; the primary action sits in the thumb zone (bottom) on phones; safe areas respected (`pt-safe`, `pb-safe`).
- Nothing important hides behind hover.

## 9. Copy

- Sentence case; buttons are verbs; no jargon; errors say what happened and what to do next.
- Read every string out loud once. Remove words until it breaks, then put one back.

## 10. The template smell test

Remove or rethink anything on this list:

- Default-looking blue, grey cards with drop shadows everywhere, an icon in a circle on every card.
- A three-column feature grid on a phone; a hero with a stock illustration; "Welcome to <app>!" with an exclamation mark.
- Centred everything; equal visual weight on every element; identical card sizes for very different content.
- Gradient text on more than one heading; glass on list rows; two things animating at once.

Pick one or two signature moves from the preset (a gradient hero heading, a glass tab bar, a serif title, a lime accent) and keep the rest quiet. That is what makes a screen look designed rather than generated.

## Review ritual

1. Build and view at 390 px wide (phone), both colour modes for `auto` presets.
2. Squint: can you still tell what the screen is for and where to tap?
3. Tab through: focus is visible and in a sensible order.
4. Read every string.
5. Note what you changed in `docs/BUILD_LOG.md` under "Design pass".
