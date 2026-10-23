/**
 * The auction: legal calls, contract resolution, and a simple bot bidder that
 * follows the same Standard American rules the drills teach. The bot is also
 * the hint engine for the human seat.
 */
import {
  hcp,
  isBalanced,
  lengths,
  SUIT_SYMBOL,
  type Hand,
  type Suit,
} from '@/features/bridge/cards'
import { rulesFor, type SystemId } from '@/features/bridge/systems'
import { next, partner, sameSide, type Seat } from './deal'

export type Strain = 'C' | 'D' | 'H' | 'S' | 'NT'
export const STRAINS: Strain[] = ['C', 'D', 'H', 'S', 'NT']
export const STRAIN_LABEL: Record<Strain, string> = {
  C: '♣',
  D: '♦',
  H: '♥',
  S: '♠',
  NT: 'NT',
}

export type Call = { type: 'pass' } | { type: 'bid'; level: number; strain: Strain }

export interface AuctionEntry {
  seat: Seat
  call: Call
}

export interface Contract {
  level: number
  strain: Strain
  declarer: Seat
}

export function callLabel(call: Call): string {
  return call.type === 'pass' ? 'Pass' : `${call.level}${STRAIN_LABEL[call.strain]}`
}

export function bidRank(level: number, strain: Strain): number {
  return (level - 1) * 5 + STRAINS.indexOf(strain)
}

export function lastBid(entries: AuctionEntry[]): AuctionEntry | null {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i]!
    if (e.call.type === 'bid') return e
  }
  return null
}

export function isLegal(entries: AuctionEntry[], call: Call): boolean {
  if (call.type === 'pass') return true
  const last = lastBid(entries)
  if (!last || last.call.type !== 'bid') return call.level >= 1 && call.level <= 7
  return bidRank(call.level, call.strain) > bidRank(last.call.level, last.call.strain)
}

/** Auction over: three passes after a bid, or four passes with no bid. */
export function isOver(entries: AuctionEntry[]): boolean {
  if (entries.length < 4) return false
  const tail = entries.slice(-3)
  const allPass = tail.every((e) => e.call.type === 'pass')
  if (lastBid(entries)) return allPass
  return entries.length >= 4 && entries.slice(-4).every((e) => e.call.type === 'pass')
}

/** Declarer is the first player on the winning side to have bid the final strain. */
export function contractOf(entries: AuctionEntry[]): Contract | null {
  const last = lastBid(entries)
  if (!last || last.call.type !== 'bid') return null
  const { level, strain } = last.call
  for (const e of entries) {
    if (e.call.type === 'bid' && e.call.strain === strain && sameSide(e.seat, last.seat)) {
      return { level, strain, declarer: e.seat }
    }
  }
  return { level, strain, declarer: last.seat }
}

export function contractLabel(c: Contract): string {
  return `${c.level}${STRAIN_LABEL[c.strain]}`
}

/** Minimum level at which `strain` can be bid now. */
function cheapestLevel(entries: AuctionEntry[], strain: Strain): number {
  const last = lastBid(entries)
  if (!last || last.call.type !== 'bid') return 1
  const lv = last.call.level
  return STRAINS.indexOf(strain) > STRAINS.indexOf(last.call.strain) ? lv : lv + 1
}

export interface Advice {
  call: Call
  why: string
}

const suitOfBid = (s: string): Strain =>
  s.endsWith('NT')
    ? 'NT'
    : (Object.entries(STRAIN_LABEL).find(([, v]) => v === s.slice(1))?.[0] as Strain)

