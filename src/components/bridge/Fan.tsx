import { CardBack, type CardSize } from './CardChip'
import { cn } from '@/lib/utils'

/** Overlap per size: horizontal fans show ~half of each covered back, vertical
 *  fans overlap harder so a 13-card side fan stays compact next to the centre. */
const H_OVERLAP: Record<CardSize, string> = {
  xs: '-ml-3.5',
  sm: '-ml-4',
  md: '-ml-5',
  lg: '-ml-7',
  xl: '-ml-8',
}
const V_OVERLAP: Record<CardSize, string> = {
  xs: '-mt-6',
  sm: '-mt-7',
  md: '-mt-9',
  lg: '-mt-11',
  xl: '-mt-14',
}

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
  const overlap = orient === 'horizontal' ? H_OVERLAP[size] : V_OVERLAP[size]
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
