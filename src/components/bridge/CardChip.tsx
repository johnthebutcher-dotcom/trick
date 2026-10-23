import { SUIT_NAME, SUIT_SYMBOL, type Card } from '@/features/bridge/cards'
import { cn } from '@/lib/utils'

const rankText = (r: Card['rank']) => (r === 'T' ? '10' : r)

/** A playing card face. As a button when `onClick` is given. */
export function CardChip({
  card,
  onClick,
  disabled,
  size = 'md',
  highlight,
  className,
}: {
  card: Card
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  highlight?: boolean
  className?: string
}) {
  const body = (
    <>
      <span
        className={cn(
          'leading-none font-bold',
          size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-sm',
        )}
      >
        {rankText(card.rank)}
      </span>
      <span
        className={cn(
          'leading-none',
          size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-xs',
        )}
      >
        {SUIT_SYMBOL[card.suit]}
      </span>
    </>
  )
  const classes = cn(
    'inline-flex flex-col items-center justify-center gap-0 rounded-md border bg-card text-card-foreground shadow-card',
    size === 'lg' ? 'h-16 w-11' : size === 'md' ? 'h-14 w-10' : 'h-10 w-7',
    `suit-ink-${card.suit}`,
    highlight && 'ring-4 ring-primary',
    onClick && !disabled && 'press focus-ring cursor-pointer hover-lift',
    disabled && onClick && 'opacity-40',
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

/** The back of a card, for hidden hands. */
export function CardBack({ className, size = 'sm' }: { className?: string; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block rounded-md border border-foreground/30 bg-primary/70',
        size === 'md' ? 'h-16 w-12' : 'h-10 w-7',
        className,
      )}
    />
  )
}
