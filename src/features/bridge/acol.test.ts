import { describe, expect, it } from 'vitest'
import { hcp, isBalanced, shape, type Hand } from './cards'
import { openOrPass, openingBid } from './systems/acol'
import { buildQuestion, questionId } from './skills'

function hand(s: string, h: string, d: string, c: string): Hand {
  const split = (x: string) => x.split('') as Hand['S']
  return { S: split(s), H: split(h), D: split(d), C: split(c) }
}

describe('Acol openings', () => {
  it('opens 13+ and passes weak hands, rule of 20 like SAYC', () => {
    expect(openOrPass(hand('AKQ5', 'K43', 'Q32', '432')).bid).toBe('Open') // 13
    expect(openOrPass(hand('K954', '843', 'Q32', '432')).bid).toBe('Pass') // 5
    expect(openOrPass(hand('AKJ52', 'KJ932', '32', '2')).bid).toBe('Open') // 12 HCP + 5 + 5
    expect(openOrPass(hand('AKJ5', 'K43', 'J32', '432')).bid).toBe('Pass') // 12 HCP, 4-3-3-3
  })

  it('opens a WEAK 1NT on 12–14 balanced (the signature Acol difference)', () => {
    const h = hand('AK5', 'K43', 'Q32', 'J432') // 13 balanced, no 5-card major
    expect(hcp(h)).toBe(13)
    expect(isBalanced(h)).toBe(true)
    expect(openingBid(h).bid).toBe('1NT')
    // 15 balanced is NOT a weak NT in Acol: it opens a suit.
    const strong = hand('AK5', 'KQ4', 'Q32', 'J432') // 15 balanced
    expect(hcp(strong)).toBe(15)
    expect(openingBid(strong).bid).not.toBe('1NT')
  })

  it('opens 2NT on 20–22 balanced', () => {
    const h = hand('AKQ', 'KQJ', 'KQ2', 'J432') // 21 balanced
    expect(hcp(h)).toBe(21)
    expect(isBalanced(h)).toBe(true)
    expect(openingBid(h).bid).toBe('2NT')
  })

  it('opens four-card majors', () => {
    // 16 balanced, 4-4 in the majors: open the lower major, 1♥.
    const bothMajors = hand('AKQ4', 'KQ32', 'Q32', '32')
    expect(hcp(bothMajors)).toBe(16)
    expect(openingBid(bothMajors).bid).toBe('1♥')
    // 15, unbalanced (singleton club), a plain four-card spade suit: 1♠.
    const fourSpades = hand('AKQ4', '432', 'AQ32', '3')
    expect(hcp(fourSpades)).toBe(15)
    expect(isBalanced(fourSpades)).toBe(false)
    expect(openingBid(fourSpades).bid).toBe('1♠')
  })

  it('opens the longer minor, prepared 1♣ when the minors are equal', () => {
    // 15, no four-card major, diamonds (5) longer than clubs (2).
    const diLong = hand('AQ2', 'KQ2', 'KJ432', '32')
    expect(openingBid(diLong).bid).toBe('1♦')
    // 13, no four-card major, 4-4 in the minors: the prepared club.
    const equalMinors = hand('A32', 'K32', 'Q432', 'KJ32')
    expect(shape(equalMinors)).toBe('4-4-3-3')
    expect(openingBid(equalMinors).bid).toBe('1♣')
  })

  it('builds stable Acol opening-bid questions with the answer among the options', () => {
    for (let n = 0; n < 40; n++) {
      const id = questionId('opening-bid', n, 'acol')
      const q = buildQuestion(id)!
      expect(id.startsWith('acol:')).toBe(true)
      expect(hcp(q.hand)).toBeGreaterThanOrEqual(12)
      expect(hcp(q.hand)).toBeLessThanOrEqual(22)
      expect(q.options).toContain(q.answer)
    }
  })
})
