import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import { Maximize, Minimize } from 'lucide-react'
import { ThemeToggle } from '@/features/theme/ThemeToggle'

/**
 * The floating top-right cluster over the felt: a small Finesse mark (taps back
 * to Today), a fullscreen toggle, and the sun/moon. No header bar — these sit
 * loose in the corner. The fullscreen button hides itself when it can't help:
 * when the app is already installed to the home screen (standalone), it's
 * fullscreen already; iPhone Safari has no Fullscreen API, so nothing to toggle.
 *
 * effects-allow: press (shell default)
 */
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
      className="app-pill press focus-ring inline-flex size-11 items-center justify-center rounded-full"
    >
      <Icon className="size-5" aria-hidden />
    </button>
  )
}

export function TopBar() {
  return (
    <div className="app-topbar pt-safe pr-safe sticky top-0 z-30 flex items-center justify-end gap-2 px-4 pb-2 md:px-6">
      <NavLink
        to="/"
        end
        aria-label="Finesse — go to Today"
        className="app-logo inline-flex items-center gap-1.5 pr-1 font-heading text-lg"
      >
        <span aria-hidden>♠</span>
        Finesse
      </NavLink>
      <FullscreenButton />
      <ThemeToggle className="app-pill" />
    </div>
  )
}
