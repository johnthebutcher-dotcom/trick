import { useCallback, useSyncExternalStore } from 'react'

/**
 * Colour mode. Dark by default; `light` is the opt-in. Stored per device and
 * applied as data-theme on <html> (every preset honours it; dark-only presets
 * ignore it). index.html applies the stored value before first paint.
 */
export type ThemeMode = 'dark' | 'light'

export const THEME_KEY = 'theme:mode'
export const DEFAULT_THEME: ThemeMode = 'dark'
const listeners = new Set<() => void>()

export function readTheme(): ThemeMode {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode
}

/** True when the active preset is dark-only (its --preset-mode token is 'dark'). */
export function presetIsDarkOnly(): boolean {
  if (typeof document === 'undefined') return false
  const value = getComputedStyle(document.documentElement).getPropertyValue('--preset-mode')
  return value.trim().replace(/^['"]|['"]$/g, '') === 'dark'
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useTheme() {
  const mode = useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME)
  const setMode = useCallback((next: ThemeMode) => {
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* storage blocked: still apply for this page view */
    }
    applyTheme(next)
    for (const l of listeners) l()
  }, [])
  return { mode, setMode }
}

/** Call once at startup so a stored choice applies before React renders. */
export function initTheme() {
  applyTheme(readTheme())
}
