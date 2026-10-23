import { useCallback, useMemo, useState } from 'react'
import { withViewTransition } from '@/lib/motion'
import { buildQuestion, type Question, type SkillId, type System } from './skills'
import { planDrill, record, today, type ProgressMap } from './scheduler'
import type { Session } from './store'

export interface Answered {
  question: Question
  chosen: string
  correct: boolean
}

export interface DrillState {
  ids: string[]
  index: number
  question: Question | null
  chosen: string | null
  answered: Answered[]
  finished: boolean
  dueCount: number
  skill: SkillId
}

/**
 * One drill session: 8 questions, tap to answer, see why, next. Progress is
 * written after every answer so closing the app mid-drill loses nothing.
 */
export function useDrill(
  progress: ProgressMap,
  setProgress: (p: ProgressMap) => void,
  sessions: Session[],
  setSessions: (s: Session[]) => void,
  skill?: SkillId,
  system: System = 'sayc',
) {
  // Planned once per mount; the page remounts (key) for a new drill.
  const [plan] = useState(() => planDrill(progress, skill, system))
  const [sessionId] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  const [startedAt] = useState(() => new Date().toISOString())
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [answered, setAnswered] = useState<Answered[]>([])
  const [finished, setFinished] = useState(false)
  // Progress as it evolves during this drill (the prop may lag a render behind).
  const [live, setLive] = useState(progress)

  const question = useMemo(() => buildQuestion(plan.ids[index] ?? ''), [plan, index])

  const answer = useCallback(
    (option: string) => {
      if (!question || chosen) return
      const correct = option === question.answer
      setChosen(option)
      setAnswered((a) => [...a, { question, chosen: option, correct }])
      const next = record(live, question.id, question.skill, correct)
      setLive(next)
      setProgress(next)
    },
    [question, chosen, live, setProgress],
  )

  const finish = useCallback(
    (list: Answered[]) => {
      const session: Session = {
        id: sessionId,
        skill: plan.skill,
        date: today(),
        startedAt,
        finishedAt: new Date().toISOString(),
        correct: list.filter((a) => a.correct).length,
        total: list.length,
      }
      setSessions([...sessions.filter((s) => s.id !== sessionId), session])
      setFinished(true)
    },
    [sessionId, plan.skill, startedAt, sessions, setSessions],
  )

  const next = useCallback(() => {
    if (index + 1 >= plan.ids.length) {
      finish(answered)
      return
    }
    void withViewTransition(() => {
      setIndex((i) => i + 1)
      setChosen(null)
    })
  }, [index, plan.ids.length, finish, answered])

  const state: DrillState = {
    ids: plan.ids,
    index,
    question,
    chosen,
    answered,
    finished,
    dueCount: plan.dueCount,
    skill: plan.skill,
  }
  return { state, answer, next }
}
