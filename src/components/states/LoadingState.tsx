import { Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface LoadingStateProps {
  label?: string
  /** Use `screen` for whole-page loads (centred in the viewport). */
  variant?: 'inline' | 'screen'
  className?: string
}

export function LoadingState({
  label = 'Loading',
  variant = 'inline',
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-muted-foreground',
        variant === 'screen' ? 'min-h-[60dvh]' : 'py-12',
        className,
      )}
    >
      <Spinner className="size-6" label={label} />
      <p className="text-sm">{label}</p>
    </div>
  )
}

/** A block-shaped placeholder for content that is still loading. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton rounded-md', className)} />
}
