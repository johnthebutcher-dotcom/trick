import { useCallback, useEffect, useRef, useState } from 'react'
import { hashString, type Card, type Hand } from '@/features/bridge/cards'
import type { SystemId } from '@/features/bridge/systems'
import {
  advise,
  contractOf,
  dealerFor,
  isLegal,
  isOver,
  type AuctionEntry,
  type Call,
  type Contract,
} from './auction'
import {
  cardsOf,
  dealFour,
  next,
  partner,
  removeCard,
  sameSide,
  type Deal,
  type Seat,
} from './deal'
import { advisePlay, legalCards, score, trickWinner, type Trick } from './play'

export type Phase = 'auction' | 'play' | 'done' | 'passed-out'

export interface GameState {
  seed: number
  dealer: Seat
  hands: Deal
  auction: AuctionEntry[]
  turn: Seat
  phase: Phase
  contract: Contract | null
  tricks: Trick[]
  current: Trick
  played: Card[]
  won: { NS: number; EW: number }
}

const HUMAN: Seat = 'S'
const BOT_DELAY = 650

function initial(seed: number): GameState {
  const dealer = dealerFor(seed)
  return {
    seed,
    dealer,
    hands: dealFour(hashString(`finesse:deal:${seed}`)),
    auction: [],
    turn: dealer,
    phase: 'auction',
    contract: null,
    tricks: [],
    current: { leader: dealer, cards: [], winner: null },
    played: [],
    won: { NS: 0, EW: 0 },
  }
}

/** Who plays a seat's cards. The human plays South, and both North and South whenever their side declares. */
export function controller(state: GameState, seat: Seat): 'human' | 'bot' {
  if (seat === HUMAN) return 'human'
  if (
    state.phase === 'play' &&
    state.contract &&
    sameSide(state.contract.declarer, HUMAN) &&
    seat === partner(HUMAN)
  ) {
    return 'human'
  }
  return 'bot'
}

export function dummySeat(state: GameState): Seat | null {
  return state.contract ? partner(state.contract.declarer) : null
}

function applyCall(state: GameState, call: Call): GameState {
  if (!isLegal(state.auction, call)) return state
  const auction = [...state.auction, { seat: state.turn, call }]
  if (isOver(auction)) {
    const contract = contractOf(auction)
    if (!contract) return { ...state, auction, phase: 'passed-out' }
    const leader = next(contract.declarer)
    return {
      ...state,
      auction,
      contract,
      phase: 'play',
      turn: leader,
      current: { leader, cards: [], winner: null },
    }
  }
  return { ...state, auction, turn: next(state.turn) }
}

function applyCard(state: GameState, card: Card): GameState {
  if (!state.contract) return state
  const seat = state.turn
  const hand = state.hands[seat]
  if (!legalCards(hand, state.current).some((c) => c.suit === card.suit && c.rank === card.rank))
    return state
  const hands = { ...state.hands, [seat]: removeCard(hand, card) }
  const current: Trick = { ...state.current, cards: [...state.current.cards, { seat, card }] }
  const played = [...state.played, card]
  if (current.cards.length === 4) {
    const winner = trickWinner(current, state.contract.strain)
    const won = { ...state.won }
    if (winner === 'N' || winner === 'S') won.NS++
    else won.EW++
    const tricks = [...state.tricks, { ...current, winner }]
    const done = tricks.length === 13
    return {
      ...state,
      hands,
      played,
      tricks,
      won,
      current: { leader: winner, cards: [], winner: null },
      turn: winner,
      phase: done ? 'done' : 'play',
    }
  }
  return { ...state, hands, played, current, turn: next(seat) }
}

export function useGame(seed: number, system: SystemId = 'sayc') {
  const [state, setState] = useState<GameState>(() => initial(seed))
  const timer = useRef<number | null>(null)

  // Bots act after a short pause so the table reads naturally.
  useEffect(() => {
    if (state.phase !== 'auction' && state.phase !== 'play') return
    if (controller(state, state.turn) !== 'bot') return
    timer.current = window.setTimeout(() => {
      setState((s) => {
        if (controller(s, s.turn) !== 'bot') return s
        if (s.phase === 'auction')
          return applyCall(s, advise(s.auction, s.turn, s.hands[s.turn], system).call)
        if (s.phase === 'play' && s.contract) {
          const a = advisePlay(
            s.turn,
            s.hands[s.turn],
            s.current,
            s.contract.strain,
            s.contract.declarer,
            s.played,
          )
          return applyCard(s, a.card)
        }
        return s
      })
    }, BOT_DELAY)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [state, system])

  const call = useCallback((c: Call) => setState((s) => applyCall(s, c)), [])
  const play = useCallback((card: Card) => setState((s) => applyCard(s, card)), [])
  const hint = (): { text: string; card?: Card; call?: Call } | null => {
    if (state.phase === 'auction') {
      const a = advise(state.auction, state.turn, state.hands[state.turn], system)
      return { text: a.why, call: a.call }
    }
    if (state.phase === 'play' && state.contract) {
      const a = advisePlay(
        state.turn,
        state.hands[state.turn],
        state.current,
        state.contract.strain,
        state.contract.declarer,
        state.played,
      )
      return { text: a.why, card: a.card }
    }
    return null
  }

  const result = state.contract && state.phase === 'done' ? finish(state) : null
  return { state, call, play, hint, result }
}

export interface Result {
  contract: Contract
  declarerSide: 'NS' | 'EW'
  tricks: number
  made: boolean
  diff: number
  points: number
  humanSide: 'NS' | 'EW'
  humanPoints: number
}

function finish(state: GameState): Result {
  const c = state.contract!
  const declarerSide = c.declarer === 'N' || c.declarer === 'S' ? 'NS' : 'EW'
  const tricks = state.won[declarerSide]
  const s = score(c.level, c.strain, tricks)
  const humanSide: 'NS' | 'EW' = 'NS'
  return {
    contract: c,
    declarerSide,
    tricks,
    made: s.made,
    diff: s.diff,
    points: s.points,
    humanSide,
    humanPoints: declarerSide === humanSide ? s.points : -s.points,
  }
}

export function humanHands(state: GameState): Seat[] {
  const seats: Seat[] = [HUMAN]
  const d = dummySeat(state)
  if (state.phase === 'play' && d && state.contract?.declarer === HUMAN) seats.push(d)
  return seats
}

export function visibleHand(state: GameState, seat: Seat): Hand | null {
  if (seat === HUMAN) return state.hands[seat]
  if (state.phase === 'done') return state.hands[seat]
  if (state.phase !== 'play' || !state.contract) return null
  // Our side declares: the human plays both hands, so both are face up from the lead.
  if (sameSide(state.contract.declarer, HUMAN) && seat === partner(HUMAN)) {
    return state.current.cards.length > 0 || state.tricks.length > 0 ? state.hands[seat] : null
  }
  // Defending: dummy goes face up after the opening lead.
  const d = dummySeat(state)
  if (d === seat && (state.current.cards.length > 0 || state.tricks.length > 0))
    return state.hands[seat]
  return null
}

export function handCards(hand: Hand): Card[] {
  return cardsOf(hand)
}
