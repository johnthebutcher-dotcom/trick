import { describe, expect, it } from 'vitest'
import type { Hand } from '@/features/bridge/cards'
import { advise, contractOf, isLegal, isOver, legalCalls, type AuctionEntry } from './auction'
import { dealFour, countCards } from './deal'
import { legalCards, score, trickWinner, type Trick } from './play'

const hand = (s: string, h: string, d: string, c: string): Hand => ({
  S: s.split('') as Hand['S'],
  H: h.split('') as Hand['H'],
  D: d.split('') as Hand['D'],
  C: c.split('') as Hand['C'],
})

describe('deal', () => {
  it('deals 13 cards to each of four seats, all 52 once', () => {
    const d = dealFour(99)
    expect(countCards(d.N) + countCards(d.E) + countCards(d.S) + countCards(d.W)).toBe(52)
    const all = new Set<string>()
    for (const seat of ['N', 'E', 'S', 'W'] as const)
      for (const suit of ['S', 'H', 'D', 'C'] as const)
        for (const r of d[seat][suit]) all.add(r + suit)
    expect(all.size).toBe(52)
  })
})

describe('auction', () => {
  it('requires each bid to be higher than the last', () => {
    const a: AuctionEntry[] = [{ seat: 'N', call: { type: 'bid', level: 1, strain: 'H' } }]
    expect(isLegal(a, { type: 'bid', level: 1, strain: 'S' })).toBe(true)
    expect(isLegal(a, { type: 'bid', level: 1, strain: 'D' })).toBe(false)
    expect(isLegal(a, { type: 'bid', level: 2, strain: 'C' })).toBe(true)
    expect(legalCalls(a)[0]).toEqual({ type: 'pass' })
  })
  it('ends after three passes following a bid and finds the declarer', () => {
    const a: AuctionEntry[] = [
      { seat: 'N', call: { type: 'bid', level: 1, strain: 'NT' } },
      { seat: 'E', call: { type: 'pass' } },
      { seat: 'S', call: { type: 'bid', level: 3, strain: 'NT' } },
      { seat: 'W', call: { type: 'pass' } },
      { seat: 'N', call: { type: 'pass' } },
      { seat: 'E', call: { type: 'pass' } },
    ]
    expect(isOver(a)).toBe(true)
    expect(contractOf(a)).toEqual({ level: 3, strain: 'NT', declarer: 'N', risk: 'none' })
  })
  it('allows double of an opponent bid and redouble by that side only', () => {
    // N bids 1S; E (opponent) may double; N/S may not double their own bid.
    const afterBid: AuctionEntry[] = [{ seat: 'N', call: { type: 'bid', level: 1, strain: 'S' } }]
    expect(isLegal(afterBid, { type: 'double' })).toBe(true) // E to act, opponent of N
    expect(isLegal(afterBid, { type: 'redouble' })).toBe(false)
    const afterDouble: AuctionEntry[] = [...afterBid, { seat: 'E', call: { type: 'double' } }]
    // S to act (N's partner): may redouble, may not double again.
    expect(isLegal(afterDouble, { type: 'redouble' })).toBe(true)
    expect(isLegal(afterDouble, { type: 'double' })).toBe(false)
    // A new bid clears the double state.
    const afterRebid: AuctionEntry[] = [
      ...afterDouble,
      { seat: 'S', call: { type: 'bid', level: 2, strain: 'S' } },
    ]
    expect(isLegal(afterRebid, { type: 'redouble' })).toBe(false)
    expect(isLegal(afterRebid, { type: 'double' })).toBe(true) // W (opponent) may double 2S
  })
  it('carries the double through to the contract', () => {
    const a: AuctionEntry[] = [
      { seat: 'N', call: { type: 'bid', level: 4, strain: 'S' } },
      { seat: 'E', call: { type: 'double' } },
      { seat: 'S', call: { type: 'pass' } },
      { seat: 'W', call: { type: 'pass' } },
      { seat: 'N', call: { type: 'pass' } },
    ]
    expect(isOver(a)).toBe(true)
    expect(contractOf(a)).toEqual({ level: 4, strain: 'S', declarer: 'N', risk: 'doubled' })
  })
  it('bot opens a 1NT hand and partner raises to game with 10+', () => {
    const opener = hand('AK5', 'KQ4', 'Q32', 'J432') // 15 balanced
    const open = advise([], 'N', opener)
    expect(open.call).toEqual({ type: 'bid', level: 1, strain: 'NT' })
    const responder = hand('Q32', 'A32', 'K432', 'Q32') // 11
    const a: AuctionEntry[] = [
      { seat: 'N', call: open.call },
      { seat: 'E', call: { type: 'pass' } },
    ]
    expect(advise(a, 'S', responder).call).toEqual({ type: 'bid', level: 3, strain: 'NT' })
  })

  it('responds to a 1-major opening by the chosen system (default Standard American)', () => {
    // Partner opened 1♠; responder has 11 points, no fit, five diamonds.
    const responder = hand('32', 'Q3', 'AQ542', 'K432') // 11
    const a: AuctionEntry[] = [
      { seat: 'N', call: { type: 'bid', level: 1, strain: 'S' } },
      { seat: 'E', call: { type: 'pass' } },
    ]
    // Standard systems bid the two-level suit on 10+; 2-over-1 needs game values, so 1NT.
    expect(advise(a, 'S', responder).call).toEqual({ type: 'bid', level: 2, strain: 'D' })
    expect(advise(a, 'S', responder, 'sayc').call).toEqual({ type: 'bid', level: 2, strain: 'D' })
    expect(advise(a, 'S', responder, 'two-over-one').call).toEqual({
      type: 'bid',
      level: 1,
      strain: 'NT',
    })
  })
})

