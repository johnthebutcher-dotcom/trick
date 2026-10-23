import { useCallback, useSyncExternalStore } from 'react'

/**
 * Tracks whether a user has finished onboarding, per user, in localStorage.
 * Good enough for a first-run tour; move it to the `profiles` table if the
 * app needs it across devices.
 */
const PREFIX = 'onboarding:done:'
const listeners = new Set<() => void>()

function notify() {
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function read(userId: string): boolean {
  try {
    return localStorage.getItem(PREFIX + userId) === '1'
  } catch {
    return true // storage blocked: do not trap the user in onboarding
  }
}

export function useOnboarding(userId: string | null) {
  const done = useSyncExternalStore(
    subscribe,
    () => (userId ? read(userId) : true),
    () => true,
  )

  const complete = useCallback(() => {
    if (!userId) return
    try {
      localStorage.setItem(PREFIX + userId, '1')
    } catch {
      /* ignore */
    }
    notify()
  }, [userId])

  return { done, complete }
}
