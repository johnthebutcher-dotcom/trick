# aurora-glass: component rules

**Personality:** premium, soft, a little dreamy. Think modern consumer apps with a "material" feel: wellness, collections, music, finance for people who like nice things.
**Use when:** the description mentions glass, frosted, liquid glass, aurora, gradients, "iOS-feeling", premium, modern, sleek, or "make it look expensive".
**Mode:** auto. Light is airy white glass over pastel aurora; dark is smoked glass over deep violet. Both must be checked.
**PWA theme_color:** `#120f1f`

## What the preset already does

The shell (header, tab bar) and every `Card` are glass, and `AppShell` renders the animated aurora backdrop. You do not add glass to those; you work on what sits inside them.

## Layout and density

- Generous: gutter `px-5`, section spacing `space-y-8`, card padding `p-5`. Let the backdrop show between cards (`gap-4`).
- Group related items in one card rather than many small cards; glass stacked on glass gets muddy. No card inside a card, ever.
- Heroes: one per app, `bg-aurora rounded-2xl p-6` with a `text-gradient` heading; everything else stays calm.

## Type

- Headings `font-semibold tracking-tight`; page titles `text-3xl`, section titles `text-lg`.
- `text-gradient` on exactly one heading per screen at most, usually the hero. Never on body text, labels or buttons.
- Body `text-base leading-relaxed`. On a busy area of the backdrop, put body text in `glass-strong`.

## Color

- Primary (violet) for primary buttons, active tab, progress and focus. Aurora colours live in the backdrop and gradient text only; never as flat fills.
- Keep status colours plain and saturated so they read on glass.
- Contrast check on glass: `text-muted-foreground` is the minimum; if it looks faint on light mode, promote to `text-foreground/80` via opacity, not a lighter colour.

## Shape, depth, borders

- Radii are large: cards `rounded-2xl`, buttons/inputs `rounded-xl`, chips `rounded-full`.
- Depth is the glass itself plus `shadow-card`; no extra borders inside cards. Floating controls (a camera FAB, a bottom sheet) use `glass glass-edge`.
- Images get `rounded-xl` and sit flush inside cards (`-mx-5 -mt-5 rounded-t-2xl` for a card header image).

## Motion

- Entrances: `animate-fade-up` on screen content (the shell already does this per route). Press: `active:scale-[0.97] ease-spring`.
- Backdrop drift is slow (26s); never add a second animated background. Respect reduced motion (automatic).
- Loading uses `skeleton` blocks shaped like the content, not spinners, except for actions.

## Components

- **Button:** primary = violet `rounded-xl h-12 font-semibold`; secondary = `glass` with `text-foreground`; ghost = transparent; danger = `bg-danger`. Full-width primary at the bottom of forms.
- **Input:** `h-12 rounded-xl border bg-card/70 px-4` (translucent so the backdrop tints it), focus ring in primary.
- **List rows:** inside one card, `py-3` with `border-border/60` dividers; no per-row cards.
- **Empty / error / loading states:** inside a card, icon in `text-primary`, one sentence, one action.

## Catalog effects allowed here

`bg-mesh` or `bg-aurora` hero (one), `text-gradient-animated` on the hero heading, `border-glow` on one premium item, `ring-progress`, `drop-glow` on icons, `reveal` on sections, `scroll-progress` on long reads, `hover-lift` on cards. Not here: `neu` (fights glass), `clip-slant`.

## Performance guardrails

- Glass is on the shell and cards only. Do not put `backdrop-filter` on list rows, table cells or anything rendered more than ~8 times per screen.
- Never add `blur()` on scrolling content containers. Keep the backdrop as the single animated layer.

## Copy tone

Calm, confident, short. Sentence case. Buttons are verbs. Delight comes from the surface, not from the words.
