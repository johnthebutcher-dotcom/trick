import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * A raised surface. Its material comes from the preset (`surface-card`): a
 * plain card in most presets, liquid glass in aurora-glass. Never nest cards.
 */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'surface-card @container isolate rounded-xl p-4 text-card-foreground',
        className,
      )}
      {...rest}
    />
  )
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold', className)} {...rest} />
}

export function CardDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...rest} />
}
