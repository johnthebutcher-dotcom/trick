/**
 * Acol opening-bid rules, the way beginner classes teach them in the UK and
 * much of the Commonwealth. The signature differences from Standard American:
 *   - four-card majors: open 1♥/1♠ with only four cards in the suit;
 *   - a WEAK 1NT: 12–14 HCP balanced (not 15–17);
 *   - 2NT = 20–22 balanced;
 *   - strong, game-forcing 2♣ with 23+.
 * Everything else (counting points, the rule of 20, opening with 13+) is the
 * same, because that is hand evaluation, not system. Each decision returns the
 * bid plus a one-line reason and a longer "show me", exactly like SAYC.
 */
import {
  hcp,
  isBalanced,
  lengths,
  shape,
  twoLongest,
  SUIT_SYMBOL,
  type Hand,
  type Suit,
} from '../cards'
import { ACOL_SHEET } from '../sheet'
import type { Decision, RuleModule } from './types'

export function openOrPass(hand: Hand): Decision {
  const points = hcp(hand)
  const longest = twoLongest(hand)
  if (points >= 13) {
    return {
      bid: 'Open',
      why: `${points} points is an opening hand.`,
      more: 'With 13 or more high-card points, open the bidding. Shape only decides which bid, not whether to open.',
    }
  }
  if (points >= 11 && points + longest >= 20) {
    return {
      bid: 'Open',
      why: `${points} points, but your two longest suits add to ${longest}. ${points} + ${longest} = ${points + longest}: open.`,
      more: 'The rule of 20: add your high-card points to the lengths of your two longest suits. If the total reaches 20, the hand is worth opening even below 13 points. Acol uses it the same way Standard American does.',
    }
  }
  if (points >= 11) {
    return {
      bid: 'Pass',
      why: `${points} points and flat shape: ${points} + ${longest} = ${points + longest}, under 20. Pass.`,
      more: 'Borderline hands open only with shape to back them up. With your two longest suits adding to less than 9, wait for partner.',
    }
  }
  return {
    bid: 'Pass',
    why: `${points} points is not enough to open.`,
    more: 'Below 11 high-card points, pass and let partner describe their hand first. You can still compete later.',
  }
}

