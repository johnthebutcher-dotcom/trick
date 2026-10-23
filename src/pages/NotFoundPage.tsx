import { ButtonLink } from '@/components/ui'
import { EmptyState } from '@/components/states'

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="The link may be old or mistyped."
      action={
        <ButtonLink to="/" variant="secondary">
          Go home
        </ButtonLink>
      }
    />
  )
}
