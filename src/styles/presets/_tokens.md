# Preset tokens

Every preset defines all of these on `:root`. Keep the names identical across presets; components and `src/styles/index.css` depend on them. Colours use `light-dark(a, b)` when the preset's mode is `auto`.

## Colour

| Token                                              | Utility                                  | Meaning                                              |
| -------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| `--background` / `--foreground`                    | `bg-background` / `text-foreground`      | Page and body text                                   |
| `--card` / `--card-foreground`                     | `bg-card` / `text-card-foreground`       | Raised surfaces                                      |
| `--muted` / `--muted-foreground`                   | `bg-muted` / `text-muted-foreground`     | Quiet fills and secondary text (≥ 4.5:1 on `--card`) |
| `--border`, `--ring`                               | `border-border`, `ring-ring`             | Dividers, focus                                      |
| `--primary` / `--primary-foreground`               | `bg-primary` / `text-primary-foreground` | The one brand colour                                 |
| `--accent` / `--accent-foreground`                 | `bg-accent` / `text-accent-foreground`   | Tinted fills (selected rows, chips)                  |
| `--danger`, `--success`, `--warning` (+foreground) | `bg-danger` …                            | Status only                                          |

## Shape, type, depth

| Token                                     | Utility                         | Meaning                                  |
| ----------------------------------------- | ------------------------------- | ---------------------------------------- |
| `--radius`                                | `rounded-sm…2xl`                | Base radius; sm/md/xl/2xl derive from it |
| `--space-unit`                            | all spacing utilities           | 0.25rem default; 0.27 airy, 0.23 tight   |
| `--heading-tracking`                      | headings                        | Letter-spacing for h1–h4                 |
| `--font-body`, `--font-heading`           | `font-sans`, `font-heading`     | Font stacks (system by default)          |
| `--elevation-card`, `--elevation-popover` | `shadow-card`, `shadow-popover` | The only two shadows                     |

## Surfaces (what the frame and cards are made of)

| Token                                                                | Used by                                     | Meaning                                 |
| -------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------- |
| `--shell-bg`, `--shell-backdrop`, `--shell-border`, `--shell-shadow` | `surface-shell` (AppShell header + tab bar) | Point at glass tokens for a glass frame |
| `--card-bg`, `--card-backdrop`, `--card-border`, `--card-shadow`     | `surface-card` (Card)                       | Point at glass tokens for glass cards   |

## Glass material

| Token                                                                                   | Utility                               | Meaning                                                      |
| --------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `--glass-bg`, `--glass-blur`, `--glass-saturate`, `--glass-border`, `--glass-highlight` | `glass`, `glass-strong`, `glass-edge` | Translucency, blur radius, vibrancy, edge, specular top line |

## Backdrop and aurora

| Token                                                                                | Utility                                    | Meaning                                                   |
| ------------------------------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------- |
| `--aurora-1/2/3`                                                                     | `bg-aurora`, `text-gradient`               | Three gradient colours; default to the primary            |
| `--backdrop-image`, `--backdrop-animation`, `--backdrop-opacity`, `--backdrop-noise` | `app-backdrop` (rendered once by AppShell) | Full-screen art behind the app; `none` / `0` turns it off |

## Motion

| Token                              | Utility                    | Meaning                                                                         |
| ---------------------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| `--motion-soft`, `--motion-spring` | `ease-soft`, `ease-spring` | Easing curves; animations: `animate-fade-up`, `animate-float`, `animate-aurora` |

Reduced motion is enforced globally in `index.css`; presets cannot override it.

## Catalog additions (effects-catalog.css)

| Token                                                     | Utility                                       | Meaning                                               |
| --------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| `--preset-mode`                                           | `ThemeToggle`                                 | `'auto'` shows the sun/moon toggle, `'dark'` hides it |
| `--elevation-stack`                                       | `shadow-stack`                                | Five-layer shadow                                     |
| `--neu-hi`, `--neu-lo`                                    | `neu`, `neu-inset`                            | Soft-UI highlight and shade                           |
| `--mesh-blend`                                            | `bg-mesh`                                     | `background-blend-mode` for the mesh blobs            |
| `--heading-variation`                                     | `font-heading-var`                            | `font-variation-settings` for variable fonts          |
| `--motion-snap`, `--motion-emphasized`, `--motion-bounce` | `ease-snap`, `ease-emphasized`, `ease-bounce` | Extra easing curves                                   |
