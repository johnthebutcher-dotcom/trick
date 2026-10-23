import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  title: string
  description?: string
  /** Usually one Button. */
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

/** Shown wherever a list or view has nothing in it yet. One sentence, one action. */
export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}
      role="status"
    >
      <div className="text-muted-foreground">
        {icon ?? <Inbox className="size-10" aria-hidden />}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
