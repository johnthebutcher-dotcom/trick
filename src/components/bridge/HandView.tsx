import { HAND_SUITS, SUIT_NAME, SUIT_SYMBOL, type Hand } from '@/features/bridge/cards'
import { cn } from '@/lib/utils'

/**
 * A 13-card hand as four suit rows, big enough to read at arm's length.
 * This is the thing on screen during every drill, so it carries the shadow
 * stack (the one floating element) and nothing else competes with it.
 */
export function HandView({
  hand,
  size = 'normal',
  className,
}: {
  hand: Hand
  size?: 'normal' | 'large'
  className?: string
}) {
  return (
    <div
      className={cn(
        'shadow-stack rounded-lg border bg-card px-5 py-4 text-card-foreground',
        className,
      )}
      aria-label="Your hand"
    >
      <ul className="space-y-3">
        {HAND_SUITS.map((suit) => {
          const ranks = hand[suit]
          return (
            <li key={suit} className="flex items-baseline gap-4">
              <span
                aria-hidden
                className={cn(
                  'w-9 shrink-0 text-center font-heading',
                  size === 'large' ? 'text-5xl' : 'text-4xl',
                  `suit-ink-${suit}`,
                )}
              >
                {SUIT_SYMBOL[suit]}
              </span>
              <span className="sr-only">
                {SUIT_NAME[suit]}:{' '}
                {ranks.length ? ranks.map((r) => (r === 'T' ? '10' : r)).join(' ') : 'none'}
              </span>
              <span
                aria-hidden
                className={cn(
                  'font-heading font-bold tracking-[0.18em] tabular-nums',
                  size === 'large' ? 'text-4xl' : 'text-3xl',
                  ranks.length === 0 && 'text-muted-foreground',
                )}
              >
                {ranks.length ? ranks.map((r) => (r === 'T' ? '10' : r)).join(' ') : '—'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
