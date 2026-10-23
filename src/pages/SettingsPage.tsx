import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, ButtonLink, Card, CardDescription, CardTitle } from '@/components/ui'
import { ErrorState, LoadingState } from '@/components/states'
import { useAuth } from '@/features/auth'
import { deleteAccount } from '@/features/account/deleteAccount'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { SYSTEMS } from '@/features/bridge/skills'
import { useLearner } from '@/features/bridge/store'
import { errorMessage } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const { user, signOut, configured } = useAuth()
  const learner = useLearner()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (learner.status === 'loading' || !learner.state) return <LoadingState variant="screen" />
  if (learner.status === 'error') return <ErrorState onRetry={learner.reload} />
  const { prefs } = learner.state

  async function onDelete() {
    setBusy(true)
    setError(null)
    try {
      await deleteAccount()
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-display font-heading font-medium">Settings</h1>

      <Card className="space-y-3">
        <CardTitle className="font-heading font-medium">Bidding system</CardTitle>
        <div className="grid gap-2" role="radiogroup" aria-label="Bidding system">
          {SYSTEMS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={prefs.system === s.id}
              disabled={!s.available}
              onClick={() => learner.setPrefs({ ...prefs, system: s.id })}
              className={cn(
                'focus-ring flex h-12 items-center justify-between rounded-md px-4 text-left transition-shadow duration-200 ease-soft',
                prefs.system === s.id ? 'neu-inset' : 'neu',
                !s.available && 'opacity-50',
              )}
            >
              <span>{s.name}</span>
              <span className="text-xs text-muted-foreground">
                {!s.available ? 'coming soon' : prefs.system === s.id ? 'active' : ''}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex items-center justify-between gap-4">
        <div>
          <CardTitle className="font-heading font-medium">Card size</CardTitle>
          <CardDescription>Bigger cards for the iPad or tired eyes.</CardDescription>
        </div>
        <div className="flex gap-2" role="radiogroup" aria-label="Card size">
          {(['normal', 'large'] as const).map((size) => (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={prefs.handSize === size}
              onClick={() => learner.setPrefs({ ...prefs, handSize: size })}
              className={cn(
                'focus-ring h-11 rounded-md px-4 text-sm capitalize transition-shadow duration-200 ease-soft',
                prefs.handSize === size ? 'neu-inset' : 'neu',
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex items-center justify-between gap-4">
        <div>
          <CardTitle className="font-heading font-medium">Appearance</CardTitle>
          <CardDescription>Dark by default. Tap to switch.</CardDescription>
        </div>
        <ThemeToggle />
      </Card>

      {configured ? (
        <Card className="space-y-3">
          <CardTitle className="font-heading font-medium">Account</CardTitle>
          {user ? (
            <>
              <CardDescription>
                {user.email ?? user.id}. Progress syncs to this account.
              </CardDescription>
              <Button variant="secondary" onClick={() => void signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <CardDescription>Optional. Sign in to keep progress across devices.</CardDescription>
              <ButtonLink to="/sign-in" variant="secondary">
                Sign in
              </ButtonLink>
            </>
          )}
        </Card>
      ) : (
        <Card className="space-y-1">
          <CardTitle className="font-heading font-medium">Your progress</CardTitle>
          <CardDescription>Saved on this device. No account needed.</CardDescription>
        </Card>
      )}

      {/* App stores require account deletion from inside the app. Keep this section. */}
      {configured && user && (
        <Card className="space-y-3">
          <CardTitle className="font-heading font-medium">Delete account</CardTitle>
          <CardDescription>
            Removes your account and everything you've saved. This cannot be undone.
          </CardDescription>
          {confirming ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="danger" loading={busy} onClick={onDelete}>
                Yes, delete everything
              </Button>
              <Button variant="ghost" disabled={busy} onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirming(true)}>
              Delete my account
            </Button>
          )}
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
