import { useState, type CSSProperties, type ReactNode } from 'react'
import { Camera, ChevronRight, Sparkles, Star, Wine } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { EmptyState, ErrorState, Skeleton } from '@/components/states'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { env } from '@/lib/env'
import { cn } from '@/lib/utils'

/**
 * Every component and effect in one screen, in the active preset. Used by the
 * design pass to check a preset at phone width in both modes, and as the home
 * screen of preview builds. Route: /styleguide. Catalog: docs/effects.md.
 */

const swatches = [
  ['bg-background', 'background'],
  ['bg-card', 'card'],
  ['bg-muted', 'muted'],
  ['bg-primary', 'primary'],
  ['bg-accent', 'accent'],
  ['bg-danger', 'danger'],
  ['bg-success', 'success'],
  ['bg-warning', 'warning'],
] as const

const rows = [
  { name: 'Diplomático Reserva Exclusiva', meta: 'Venezuela · 40%', rating: 4 },
  { name: 'Plantation XO 20th Anniversary', meta: 'Barbados · 40%', rating: 5 },
  { name: 'Clairin Communal', meta: 'Haiti · 46.5%', rating: 3 },
]

const shelf = [
  { name: 'Foursquare 2009', note: 'Dry, oak, toffee', abv: 60 },
  { name: 'Appleton 12', note: 'Orange peel, molasses, a long warm finish', abv: 43 },
  { name: 'Hampden Great House', note: 'Funk, overripe banana', abv: 55 },
  { name: 'Rhum JM VSOP', note: 'Grassy, cane, pepper', abv: 43 },
]

