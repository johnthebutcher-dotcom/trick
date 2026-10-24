import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { Button, Card, CardDescription, CardTitle, Input } from '@/components/ui'
import { SetupNotice } from '@/components/SetupNotice'
import { signInWithEmail, signInWithProvider, useAuth } from '@/features/auth'
import { errorMessage } from '@/lib/utils'

export function SignInPage() {
  const { user, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  if (!configured) {
    return (
      <div className="mx-auto w-full max-w-md pt-6">
        <SetupNotice />
      </div>
    )
  }
  if (user) return <Navigate to="/" replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setStatus('sending')
    try {
      await signInWithEmail(email.trim())
      setStatus('sent')
    } catch (err) {
      setError(errorMessage(err, 'Could not send the sign-in link.'))
      setStatus('idle')
    }
  }

  async function onProvider(provider: 'apple' | 'google') {
    setError(null)
    try {
      await signInWithProvider(provider)
    } catch (err) {
      setError(errorMessage(err, 'Could not start sign-in.'))
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4 pt-6">
      <Card className="space-y-4">
        <div className="space-y-1">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>We'll email you a link. No password needed.</CardDescription>
        </div>

        {status === 'sent' ? (
          <p className="text-sm" role="status">
            Check <strong>{email}</strong> for your sign-in link.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error ?? undefined}
            />
            <Button type="submit" block loading={status === 'sending'}>
              Send link
            </Button>
          </form>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Enable providers in Supabase → Authentication → Providers before shipping. */}
        <div className="grid gap-2">
          <Button variant="secondary" block onClick={() => onProvider('apple')}>
            Continue with Apple
          </Button>
          <Button variant="secondary" block onClick={() => onProvider('google')}>
            Continue with Google
          </Button>
        </div>
      </Card>
    </div>
  )
}
