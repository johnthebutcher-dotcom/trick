import { NavLink, Outlet, useLocation } from 'react-router'
import { Home, Settings } from 'lucide-react'
import { OfflineBanner } from '@/components/OfflineBanner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { env } from '@/lib/env'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/features/theme/ThemeToggle'

/**
 * The frame every screen renders inside: backdrop art, offline banner, header,
 * content, bottom tab bar on phones. The header and tab bar take their material
 * from the active preset (`surface-shell`), and the backdrop renders whatever
 * the preset defines (nothing by default, an animated aurora in aurora-glass).
 * Add tabs in `tabs` below.
 *
 * effects-allow: viewTransition (shell default; remove the prop on NavLink to turn off)
 */
const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  const { pathname } = useLocation()

  return (
    <div className="isolate flex min-h-dvh flex-col">
      <div aria-hidden className="app-backdrop" />
      <OfflineBanner />

      <header className="surface-shell pt-safe sticky top-0 z-20 border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <span className="font-heading text-lg font-semibold">{env.VITE_APP_NAME}</span>
          <ThemeToggle className="size-9" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6">
        <ErrorBoundary>
          {/* Keyed on the path so each screen fades up on navigation. */}
          <div key={pathname} className="animate-fade-up">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>

      <nav className="surface-shell pb-safe sticky bottom-0 z-20 border-t" aria-label="Primary">
        <ul className="mx-auto flex max-w-5xl">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === '/'}
                viewTransition
                className={({ isActive }) =>
                  cn(
                    'flex h-14 flex-col items-center justify-center gap-0.5 text-xs',
                    'transition-colors duration-150 ease-soft',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )
                }
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
