import { CardBack, type CardSize } from './CardChip'
import { cn } from '@/lib/utils'

/**
 * A concealed hand shown as overlapping card backs — a shallow horizontal fan
 * for the seat across the top, a compact vertical fan for the seats on the
 * sides. `count` is how many cards remain in the hand.
 */
export function Fan({
  count,
  orient,
  size = 'sm',
  className,
}: {
  count: number
  orient: 'horizontal' | 'vertical'
  size?: CardSize
  className?: string
}) {
  const n = Math.max(0, count)
  const overlap = orient === 'horizontal' ? '-ml-5' : '-mt-9'
  return (
    <div
      className={cn(
        'flex',
        orient === 'horizontal' ? 'justify-center' : 'flex-col items-center',
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: n }).map((_, i) => (
        <CardBack key={i} size={size} className={i > 0 ? overlap : undefined} />
      ))}
    </div>
  )
}
