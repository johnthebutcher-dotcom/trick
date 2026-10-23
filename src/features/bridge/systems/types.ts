/**
 * Shared bidding-system types. Kept separate from the registry (index.ts) so a
 * system module can import the types without a circular import back through the
 * registry that lists it.
 */
import type { Hand } from '../cards'
import type { SheetSection } from '../sheet'

export interface Decision {
  bid: string
  why: string
  more: string
}

/** Everything a bidding system must provide to drive drills, the bot and the sheet. */
export interface RuleModule {
  openOrPass(hand: Hand): Decision
  openingBid(hand: Hand): Decision
  isTeachableOpener(hand: Hand): boolean
  isTeachableOpenPass(hand: Hand): boolean
  /** NT ranges the bot and responder logic key off, so responses follow the system. */
  readonly oneNoTrump: { min: number; max: number }
  readonly twoNoTrump: { min: number; max: number }
  /** Cheat-sheet rows for this system. */
  readonly sheet: SheetSection[]
}

export type SystemId = 'sayc' | 'two-over-one' | 'acol'
