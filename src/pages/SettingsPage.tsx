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
      <h1 className="text-display font-heading font-normal">Settings</h1>

      <Card className="space-y-3">
        <CardTitle className="font-heading font-normal">Bidding system</CardTitle>
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
                'focus-ring flex h-14 items-center justify-between rounded-md px-4 text-left transition-shadow duration-200 ease-soft',
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

      <Card className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
        <div>
          <CardTitle className="font-heading font-normal">Text size</CardTitle>
          <CardDescription>Larger makes everything bigger: cards, buttons, words.</CardDescription>
        </div>
        <div className="flex gap-2" role="radiogroup" aria-label="Text size">
          {(['normal', 'large'] as const).map((size) => (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={prefs.handSize === size}
              onClick={() => learner.setPrefs({ ...prefs, handSize: size })}
              className={cn(
                'focus-ring h-12 min-w-[5.5rem] rounded-md px-4 text-base capitalize transition-shadow duration-200 ease-soft',
                prefs.handSize === size ? 'neu-inset' : 'neu',
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
        <div>
          <CardTitle className="font-heading font-normal">Suit colours</CardTitle>
          <CardDescription>
            Four colours gives clubs and diamonds their own colour, so suits are easy to tell apart.
          </CardDescription>
        </div>
        <div className="flex gap-2" role="radiogroup" aria-label="Suit colours">
          {([false, true] as const).map((four) => (
            <button
              key={String(four)}
              type="button"
              role="radio"
              aria-checked={prefs.fourColour === four}
              onClick={() => learner.setPrefs({ ...prefs, fourColour: four })}
              className={cn(
                'focus-ring h-12 min-w-[5.5rem] rounded-md px-4 text-base transition-shadow duration-200 ease-soft',
                prefs.fourColour === four ? 'neu-inset' : 'neu',
              )}
            >
              {four ? 'Four' : 'Two'}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
        <div>
          <CardTitle className="font-heading font-normal">High contrast</CardTitle>
          <CardDescription>
            Stronger text, borders and suit colours for easier reading.
          </CardDescription>
        </div>
        <div className="flex gap-2" role="radiogroup" aria-label="High contrast">
          {(['high', 'normal'] as const).map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={prefs.contrast === level}
              onClick={() => learner.setPrefs({ ...prefs, contrast: level })}
              className={cn(
                'focus-ring h-12 min-w-[5.5rem] rounded-md px-4 text-base transition-shadow duration-200 ease-soft',
                prefs.contrast === level ? 'neu-inset' : 'neu',
              )}
            >
              {level === 'high' ? 'On' : 'Off'}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <CardTitle className="font-heading font-normal">Sounds</CardTitle>
          <CardDescription>
            Gentle plays a soft chime for right and wrong. Joker plays a fart when she gets one
            wrong and a cheer when she gets one right.
          </CardDescription>
        </div>
        <div className="flex gap-2" role="radiogroup" aria-label="Sounds">
          {(['off', 'gentle', 'joker'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={prefs.soundMode === m}
              onClick={() => learner.setPrefs({ ...prefs, soundMode: m })}
              className={cn(
                'focus-ring h-12 flex-1 rounded-md px-4 text-base capitalize transition-shadow duration-200 ease-soft',
                prefs.soundMode === m ? 'neu-inset' : 'neu',
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
        <div>
          <CardTitle className="font-heading font-normal">Tips while playing</CardTitle>
          <CardDescription>
            A one-line nudge at each decision. Hints are always available on request.
          </CardDescription>
        </div>
        <div className="flex gap-2" role="radiogroup" aria-label="Tips while playing">
          {([true, false] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              role="radio"
              aria-checked={prefs.tips === v}
              onClick={() => learner.setPrefs({ ...prefs, tips: v })}
              className={cn(
                'focus-ring h-12 min-w-[5.5rem] rounded-md px-4 text-base transition-shadow duration-200 ease-soft',
                prefs.tips === v ? 'neu-inset' : 'neu',
              )}
            >
              {v ? 'On' : 'Off'}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
        <div>
          <CardTitle className="font-heading font-normal">Appearance</CardTitle>
          <CardDescription>Dark by default. Tap to switch.</CardDescription>
        </div>
        <ThemeToggle />
      </Card>

      {configured ? (
        <Card className="space-y-3">
          <CardTitle className="font-heading font-normal">Account</CardTitle>
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
          <CardTitle className="font-heading font-normal">Your progress</CardTitle>
          <CardDescription>Saved on this device. No account needed.</CardDescription>
        </Card>
      )}

      {/* App stores require account deletion from inside the app. Keep this section. */}
      {configured && user && (
        <Card className="space-y-3">
          <CardTitle className="font-heading font-normal">Delete account</CardTitle>
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
