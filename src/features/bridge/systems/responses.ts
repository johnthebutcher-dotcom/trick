/**
 * Responding to a 1-of-a-major opening (1♥ or 1♠), as a beginner class teaches
 * it. This is the first place 2-over-1 diverges from the "standard" systems
 * (Standard American and Acol both respond the same way here), so the shared
 * ladder lives in one place and the two variants branch only where they must.
 *
 *   standard: a new suit at the two level shows about 10+ and is forcing for one
 *   round, but does not promise game. With 6–9 and no fit you bid a natural 1NT.
 *
 *   two-over-one: a new suit at the two level commits the pair to game (≈13+).
 *   Hands too good to pass but short of game can no longer bid two of a suit, so
 *   they start with a FORCING 1NT (opener must bid again) and show the suit next.
 *
 * The drill constrains the two-level suit to diamonds so the answer is always a
 * single clean call; the point being taught is the level and what it promises,
 * not which minor to pick.
 */
import { hcp, lengths, type Hand } from '../cards'
import type { Decision, OpenerMajor, ResponseVariant } from './types'

export type { OpenerMajor, ResponseVariant } from './types'

const MAJOR_BID: Record<OpenerMajor, string> = { H: '1♥', S: '1♠' }
const RAISE_BID: Record<OpenerMajor, string> = { H: '2♥', S: '2♠' }

/**
 * The response to 1 of a major. The two-level suit the drill offers is always
 * diamonds, so the single clean answer is Pass / a raise / 1♠ / 1NT / 2♦.
 */
export function respondToMajor(
  hand: Hand,
  opener: OpenerMajor,
  variant: ResponseVariant,
): Decision {
  const p = hcp(hand)
  const len = lengths(hand)
  const support = len[opener]
  const openBid = MAJOR_BID[opener]

  // Too weak to answer.
  if (p <= 5) {
    return {
      bid: 'Pass',
      why: `${p} points is not enough to answer. Pass.`,
      more: `Partner's ${openBid} shows an opening hand but could be a minimum. With 5 or fewer points there is no game your way, so pass and let partner play.`,
    }
  }

  // A fit in the major comes first: support is worth more than a side suit.
  if (support >= 3 && p <= 10) {
    return {
      bid: RAISE_BID[opener],
      why: `${p} points and ${support}-card support: raise to ${RAISE_BID[opener]}.`,
      more: `With three or more of partner's suit and 6–10 points, raise to the two level. It shows the fit and the range in one bid. (Stronger raises are a later lesson.)`,
    }
  }

  // No usable fit. A new suit at the ONE level is always cheap: over 1♥, four or
  // more spades is a 1♠ response in every system.
  if (opener === 'H' && len.S >= 4) {
    return {
      bid: '1♠',
      why: `${p} points and ${len.S} spades: show the suit at the one level, 1♠.`,
      more: `A new suit at the one level only promises 6+ points and four cards, and keeps the bidding low. Every system bids it the same way; the two-level is where 2-over-1 differs.`,
    }
  }

  // A new suit at the TWO level (here, diamonds). This is the dividing line.
  const twoLevelSuit = len.D >= 4 && len.D >= len.C
  if (twoLevelSuit) {
    if (variant === 'two-over-one') {
      if (p >= 13) {
        return {
          bid: '2♦',
          why: `${p} points and 4+ diamonds: 2♦ is game forcing in 2-over-1.`,
          more: `In 2-over-1 a new suit at the two level promises game. With ${p} points you have the values, so bid 2♦ and the pair is committed to at least game — you can describe the rest of the hand slowly below game.`,
        }
      }
      return {
        bid: '1NT',
        why: `${p} points: too good to pass, not enough to force game. Bid a forcing 1NT.`,
        more: `In 2-over-1, bidding 2♦ here would promise game, which ${p} points is short of. So start with 1NT — it is FORCING, partner must bid again — and show your diamonds next time to describe an invitational hand.`,
      }
    }
    // Standard (SAYC / Acol).
    if (p >= 10) {
      return {
        bid: '2♦',
        why: `${p} points and 4+ diamonds: a new suit at the two level shows 10 or more.`,
        more: `A new suit at the two level shows about 10 or more points and is forcing for one round, but it does not promise game. Bid 2♦ and keep options open.`,
      }
    }
    return {
      bid: '1NT',
      why: `${p} points and no fit: 1NT. Not enough for a two-level suit.`,
      more: `A two-level new suit needs about 10 points. With ${p} you are short of that, so make the catch-all response of 1NT (6–9, no fit).`,
    }
  }

  // Nothing else to show: the catch-all 1NT.
  if (variant === 'two-over-one') {
    return {
      bid: '1NT',
      why: `${p} points, no fit and nothing to show at the one level: forcing 1NT.`,
      more: `1NT is the catch-all when you cannot support partner or bid a new suit cheaply. In 2-over-1 it is forcing: partner must bid again, so you get another turn to describe your hand.`,
    }
  }
  return {
    bid: '1NT',
    why: `${p} points, no fit and nothing to show at the one level: 1NT.`,
    more: `1NT is the catch-all response: 6–9 points, no three-card support and no new suit worth bidding. Partner may pass it.`,
  }
}

/**
 * Is this a clean responder hand for the drill? We keep it to the decisions
 * above: no slam-zone hands, no long suits that invite jump shifts or weak
 * jumps, no four-card-plus fit (raising partner is its own lesson), and when
 * the answer is a two-level suit it is cleanly diamonds. The filter does not
 * depend on the variant, so both systems quiz the same hands.
 */
export function isTeachableResponder(hand: Hand, opener: OpenerMajor): boolean {
  const p = hcp(hand)
  if (p > 15) return false
  const len = lengths(hand)
  if (Object.values(len).some((n) => n >= 7)) return false
  // Four-plus support for the major is a raising lesson, not this one.
  if (len[opener] >= 4) return false
  // Three-card support only in the simple-raise band, to avoid limit-raise answers.
  if (len[opener] === 3 && p > 10) return false
  // If the hand's natural two-level suit is clubs or (over 1♠) hearts, the clean
  // single answer 2♦ would not hold; keep those out so options stay unambiguous.
  const wantsClubs = len.C >= 4 && len.C > len.D
  if (wantsClubs && len[opener] < 3 && !(opener === 'H' && len.S >= 4)) return false
  if (opener === 'S' && len.H >= 4 && len.H > len.D && len.S < 3) return false
  return true
}

/** The fixed answer options for the responding drill, per opener. */
export function responseOptions(opener: OpenerMajor): string[] {
  return opener === 'H' ? ['Pass', '1♠', '1NT', '2♥', '2♦'] : ['Pass', '1NT', '2♠', '2♥', '2♦']
}
