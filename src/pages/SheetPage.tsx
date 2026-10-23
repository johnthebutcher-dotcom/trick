import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Card } from '@/components/ui'
import { SAYC_SHEET } from '@/features/bridge/sheet'
import { cn } from '@/lib/utils'

/** The bidding ladder on one screen. Set your points and the matching rows light up. */
export function SheetPage() {
  const [points, setPoints] = useState<number | null>(null)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-display font-heading font-medium">Cheat-sheet</h1>
        <p className="text-muted-foreground">
          Standard American. Count your points, then find the row.
        </p>
      </header>

      <Card className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.12em] text-muted-foreground uppercase">My points</p>
          <p className="text-display font-heading font-medium tabular-nums">
            {points === null ? '—' : points}
          </p>
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Adjust points">
          <button
            type="button"
            aria-label="Fewer points"
            onClick={() => setPoints((p) => Math.max(0, (p ?? 12) - 1))}
            className="neu focus-ring press flex size-12 items-center justify-center rounded-full"
          >
            <Minus className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="More points"
            onClick={() => setPoints((p) => Math.min(37, (p ?? 11) + 1))}
            className="neu focus-ring press flex size-12 items-center justify-center rounded-full"
          >
            <Plus className="size-5" aria-hidden />
          </button>
          {points !== null && (
            <button
              type="button"
              onClick={() => setPoints(null)}
              className="focus-ring px-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </Card>

      {SAYC_SHEET.map((section) => (
        <section key={section.id} className="reveal space-y-3">
          <h2 className="text-title font-heading font-medium">{section.title}</h2>
          {section.intro && <p className="text-sm text-muted-foreground">{section.intro}</p>}
          <Card className="p-0">
            <ul className="divide-y">
              {section.rows.map((row, i) => {
                const hit = points !== null && points >= row.min && points <= row.max
                const dim = points !== null && !hit
                return (
                  <li
                    key={i}
                    className={cn(
                      'grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 px-4 py-3 transition-colors duration-200 ease-soft',
                      hit && 'bg-accent text-accent-foreground',
                      dim && 'text-muted-foreground',
                    )}
                  >
                    <span className="text-sm tabular-nums">{row.points}</span>
                    <span className="text-sm">{row.shape}</span>
                    <span className="font-heading text-lg font-medium">{row.bid}</span>
                  </li>
                )
              })}
            </ul>
          </Card>
        </section>
      ))}

      <p className="text-sm text-muted-foreground">
        Classes vary on details. If your teacher says something different, the teacher wins.
      </p>
    </div>
  )
}
