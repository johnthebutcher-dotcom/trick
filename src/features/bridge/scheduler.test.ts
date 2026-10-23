import { describe, expect, it } from 'vitest'
import { INTERVALS, planDrill, record, streak, unlockedSkills, type ProgressMap } from './scheduler'

const day = (s: string) => new Date(`${s}T12:00:00Z`)

describe('scheduler', () => {
  it('moves up the ladder on right answers and resets on wrong', () => {
    let map: ProgressMap = {}
    map = record(map, 'sayc:hcp:0', 'hcp', true, day('2026-10-22'))
    expect(map['sayc:hcp:0']!.due).toBe('2026-10-23')
    map = record(map, 'sayc:hcp:0', 'hcp', true, day('2026-10-23'))
    expect(map['sayc:hcp:0']!.due).toBe('2026-10-26') // +3
    map = record(map, 'sayc:hcp:0', 'hcp', false, day('2026-10-26'))
    expect(map['sayc:hcp:0']!.step).toBe(0)
    expect(map['sayc:hcp:0']!.due).toBe('2026-10-27')
    expect(INTERVALS[0]).toBe(1)
  })

  it('plans due hands first, then new ones, eight total', () => {
    let map: ProgressMap = {}
    for (let n = 0; n < 3; n++) map = record(map, `sayc:hcp:${n}`, 'hcp', false, day('2026-10-20'))
    const plan = planDrill(map, undefined, day('2026-10-22'))
    expect(plan.ids.length).toBe(8)
    expect(plan.dueCount).toBe(3)
    expect(plan.ids.slice(0, 3)).toEqual(['sayc:hcp:0', 'sayc:hcp:1', 'sayc:hcp:2'])
    expect(plan.ids[3]).toBe('sayc:hcp:3')
  })

  it('unlocks the next skill after enough hands', () => {
    let map: ProgressMap = {}
    expect(unlockedSkills(map)).toEqual(['hcp'])
    for (let n = 0; n < 16; n++) map = record(map, `sayc:hcp:${n}`, 'hcp', true)
    expect(unlockedSkills(map)).toEqual(['hcp', 'shape-points'])
  })

  it('counts a soft streak and forgives today not yet practised', () => {
    const s = streak(['2026-10-20', '2026-10-21'], day('2026-10-22'))
    expect(s.days).toBe(2)
    expect(s.practisedToday).toBe(false)
    expect(streak(['2026-10-18'], day('2026-10-22')).days).toBe(0)
  })
})
