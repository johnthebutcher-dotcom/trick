# card-room: component rules (Trick)

**Personality:** a quiet card room. Green felt, cream cards, ink text; Tenor Sans for titles and the ranks, DM Sans for everything else.
**Mode:** auto, dark default. The felt stays in both modes; cards switch between dark brown and cream. Page-level text (titles over the felt) is always cream.
**PWA theme_color:** `#1d3a26`

## The two surfaces

- **Felt** (the page): only headings, short captions and the primary button sit directly on it. Everything readable lives on a card.
- **Card** (`Card`, `HandView`): text uses `text-card-foreground`; inside a card never use `text-foreground` (it is cream and will vanish on a cream card in light mode).

## Layout and density

- Gutter `px-5`, section spacing `space-y-8`, single column, `max-w-xl`.
- Cards get `p-5`; the hand card is the biggest thing on the drill screen and carries `shadow-stack`.

## Type

- Tenor Sans is one weight; use `font-heading` with `font-normal` (no bold serif). Titles `text-display`, section titles `text-title`, card ranks `text-2xl` with `tracking-[0.18em]`.
- DM Sans body `text-base leading-relaxed`; small-caps labels `text-xs uppercase tracking-[0.12em]`.

## Color

- Primary (terracotta) for the one primary button per screen, active tab, focus and the ring. Status colours only on the answer reveal.
- Links and secondary actions over the felt: cream with underline, not primary.

## Shape, depth, borders

- Radii small (`rounded-md` controls, `rounded-lg` cards). Cards float with `shadow-card`; nothing else casts a shadow except the hand card.
- `neu` controls take their fill from the surface they sit on: inside a card they are card-coloured; on the felt add `on-felt`.

## Motion

- As warm-editorial: 200–250 ms, `ease-soft`, pop on correct, shake on wrong, fade-up on routes. The felt never moves.

## Copy tone

Warm, specific, unhurried. Sentence case. Prefer full words.
