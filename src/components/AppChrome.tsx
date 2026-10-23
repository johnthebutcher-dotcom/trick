import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { BookOpen, Home, Maximize, Minimize, Settings, Spade } from 'lucide-react'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { cn } from '@/lib/utils'

/**
 * The app's only chrome: no bars. The Finesse mark, the four tabs, fullscreen
 * and the sun/moon all float over the felt as matching cream tools, tucked to
 * the bottom edge. Labels show on tablets (icons + text) and hide on phones
 * (icons only). Styling (cream ink, active accent, transparent toggle) lives in
 * the card-room preset under `.app-chrome`.
 *
 * effects-allow: viewTransition, press (shell defaults)
 */
const tabs = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/play', label: 'Play', icon: Spade, end: false },
  { to: '/sheet', label: 'Cheat-sheet', icon: BookOpen, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

function canFullscreen(): boolean {
  if (typeof document === 'undefined') return false
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: unknown }
  const hasApi = Boolean(el.requestFullscreen || el.webkitRequestFullscreen)
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  return hasApi && !standalone
}

function FullscreenButton() {
  const [supported] = useState(canFullscreen)
  const [isFull, setIsFull] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  if (!supported) return null

  async function toggle() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      /* some browsers reject without a user gesture; ignore */
    }
  }

  const Icon = isFull ? Minimize : Maximize
  const label = isFull ? 'Exit fullscreen' : 'Fullscreen'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="press focus-ring inline-flex min-h-11 items-center justify-center rounded-full px-2"
    >
      <Icon className="size-6" aria-hidden />
    </button>
  )
}

export function AppChrome() {
  return (
    <div
      className="app-chrome pl-safe pr-safe sticky bottom-0 z-30 flex items-end justify-between gap-1 px-3 pt-1.5 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
      aria-label="App controls"
    >
      <Link to="/" aria-label="Finesse — Today" className="brand mb-1.5 text-lg whitespace-nowrap">
        <span aria-hidden>♠</span> Finesse
      </Link>

      <nav className="flex items-end gap-0.5 sm:gap-1" aria-label="Primary">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            viewTransition
            className={({ isActive }) =>
              cn(
                'flex min-h-11 flex-col items-center justify-end gap-0.5 px-2 transition-colors duration-150 ease-soft',
                !isActive && 'opacity-85',
              )
            }
          >
            <Icon className="size-6" aria-hidden />
            <span className="hidden text-[0.65rem] leading-none font-bold md:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex items-end gap-0.5">
        <FullscreenButton />
        <ThemeToggle className="mb-px size-11" />
      </div>
    </div>
  )
}
