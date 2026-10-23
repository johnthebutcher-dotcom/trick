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
    expect(contractOf(a)).toEqual({ level: 3, strain: 'NT', declarer: 'N' })
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
})
