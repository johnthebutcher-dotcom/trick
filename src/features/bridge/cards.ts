/**
 * Cards, hands and hand evaluation. Pure functions, no UI.
 * Hands are dealt from a seeded generator so every hand has a stable id and
 * the same hand comes back for the same id on every device.
 */

export const SUITS = ['S', 'H', 'D', 'C'] as const
export type Suit = (typeof SUITS)[number]

/**
 * The order to show the four suits in when a *player holds a hand on screen*.
 * Colours alternate (black, red, black, red) so a heart is never next to a
 * diamond and a spade never next to a club — the standard way bridge players
 * arrange a hand so cards aren't misread at a glance. `SUITS` stays in rank
 * order (♠♥♦♣) for the cheat-sheet, bidding and all logic; this is display only.
 */
export const HAND_SUITS = ['S', 'H', 'C', 'D'] as const satisfies readonly Suit[]
export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
export type Rank = (typeof RANKS)[number]

export interface Card {
  suit: Suit
  rank: Rank
}

/** A hand grouped by suit, each suit sorted high to low. */
export type Hand = Record<Suit, Rank[]>

export const SUIT_SYMBOL: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' }
export const SUIT_NAME: Record<Suit, string> = {
  S: 'spades',
  H: 'hearts',
  D: 'diamonds',
  C: 'clubs',
}
export const RED_SUITS: ReadonlySet<Suit> = new Set<Suit>(['H', 'D'])

const HCP: Partial<Record<Rank, number>> = { A: 4, K: 3, Q: 2, J: 1 }

/** Small, fast, deterministic PRNG (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stable 32-bit hash of a string (FNV-1a). */
export function hashString(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function fullDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ suit, rank })
  return deck
}

/** Deal one 13-card hand from a seed. */
export function dealHand(seed: number): Hand {
  const random = rng(seed)
  const deck = fullDeck()
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const a = deck[i]!
    deck[i] = deck[j]!
    deck[j] = a
  }
  const hand: Hand = { S: [], H: [], D: [], C: [] }
  for (const card of deck.slice(0, 13)) hand[card.suit].push(card.rank)
  for (const suit of SUITS) {
    hand[suit].sort((x, y) => RANKS.indexOf(x) - RANKS.indexOf(y))
  }
  return hand
}

export function hcp(hand: Hand): number {
  let total = 0
  for (const suit of SUITS) for (const rank of hand[suit]) total += HCP[rank] ?? 0
  return total
}

/** HCP per suit, for "show me" breakdowns. */
export function hcpBySuit(hand: Hand): Record<Suit, number> {
  const out = { S: 0, H: 0, D: 0, C: 0 }
  for (const suit of SUITS) for (const rank of hand[suit]) out[suit] += HCP[rank] ?? 0
  return out
}

/** Honours in a hand as readable tokens, e.g. ["A♠", "K♥"]. */
export function honours(hand: Hand): string[] {
  const out: string[] = []
  for (const suit of SUITS) {
    for (const rank of hand[suit]) if (HCP[rank]) out.push(`${rank}${SUIT_SYMBOL[suit]}`)
  }
  return out
}

/** Suit lengths, e.g. { S: 5, H: 3, D: 3, C: 2 }. */
export function lengths(hand: Hand): Record<Suit, number> {
  return { S: hand.S.length, H: hand.H.length, D: hand.D.length, C: hand.C.length }
}

/** Shape as sorted lengths, e.g. "5-3-3-2". */
export function shape(hand: Hand): string {
  return Object.values(lengths(hand))
    .sort((a, b) => b - a)
    .join('-')
}

const BALANCED = new Set(['4-3-3-3', '4-4-3-2', '5-3-3-2'])
export function isBalanced(hand: Hand): boolean {
  return BALANCED.has(shape(hand))
}

/** Distribution points when the hand will be played in a suit: void 3, singleton 2, doubleton 1. */
export function distributionPoints(hand: Hand): number {
  let pts = 0
  for (const n of Object.values(lengths(hand))) {
    if (n === 0) pts += 3
    else if (n === 1) pts += 2
    else if (n === 2) pts += 1
  }
  return pts
}

/** The two longest suit lengths added together (for the rule of 20). */
export function twoLongest(hand: Hand): number {
  const [a = 0, b = 0] = Object.values(lengths(hand)).sort((x, y) => y - x)
  return a + b
}

export function handToString(hand: Hand): string {
  return SUITS.map((s) => `${SUIT_SYMBOL[s]}${hand[s].join('') || '—'}`).join(' ')
}
