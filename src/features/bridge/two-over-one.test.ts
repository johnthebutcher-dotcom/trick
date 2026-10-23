import { describe, expect, it } from 'vitest'
import { type Hand } from './cards'
import { openingBid, openOrPass } from './systems/sayc'
import { rulesFor, SYSTEMS } from './systems'
import { respondToMajor } from './systems/responses'
import { buildQuestion, questionId, SKILLS } from './skills'

function hand(s: string, h: string, d: string, c: string): Hand {
  const split = (x: string) => x.split('') as Hand['S']
  return { S: split(s), H: split(h), D: split(d), C: split(c) }
}

describe('2-over-1 is available and shares the openings', () => {
  it('is a selectable system', () => {
    expect(SYSTEMS.find((s) => s.id === 'two-over-one')?.available).toBe(true)
    expect(rulesFor('two-over-one').respondingVariant).toBe('two-over-one')
    expect(rulesFor('sayc').respondingVariant).toBe('standard')
    expect(rulesFor('acol').respondingVariant).toBe('standard')
  })
  it('opens exactly the same as Standard American', () => {
    const two = rulesFor('two-over-one')
    const samples = [
      hand('AKQ52', 'K43', 'Q32', '32'),
      hand('AK5', 'KQ4', 'Q32', 'J432'),
      hand('AK43', 'K432', 'Q32', 'J3'),
      hand('K954', '843', 'Q32', '432'),
    ]
    for (const h of samples) {
      expect(two.openOrPass(h)).toEqual(openOrPass(h))
      expect(two.openingBid(h)).toEqual(openingBid(h))
    }
  })
})

describe('responding to 1 of a major', () => {
  it('passes with 5 or fewer, in both variants', () => {
    const weak = hand('432', '32', '8432', '8432') // 0
    expect(respondToMajor(weak, 'H', 'standard').bid).toBe('Pass')
    expect(respondToMajor(weak, 'H', 'two-over-one').bid).toBe('Pass')
  })

  it('raises the major with a fit and 6–10, in both variants', () => {
    const fit = hand('432', 'KQ2', 'Q432', '432') // 7, 3 hearts
    expect(respondToMajor(fit, 'H', 'standard').bid).toBe('2♥')
    expect(respondToMajor(fit, 'H', 'two-over-one').bid).toBe('2♥')
  })

  it('shows a one-level new suit the same way', () => {
    const spades = hand('KJ32', '32', '432', 'Q432') // 6, 4 spades, no heart fit
    expect(respondToMajor(spades, 'H', 'standard').bid).toBe('1♠')
    expect(respondToMajor(spades, 'H', 'two-over-one').bid).toBe('1♠')
  })

  it('DIVERGES on an invitational hand with a two-level suit', () => {
    // 11 points, no spade fit, four diamonds: standard bids 2♦ (10+), 2/1 bids a forcing 1NT.
    const inv = hand('32', 'Q32', 'AQ54', 'K432') // 11
    expect(respondToMajor(inv, 'S', 'standard').bid).toBe('2♦')
    expect(respondToMajor(inv, 'S', 'two-over-one').bid).toBe('1NT')
  })

  it('both bid a two-level suit with game-forcing values (2/1 forces to game)', () => {
    const gf = hand('32', 'K32', 'AQJ4', 'AQ3') // 16, no spade fit over 1♠
    expect(respondToMajor(gf, 'S', 'standard').bid).toBe('2♦')
    expect(respondToMajor(gf, 'S', 'two-over-one').bid).toBe('2♦')
    expect(respondToMajor(gf, 'S', 'two-over-one').why).toMatch(/game forcing/i)
  })

  it('makes the catch-all 1NT when there is nothing else, 2/1 forcing', () => {
    const min = hand('432', '32', 'KJ3', 'Q5432') // 6, no heart fit, clubs longer than diamonds
    expect(respondToMajor(min, 'H', 'standard').bid).toBe('1NT')
    expect(respondToMajor(min, 'H', 'two-over-one').bid).toBe('1NT')
    expect(respondToMajor(min, 'H', 'two-over-one').more).toMatch(/forcing/i)
  })
})

describe('responding drill questions', () => {
  const RESPOND = 'respond-1-suit'

  it('is in the skill ladder', () => {
    expect(SKILLS.some((s) => s.id === RESPOND)).toBe(true)
  })

  it('always offers the correct answer among the options', () => {
    for (const system of ['sayc', 'two-over-one', 'acol'] as const) {
      for (let n = 0; n < 40; n++) {
        const q = buildQuestion(questionId(RESPOND, n, system))!
        expect(q.options).toContain(q.answer)
      }
    }
  })

  it('asks about the same hand but can answer differently per system', () => {
    let diverged = false
    for (let n = 0; n < 60; n++) {
      const sa = buildQuestion(questionId(RESPOND, n, 'sayc'))!
      const two = buildQuestion(questionId(RESPOND, n, 'two-over-one'))!
      expect(two.hand).toEqual(sa.hand) // same hand, same opener
      expect(two.prompt).toBe(sa.prompt)
      if (two.answer !== sa.answer) diverged = true
    }
    expect(diverged).toBe(true)
  })

  it('keeps 2-over-1 responding ids separate from SAYC', () => {
    expect(questionId(RESPOND, 3, 'two-over-one')).toBe('two-over-one:respond-1-suit:3')
    expect(questionId(RESPOND, 3, 'sayc')).toBe('sayc:respond-1-suit:3')
  })
})
