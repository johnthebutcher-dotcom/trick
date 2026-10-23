import { useState, type MouseEvent } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { withViewTransition } from '@/lib/motion'
import { presetIsDarkOnly, useTheme } from './useTheme'

/**
 * Sun/moon button. Dark is the default; tapping switches to light and back,
 * with a circular wipe from the tap point where View Transitions exist.
 * Renders nothing in dark-only presets.
 *
 * effects-allow: withViewTransition, press (shell default)
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme()
  const [darkOnly] = useState(presetIsDarkOnly)
  if (darkOnly) return null

  const next = mode === 'dark' ? 'light' : 'dark'
  const Icon = mode === 'dark' ? Sun : Moon

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    void withViewTransition(() => setMode(next), {
      kind: 'theme',
      origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={cn(
        'press focus-ring inline-flex size-11 items-center justify-center rounded-full bg-muted text-foreground',
        className,
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  )
}
