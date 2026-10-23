/**
 * Card play: legal cards, trick winners, bot card choice (also the hint),
 * and scoring. Bots follow the rules of thumb a beginner is taught, so the
 * hint and the opponents are the same mind.
 */
import { SUIT_SYMBOL, type Card, type Hand, type Suit } from '@/features/bridge/cards'
import type { Strain } from './auction'
import { cardsOf, next, partner, rankValue, sameSide, type Seat } from './deal'

export interface Trick {
  leader: Seat
  cards: { seat: Seat; card: Card }[]
  winner: Seat | null
}

export function legalCards(hand: Hand, trick: Trick): Card[] {
  const all = cardsOf(hand)
  const lead = trick.cards[0]?.card
  if (!lead) return all
  const follow = all.filter((c) => c.suit === lead.suit)
  return follow.length ? follow : all
}

export function trickWinner(trick: Trick, trump: Strain): Seat {
  const lead = trick.cards[0]!.card.suit
  let best = trick.cards[0]!
  for (const play of trick.cards.slice(1)) {
    const c = play.card
    const b = best.card
    const cTrump = trump !== 'NT' && c.suit === trump
    const bTrump = trump !== 'NT' && b.suit === trump
    if (cTrump && !bTrump) best = play
    else if (cTrump === bTrump && c.suit === b.suit && rankValue(c.rank) > rankValue(b.rank))
      best = play
    else if (!cTrump && !bTrump && c.suit === lead && b.suit !== lead) best = play
  }
  return best.seat
}

export function currentWinner(trick: Trick, trump: Strain): Seat | null {
  return trick.cards.length ? trickWinner(trick, trump) : null
}

export interface PlayAdvice {
  card: Card
  why: string
}

const lowest = (cards: Card[]) =>
  [...cards].sort((a, b) => rankValue(a.rank) - rankValue(b.rank))[0]!
const highest = (cards: Card[]) =>
  [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank))[0]!
const label = (c: Card) => `${c.rank === 'T' ? '10' : c.rank}${SUIT_SYMBOL[c.suit]}`

