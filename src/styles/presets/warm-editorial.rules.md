# warm-editorial: component rules

**Personality:** considered, tactile, a little literary. Think journals, recipes, tasting notes, collections with stories.
**Use when:** the description mentions warm, cozy, elegant, editorial, magazine, craft, artisanal, tasting notes, or "like a nice cookbook".
**Mode:** light first; dark mode is a deep brown, not grey. Both must look finished.
**PWA theme_color:** `#b5543c`

## Layout and density

- Slightly airier than the default (`--space-unit` is larger). Gutter `px-5`, section spacing `space-y-8`.
- Prefer single-column reading layouts (`max-w-xl`). Two columns only from `md:` for galleries.
- Let content breathe: generous `py-6` around headings; whitespace is part of the style.

## Type

- Headings in the serif stack (`font-heading`), `font-medium`, sizes `text-3xl` for pages and `text-xl` for sections. Never bold-weight serif above `font-semibold`.
- Body in the sans stack, `text-base leading-relaxed`. Long passages may use `text-[17px]`.
- Small caps style labels: `text-xs uppercase tracking-[0.12em] text-muted-foreground`.

## Color

- Primary (terracotta) for primary buttons, links, and small marks such as rating dots. Never as a page or card background.
- Surfaces are warm: `bg-background` for pages, `bg-card` for sheets and inputs, `bg-muted` for quiet fills.
- Status colors only for status.

## Shape, depth, borders

- Hairline borders define structure; radii are small (`rounded-md` on inputs, `rounded-lg` on images). Chips `rounded-sm`.
- No card shadows. Cards are `border bg-card`; overlays get `shadow-popover`.
- Thin rules (`border-t`) separate sections; avoid boxes inside boxes.

## Motion

- Gentle: 200-250ms, `ease-in-out`. Fades over slides. No scale effects on press; use a background tint instead (`active:bg-muted`).

## Components

- **Button:** primary = `bg-primary text-primary-foreground rounded-md`; secondary = `border bg-card`; ghost = underlined text link style; danger = `text-danger` ghost unless destructive confirm. Height `h-11`.
- **Input:** `h-11 rounded-md border bg-card px-3`; labels in the small-caps label style.
- **Cards:** `rounded-lg border bg-card p-5`; images `rounded-md` with a 1px border.
- **Empty / error / loading states:** serif heading, one sentence, one action.

## Catalog effects allowed here

`mask-fade-b` on long text, `reveal`, `hover-lift` on cards, `neu` for toggles and knobs, `text-gradient` never. Not here: `border-glow`, `bg-conic`, animated gradients.

## Copy tone

Warm, specific, unhurried. Sentence case. Prefer full words to abbreviations.
