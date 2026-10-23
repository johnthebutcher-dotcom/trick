/**
 * Spaced repetition, the simple version. Each question the learner has seen
 * has a step on the interval ladder and a due date. Wrong answers go back to
 * step 0 (due tomorrow); right answers move one step up. "Today's drill" is
 * due questions first, then new ones from the current skill, up to 8.
 */
import { questionId, SKILLS, type SkillId, type System } from './skills'

export const INTERVALS = [1, 3, 7, 16, 35] as const
export const DRILL_SIZE = 8

export interface Progress {
  id: string
  skill: SkillId
  step: number
  /** ISO date (YYYY-MM-DD) when this question is next due. */
  due: string
  seen: number
  correct: number
  updatedAt: string
}

export type ProgressMap = Record<string, Progress>

export function today(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function record(
  map: ProgressMap,
  id: string,
  skill: SkillId,
  wasCorrect: boolean,
  now = new Date(),
): ProgressMap {
  const prev = map[id]
  const step = wasCorrect ? Math.min((prev?.step ?? -1) + 1, INTERVALS.length - 1) : 0
  const next: Progress = {
    id,
    skill,
    step,
    due: addDays(today(now), INTERVALS[step]!),
    seen: (prev?.seen ?? 0) + 1,
    correct: (prev?.correct ?? 0) + (wasCorrect ? 1 : 0),
    updatedAt: now.toISOString(),
  }
  return { ...map, [id]: next }
}

export function seenCount(map: ProgressMap, skill: SkillId): number {
  return Object.values(map).filter((p) => p.skill === skill).length
}

/** Skills the learner may practise: each unlocks after enough hands of the one before. */
export function unlockedSkills(map: ProgressMap): SkillId[] {
  const out: SkillId[] = []
  for (let i = 0; i < SKILLS.length; i++) {
    const skill = SKILLS[i]!
    if (i === 0) {
      out.push(skill.id)
      continue
    }
    const prev = SKILLS[i - 1]!
    if (seenCount(map, prev.id) >= skill.unlockAfter) out.push(skill.id)
    else break
  }
  return out
}

/** The skill new hands come from: the newest unlocked one. */
export function currentSkill(map: ProgressMap): SkillId {
  const unlocked = unlockedSkills(map)
  return unlocked[unlocked.length - 1] ?? 'hcp'
}

/** Next unseen question index for a skill in the given system. */
export function nextIndex(map: ProgressMap, skill: SkillId, system: System = 'sayc'): number {
  let n = 0
  while (map[questionId(skill, n, system)]) n++
  return n
}

export interface DrillPlan {
  ids: string[]
  dueCount: number
  newCount: number
  skill: SkillId
}

/**
 * Build today's drill: due first (oldest due first), then new hands from
 * `skill` (default: current). New bidding hands come from the active `system`;
 * due hands are whatever is due, in whichever system the learner met them.
 */
export function planDrill(
  map: ProgressMap,
  skill?: SkillId,
  system: System = 'sayc',
  now = new Date(),
): DrillPlan {
  const date = today(now)
  const target = skill ?? currentSkill(map)
  const due = Object.values(map)
    .filter((p) => p.due <= date && (skill ? p.skill === skill : true))
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))
    .slice(0, DRILL_SIZE)
    .map((p) => p.id)
  const ids = [...due]
  let n = nextIndex(map, target, system)
  while (ids.length < DRILL_SIZE) {
    const id = questionId(target, n++, system)
    if (!ids.includes(id)) ids.push(id)
  }
  return { ids, dueCount: due.length, newCount: ids.length - due.length, skill: target }
}

export interface Streak {
  days: number
  practisedToday: boolean
  lastDate: string | null
}

/** Soft streak: consecutive days with at least one answer, counting back from today or yesterday. */
export function streak(sessionDates: string[], now = new Date()): Streak {
  const set = new Set(sessionDates)
  const date = today(now)
  const practisedToday = set.has(date)
  let cursor = practisedToday ? date : addDays(date, -1)
  let days = 0
  while (set.has(cursor)) {
    days++
    cursor = addDays(cursor, -1)
  }
  const sorted = [...set].sort()
  return { days, practisedToday, lastDate: sorted[sorted.length - 1] ?? null }
}
