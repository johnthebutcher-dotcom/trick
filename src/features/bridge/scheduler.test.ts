import { describe, expect, it } from 'vitest'
import { INTERVALS, planDrill, record, streak, unlockedSkills, type ProgressMap } from './scheduler'

const day = (s: string) => new Date(`${s}T12:00:00Z`)

describe('scheduler', () => {
  it('moves up the ladder on right answers and resets on wrong', () => {
    let map: ProgressMap = {}
    map = record(map, 'hcp:0', 'hcp', true, day('2026-10-22'))
    expect(map['hcp:0']!.due).toBe('2026-10-23')
    map = record(map, 'hcp:0', 'hcp', true, day('2026-10-23'))
    expect(map['hcp:0']!.due).toBe('2026-10-26') // +3
    map = record(map, 'hcp:0', 'hcp', false, day('2026-10-26'))
    expect(map['hcp:0']!.step).toBe(0)
    expect(map['hcp:0']!.due).toBe('2026-10-27')
    expect(INTERVALS[0]).toBe(1)
  })

  it('plans due hands first, then new ones, eight total', () => {
    let map: ProgressMap = {}
    for (let n = 0; n < 3; n++) map = record(map, `hcp:${n}`, 'hcp', false, day('2026-10-20'))
    const plan = planDrill(map, undefined, 'sayc', day('2026-10-22'))
    expect(plan.ids.length).toBe(8)
    expect(plan.dueCount).toBe(3)
    expect(plan.ids.slice(0, 3)).toEqual(['hcp:0', 'hcp:1', 'hcp:2'])
    expect(plan.ids[3]).toBe('hcp:3')
  })

  it('gives each system its own ladder for bidding skills', () => {
    let map: ProgressMap = {}
    // 16 point-counting hands to unlock the bidding skills.
    for (let n = 0; n < 16; n++) map = record(map, `hcp:${n}`, 'hcp', true, day('2026-10-20'))
    for (let n = 0; n < 16; n++)
      map = record(map, `shape-points:${n}`, 'shape-points', true, day('2026-10-20'))
    const sayc = planDrill(map, 'opening-bid', 'sayc', day('2026-10-22'))
    const acol = planDrill(map, 'opening-bid', 'acol', day('2026-10-22'))
    expect(sayc.ids[0]).toBe('sayc:opening-bid:0')
    expect(acol.ids[0]).toBe('acol:opening-bid:0')
  })

  it('unlocks the next skill after enough hands', () => {
    let map: ProgressMap = {}
    expect(unlockedSkills(map)).toEqual(['hcp'])
    for (let n = 0; n < 16; n++) map = record(map, `hcp:${n}`, 'hcp', true)
    expect(unlockedSkills(map)).toEqual(['hcp', 'shape-points'])
  })

  it('counts a soft streak and forgives today not yet practised', () => {
    const s = streak(['2026-10-20', '2026-10-21'], day('2026-10-22'))
    expect(s.days).toBe(2)
    expect(s.practisedToday).toBe(false)
    expect(streak(['2026-10-18'], day('2026-10-22')).days).toBe(0)
  })
})