function readPresetName(): string {
  if (typeof document === 'undefined') return ''
  const value = getComputedStyle(document.documentElement).getPropertyValue('--preset-name')
  return value.trim().replace(/^['"]|['"]$/g, '')
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="reveal space-y-3">
      <h2 className="text-title font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export function StyleguidePage() {
  const [preset] = useState(readPresetName)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(68)
  const [shaking, setShaking] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [pops, setPops] = useState(0)

  return (
    <div className="mx-auto max-w-xl space-y-10 pb-32">
      <div className="scroll-progress" aria-hidden />

      {/* Hero: mesh gradient, fluid type, animated gradient text, parallax ornament. */}
      <section className="bg-mesh relative overflow-hidden rounded-2xl border p-6">
        <div
          aria-hidden
          className="bg-conic animate-morph parallax absolute -top-10 -right-10 size-40 opacity-40 blur-2xl"
          style={{ '--parallax': 0.25 } as CSSProperties}
        />
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Preset {preset || '…'}
        </p>
        <h1 className="text-gradient-animated text-hero mt-2 font-semibold tracking-tight">
          {env.VITE_APP_NAME}
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Every component below takes its look from the preset tokens. Dark is the default; the
          sun/moon switches with a wipe.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button className="hover-lift">Scan a bottle</Button>
          <ThemeToggle />
        </div>
      </section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading={loading} onClick={() => setLoading((v) => !v)}>
            {loading ? 'Saving' : 'Tap to load'}
          </Button>
        </div>
      </Section>

      <Section title="Gradients and glow">
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-glow space-y-1 rounded-2xl">
            <p className="text-sm text-muted-foreground">Rotating border</p>
            <p className="font-semibold">Pro bottle</p>
          </Card>
          <div className="bg-conic animate-spin-slow flex items-center justify-center rounded-2xl">
            <span className="glass rounded-xl px-3 py-1 text-sm font-semibold">Conic</span>
          </div>
          <Card className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setProgress((p) => (p >= 100 ? 12 : p + 16))}
              className="ring-progress focus-ring size-16 shrink-0"
              style={{ '--progress': progress, '--ring-thickness': '7px' } as CSSProperties}
              aria-label={`Progress ${progress}%. Tap to advance.`}
            />
            <div>
              <p className="font-semibold tabular-nums">{progress}%</p>
              <p className="text-sm text-muted-foreground">Conic ring</p>
            </div>
          </Card>
          <Card className="flex items-center justify-center">
            <Wine className="drop-glow size-10 text-primary" aria-hidden />
            <span className="sr-only">Glowing icon</span>
          </Card>
        </div>
      </Section>

      <Section title="Depth">
        <div className="grid grid-cols-3 gap-3">
          <div className="shadow-stack flex h-20 items-center justify-center rounded-xl bg-card text-xs">
            stacked
          </div>
          <div className="neu flex h-20 items-center justify-center rounded-xl text-xs">neu</div>
          <button
            type="button"
            onClick={() => setPressed((v) => !v)}
            className={cn(
              'focus-ring flex h-20 items-center justify-center rounded-xl text-xs transition-shadow duration-200 ease-soft',
              pressed ? 'neu-inset' : 'neu',
            )}
          >
            {pressed ? 'pressed' : 'tap me'}
          </button>
        </div>
      </Section>

      <Section title="Masks, clips, blends">
        <div className="grid grid-cols-3 gap-3">
          <div className="mask-fade-b bg-aurora h-24 rounded-xl" aria-hidden />
          <div className="clip-slant h-24 bg-primary" aria-hidden />
          <div className="bg-aurora relative h-24 overflow-hidden rounded-xl" aria-hidden>
            <div className="rounded-blob animate-morph absolute inset-3 bg-primary mix-blend-overlay" />
            <Sparkles className="absolute right-2 bottom-2 size-5 text-foreground mix-blend-difference" />
          </div>
        </div>
      </Section>

      <Section title="Motion">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className={cn(shaking && 'animate-shake')}
            onAnimationEnd={() => setShaking(false)}
            onClick={() => setShaking(true)}
          >
            Shake
          </Button>
          <Button variant="secondary" className="animate-pulse-ring">
            Pulse ring
          </Button>
          <Button
            key={pops}
            variant="secondary"
            className="animate-pop-in"
            onClick={() => setPops((n) => n + 1)}
          >
            Pop in
          </Button>
          <Button variant="secondary" className="hover-lift">
            Hover lift
          </Button>
          <Button variant="secondary" className="press">
            Press
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Sections fade in as you scroll (scroll-driven); the bar at the top is reading progress;
          the blob in the hero drifts with parallax. Routes cross-fade with View Transitions.
        </p>
      </Section>

      <Section title="Container queries and subgrid">
        <div className="grid grid-cols-2 gap-3">
          {shelf.map((bottle) => (
            <Card key={bottle.name} className="row-span-3 grid grid-rows-subgrid gap-1 @sm:p-5">
              <p className="font-semibold @sm:text-lg">{bottle.name}</p>
              <p className="text-sm text-muted-foreground">{bottle.note}</p>
              <p className="text-xs text-muted-foreground tabular-nums">{bottle.abv}% ABV</p>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Cards share row heights via subgrid; padding and type step up with the card's own width,
          not the viewport.
        </p>
      </Section>

      <Section title="Inputs">
        <Card className="space-y-4">
          <Input label="Bottle name" placeholder="As printed on the label" />
          <Input label="ABV" inputMode="decimal" hint="Percent, e.g. 40" />
          <Input label="Country" defaultValue="Venezuelа" error="Check the spelling" />
        </Card>
      </Section>

      <Section title="List in a card">
        <Card className="p-0">
          <ul className="divide-y">
            {rows.map((row) => (
              <li key={row.name} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{row.name}</p>
                  <p className="text-sm text-muted-foreground">{row.meta}</p>
                </div>
                <span className="flex items-center gap-0.5 text-sm text-warning-foreground">
                  {Array.from({ length: row.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-warning text-warning" aria-hidden />
                  ))}
                  <span className="sr-only">{row.rating} stars</span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Horizontal strip">
        <div className="mask-fade-x scrollbar-thin -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {[...shelf, ...shelf].map((bottle, i) => (
            <div key={i} className="surface-card w-40 shrink-0 rounded-xl p-3">
              <p className="truncate text-sm font-semibold">{bottle.name}</p>
              <p className="text-xs text-muted-foreground">{bottle.abv}%</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="States">
        <Card className="space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </Card>
        <Card>
          <EmptyState
            title="No bottles yet"
            description="Scan your first label and it will show up here."
            action={<Button variant="secondary">Scan a bottle</Button>}
          />
        </Card>
        <Card>
          <ErrorState onRetry={() => undefined} />
        </Card>
      </Section>

      <Section title="Type and colour">
        <Card className="space-y-2">
          <p className="text-display font-semibold tracking-tight">Display, fluid</p>
          <p className="text-title font-semibold">Title, fluid</p>
          <p className="text-base leading-relaxed">
            Body 16. Aged in ex-bourbon casks, then finished in sherry wood for a year.
          </p>
          <p className="text-sm text-muted-foreground">Caption 14, muted.</p>
        </Card>
        <div className="grid grid-cols-4 gap-2">
          {swatches.map(([cls, label]) => (
            <div key={cls} className="space-y-1">
              <div className={`${cls} h-12 rounded-lg border`} />
              <p className="text-center text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Floating control: glass with a specular edge. */}
      <button
        type="button"
        aria-label="Scan"
        className="glass glass-edge press focus-ring fixed right-5 bottom-20 flex size-14 items-center justify-center rounded-full text-primary"
      >
        <Camera className="size-6" aria-hidden />
      </button>
    </div>
  )
}
