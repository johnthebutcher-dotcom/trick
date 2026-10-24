import { SUIT_NAME, SUIT_SYMBOL, type Card } from '@/features/bridge/cards'
import { cn } from '@/lib/utils'

const rankText = (r: Card['rank']) => (r === 'T' ? '10' : r)

export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** One card footprint, shared by faces and backs so every card is the same size. */
const SIZE: Record<CardSize, string> = {
  xs: 'h-9 w-7',
  sm: 'h-11 w-8',
  md: 'h-14 w-10',
  lg: 'h-[4.5rem] w-[3.25rem]',
  xl: 'h-[5.5rem] w-[4rem]',
}
/** Corner index (rank over suit, top-left) — readable even when cards overlap. */
const INDEX_RANK: Record<CardSize, string> = {
  xs: 'text-[0.6rem]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}
const INDEX_SUIT: Record<CardSize, string> = {
  xs: 'text-[0.5rem]',
  sm: 'text-[0.6rem]',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-base',
}
/** Centre pip — the big suit symbol on the fully-visible card. */
const PIP: Record<CardSize, string> = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
}

/**
 * A playing-card face: warm ivory, a bold rank-over-suit index in the top-left
 * corner (so a fanned, overlapping hand stays readable), and a large suit pip in
 * the centre of the fully-visible card. A fine border and restrained shadow.
 * A button when `onClick` is given. Suit colour comes from the `suit-ink-*`
 * class, so the four-colour option flows through.
 */
export function CardChip({
  card,
  onClick,
  disabled,
  size = 'md',
  highlight,
  selectable,
  className,
}: {
  card: Card
  onClick?: () => void
  disabled?: boolean
  size?: CardSize
  highlight?: boolean
  /** During bidding the hand is reference only — no press/hover affordance. */
  selectable?: boolean
  className?: string
}) {
  const r = rankText(card.rank)
  const sym = SUIT_SYMBOL[card.suit]
  const body = (
    <>
      <span className="absolute top-0.5 left-1 flex flex-col items-center leading-none">
        <span className={cn('font-bold', INDEX_RANK[size])}>{r}</span>
        <span className={cn('-mt-px leading-none', INDEX_SUIT[size])}>{sym}</span>
      </span>
      <span className={cn('leading-none opacity-90', PIP[size])} aria-hidden>
        {sym}
      </span>
    </>
  )
  const classes = cn(
    'card-face relative inline-flex items-center justify-center overflow-hidden rounded-md border',
    SIZE[size],
    `suit-ink-${card.suit}`,
    highlight && 'z-20 ring-3 ring-primary',
    onClick && selectable && !disabled && 'press focus-ring cursor-pointer hover-lift',
    disabled && onClick && 'opacity-45',
    className,
  )
  const label = `${r} of ${SUIT_NAME[card.suit]}`
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={classes}
      >
        {body}
      </button>
    )
  }
  return (
    <span role="img" aria-label={label} className={classes}>
      {body}
    </span>
  )
}

/** The back of a concealed card: patterned, with clear edges and a soft shadow. */
export function CardBack({ className, size = 'md' }: { className?: string; size?: CardSize }) {
  return <span aria-hidden className={cn('card-back rounded-md border', SIZE[size], className)} />
}
