import { RED_SUITS, SUIT_NAME, SUIT_SYMBOL, SUITS, type Hand } from '@/features/bridge/cards'
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
      className={cn('shadow-stack rounded-lg border bg-card px-5 py-4', className)}
      aria-label="Your hand"
    >
      <ul className="space-y-2">
        {SUITS.map((suit) => {
          const red = RED_SUITS.has(suit)
          const ranks = hand[suit]
          return (
            <li key={suit} className="flex items-baseline gap-4">
              <span
                className={cn(
                  'w-8 shrink-0 text-center font-heading',
                  size === 'large' ? 'text-4xl' : 'text-3xl',
                  red ? 'text-suit-red' : 'text-suit-black',
                )}
                aria-label={SUIT_NAME[suit]}
              >
                {SUIT_SYMBOL[suit]}
              </span>
              <span
                className={cn(
                  'font-heading tracking-[0.18em] tabular-nums',
                  size === 'large' ? 'text-3xl' : 'text-2xl',
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