/** Which bid to open with, assuming the hand is an opener (12–22 HCP, not a preempt). */
export function openingBid(hand: Hand): Decision {
  const points = hcp(hand)
  const len = lengths(hand)
  const balanced = isBalanced(hand)

  // Balanced ranges come first: a balanced hand in the NT zone is shown with
  // NT, not a suit. Acol's weak 1NT (12–14) is the headline difference.
  if (balanced && points >= 20 && points <= 22) {
    return {
      bid: '2NT',
      why: `${points} points and a balanced ${shape(hand)}: 2NT.`,
      more: 'In Acol, 2NT shows 20–22 high-card points and a balanced hand (no singleton, no void, at most one doubleton).',
    }
  }
  if (balanced && points >= 12 && points <= 14) {
    return {
      bid: '1NT',
      why: `${points} points and a balanced ${shape(hand)}: a weak 1NT.`,
      more: 'Acol plays a WEAK no-trump: 1NT shows just 12–14 high-card points and a balanced hand. This is the biggest difference from Standard American, where 1NT is 15–17. It describes the whole hand in one bid, so prefer it to a four-card suit when balanced and in range.',
    }
  }

  // Four-card majors: open a major with four or more. Higher of two five-card
  // (or longer) suits; with two four-card majors open 1♥ and prepare to show
  // spades cheaply next time.
  if (len.S >= 5 && len.H >= 5) {
    return {
      bid: '1♠',
      why: `Five or more in both majors: open the higher one, 1♠.`,
      more: 'With two five-card (or longer) suits, open the higher-ranking one first so you can show the second cheaply next time.',
    }
  }
  if (len.S >= 5 || len.H >= 5) {
    const suit: Suit = len.S >= 5 ? 'S' : 'H'
    return {
      bid: `1${SUIT_SYMBOL[suit]}`,
      why: `A ${len[suit]}-card major: open 1${SUIT_SYMBOL[suit]}.`,
      more: 'With a five-card major and an opening hand outside the 1NT range, open the major.',
    }
  }
  if (len.S === 4 && len.H === 4) {
    return {
      bid: '1♥',
      why: `Four hearts and four spades: open the lower major, 1♥.`,
      more: 'Acol opens four-card majors. With four cards in each major, open 1♥ first; if partner has no fit you can still show spades at a comfortable level. (Some teachers prefer 1♠ with 4-4; follow your class if it differs.)',
    }
  }
  if (len.H === 4) {
    return {
      bid: '1♥',
      why: `A four-card heart suit and no longer major: open 1♥.`,
      more: 'Acol opens four-card majors, so a plain four-card heart suit is enough to open 1♥ when the hand is not balanced in the 1NT range.',
    }
  }
  if (len.S === 4) {
    return {
      bid: '1♠',
      why: `A four-card spade suit and no longer major: open 1♠.`,
      more: 'Acol opens four-card majors, so a plain four-card spade suit is enough to open 1♠ when the hand is not balanced in the 1NT range.',
    }
  }

  // No four-card major: open the longer minor; with equal length open 1♣ (the
  // "prepared club", so a 1♦ response leaves an easy 1-of-a-major or 1NT rebid).
  if (len.D > len.C) {
    return {
      bid: '1♦',
      why: `No four-card major; diamonds (${len.D}) are longer than clubs (${len.C}): 1♦.`,
      more: 'Without a four-card major, open your longer minor. Partner knows a minor opening can be short.',
    }
  }
  if (len.C > len.D) {
    return {
      bid: '1♣',
      why: `No four-card major; clubs (${len.C}) are longer than diamonds (${len.D}): 1♣.`,
      more: 'Without a four-card major, open your longer minor. Partner knows a minor opening can be short.',
    }
  }
  return {
    bid: '1♣',
    why: `No four-card major and equal minors: open the prepared 1♣.`,
    more: 'With the minors the same length and no major to open, Acol opens 1♣ (the "prepared club"). Whatever partner responds, you have a comfortable rebid.',
  }
}

/** Is this hand a clean teaching example for the opening-bid drill? */
export function isTeachableOpener(hand: Hand): boolean {
  const points = hcp(hand)
  // Acol opens 2NT up to 22, so the teachable opener range runs 12–22.
  if (points < 12 || points > 22) return false
  const len = lengths(hand)
  // Skip 18–19 balanced: a 1-of-a-suit open then a jump in no-trump, a later lesson.
  if (isBalanced(hand) && points >= 18 && points <= 19) return false
  // Skip hands with a 7+ card suit (preempt / strong-two territory).
  if (Object.values(len).some((n) => n >= 7)) return false
  return true
}

/** Hands that make a fair open-or-pass question (no preempts, no strong 2♣). */
export function isTeachableOpenPass(hand: Hand): boolean {
  const points = hcp(hand)
  if (points > 22) return false
  const len = lengths(hand)
  if (Object.values(len).some((n) => n >= 7)) return false
  // Six-card-suit minimums are a separate lesson (strong twos in classic Acol).
  if (points <= 11 && Object.values(len).some((n) => n === 6)) return false
  return true
}

/** Acol, packaged as a rule module for the system registry. */
export const rules: RuleModule = {
  openOrPass,
  openingBid,
  isTeachableOpener,
  isTeachableOpenPass,
  oneNoTrump: { min: 12, max: 14 },
  twoNoTrump: { min: 20, max: 22 },
  // Acol responds to a major the standard way; its signature is the weak 1NT, not responding.
  respondingVariant: 'standard',
  sheet: ACOL_SHEET,
}
