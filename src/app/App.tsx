import { BrowserRouter, HashRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '@/features/auth'
import { AppShell } from './AppShell'
import { ProtectedRoute } from './ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { SignInPage } from '@/pages/SignInPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { StyleguidePage } from '@/pages/StyleguidePage'
import { env } from '@/lib/env'

// Static previews (artifacts, GitHub Pages) have no SPA rewrite, so they use hash routing.
const Router = env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter

/**
 * Route table. Public routes render inside the shell too, so the offline
 * banner and header are always present. Add new signed-in screens under
 * <ProtectedRoute>.
 */
export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={env.VITE_PREVIEW === '1' ? <StyleguidePage /> : <HomePage />} />
            <Route path="styleguide" element={<StyleguidePage />} />
            <Route path="sign-in" element={<SignInPage />} />
            <Route path="auth/callback" element={<AuthCallbackPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}
