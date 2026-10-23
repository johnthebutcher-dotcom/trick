import { NavLink, Outlet, useLocation } from 'react-router'
import { BookOpen, Home, Settings, Spade } from 'lucide-react'
import { OfflineBanner } from '@/components/OfflineBanner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TopBar } from '@/components/TopBar'
import { cn } from '@/lib/utils'

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
  { to: '/', label: 'Today', icon: Home },
  { to: '/play', label: 'Play', icon: Spade },
  { to: '/sheet', label: 'Cheat-sheet', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  const { pathname } = useLocation()

  return (
    <div className="isolate flex min-h-dvh flex-col">
      <div aria-hidden className="app-backdrop" />
      <OfflineBanner />

      {/* No header bar — just a floating cluster in the top-right over the felt:
          the Finesse mark, fullscreen, and the sun/moon (also still in Settings). */}
      <TopBar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-2 pb-6 md:px-6">
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
