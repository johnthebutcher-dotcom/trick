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

/** Standard American and Acol respond the same way to a major; 2-over-1 is the exception. */
export type ResponseVariant = 'standard' | 'two-over-one'
/** A major opening the responding drill asks about. */
export type OpenerMajor = 'H' | 'S'

/** Everything a bidding system must provide to drive drills, the bot and the sheet. */
export interface RuleModule {
  openOrPass(hand: Hand): Decision
  openingBid(hand: Hand): Decision
  isTeachableOpener(hand: Hand): boolean
  isTeachableOpenPass(hand: Hand): boolean
  /** NT ranges the bot and responder logic key off, so responses follow the system. */
  readonly oneNoTrump: { min: number; max: number }
  readonly twoNoTrump: { min: number; max: number }
  /**
   * How this system responds to a 1-of-a-major opening: 'standard' (SAYC/Acol,
   * a two-level new suit shows 10+) or 'two-over-one' (a two-level new suit
   * forces to game, with a forcing 1NT for the weaker hands). The drill and the
   * bot both read this, so they never contradict each other.
   */
  readonly respondingVariant: ResponseVariant
  /** Cheat-sheet rows for this system. */
  readonly sheet: SheetSection[]
}

export type SystemId = 'sayc' | 'two-over-one' | 'acol'
