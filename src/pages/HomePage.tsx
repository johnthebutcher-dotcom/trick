import { ButtonLink, Card, CardDescription, CardTitle } from '@/components/ui'
import { EmptyState } from '@/components/states'
import { SetupNotice } from '@/components/SetupNotice'
import { useAuth } from '@/features/auth'

/**
 * Replace this with the app's real home screen. It demonstrates the three
 * states a screen can be in: unconfigured, signed out, signed in.
 */
export function HomePage() {
  const { user, configured } = useAuth()

  if (!configured) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <SetupNotice />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          title="Welcome"
          description="Sign in to start using the app."
          action={<ButtonLink to="/sign-in">Sign in</ButtonLink>}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card className="space-y-2">
        <CardTitle>You're in</CardTitle>
        <CardDescription>
          Signed in as {user.email ?? user.id}. Build the first feature here.
        </CardDescription>
      </Card>
    </div>
  )
}
