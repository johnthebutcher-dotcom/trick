/**
 * Local-first storage (IndexedDB via idb-keyval). Works offline and without
 * an account. When Supabase sync lands, this is the write-through cache.
 */
import { get, set } from 'idb-keyval'
import { useCallback, useEffect, useState } from 'react'
import type { ProgressMap } from './scheduler'
import type { SkillId, System } from './skills'

export interface Session {
  id: string
  skill: SkillId
  date: string
  startedAt: string
  finishedAt: string | null
  correct: number
  total: number
}

/** Off, gentle chimes, or the joker pack (farts and cheers). */
export type SoundMode = 'off' | 'gentle' | 'joker'

export interface Prefs {
  system: System
  handSize: 'normal' | 'large'
  soundMode: SoundMode
  tips: boolean
  /** Give clubs and diamonds their own colour so suits don't blur together. */
  fourColour: boolean
  contrast: 'normal' | 'high'
}

export const DEFAULT_PREFS: Prefs = {
  system: 'sayc',
  handSize: 'normal',
  soundMode: 'off',
  tips: true,
  fourColour: false,
  contrast: 'normal',
}

const KEYS = {
  progress: 'trick:progress',
  sessions: 'trick:sessions',
  prefs: 'trick:prefs',
} as const

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    return ((await get<T>(key)) as T | undefined) ?? fallback
  } catch {
    return fallback
  }
}
async function write<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value)
  } catch {
    /* storage unavailable (private mode); progress lives for this visit only */
  }
}

/** Mirrors the text-size preference onto <html> so CSS can scale everything. */
export function applyHandSize(size: Prefs['handSize']) {
  if (typeof document === 'undefined') return
  if (size === 'large') document.documentElement.dataset.size = 'large'
  else delete document.documentElement.dataset.size
}

/** Mirror the appearance prefs onto <html> so CSS can react: text size,
 *  four-colour suits, the readable font, and high-contrast mode. */
export function applyAppearance(prefs: Prefs) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  applyHandSize(prefs.handSize)
  if (prefs.fourColour) root.dataset.suits = 'four'
  else delete root.dataset.suits
  if (prefs.contrast === 'high') root.dataset.contrast = 'high'
  else delete root.dataset.contrast
}

export const store = {
  progress: () => read<ProgressMap>(KEYS.progress, {}),
  saveProgress: (map: ProgressMap) => write(KEYS.progress, map),
  sessions: () => read<Session[]>(KEYS.sessions, []),
  saveSessions: (list: Session[]) => write(KEYS.sessions, list),
  prefs: () => read<Prefs>(KEYS.prefs, DEFAULT_PREFS),
  savePrefs: (prefs: Prefs) => write(KEYS.prefs, prefs),
}

export interface LearnerState {
  progress: ProgressMap
  sessions: Session[]
  prefs: Prefs
}

type Status = 'loading' | 'ready' | 'error'

/** Loads everything once; exposes setters that persist. */
export function useLearner() {
  const [state, setState] = useState<LearnerState | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  const load = useCallback(() => {
    return Promise.all([store.progress(), store.sessions(), store.prefs()])
      .then(([progress, sessions, prefs]) => {
        const merged = { ...DEFAULT_PREFS, ...prefs }
        applyAppearance(merged)
        setState({ progress, sessions, prefs: merged })
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    let active = true
    void load().then(() => {
      if (!active) return
    })
    return () => {
      active = false
    }
  }, [load])

  const reload = useCallback(() => {
    setStatus('loading')
    void load()
  }, [load])

  const setProgress = useCallback((progress: ProgressMap) => {
    setState((s) => (s ? { ...s, progress } : s))
    void store.saveProgress(progress)
  }, [])
  const setSessions = useCallback((sessions: Session[]) => {
    setState((s) => (s ? { ...s, sessions } : s))
    void store.saveSessions(sessions)
  }, [])
  const setPrefs = useCallback((prefs: Prefs) => {
    applyAppearance(prefs)
    setState((s) => (s ? { ...s, prefs } : s))
    void store.savePrefs(prefs)
  }, [])

  return { state, status, reload, setProgress, setSessions, setPrefs }
}
