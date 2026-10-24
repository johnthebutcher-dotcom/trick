import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Card } from '@/components/ui'
import { ErrorState, LoadingState } from '@/components/states'
import { rulesFor, SYSTEMS } from '@/features/bridge/systems'
import { useLearner } from '@/features/bridge/store'
import { cn } from '@/lib/utils'

/** The bidding ladder on one screen. Set your points and the matching rows light up. */
export function SheetPage() {
  const [points, setPoints] = useState<number | null>(null)
  const learner = useLearner()

  if (learner.status === 'loading' || !learner.state) return <LoadingState variant="screen" />
  if (learner.status === 'error') return <ErrorState onRetry={learner.reload} />

  const { system } = learner.state.prefs
  const sheet = rulesFor(system).sheet
  const systemName = SYSTEMS.find((s) => s.id === system)?.name ?? 'Standard American'

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-display font-heading font-normal">Cheat-sheet</h1>
        <p className="text-foreground/90">{systemName}. Count your points, then find the row.</p>
      </header>

      <Card className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.12em] text-muted-foreground uppercase">My points</p>
          <p className="text-display font-heading font-normal tabular-nums">
            {points === null ? '—' : points}
          </p>
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Adjust points">
          <button
            type="button"
            aria-label="Fewer points"
            onClick={() => setPoints((p) => Math.max(0, (p ?? 12) - 1))}
            className="neu focus-ring press flex size-14 items-center justify-center rounded-full"
          >
            <Minus className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="More points"
            onClick={() => setPoints((p) => Math.min(37, (p ?? 11) + 1))}
            className="neu focus-ring press flex size-14 items-center justify-center rounded-full"
          >
            <Plus className="size-5" aria-hidden />
          </button>
          {points !== null && (
            <button
              type="button"
              onClick={() => setPoints(null)}
              className="focus-ring min-h-11 px-2 text-base text-muted-foreground underline underline-offset-4"
            >
              Clear
            </button>
          )}
        </div>
      </Card>

      {sheet.map((section) => (
        <section key={section.id} className="reveal space-y-3">
          <h2 className="text-title font-heading font-normal">{section.title}</h2>
          {section.intro && <p className="text-base text-foreground/90">{section.intro}</p>}
          <Card className="p-0">
            <ul className="divide-y">
              {section.rows.map((row, i) => {
                const hit = points !== null && points >= row.min && points <= row.max
                const dim = points !== null && !hit
                return (
                  <li
                    key={i}
                    className={cn(
                      'flex flex-col gap-1 px-4 py-4 transition-colors duration-200 ease-soft',
                      hit && 'bg-accent text-accent-foreground',
                      dim && 'text-muted-foreground',
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-base font-medium tabular-nums">
                        {row.points} points
                      </span>
                      <span className="text-right font-heading text-xl">{row.bid}</span>
                    </div>
                    <span className="text-base">{row.shape}</span>
                  </li>
                )
              })}
            </ul>
          </Card>
        </section>
      ))}

      <p className="text-sm text-foreground/90">
        Classes vary on details. If your teacher says something different, the teacher wins.
      </p>
    </div>
  )
}
