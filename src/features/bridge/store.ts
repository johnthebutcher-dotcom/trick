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

export interface Prefs {
  system: System
  handSize: 'normal' | 'large'
  sound: boolean
}

export const DEFAULT_PREFS: Prefs = { system: 'sayc', handSize: 'normal', sound: false }

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
        setState({ progress, sessions, prefs: { ...DEFAULT_PREFS, ...prefs } })
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
    setState((s) => (s ? { ...s, prefs } : s))
    void store.savePrefs(prefs)
  }, [])

  return { state, status, reload, setProgress, setSessions, setPrefs }
}
