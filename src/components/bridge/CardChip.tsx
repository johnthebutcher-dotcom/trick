import { SUIT_NAME, SUIT_SYMBOL, type Card } from '@/features/bridge/cards'
import { cn } from '@/lib/utils'

const rankText = (r: Card['rank']) => (r === 'T' ? '10' : r)

export type CardSize = 'xs' | 'sm' | 'md' | 'lg'

/** One card footprint, shared by faces and backs so every card is the same size. */
const SIZE: Record<CardSize, string> = {
  xs: 'h-9 w-7',
  sm: 'h-11 w-8',
  md: 'h-14 w-10',
  lg: 'h-16 w-12',
}
const RANK_TEXT: Record<CardSize, string> = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}
const SUIT_TEXT: Record<CardSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}
/** Hearts and diamonds render a touch small next to spades/clubs, so bump them. */
const SUIT_TEXT_RED: Record<CardSize, string> = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

/**
 * A playing-card face: warm ivory, crisp rank and suit, a fine border and a
 * restrained shadow. A button when `onClick` is given. Suit colour comes from
 * the `suit-ink-*` class, so the four-colour option flows through.
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
  const red = card.suit === 'H' || card.suit === 'D'
  const body = (
    <>
      <span className={cn('leading-none font-bold', RANK_TEXT[size])}>{rankText(card.rank)}</span>
      <span className={cn('leading-none', red ? SUIT_TEXT_RED[size] : SUIT_TEXT[size])}>
        {SUIT_SYMBOL[card.suit]}
      </span>
    </>
  )
  const classes = cn(
    'card-face inline-flex flex-col items-center justify-center gap-0 rounded-md border',
    SIZE[size],
    `suit-ink-${card.suit}`,
    highlight && 'z-10 ring-3 ring-primary',
    onClick && selectable && !disabled && 'press focus-ring cursor-pointer hover-lift',
    disabled && onClick && 'opacity-45',
    className,
  )
  const label = `${rankText(card.rank)} of ${SUIT_NAME[card.suit]}`
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
