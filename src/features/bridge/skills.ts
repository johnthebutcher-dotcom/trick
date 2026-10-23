/**
 * The skill ladder and the question builder. A question is a hand plus a
 * prompt, answer options, the correct option, a one-line reason and a longer
 * "show me". Everything is derived from the hand id, so questions never need
 * to be stored; only the learner's progress is.
 */
import {
  dealHand,
  distributionPoints,
  hashString,
  hcp,
  hcpBySuit,
  honours,
  rng,
  shape,
  SUIT_SYMBOL,
  SUITS,
  type Hand,
} from './cards'
import { rulesFor } from './systems'
import type { SystemId } from './systems/types'

export type System = SystemId
export { SYSTEMS } from './systems'

export type SkillId = 'hcp' | 'shape-points' | 'open-pass' | 'opening-bid'

/**
 * Point-counting is the same in every system, so those skills keep one shared
 * progress ladder. Only the bidding skills differ by system, so switching
 * systems keeps your point-counting progress and gives each system its own
 * bidding ladder.
 */
const SYSTEM_SPECIFIC: ReadonlySet<SkillId> = new Set<SkillId>(['open-pass', 'opening-bid'])

export interface Skill {
  id: SkillId
  title: string
  blurb: string
  /** How many hands the previous skill needs before this one opens up. */
  unlockAfter: number
}

export const SKILLS: Skill[] = [
  {
    id: 'hcp',
    title: 'Count your points',
    blurb: 'Ace 4, king 3, queen 2, jack 1.',
    unlockAfter: 0,
  },
  {
    id: 'shape-points',
    title: 'Points with shape',
    blurb: 'Short suits add points when you play in a suit.',
    unlockAfter: 16,
  },
  {
    id: 'open-pass',
    title: 'Open or pass?',
    blurb: '13 points opens. 11–12 needs shape.',
    unlockAfter: 16,
  },
  {
    id: 'opening-bid',
    title: 'Which bid opens?',
    blurb: 'Five-card majors, 1NT with 15–17, longer minor otherwise.',
    unlockAfter: 16,
  },
]

export interface Question {
  id: string
  skill: SkillId
  hand: Hand
  prompt: string
  options: string[]
  answer: string
  why: string
  more: string
}

/**
 * A question id. Point-counting skills are system-independent, so their ids are
 * just `skill:n`. Bidding skills carry the system, `system:skill:n`, so each
 * system keeps its own spaced-repetition ladder and switching systems does not
 * mix the two up. The default system keeps the id stable for shared skills.
 */
export function questionId(skill: SkillId, n: number, system: System = 'sayc'): string {
  return SYSTEM_SPECIFIC.has(skill) ? `${system}:${skill}:${n}` : `${skill}:${n}`
}

export function parseQuestionId(id: string): { skill: SkillId; n: number; system: System } | null {
  const parts = id.split(':')
  // `system:skill:n` (bidding) or `skill:n` (point counting).
  const [a, b, c] = parts
  if (parts.length === 3 && a && b && c) {
    if (!SKILLS.some((s) => s.id === b)) return null
    return { skill: b as SkillId, n: Number(c), system: a as System }
  }
  if (parts.length === 2 && a && b) {
    if (!SKILLS.some((s) => s.id === a)) return null
    return { skill: a as SkillId, n: Number(b), system: 'sayc' }
  }
  return null
}

/** Deal the n-th hand for a skill, skipping hands that make poor teaching examples. */
function handFor(skill: SkillId, n: number, system: System): Hand {
  const { isTeachableOpenPass, isTeachableOpener } = rulesFor(system)
  // Walk seeds until a teachable hand; deterministic because the walk is.
  let attempt = 0
  for (;;) {
    const seed = hashString(`${skill}:${n}:${attempt}`)
    const hand = dealHand(seed)
    const points = hcp(hand)
    const ok =
      skill === 'hcp'
        ? points >= 3 && points <= 22
        : skill === 'shape-points'
          ? distributionPoints(hand) > 0 && points >= 6 && points <= 20
          : skill === 'open-pass'
            ? isTeachableOpenPass(hand) && points >= 8 && points <= 16
            : isTeachableOpener(hand)
    if (ok) return hand
    attempt++
  }
}

function numberOptions(correct: number, seed: number, count = 4, min = 0): string[] {
  const random = rng(seed)
  const set = new Set<number>([correct])
  while (set.size < count) {
    const delta = Math.floor(random() * 5) - 2 // -2..2
    const candidate = correct + (delta === 0 ? (random() < 0.5 ? -3 : 3) : delta)
    if (candidate >= min) set.add(candidate)
  }
  return [...set].sort((a, b) => a - b).map(String)
}

export function buildQuestion(id: string): Question | null {
  const parsed = parseQuestionId(id)
  if (!parsed) return null
  const { skill, n, system } = parsed
  const hand = handFor(skill, n, system)
  const seed = hashString(id)
  const { openOrPass, openingBid, twoNoTrump } = rulesFor(system)

  if (skill === 'hcp') {
    const points = hcp(hand)
    const by = hcpBySuit(hand)
    const parts = SUITS.filter((s) => by[s] > 0).map((s) => `${SUIT_SYMBOL[s]} ${by[s]}`)
    return {
      id,
      skill,
      hand,
      prompt: 'How many high-card points?',
      options: numberOptions(points, seed),
      answer: String(points),
      why: honours(hand).length
        ? `${honours(hand).join(' ')} = ${points}.`
        : 'No honours at all: 0 points.',
      more: `Ace 4, king 3, queen 2, jack 1. By suit: ${parts.join(', ') || 'nothing'}. Total ${points}.`,
    }
  }

  if (skill === 'shape-points') {
    const points = hcp(hand)
    const dist = distributionPoints(hand)
    const shortSuits = SUITS.filter((s) => hand[s].length <= 2).map((s) => {
      const len = hand[s].length
      const label = len === 0 ? 'void (3)' : len === 1 ? 'singleton (2)' : 'doubleton (1)'
      return `${SUIT_SYMBOL[s]} ${label}`
    })
    return {
      id,
      skill,
      hand,
      prompt: 'Total points if you play in a suit? (high cards + shape)',
      options: numberOptions(points + dist, seed),
      answer: String(points + dist),
      why: `${points} high-card + ${dist} for shape = ${points + dist}.`,
      more: `Short suits: ${shortSuits.join(', ')}. Void 3, singleton 2, doubleton 1. Shape points count only when your side plays in a trump suit.`,
    }
  }

  if (skill === 'open-pass') {
    const d = openOrPass(hand)
    return {
      id,
      skill,
      hand,
      prompt: 'You are the dealer. Open or pass?',
      options: ['Pass', 'Open'],
      answer: d.bid,
      why: d.why,
      more: d.more,
    }
  }

  const d = openingBid(hand)
  const points = hcp(hand)
  const options = ['1♣', '1♦', '1♥', '1♠', '1NT']
  if (points >= twoNoTrump.min) options.push('2NT')
  return {
    id,
    skill,
    hand,
    prompt: `You have ${points} points and a ${shape(hand)} shape. What do you open?`,
    options,
    answer: d.bid,
    why: d.why,
    more: d.more,
  }
}
