/**
 * Bidding-system registry. Each system is a content pack: the opening-bid
 * rules the drills quiz, the bot/hint bidding, and the cheat-sheet rows.
 * SAYC and Acol share the same hand evaluation (points, shape) — they differ
 * only in how those translate into bids, so a system is a small rule module,
 * not a fork of the whole app.
 */
import { rules as sayc } from './sayc'
import { rules as acol } from './acol'
import type { RuleModule, SystemId } from './types'

export type { Decision, RuleModule, SystemId } from './types'

export interface SystemInfo {
  id: SystemId
  name: string
  available: boolean
  /** The rule module, when the system is built out. */
  rules?: RuleModule
}

export const SYSTEMS: SystemInfo[] = [
  { id: 'sayc', name: 'Standard American', available: true, rules: sayc },
  { id: 'acol', name: 'ACOL', available: true, rules: acol },
  { id: 'two-over-one', name: '2-over-1', available: false },
]

/** The rule module for a system, falling back to SAYC if a pack is missing. */
export function rulesFor(id: SystemId): RuleModule {
  return SYSTEMS.find((s) => s.id === id)?.rules ?? sayc
}
