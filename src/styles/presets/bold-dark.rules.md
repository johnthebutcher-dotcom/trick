# bold-dark: component rules

**Personality:** confident, energetic, a little loud. Think fitness, nightlife, gaming, collector apps.
**Use when:** the description mentions dark, bold, punchy, neon, "like Spotify/Strava", or the subject is evening-oriented (bars, spirits, music, events).
**Mode:** dark only. There is no light variant; do not add one.
**PWA theme_color:** `#0f0e14`

## Layout and density

- Tighter than the default: gutter `px-4`, section spacing `space-y-6`, list rows `py-2.5`.
- Big numbers and big headings are welcome (`text-4xl font-bold`) when they carry the main info of the screen.
- Full-bleed hero areas and edge-to-edge images are fine; keep text off busy images.

## Type

- Headings `font-bold tracking-tight`, uppercase allowed for short labels (`text-xs uppercase tracking-wider text-muted-foreground`).
- Body `text-base`; never reduce contrast for style. `muted-foreground` is already the minimum.

## Color

- Primary (lime) is the only bright color: primary buttons, active states, progress, one highlight per screen.
- Large lime fills are allowed for hero CTAs and badges, never for body backgrounds.
- Borders carry the structure (`border-border`); surfaces step up in lightness: background → card → muted.

## Shape, depth, borders

- Radii are tight: cards `rounded-lg`, buttons/inputs `rounded-md`, chips `rounded-sm`.
- No drop shadows anywhere. Elevation is expressed by a lighter surface and a 1px border.
- Overlays get `shadow-popover` (a 1px border ring), not a blur.

## Motion

- Snappy: 120-160ms, `ease-out`. Pressed state `active:scale-95` on primary buttons.
- Entrances may slide 8px up with a fade; no bounce, no springs.

## Components

- **Button:** primary = lime on near-black text, `font-semibold`; secondary = `bg-muted border`; ghost = transparent with `hover:bg-muted`; danger = `bg-danger`. Height `h-12` on touch.
- **Input:** `h-12 rounded-md border bg-muted px-3`; focus shows the lime ring.
- **Cards:** `rounded-lg border bg-card p-4`; stat cards may use `text-3xl font-bold` numerals with a small uppercase label.
- **Empty / error / loading states:** same structure as other presets; the icon may use `text-primary`.

## Catalog effects allowed here

`border-glow` on one item, `bg-conic` badges, `drop-glow` on icons, `text-gradient-animated` on the hero, `clip-slant` section breaks, `press`. Not here: `neu`, `bg-mesh` (keep surfaces flat and sharp).

## Copy tone

Short, direct, energetic. Sentence case. Buttons are verbs. No exclamation marks in system messages.
