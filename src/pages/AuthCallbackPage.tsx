import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { LoadingState, ErrorState } from '@/components/states'
import { useAuth } from '@/features/auth'

/**
 * Landing page for magic links and OAuth. The Supabase client exchanges the
 * code in the URL for a session on its own (detectSessionInUrl + PKCE); this
 * page just waits for that to happen, then sends the user on.
 */
export function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setTimedOut(true), 10_000)
    return () => window.clearTimeout(id)
  }, [])

  const params = new URLSearchParams(location.search)
  const providerError = params.get('error_description') ?? params.get('error')

  if (providerError) {
    return <ErrorState title="Sign-in failed" message={providerError} />
  }
  if (user) return <Navigate to="/" replace />
  if (!loading && timedOut) {
    return (
      <ErrorState
        title="That link didn't work"
        message="It may have expired or already been used. Request a new one."
        onRetry={() => window.location.assign('/sign-in')}
      />
    )
  }
  return <LoadingState variant="screen" label="Signing you in" />
}
