# clean-light: component rules

**Personality:** calm, trustworthy, modern SaaS. Think productivity and utility apps.
**Use when:** the description mentions clean, simple, minimal, professional, "like Notion/Linear", or gives no style direction at all. This is the default preset.
**Mode:** light first; dark follows the system automatically. Both must look finished.
**PWA theme_color:** `#2563eb`

## Layout and density

- Page gutter: `px-4` on phones, `px-6` from `md:`. Content max width `max-w-2xl` for reading, `max-w-5xl` for dashboards.
- Vertical rhythm in multiples of 4 (`space-y-4`, `gap-6`). Sections separated by `space-y-8`.
- One primary action per screen. Secondary actions are `secondary` or `ghost` buttons.

## Type

- Body `text-base` (16px) with `leading-relaxed`; never below `text-sm` for anything a user must read.
- Headings: `text-2xl font-semibold tracking-tight` for page titles, `text-lg font-semibold` for section titles. No uppercase headings.
- Muted text uses `text-muted-foreground`, never a lighter shade of the foreground.

## Color

- Backgrounds: page `bg-background`, cards `bg-card`, subtle fills `bg-muted`.
- Primary color only on primary buttons, links, active nav, focus rings and small accents. Never as a large fill behind text.
- Status colors (`danger`, `success`, `warning`) only for status; never decorative.

## Shape, depth, borders

- Cards: `rounded-xl border bg-card shadow-card`. Inputs and buttons: `rounded-lg`. Chips: `rounded-full`.
- Depth comes from `shadow-card` on raised surfaces and `shadow-popover` on overlays only. No other shadows.
- Dividers use `border-border` at 1px. No double borders (card border plus inner borders).

## Motion

- Transitions 150-200ms, `ease-out`, on color/opacity/transform only. Hover states on desktop, pressed states (`active:scale-[0.98]`) on touch.
- Loading uses a spinner or skeleton, never a full-screen blocker, unless the whole screen depends on the data.

## Components

- **Button:** primary = `bg-primary text-primary-foreground`; secondary = `bg-muted text-foreground`; ghost = transparent; danger = `bg-danger`. Height 44px on touch (`h-11`), 40px on desktop (`md:h-10`).
- **Input:** `h-11 rounded-lg border bg-card px-3`; label above, helper or error text below in `text-sm`.
- **List rows:** `py-3` with a 1px divider, chevron on navigable rows, no card-per-row.
- **Empty / error / loading states:** centered, icon in `text-muted-foreground`, one sentence of copy, one action.

## Catalog effects allowed here

`ring-progress`, `shadow-stack` on one floating element, `reveal`, `hover-lift`, `text-gradient` on the hero only. Not here: `border-glow`, `bg-mesh`, `neu`, animated gradients (too loud for this preset).

## Copy tone

Plain, short, friendly. Sentence case everywhere. Buttons are verbs ("Save bottle", not "Submit").