/** Pick a card for `seat`, with a one-line reason. */
export function advisePlay(
  seat: Seat,
  hand: Hand,
  trick: Trick,
  trump: Strain,
  declarer: Seat,
  played: Card[],
): PlayAdvice {
  const legal = legalCards(hand, trick)
  if (legal.length === 1) return { card: legal[0]!, why: 'Only one card you can play.' }
  const isDeclarerSide = sameSide(seat, declarer)
  const lead = trick.cards[0]?.card

  // Leading
  if (!lead) {
    if (isDeclarerSide && trump !== 'NT') {
      const trumpsOut = 13 - played.filter((c) => c.suit === trump).length - countSuit(hand, trump)
      const myTrumps = hand[trump]
      if (myTrumps.length && trumpsOut > 0 && played.length < 20) {
        return {
          card: { suit: trump, rank: highest(cardsOf({ ...emptyHand(), [trump]: myTrumps })).rank },
          why: 'Draw trumps first so the defenders cannot ruff your winners.',
        }
      }
    }
    // Lead top of a sequence, else fourth-best from longest, else low from longest.
    const suits = (['S', 'H', 'D', 'C'] as Suit[])
      .filter((s) => hand[s].length > 0 && (trump === 'NT' || s !== trump || isDeclarerSide))
      .sort((a, b) => hand[b].length - hand[a].length)
    const s = suits[0] ?? (['S', 'H', 'D', 'C'] as Suit[]).find((x) => hand[x].length)!
    const ranks = hand[s]
    if (
      ranks.length >= 2 &&
      rankValue(ranks[0]!) - rankValue(ranks[1]!) === 1 &&
      rankValue(ranks[0]!) >= 10
    ) {
      return {
        card: { suit: s, rank: ranks[0]! },
        why: `Lead the top of a sequence: ${ranks[0]}${SUIT_SYMBOL[s]} is safe and sets up the suit.`,
      }
    }
    if (ranks.length >= 4) {
      return {
        card: { suit: s, rank: ranks[3]! },
        why: `Lead fourth-best from your longest suit (${SUIT_SYMBOL[s]}).`,
      }
    }
    return {
      card: { suit: s, rank: ranks[ranks.length - 1]! },
      why: `Lead low from your longest suit (${SUIT_SYMBOL[s]}).`,
    }
  }

  const position = trick.cards.length // 1 = second hand, 2 = third, 3 = fourth
  const winner = currentWinner(trick, trump)!
  const partnerWinning = winner === partner(seat)
  const follow = legal.filter((c) => c.suit === lead.suit)
  const canFollow = follow.length > 0

  if (!canFollow) {
    // Ruff if it wins, else throw the lowest from the weakest suit.
    if (trump !== 'NT' && hand[trump].length && !partnerWinning) {
      const bestSoFar = trick.cards.map((p) => p.card).find((c) => c.suit === trump)
      const myTrumps = legal.filter((c) => c.suit === trump)
      const winning = bestSoFar
        ? myTrumps.filter((c) => rankValue(c.rank) > rankValue(bestSoFar.rank))
        : myTrumps
      if (winning.length)
        return {
          card: lowest(winning),
          why: 'Out of the suit: ruff with the cheapest trump that wins.',
        }
    }
    const discards = legal.filter((c) => trump === 'NT' || c.suit !== trump)
    const pool = discards.length ? discards : legal
    return {
      card: lowest(pool),
      why: 'Cannot follow suit and no useful ruff: discard your lowest card.',
    }
  }

  const winningCards = follow.filter((c) => beats(c, trick, trump))
  if (position === 3) {
    if (partnerWinning)
      return { card: lowest(follow), why: 'Partner is winning the trick: play low.' }
    if (winningCards.length)
      return { card: lowest(winningCards), why: 'Fourth hand: win as cheaply as you can.' }
    return { card: lowest(follow), why: 'Cannot win it: play your lowest.' }
  }
  if (position === 2) {
    if (
      partnerWinning &&
      rankValue(trick.cards[0]!.card.rank) >= 12 &&
      !winningCards.some((c) => rankValue(c.rank) > rankValue(trick.cards[0]!.card.rank))
    )
      return { card: lowest(follow), why: 'Partner led a high card that is winning: play low.' }
    if (winningCards.length)
      return {
        card: highest(follow),
        why: 'Third hand high: play your highest to win or force out a top card.',
      }
    return { card: lowest(follow), why: 'Third hand high only when it can help; here play low.' }
  }
  // second hand
  if (
    isDeclarerSide &&
    winningCards.length &&
    position === 1 &&
    trick.cards[0]!.seat !== partner(seat)
  ) {
    // declarer in second seat: usually low, but take a sure winner late in the hand
    if (played.length >= 32 && winningCards.length)
      return { card: lowest(winningCards), why: 'Late in the hand: take the trick while you can.' }
  }
  return {
    card: lowest(follow),
    why: 'Second hand low: let partner or the fourth hand decide the trick.',
  }
}

function beats(card: Card, trick: Trick, trump: Strain): boolean {
  const test: Trick = { ...trick, cards: [...trick.cards, { seat: 'N', card }] }
  return trickWinner(test, trump) === 'N' && !trick.cards.some((p) => p.seat === 'N')
}

function emptyHand(): Hand {
  return { S: [], H: [], D: [], C: [] }
}
function countSuit(hand: Hand, suit: Suit): number {
  return hand[suit].length
}

/** Duplicate-style score for the declaring side, not vulnerable. */
export function score(
  level: number,
  strain: Strain,
  tricksWon: number,
): { points: number; made: boolean; diff: number } {
  const needed = 6 + level
  const diff = tricksWon - needed
  if (diff < 0) return { points: -50 * -diff, made: false, diff }
  const perTrick = strain === 'C' || strain === 'D' ? 20 : 30
  let trickScore = perTrick * level + (strain === 'NT' ? 10 : 0)
  const overtricks = diff * perTrick
  let bonus = trickScore >= 100 ? 300 : 50
  if (level === 6) bonus += 500
  if (level === 7) bonus += 1000
  trickScore += overtricks
  return { points: trickScore + bonus, made: true, diff }
}

export function seatAfter(seat: Seat): Seat {
  return next(seat)
}

export { label as cardLabel }
