/** Contextual tips shown when "Tips" is on. One sentence, shown at the moment it matters. */
import type { Strain } from './auction'
import type { Seat } from './deal'
import type { GameState } from './useGame'
import { sameSide } from './deal'

export function tipFor(state: GameState, human: Seat): string | null {
  if (state.phase === 'auction') {
    if (!state.auction.some((e) => e.call.type === 'bid'))
      return 'Count your points first. 13 or more opens; 11–12 needs the rule of 20.'
    const partnerBid = state.auction.find(
      (e) => sameSide(e.seat, human) && e.seat !== human && e.call.type === 'bid',
    )
    if (partnerBid)
      return 'Partner has bid. Ask: do I have a fit (3+ cards in their suit), and how many points do we have together? 25 is game.'
    return 'Opponents opened. Overcall only with a good five-card suit and 8–16 points; otherwise pass and defend.'
  }
  if (state.phase === 'play' && state.contract) {
    const c = state.contract
    const declarerSide = sameSide(human, c.declarer)
    const trump: Strain = c.strain
    if (state.tricks.length === 0 && state.current.cards.length === 0) {
      if (declarerSide) return null
      return trump === 'NT'
        ? 'Opening lead against no-trump: fourth-best from your longest suit.'
        : 'Opening lead against a suit contract: top of a sequence is safest; avoid leading away from an ace.'
    }
    if (declarerSide && state.tricks.length === 0 && state.current.cards.length === 1) {
      return trump === 'NT'
        ? 'Count your sure winners before playing from dummy. How many more do you need?'
        : 'Count your losers. Plan to draw trumps before cashing side-suit winners.'
    }
    if (!declarerSide && state.current.cards.length === 1 && state.current.cards[0]!.seat !== human)
      return 'Second hand low, unless you can see a reason to go up.'
    if (!declarerSide && state.current.cards.length === 2)
      return 'Third hand high: play your highest to win or force out a top card.'
    if (state.current.cards.length === 3)
      return 'Fourth hand: win as cheaply as you can, or play low if partner has it.'
    if (declarerSide && trump !== 'NT' && state.tricks.length < 4)
      return 'Still drawing trumps? Stop once the defenders have none left.'
    return null
  }
  return null
}
