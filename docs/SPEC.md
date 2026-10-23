# {{APP_NAME}} — spec

_Written from the description sent on {{DATE}}. Update it when scope changes; the build log records why._

## One sentence

{{What the app is, for whom, in one sentence.}}

## Style

- Preset: `{{clean-light | bold-dark | warm-editorial}}` (reason: {{keywords from the description}})
- Name / icon letter / theme colour: {{…}}

## Effects (chosen before build)

_Copied from `docs/effects-menu.md` with the owner's ticks. `npm run check:effects` enforces it; untouched = nothing beyond the always-on set._

- [ ] Liquid glass on shell and cards (`glass`, `glass-strong`, `glass-edge`)
- [ ] Animated aurora backdrop behind the app (`app-backdrop`)
- [ ] Aurora or mesh hero (`bg-aurora`, `bg-mesh`)
- [ ] Gradient heading, static (`text-gradient`)
- [ ] Gradient heading, animated (`text-gradient-animated`)
- [ ] Rotating glow border (`border-glow`)
- [ ] Conic gradient and progress ring (`bg-conic`, `ring-progress`)
- [ ] Multi-layer shadow (`shadow-stack`)
- [ ] Icon glow (`drop-glow`)
- [ ] Soft UI / neumorphism (`neu`, `neu-inset`)
- [ ] Edge fades (`mask-fade-x`, `mask-fade-b`)
- [ ] Slanted section breaks (`clip-slant`)
- [ ] Organic blob shapes (`rounded-blob`, `animate-morph`)
- [ ] Blend modes on decorative layers (`mix-blend-*`, `bg-blend-*`)
- [ ] View Transitions (`viewTransition`, `withViewTransition`)
- [ ] Scroll-driven reveals (`reveal`)
- [ ] Reading-progress bar (`scroll-progress`)
- [ ] Parallax ornaments (`parallax`)
- [ ] Hover lift and press feedback (`hover-lift`, `press`)
- [ ] Entrance and feedback keyframes (`animate-pop-in`, `animate-shake`, `animate-pulse-ring`, `animate-float`)
- [ ] Fluid display type (`text-hero`, `text-display`, `text-title`)
- [ ] Variable heading font (`font-heading-var`)
- [ ] Container-query layouts and subgrid (`@sm:`, `@md:`, `grid-rows-subgrid`)

## Features (v1, in build order)

1. {{Feature}} — {{what the user does, what they see}}
2. …

## Deliberately not in v1

- {{…}}

## Data

| Table        | Columns (type)                                                     | Owner / RLS      |
| ------------ | ------------------------------------------------------------------ | ---------------- |
| `{{things}}` | `id uuid pk`, `user_id uuid → auth.users cascade`, `created_at`, … | owner read/write |

## Integrations

- AI: {{photo → fields? which schema? daily limit}} / none
- Storage: {{keep photos? which bucket}} / none
- Push: {{yes: which events}} / no
- Third-party APIs: {{barcode lookup, …}} / none

## Secrets the owner must set

- Client `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Edge Function secrets: `AI_PROVIDER`, `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`, `AI_DAILY_LIMIT`, `ALLOWED_ORIGIN`

## Open questions for the owner

- {{Anything that changes the build and was not in the description.}}