describe('play', () => {
  it('must follow suit when able', () => {
    const h = hand('A2', 'K', 'QJ', '98765432')
    const trick: Trick = {
      leader: 'W',
      cards: [{ seat: 'W', card: { suit: 'S', rank: '5' } }],
      winner: null,
    }
    expect(legalCards(h, trick).map((c) => c.suit)).toEqual(['S', 'S'])
  })
  it('finds the trick winner with and without trumps', () => {
    const t: Trick = {
      leader: 'N',
      cards: [
        { seat: 'N', card: { suit: 'H', rank: 'K' } },
        { seat: 'E', card: { suit: 'H', rank: 'A' } },
        { seat: 'S', card: { suit: 'C', rank: '2' } },
        { seat: 'W', card: { suit: 'H', rank: '3' } },
      ],
      winner: null,
    }
    expect(trickWinner(t, 'NT')).toBe('E')
    expect(trickWinner(t, 'C')).toBe('S')
  })
  it('scores part-scores, games and sets', () => {
    expect(score(3, 'NT', 9)).toEqual({ points: 400, made: true, diff: 0 })
    expect(score(4, 'S', 11)).toEqual({ points: 450, made: true, diff: 1 })
    expect(score(2, 'C', 8)).toEqual({ points: 90, made: true, diff: 0 })
    expect(score(3, 'H', 7)).toEqual({ points: -100, made: false, diff: -2 })
  })
  it('scores doubling and vulnerability', () => {
    // 4S doubled, made exactly, not vulnerable: 120*2 trick + 300 game + 50 insult = 590.
    expect(score(4, 'S', 10, 'doubled', false)).toEqual({ points: 590, made: true, diff: 0 })
    // Same, vulnerable: 240 trick + 500 game + 50 = 790.
    expect(score(4, 'S', 10, 'doubled', true).points).toBe(790)
    // 3NT doubled +1 not vulnerable: 200 trick + 300 game + 100 overtrick + 50 = 650.
    expect(score(3, 'NT', 10, 'doubled', false).points).toBe(650)
    // Down 2, doubled, not vulnerable: 100 + 200 = 300.
    expect(score(4, 'S', 8, 'doubled', false)).toEqual({ points: -300, made: false, diff: -2 })
    // Down 2, doubled, vulnerable: 200 + 300 = 500.
    expect(score(4, 'S', 8, 'doubled', true).points).toBe(-500)
    // Down 1, redoubled, not vulnerable: 100 doubled -> 200.
    expect(score(4, 'S', 9, 'redoubled', false).points).toBe(-200)
    // Vulnerable undoubled game: 4S = 120 trick + 500 game = 620.
    expect(score(4, 'S', 10, 'none', true).points).toBe(620)
  })
})
