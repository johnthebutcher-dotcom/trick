import { describe, expect, it } from 'vitest'
import { dealHand, distributionPoints, hcp, isBalanced, shape, type Hand } from './cards'
import { openOrPass, openingBid } from './systems/sayc'
import { buildQuestion, questionId } from './skills'

function hand(s: string, h: string, d: string, c: string): Hand {
  const split = (x: string) => x.split('') as Hand['S']
  return { S: split(s), H: split(h), D: split(d), C: split(c) }
}

describe('hand evaluation', () => {
  it('counts high-card points', () => {
    expect(hcp(hand('AKQJ', 'T98', '765', '432'))).toBe(10)
    expect(hcp(hand('AK', 'AK', 'AK', 'AKQJT98'))).toBe(31)
  })
  it('knows shape and balance', () => {
    const h = hand('AKQ52', 'K43', 'Q32', '32')
    expect(shape(h)).toBe('5-3-3-2')
    expect(isBalanced(h)).toBe(true)
    expect(isBalanced(hand('AKQJ52', 'K4', 'Q32', '32'))).toBe(false)
  })
  it('adds distribution points for short suits', () => {
    expect(distributionPoints(hand('AKQJT9876', 'K', '', '432'))).toBe(2 + 3)
  })
  it('deals 13 cards deterministically', () => {
    const a = dealHand(42)
    const b = dealHand(42)
    expect(a).toEqual(b)
    expect(a.S.length + a.H.length + a.D.length + a.C.length).toBe(13)
  })
})

describe('Standard American openings', () => {
  it('opens 13+ and passes weak hands', () => {
    expect(openOrPass(hand('AKQ5', 'K43', 'Q32', '432')).bid).toBe('Open') // 13
    expect(openOrPass(hand('K954', '843', 'Q32', '432')).bid).toBe('Pass') // 5
  })
  it('applies the rule of 20 on 11–12', () => {
    expect(openOrPass(hand('AKJ52', 'KJ932', '32', '2')).bid).toBe('Open') // 12 HCP + 5 + 5 = 22
    expect(openOrPass(hand('AKJ5', 'K43', 'J32', '432')).bid).toBe('Pass') // 12 HCP, 4-3-3-3: 12 + 7 = 19
    expect(openOrPass(hand('AK32', 'K43', 'Q432', '32')).bid).toBe('Open') // 12 HCP, 4-4-3-2: 12 + 8 = 20
  })
  it('bids 1NT and 2NT on balanced hands in range', () => {
    expect(openingBid(hand('AK5', 'KQ4', 'Q32', 'J432')).bid).toBe('1NT') // 15
    expect(openingBid(hand('AKQ', 'KQJ', 'KQ2', 'J432')).bid).toBe('2NT') // 21
  })
  it('opens five-card majors, higher of two', () => {
    expect(openingBid(hand('AKQ52', 'K43', 'Q32', '32')).bid).toBe('1♠') // 13, 5332 but 13 < 15
    expect(openingBid(hand('AK532', 'KQ432', '3', '32')).bid).toBe('1♠')
    expect(openingBid(hand('A32', 'KQ432', 'K32', '32')).bid).toBe('1♥')
  })
  it('opens the longer minor, 1♦ with 4-4, 1♣ with 3-3', () => {
    expect(openingBid(hand('AK43', 'K432', 'Q32', 'J3')).bid).toBe('1♦') // 13 HCP, 4-4-3-2: diamonds longer than clubs
    expect(openingBid(hand('A432', 'K', 'Q432', 'K432')).bid).toBe('1♦') // 12 HCP, 4-4 in the minors
    expect(openingBid(hand('AK4', 'K432', 'Q32', 'J32')).bid).toBe('1♣') // 13 HCP, 3-3 in the minors
    expect(openingBid(hand('AKJ5', 'K43', 'Q32', '432')).bid).toBe('1♣') // 13 HCP, 4-3-3-3, below the 1NT range
  })
})

describe('questions', () => {
  it('builds a stable question with the right answer among the options', () => {
    const id = questionId('hcp', 0)
    const q1 = buildQuestion(id)!
    const q2 = buildQuestion(id)!
    expect(q1).toEqual(q2)
    expect(q1.options).toContain(q1.answer)
    expect(String(hcp(q1.hand))).toBe(q1.answer)
  })
  it('only asks opening-bid questions on teachable openers', () => {
    for (let n = 0; n < 40; n++) {
      const q = buildQuestion(questionId('opening-bid', n))!
      expect(hcp(q.hand)).toBeGreaterThanOrEqual(12)
      expect(q.options).toContain(q.answer)
    }
  })
})
