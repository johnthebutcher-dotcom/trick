import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth'
import { useOnboarding } from '@/features/onboarding/useOnboarding'
import { LoadingState } from '@/components/states'

/**
 * Gate for signed-in screens. Unconfigured -> home shows the setup notice;
 * signed out -> /sign-in (remembering where they were going);
 * first run -> /onboarding.
 */
export function ProtectedRoute() {
  const { user, loading, configured } = useAuth()
  const { done } = useOnboarding(user?.id ?? null)
  const location = useLocation()

  if (!configured) return <Navigate to="/" replace />
  if (loading) return <LoadingState variant="screen" />
  if (!user) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  if (!done && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />

  return <Outlet />
}
