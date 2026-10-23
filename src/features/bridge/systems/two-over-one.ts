/**
 * 2-over-1 game forcing, the beginner slice of it.
 *
 * Openings are exactly Standard American — same rule of 20, five-card majors,
 * 1NT 15–17, 2NT 20–21, strong 2♣ — so this module re-uses SAYC's opening
 * functions rather than restating them. The whole difference is in responding
 * to a 1-of-a-major opening, which is carried by `respondingVariant`:
 *
 *   • A new suit at the TWO level (1♥–2♦, 1♠–2♦, …) is GAME FORCING — it promises
 *     about 13+ and commits the pair to at least game. In the standard systems
 *     the same bid only shows 10+.
 *   • Hands too good to pass but short of game start with a FORCING 1NT (opener
 *     must bid again) and show the suit on the next round.
 *
 * The drill reads `respondingVariant` for the answer and the bot reads it for
 * its two-level threshold, so what the drill teaches is what the table does.
 */
import { openOrPass, openingBid, isTeachableOpener, isTeachableOpenPass } from './sayc'
import { TWO_OVER_ONE_SHEET } from '../sheet'
import type { RuleModule } from './types'

/** 2-over-1, packaged as a rule module for the system registry. */
export const rules: RuleModule = {
  // Openings are identical to Standard American.
  openOrPass,
  openingBid,
  isTeachableOpener,
  isTeachableOpenPass,
  oneNoTrump: { min: 15, max: 17 },
  twoNoTrump: { min: 20, max: 21 },
  // The one thing that makes it 2-over-1.
  respondingVariant: 'two-over-one',
  sheet: TWO_OVER_ONE_SHEET,
}
