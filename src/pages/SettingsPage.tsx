import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Card, CardDescription, CardTitle } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { deleteAccount } from '@/features/account/deleteAccount'
import { errorMessage } from '@/lib/utils'
import { ThemeToggle } from '@/features/theme/ThemeToggle'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <Card className="space-y-3">
        <CardTitle>Account</CardTitle>
        <CardDescription>{user?.email ?? user?.id}</CardDescription>
        <Button variant="secondary" onClick={() => void signOut()}>
          Sign out
        </Button>
      </Card>

      <Card className="flex items-center justify-between gap-4">
        <div>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Dark by default. Tap to switch.</CardDescription>
        </div>
        <ThemeToggle />
      </Card>

      {/* App stores require account deletion from inside the app. Keep this section. */}
      <Card className="space-y-3">
        <CardTitle>Delete account</CardTitle>
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
    </div>
  )
}
