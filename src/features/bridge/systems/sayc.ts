/**
 * Standard American (SAYC) opening-bid rules, the way beginner classes teach
 * them: five-card majors, 1NT = 15–17 balanced, 2NT = 20–21 balanced,
 * open with 13+ HCP or 12 with the rule of 20, strong 2♣ with 22+.
 * Every decision returns the bid plus a one-line reason and a longer "show me".
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

export interface Decision {
  bid: string
  why: string
  more: string
}

export function openOrPass(hand: Hand): Decision {
  const points = hcp(hand)
  const longest = twoLongest(hand)
  if (points >= 13) {
    return {
      bid: 'Open',
      why: `${points} points is an opening hand.`,
      more: 'With 13 or more high-card points, open the bidding. Shape only matters for which bid, not whether to open.',
    }
  }
  if (points >= 11 && points + longest >= 20) {
    return {
      bid: 'Open',
      why: `${points} points, but your two longest suits add to ${longest}. ${points} + ${longest} = ${points + longest}: open.`,
      more: 'The rule of 20: add your high-card points to the lengths of your two longest suits. If the total reaches 20, the hand is worth opening even below 13 points.',
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

/** Which bid to open with, assuming the hand is an opener (12–21 HCP, not a preempt). */
export function openingBid(hand: Hand): Decision {
  const points = hcp(hand)
  const len = lengths(hand)
  const balanced = isBalanced(hand)

  if (balanced && points >= 20 && points <= 21) {
    return {
      bid: '2NT',
      why: `${points} points and a balanced ${shape(hand)}: 2NT.`,
      more: '2NT shows 20–21 high-card points and a balanced hand (no singleton, no void, at most one doubleton).',
    }
  }
  if (balanced && points >= 15 && points <= 17) {
    return {
      bid: '1NT',
      why: `${points} points and a balanced ${shape(hand)}: 1NT.`,
      more: '1NT shows 15–17 high-card points and a balanced hand. It tells partner almost everything in one bid, so it comes before a five-card major in most classes.',
    }
  }
  if (len.S >= 5 || len.H >= 5) {
    if (len.S >= 5 && len.H >= 5) {
      return {
        bid: '1♠',
        why: `Five or more in both majors: open the higher one, 1♠.`,
        more: 'With two five-card (or longer) suits, open the higher-ranking one first so you can show the second cheaply next time.',
      }
    }
    const suit: Suit = len.S >= 5 ? 'S' : 'H'
    return {
      bid: `1${SUIT_SYMBOL[suit]}`,
      why: `A ${len[suit]}-card major: open 1${SUIT_SYMBOL[suit]}.`,
      more: 'Standard American opens a major only with five or more cards. With a five-card major and an opening hand outside the 1NT range, open the major.',
    }
  }
  // No five-card major: open the longer minor; 3-3 → 1♣, 4-4 → 1♦.
  if (len.D > len.C) {
    return {
      bid: '1♦',
      why: `No five-card major; diamonds (${len.D}) are longer than clubs (${len.C}): 1♦.`,
      more: 'Without a five-card major, open your longer minor. Partner knows a minor opening may be as short as three cards.',
    }
  }
  if (len.C > len.D) {
    return {
      bid: '1♣',
      why: `No five-card major; clubs (${len.C}) are longer than diamonds (${len.D}): 1♣.`,
      more: 'Without a five-card major, open your longer minor. Partner knows a minor opening may be as short as three cards.',
    }
  }
  if (len.C === 4) {
    return {
      bid: '1♦',
      why: `No five-card major and 4-4 in the minors: open 1♦.`,
      more: 'With four cards in each minor, open 1♦. Rebidding is easier that way.',
    }
  }
  return {
    bid: '1♣',
    why: `No five-card major and 3-3 in the minors: open 1♣.`,
    more: 'With three cards in each minor, open 1♣. It is the cheapest bid and keeps every response available to partner.',
  }
}

/** Is this hand a clean teaching example for the opening-bid drill? */
export function isTeachableOpener(hand: Hand): boolean {
  const points = hcp(hand)
  if (points < 12 || points > 21) return false
  const len = lengths(hand)
  // Skip 5-card-major 15–17 balanced hands: classes disagree on 1NT vs the major.
  if (isBalanced(hand) && points >= 15 && points <= 17 && (len.S === 5 || len.H === 5)) return false
  // Skip 18–19 balanced (would be 1-suit then 2NT rebid: a later lesson).
  if (isBalanced(hand) && points >= 18 && points <= 19) return false
  // Skip hands with a 7+ card suit (preempt territory).
  if (Object.values(len).some((n) => n >= 7)) return false
  return true
}

/** Hands that make a fair open-or-pass question (no preempts, no strong 2♣). */
export function isTeachableOpenPass(hand: Hand): boolean {
  const points = hcp(hand)
  if (points > 21) return false
  const len = lengths(hand)
  if (Object.values(len).some((n) => n >= 7)) return false
  // Weak-two shapes (6-card suit with 5–11) are a separate lesson.
  if (points <= 11 && Object.values(len).some((n) => n === 6)) return false
  return true
}
