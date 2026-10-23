# Effects catalog

Every effect the starter ships, what to reach for, and where a preset allows it. All of them are driven by preset tokens (`src/styles/presets/_tokens.md`) and degrade safely: no `backdrop-filter` → solid card, no `animation-timeline` → element shown at rest, reduced motion → nothing moves. See them all on `/styleguide`.

The rule that keeps this tasteful: **one or two signature moves per screen**, from the preset's rules file. Everything else stays quiet.

## Visual

| Effect                           | Use                                                                        | Notes / limits                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Glassmorphism                    | `glass`, `glass-strong`, `glass-edge`                                      | Shell and cards go glass via `--shell-*` / `--card-*` tokens (aurora-glass). Never on list rows. |
| Conic gradient                   | `bg-conic`, `ring-progress` (`--progress` 0–100)                           | Ring is a masked conic; `--progress` is a registered property so it animates on change.          |
| Mesh gradient                    | `bg-mesh`                                                                  | Five blobs from the aurora/primary/accent tokens, blended with `--mesh-blend`.                   |
| Animated gradients (`@property`) | `text-gradient-animated`, `border-glow`, `animate-spin-slow` on `bg-conic` | Registered `--angle` / `--gx` make gradients animatable without JS.                              |
| Text gradient                    | `text-gradient`, `text-gradient-animated`                                  | One heading per screen, never body text.                                                         |
| Multi-layer shadow               | `shadow-stack`                                                             | Five-layer stack from `--elevation-stack`; for the one element that must float.                  |
| Drop-shadow filter               | `drop-glow`                                                                | For icons and SVG; follows alpha, unlike box-shadow.                                             |
| Neumorphism / soft UI            | `neu`, `neu-inset`                                                         | Uses `--neu-hi` / `--neu-lo`; only on flat backgrounds, never on glass or over the aurora.       |
| Masks and clipping               | `mask-fade-b`, `mask-fade-x`, `clip-slant`, `rounded-blob`                 | Edge fades for scroll strips; slant for section breaks.                                          |
| Blend modes                      | Tailwind `mix-blend-*`, `bg-blend-*`                                       | `isolate` the parent (Card does) so blends stay inside it.                                       |
| Rotating / glowing border        | `border-glow` (`--glow-width`, `--glow-speed`, `--glow-opacity`)           | At most one per screen (premium item, active card).                                              |
| Backdrop art                     | `app-backdrop` (rendered once by AppShell)                                 | From `--backdrop-*` tokens; one animated layer per screen.                                       |

## Motion

| Effect                     | Use                                                                                                                            | Notes                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Scroll-driven reveal       | `reveal`                                                                                                                       | `animation-timeline: view()`; no-support browsers show content at rest.       |
| Reading progress           | `scroll-progress`                                                                                                              | Hidden where unsupported.                                                     |
| Native parallax            | `parallax` (`--parallax` 0.1–0.6)                                                                                              | Scroll-timeline translate; decorative elements only.                          |
| View Transitions           | `NavLink viewTransition`; `withViewTransition()` in `lib/motion.ts`                                                            | Routes cross-fade; theme toggle wipes from the tap point (`data-vt="theme"`). |
| Hover / micro-interactions | `hover-lift`, `press`, `active:scale-*`                                                                                        | Hover only on pointer devices (`@media (hover: hover)`).                      |
| Easing curves              | `ease-soft`, `ease-spring`, `ease-snap`, `ease-emphasized`, `ease-bounce`                                                      | Tokens `--motion-*`; presets may retune them.                                 |
| Keyframe sequences         | `animate-fade-up`, `animate-pop-in`, `animate-shake`, `animate-pulse-ring`, `animate-morph`, `animate-float`, `animate-aurora` | Re-mount (change `key`) to replay an entrance.                                |

## Layout

| Feature            | Use                                                                                                        | Notes                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Subgrid            | `grid-rows-subgrid` / `grid-cols-subgrid` + `row-span-N`                                                   | Cards in a grid share row heights.                       |
| Container queries  | `Card` is a `@container`; use `@sm:`, `@md:` variants                                                      | Components respond to their own width, not the viewport. |
| CSS nesting        | Native in `effects*.css` (`&::before`, `@supports` inside)                                                 |                                                          |
| Isolation          | `isolate` on AppShell root and Card                                                                        | Keeps blends and z-index local.                          |
| Logical properties | Tailwind v4 utilities already emit `padding-inline` etc.; use `ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-` | RTL-safe by default.                                     |

## Typography and colour

| Feature                   | Use                                                                                            | Notes                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fluid type                | `text-hero`, `text-display`, `text-title`                                                      | `clamp()` scales; body stays 16px.                                                                                                                       |
| Variable fonts            | `font-optical` (on body), `font-heading-var` (`--heading-variation`)                           | To add a variable Google font: `<link>` in `index.html` with `wght@300..800`, set `--font-heading`, and `--heading-variation: 'wght' 650` in the preset. |
| Colour scheme / dark mode | Dark by default (`data-theme="dark"` set before paint in `index.html`); `ThemeToggle` sun/moon | `mode: auto` presets use `light-dark()`; `mode: dark` presets hide the toggle.                                                                           |
| Custom properties         | Every token on `:root`; `_tokens.md`                                                           | Registered ones: `--angle`, `--gx`, `--progress`.                                                                                                        |
| Focus rings               | global `:focus-visible`; `focus-ring` (`--ring-offset`)                                        |                                                                                                                                                          |
| Custom scrollbars         | global thin + tinted; `scrollbar-thin`, `scrollbar-none`                                       |                                                                                                                                                          |

## Performance guardrails

- `backdrop-filter`, `filter: blur()`, `mix-blend-mode` and animated gradients cost GPU on phones: shell + cards + one hero + one floating control is the budget. Never on list rows or inside scroll containers with many children.
- One animated background layer per screen (`app-backdrop` or a hero blob, not both).
- Scroll-driven animations are cheap; JS scroll listeners are not. Use the utilities.
- Always re-check at 390px in both modes (`docs/recipes/preview.md`).
