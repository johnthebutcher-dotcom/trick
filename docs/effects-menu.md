# Effects menu

Before any app is built, Claude shows this menu and the owner ticks what this app may use. The picks go into `docs/SPEC.md` → "Effects", and `npm run check:effects` fails the build if a screen uses anything unticked. Each preset's rules file suggests a sensible default set; the owner can always add or remove.

Tick with `[x]`. Names in parentheses are the utilities the checker looks for.

## Surfaces and depth

- [ ] Liquid glass on shell and cards (`glass`, `glass-strong`, `glass-edge`; also the preset's `--shell-*`/`--card-*` glass tokens)
- [ ] Multi-layer shadow (`shadow-stack`)
- [ ] Icon glow (`drop-glow`)
- [ ] Soft UI / neumorphism (`neu`, `neu-inset`)

## Gradients

- [ ] Animated aurora backdrop behind the app (`app-backdrop` via preset tokens)
- [ ] Aurora or mesh hero (`bg-aurora`, `bg-mesh`)
- [ ] Conic gradient and progress ring (`bg-conic`, `ring-progress`)
- [ ] Gradient heading, static (`text-gradient`)
- [ ] Gradient heading, animated (`text-gradient-animated`)
- [ ] Rotating glow border (`border-glow`)

## Masks and blends

- [ ] Edge fades on scroll strips and long text (`mask-fade-x`, `mask-fade-b`)
- [ ] Slanted section breaks (`clip-slant`)
- [ ] Organic blob shapes (`rounded-blob`, `animate-morph`)
- [ ] Blend modes on decorative layers (`mix-blend-*`, `bg-blend-*`)

## Motion

- [ ] Screens fade up on navigation (`animate-fade-up`, on by default in AppShell)
- [ ] View Transitions: route cross-fade and theme wipe (`viewTransition`, `withViewTransition`)
- [ ] Scroll-driven reveals (`reveal`)
- [ ] Reading-progress bar (`scroll-progress`)
- [ ] Parallax ornaments (`parallax`)
- [ ] Hover lift and press feedback (`hover-lift`, `press`)
- [ ] Entrance and feedback keyframes (`animate-pop-in`, `animate-shake`, `animate-pulse-ring`, `animate-float`)
- [ ] Shimmer skeletons (`skeleton`, on by default in LoadingState)

## Type and layout

- [ ] Fluid display type (`text-hero`, `text-display`, `text-title`)
- [ ] Variable heading font (`font-heading-var`, needs a font in the preset)
- [ ] Container-query layouts and subgrid (`@sm:`, `@md:`, `grid-rows-subgrid`)

## Always on (not optional)

Dark mode default with sun/moon toggle (its wipe and press feedback), route fade-up and cross-fade in the shell, shimmer skeletons, focus rings, custom scrollbars, reduced-motion fallbacks, empty/error/loading/offline states. Untick nothing here; to remove one, say so and Claude edits the shell.

---

### Suggested defaults by preset

- **clean-light:** fade-up, View Transitions, reveals, hover lift, shimmer, fluid type, container queries, `ring-progress`, `shadow-stack`.
- **bold-dark:** fade-up, View Transitions, press feedback, `border-glow` (one), `bg-conic` badges, `drop-glow`, animated gradient heading, `clip-slant`, fluid type.
- **warm-editorial:** fade-up, View Transitions, reveals, hover lift, `mask-fade-b`, `neu` on controls, fluid type, container queries.
- **aurora-glass:** glass, aurora backdrop, mesh hero, animated gradient heading, `border-glow` (one), `ring-progress`, `drop-glow`, View Transitions, reveals, hover lift, shimmer, fluid type, container queries, blend on decorative layers.