/** The bot (and the hint). Follows the chosen system, kept to what the drills teach. */
export function advise(
  entries: AuctionEntry[],
  seat: Seat,
  hand: Hand,
  system: SystemId = 'sayc',
): Advice {
  const { openOrPass, openingBid, oneNoTrump, respondingVariant } = rulesFor(system)
  const gameForcingTwoLevel = respondingVariant === 'two-over-one'
  const points = hcp(hand)
  const len = lengths(hand)
  const mine = entries.filter((e) => e.seat === seat)
  const partnerEntries = entries.filter((e) => e.seat === partner(seat))
  const partnerBid = [...partnerEntries].reverse().find((e) => e.call.type === 'bid')
  const opponentsOpened = entries.some((e) => e.call.type === 'bid' && !sameSide(e.seat, seat))
  const weOpened = entries.some((e) => e.call.type === 'bid' && sameSide(e.seat, seat))
  const pass: Advice = { call: { type: 'pass' }, why: 'Nothing to add. Pass.' }

  // 1. Nobody has bid yet: open or pass.
  if (!lastBid(entries)) {
    const d = openOrPass(hand)
    if (d.bid === 'Pass') return { call: { type: 'pass' }, why: d.why }
    const o = openingBid(hand)
    const strain = suitOfBid(o.bid)
    const level = o.bid.startsWith('2') ? 2 : 1
    return { call: { type: 'bid', level, strain }, why: o.why }
  }

  // 2. Partner opened and I have not spoken: respond.
  const iHaveBid = mine.some((e) => e.call.type === 'bid')
  if (partnerBid && partnerBid.call.type === 'bid' && !iHaveBid) {
    const pb = partnerBid.call
    if (pb.strain === 'NT' && pb.level === 1) {
      const ntLabel = `${oneNoTrump.min}–${oneNoTrump.max}`
      // 1NT shows a known point count; aim for ~25 combined for game, ~23 to invite.
      const inviteFrom = 25 - oneNoTrump.max
      const gameFrom = 26 - oneNoTrump.min
      if (points < inviteFrom)
        return { call: { type: 'pass' }, why: `${points} points opposite ${ntLabel}: pass.` }
      if (points < gameFrom)
        return legal(
          entries,
          { type: 'bid', level: 2, strain: 'NT' },
          `${points} points opposite ${ntLabel}: invite with 2NT.`,
        )
      return legal(
        entries,
        { type: 'bid', level: 3, strain: 'NT' },
        `${points} points opposite ${ntLabel} is enough for game: 3NT.`,
      )
    }
    if (pb.strain !== 'NT' && pb.level === 1) {
      const support = len[pb.strain as Suit] >= 3
      if (points <= 5)
        return { call: { type: 'pass' }, why: `${points} points: pass, even with support.` }
      if (support && points <= 9)
        return legal(
          entries,
          { type: 'bid', level: 2, strain: pb.strain },
          `${points} points with ${len[pb.strain as Suit]} ${STRAIN_LABEL[pb.strain]}: raise to 2.`,
        )
      if (support && points <= 12)
        return legal(
          entries,
          { type: 'bid', level: 3, strain: pb.strain },
          `${points} points with support: invite with a jump raise.`,
        )
      if (support && (pb.strain === 'H' || pb.strain === 'S'))
        return legal(
          entries,
          { type: 'bid', level: 4, strain: pb.strain },
          `${points} points with support for a major: bid game.`,
        )
      // New suit at the one level with 6+, four cards or more
      const order: Strain[] = ['D', 'H', 'S']
      for (const s of order) {
        if (bidRank(1, s) > bidRank(1, pb.strain) && len[s as Suit] >= 4 && points >= 6)
          return legal(
            entries,
            { type: 'bid', level: 1, strain: s },
            `${points} points and ${len[s as Suit]} ${STRAIN_LABEL[s]}: show the suit at the one level.`,
          )
      }
      // A new suit at the two level: standard shows 10+, 2-over-1 forces to game (13+).
      const twoLevelMin = gameForcingTwoLevel ? 13 : 10
      if (points >= twoLevelMin) {
        const longest = (['S', 'H', 'D', 'C'] as Suit[]).sort((a, b) => len[b] - len[a])[0]!
        if (longest !== pb.strain && len[longest] >= 4)
          return legal(
            entries,
            { type: 'bid', level: 2, strain: longest },
            gameForcingTwoLevel
              ? `${points} points: a new suit at the two level forces to game.`
              : `${points} points: a new suit at the two level shows 10 or more.`,
          )
      }
      return legal(
        entries,
        { type: 'bid', level: 1, strain: 'NT' },
        gameForcingTwoLevel
          ? `${points} points, no fit: 1NT. It is forcing, so partner bids again.`
          : `${points} points, no fit and no suit to show at the one level: 1NT.`,
      )
    }
    return pass
  }

  // 3. I opened and partner responded: rebid once, then stop.
  if (
    weOpened &&
    mine.some((e) => e.call.type === 'bid') &&
    partnerBid &&
    partnerBid.call.type === 'bid'
  ) {
    const pb = partnerBid.call as { level: number; strain: Strain }
    const myOpen = mine.find((e) => e.call.type === 'bid')!.call as {
      level: number
      strain: Strain
    }
    if (mine.filter((e) => e.call.type === 'bid').length >= 2) return pass
    if (pb.strain === myOpen.strain) {
      // partner raised my suit
      const game = pb.strain === 'NT' ? 3 : pb.strain === 'H' || pb.strain === 'S' ? 4 : 5
      if (pb.level >= game) return { call: { type: 'pass' }, why: 'Partner bid game. Pass.' }
      if (points >= 19 || (points >= 16 && pb.level === 3))
        return legal(
          entries,
          { type: 'bid', level: game, strain: pb.strain },
          `${points} points opposite a raise: bid game.`,
        )
      if (points >= 16 && pb.level === 2)
        return legal(
          entries,
          { type: 'bid', level: 3, strain: pb.strain },
          `${points} points: invite with one more.`,
        )
      return { call: { type: 'pass' }, why: `${points} points is a minimum. Pass the raise.` }
    }
    if (pb.strain === 'NT' && pb.level === 2 && myOpen.strain === 'NT') {
      if (points >= 17)
        return legal(
          entries,
          { type: 'bid', level: 3, strain: 'NT' },
          `Maximum 1NT: accept the invitation.`,
        )
      return { call: { type: 'pass' }, why: 'Minimum 1NT: decline the invitation.' }
    }
    if (pb.strain === 'NT' && pb.level === 3)
      return { call: { type: 'pass' }, why: 'Partner chose game. Pass.' }
    // partner bid a new suit: support it with 4, otherwise rebid NT or my suit
    if (pb.strain !== 'NT' && len[pb.strain as Suit] >= 4) {
      const lvl = cheapestLevel(entries, pb.strain)
      return legal(
        entries,
        { type: 'bid', level: Math.min(4, points >= 16 ? lvl + 1 : lvl), strain: pb.strain },
        `Four-card support for partner's suit: raise it.`,
      )
    }
    if (isBalanced(hand)) {
      const lvl = cheapestLevel(entries, 'NT')
      return legal(
        entries,
        { type: 'bid', level: lvl, strain: 'NT' },
        `Balanced with ${points} points: rebid no-trump.`,
      )
    }
    if (myOpen.strain !== 'NT' && len[myOpen.strain as Suit] >= 6)
      return legal(
        entries,
        { type: 'bid', level: cheapestLevel(entries, myOpen.strain), strain: myOpen.strain },
        `Six cards: rebid my suit.`,
      )
    return legal(
      entries,
      { type: 'bid', level: cheapestLevel(entries, 'NT'), strain: 'NT' },
      `No fit yet: no-trump keeps it low.`,
    )
  }

  // 4. Opponents opened and we have not bid: overcall with a decent five-card suit, else pass.
  if (opponentsOpened && !weOpened && mine.every((e) => e.call.type === 'pass')) {
    const best = (['S', 'H', 'D', 'C'] as Suit[])
      .filter((s) => len[s] >= 5)
      .sort((a, b) => len[b] - len[a])[0]
    if (best && points >= 8 && points <= 16 && cheapestLevel(entries, best) === 1)
      return legal(
        entries,
        { type: 'bid', level: 1, strain: best },
        `${points} points and five ${STRAIN_LABEL[best]}: overcall at the one level.`,
      )
    if (best && points >= 11 && points <= 16 && cheapestLevel(entries, best) === 2)
      return legal(
        entries,
        { type: 'bid', level: 2, strain: best },
        `${points} points and a good five-card suit: overcall at the two level.`,
      )
    return { call: { type: 'pass' }, why: 'No safe overcall. Pass.' }
  }

  return pass
}

function legal(entries: AuctionEntry[], call: Call, why: string): Advice {
  if (isLegal(entries, call)) return { call, why }
  return { call: { type: 'pass' }, why: 'That bid is no longer available. Pass.' }
}

/** All legal calls for a bidding box, lowest first. */
export function legalCalls(entries: AuctionEntry[]): Call[] {
  const out: Call[] = [{ type: 'pass' }]
  for (let level = 1; level <= 7; level++)
    for (const strain of STRAINS) {
      const c: Call = { type: 'bid', level, strain }
      if (isLegal(entries, c)) out.push(c)
    }
  return out
}

export function dealerFor(boardSeed: number): Seat {
  return (['N', 'E', 'S', 'W'] as Seat[])[boardSeed % 4]!
}

export { next as nextSeat, SUIT_SYMBOL }
