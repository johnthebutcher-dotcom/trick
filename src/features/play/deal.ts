/** Four hands from one seed, plus seat helpers. Pure. */
import {
  fullDeck,
  RANKS,
  rng,
  SUITS,
  type Card,
  type Hand,
  type Rank,
  type Suit,
} from '@/features/bridge/cards'

export const SEATS = ['N', 'E', 'S', 'W'] as const
export type Seat = (typeof SEATS)[number]
export const SEAT_NAME: Record<Seat, string> = { N: 'North', E: 'East', S: 'South', W: 'West' }

export type Deal = Record<Seat, Hand>

export function next(seat: Seat): Seat {
  return SEATS[(SEATS.indexOf(seat) + 1) % 4]!
}
export function partner(seat: Seat): Seat {
  return SEATS[(SEATS.indexOf(seat) + 2) % 4]!
}
export function sameSide(a: Seat, b: Seat): boolean {
  return a === b || partner(a) === b
}

export function dealFour(seed: number): Deal {
  const random = rng(seed)
  const deck = fullDeck()
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const a = deck[i]!
    deck[i] = deck[j]!
    deck[j] = a
  }
  const empty = (): Hand => ({ S: [], H: [], D: [], C: [] })
  const deal: Deal = { N: empty(), E: empty(), S: empty(), W: empty() }
  deck.forEach((card, i) => {
    deal[SEATS[i % 4]!][card.suit].push(card.rank)
  })
  for (const seat of SEATS)
    for (const suit of SUITS) deal[seat][suit].sort((x, y) => RANKS.indexOf(x) - RANKS.indexOf(y))
  return deal
}

export function cardsOf(hand: Hand): Card[] {
  const out: Card[] = []
  for (const suit of SUITS) for (const rank of hand[suit]) out.push({ suit, rank })
  return out
}

export function removeCard(hand: Hand, card: Card): Hand {
  return { ...hand, [card.suit]: hand[card.suit].filter((r) => r !== card.rank) }
}

export function rankValue(rank: Rank): number {
  return 14 - RANKS.indexOf(rank) // A=14 … 2=2
}

export function cardKey(card: Card): string {
  return `${card.rank}${card.suit}`
}

export function countCards(hand: Hand): number {
  return hand.S.length + hand.H.length + hand.D.length + hand.C.length
}

export function suitLength(hand: Hand, suit: Suit): number {
  return hand[suit].length
}
