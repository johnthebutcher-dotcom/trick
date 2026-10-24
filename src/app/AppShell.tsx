import { Outlet, useLocation } from 'react-router'
import { OfflineBanner } from '@/components/OfflineBanner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppChrome } from '@/components/AppChrome'

/**
 * The frame every screen renders inside: the felt backdrop, the offline banner,
 * the content, and the floating chrome (nav + fullscreen + sun/moon) tucked to
 * the bottom over the felt. No bars — see `AppChrome` and the card-room preset.
 */
export function AppShell() {
  const { pathname } = useLocation()

  return (
    <div className="isolate flex min-h-dvh flex-col">
      <div aria-hidden className="app-backdrop" />
      <OfflineBanner />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:px-6">
        <ErrorBoundary>
          {/* Keyed on the path so each screen fades up on navigation. */}
          <div key={pathname} className="animate-fade-up flex min-h-0 flex-1 flex-col">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>

      <AppChrome />
    </div>
  )
}
