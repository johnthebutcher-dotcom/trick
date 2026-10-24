import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { Button, ButtonLink, Card, CardDescription, CardTitle } from '@/components/ui'
import { ErrorState, LoadingState } from '@/components/states'
import { CardChip } from '@/components/bridge/CardChip'
import { Fan } from '@/components/bridge/Fan'
import { HAND_SUITS, type Card as PlayingCard, type Hand } from '@/features/bridge/cards'
import type { System } from '@/features/bridge/skills'
import { useLearner } from '@/features/bridge/store'
import {
  callLabel,
  contractLabel,
  isLegal,
  STRAINS,
  STRAIN_LABEL,
  type Call,
  type Strain,
  type Vul,
} from '@/features/play/auction'
import { SEAT_NAME, cardsOf, type Seat } from '@/features/play/deal'
import { legalCards } from '@/features/play/play'
import { tipFor } from '@/features/play/tips'
import { controller, useGame, visibleHand, type GameState } from '@/features/play/useGame'
import { cn } from '@/lib/utils'

const HUMAN: Seat = 'S'
const SEAT_COLS: Seat[] = ['N', 'E', 'S', 'W'] // clockwise, for the auction grid
const VUL_LABEL: Record<Vul, string> = { none: 'None', NS: 'N-S', EW: 'E-W', both: 'Both' }

/** /play?board=N — one deal against three bots, laid out as a bridge table. */
export function PlayPage() {
  const [params] = useSearchParams()
  const board = Number(params.get('board') ?? 1) || 1
  const learner = useLearner()
  if (learner.status === 'loading' || !learner.state) return <LoadingState variant="screen" />
  if (learner.status === 'error') return <ErrorState onRetry={learner.reload} />
  const { prefs } = learner.state
  return (
    <Table
      key={board}
      board={board}
      system={prefs.system}
      tips={prefs.tips}
      showAll={prefs.showAll}
    />
  )
}

function Table({
  board,
  system,
  tips,
  showAll,
}: {
  board: number
  system: System
  tips: boolean
  showAll: boolean
}) {
  const { state, call, play, hint, result } = useGame(board, system)
  const [shown, setShown] = useState<{ text: string; card?: PlayingCard; call?: Call } | null>(null)
  const humanTurn =
    controller(state, state.turn) === 'human' &&
    (state.phase === 'auction' || state.phase === 'play')
  const tip = tips && humanTurn ? tipFor(state, HUMAN) : null
  const over = state.phase === 'passed-out' || state.phase === 'done'

  function onCall(c: Call) {
    setShown(null)
    call(c)
  }
  function onPlay(card: PlayingCard) {
    setShown(null)
    play(card)
  }

  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-1">
      <StatusHeader state={state} />

      {/* West & East: the opponents' concealed hands, lying sideways (rotated
          90°), anchored to the left and right screen edges. */}
      <SideHand seat="W" state={state} showAll={showAll} />
      <SideHand seat="E" state={state} showAll={showAll} />

      <div className="flex min-h-0 flex-1 flex-col">
        {/* North (partner) across the top — the biggest fan. */}
        <div className="flex justify-center">
          <SeatArea
            seat="N"
            state={state}
            showAll={showAll}
            onPlay={onPlay}
            hintCard={shown?.card}
            big
          />
        </div>

        {/* The auction/trick and the controls fill the middle, padded in so they
            never slide under the side hands at the edges. */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-[5.5rem]">
          {over ? (
            <>
              {state.phase === 'passed-out' && (
                <Card className="animate-pop-in w-full max-w-sm space-y-3 text-center">
                  <CardTitle className="font-heading font-normal">Everyone passed</CardTitle>
                  <CardDescription>No contract this time. Deal again.</CardDescription>
                  <ButtonLink to={`/play?board=${board + 1}`} variant="wood" size="lg" block>
                    Next board
                  </ButtonLink>
                </Card>
              )}
              {result && (
                <Card className="animate-pop-in w-full max-w-sm space-y-3 text-center">
                  <CardTitle className="font-heading font-normal">
                    {contractLabel(result.contract)} by {SEAT_NAME[result.contract.declarer]}:{' '}
                    {result.made
                      ? `made${result.diff > 0 ? ` +${result.diff}` : ''}`
                      : `down ${-result.diff}`}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {result.declarerSide === 'NS' ? 'Your side' : 'They'} took {result.tricks}{' '}
                    tricks.{' '}
                    {result.humanPoints >= 0 ? `+${result.humanPoints}` : result.humanPoints} for
                    you.
                  </CardDescription>
                  <div className="flex flex-col gap-2">
                    <ButtonLink to={`/play?board=${board + 1}`} variant="wood" size="lg" block>
                      Next board
                    </ButtonLink>
                    <ButtonLink to="/" variant="ghost" block>
                      Back to Today
                    </ButtonLink>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <>
              <Centre state={state} />
              <div className="flex w-full max-w-md flex-col items-center gap-2">
                {state.phase === 'auction' && <BiddingControls state={state} onCall={onCall} />}
                {state.phase === 'play' && (
                  <p className="min-h-6 text-center text-sm text-foreground/90">
                    {humanTurn ? 'Tap a card to play it.' : `${SEAT_NAME[state.turn]} is playing…`}
                  </p>
                )}
                <HintControl
                  shown={shown}
                  tip={tip}
                  canHint={humanTurn}
                  onAsk={() => setShown(hint())}
                  onClose={() => setShown(null)}
                />
              </div>
            </>
          )}
        </div>

        {/* Your hand along the very bottom of the screen. */}
        <div className="flex justify-center">
          <SeatArea
            seat="S"
            state={state}
            showAll={showAll}
            onPlay={onPlay}
            hintCard={shown?.card}
          />
        </div>
      </div>
    </div>
  )
}

/** Compact status: one clear line, with board, dealer and vulnerability secondary. */
function StatusHeader({ state }: { state: GameState }) {
  const youAct = controller(state, state.turn) === 'human'
  let primary = 'Hand over'
  if (state.phase === 'auction')
    primary = youAct ? 'Your turn to bid' : `${SEAT_NAME[state.turn]} is bidding`
  else if (state.phase === 'play')
    primary = youAct ? 'Your turn to play' : `${SEAT_NAME[state.turn]} is playing`
  else if (state.phase === 'passed-out') primary = 'Passed out'
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <span className="font-heading text-lg">{primary}</span>
      <span className="text-xs tracking-[0.1em] text-foreground/80 uppercase">
        Board {state.seed} · Dealer {SEAT_NAME[state.dealer]} · Vul {VUL_LABEL[state.vul]}
      </span>
    </div>
  )
}

/** A seat label with the turn highlight and dealer badge. */
function SeatLabel({ seat, state }: { seat: Seat; state: GameState }) {
  const active = state.turn === seat && (state.phase === 'auction' || state.phase === 'play')
  const partnerTag = seat === partnerOf(HUMAN) ? ' · Partner' : ''
  const text = seat === HUMAN ? 'You' : `${SEAT_NAME[seat]}${partnerTag}`
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span
        className={cn(
          'rounded px-1 text-[0.7rem] tracking-[0.08em] uppercase',
          active ? 'bg-primary/20 text-foreground ring-1 ring-primary' : 'text-foreground/80',
        )}
      >
        {text}
      </span>
      {state.dealer === seat && (
        <span
          className="flex size-4 items-center justify-center rounded-full bg-foreground/85 text-[0.6rem] font-bold text-background"
          title="Dealer"
          aria-label="Dealer"
        >
          D
        </span>
      )}
    </div>
  )
}

/** North (partner, top) and South (you, bottom): a horizontal fan of backs while
 *  concealed, readable faces when revealed. North is the bigger fan. */
function SeatArea({
  seat,
  state,
  showAll,
  onPlay,
  hintCard,
  big,
}: {
  seat: Seat
  state: GameState
  showAll: boolean
  onPlay?: (c: PlayingCard) => void
  hintCard?: PlayingCard
  big?: boolean
}) {
  const hand = visibleHand(state, seat, showAll)
  const remaining = cardsOf(state.hands[seat]).length
  const active = state.turn === seat && (state.phase === 'auction' || state.phase === 'play')
  const playable =
    state.phase === 'play' && active && controller(state, seat) === 'human' && Boolean(onPlay)
  const legal = playable ? legalCards(state.hands[seat], state.current) : []

  if (seat === HUMAN) {
    return (
      <div className="flex flex-col items-center gap-1">
        <HandFaces
          hand={hand!}
          size="md"
          legal={playable ? legal : undefined}
          onPlay={playable ? onPlay : undefined}
          hintCard={hintCard}
        />
        <SeatLabel seat={seat} state={state} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <SeatLabel seat={seat} state={state} />
      {hand ? (
        <HandFaces
          hand={hand}
          size={big ? 'md' : 'sm'}
          legal={playable ? legal : undefined}
          onPlay={playable ? onPlay : undefined}
          hintCard={hintCard}
        />
      ) : (
        <Fan count={remaining} orient="horizontal" size={big ? 'lg' : 'md'} />
      )}
    </div>
  )
}

/** West / East: concealed hands shown as a vertical stack of sideways (landscape)
 *  card backs, fixed to the left/right screen edge and centred vertically. When
 *  an opponent is dummy the hand is revealed as a compact upright column. */
function SideHand({ seat, state, showAll }: { seat: Seat; state: GameState; showAll: boolean }) {
  const hand = visibleHand(state, seat, showAll)
  const remaining = cardsOf(state.hands[seat]).length
  const west = seat === 'W'
  return (
    <div
      className={cn(
        'fixed top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-1',
        west ? 'left-0 pl-1' : 'right-0 pr-1',
      )}
    >
      <SeatLabel seat={seat} state={state} />
      {hand ? (
        <HandFaces hand={hand} size="sm" columns />
      ) : (
        <div className="flex flex-col items-center" aria-hidden>
          {Array.from({ length: Math.max(0, remaining) }).map((_, i) => (
            <span
              key={i}
              className={cn('card-back h-10 w-14 rounded-md border', i > 0 && '-mt-7')}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** A readable hand of faces, grouped by suit with small gaps between groups. */
function HandFaces({
  hand,
  size,
  legal,
  onPlay,
  hintCard,
  columns,
}: {
  hand: Hand
  size: 'xs' | 'sm' | 'md' | 'lg'
  legal?: PlayingCard[]
  onPlay?: (c: PlayingCard) => void
  hintCard?: PlayingCard
  columns?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap justify-center gap-y-1',
        columns ? 'max-w-[7.5rem] gap-x-1' : 'gap-x-2',
      )}
    >
      {HAND_SUITS.map((suit) =>
        hand[suit].length ? (
          <div key={suit} className="flex gap-0.5">
            {hand[suit].map((rank) => {
              const card = { suit, rank }
              const isLegalCard = legal?.some((c) => c.suit === suit && c.rank === rank) ?? false
              const isHint = hintCard?.suit === suit && hintCard?.rank === rank
              return (
                <CardChip
                  key={rank + suit}
                  card={card}
                  size={size}
                  highlight={isHint}
                  selectable={Boolean(onPlay)}
                  onClick={onPlay ? () => onPlay(card) : undefined}
                  disabled={onPlay ? !isLegalCard : false}
                />
              )
            })}
          </div>
        ) : null,
      )}
    </div>
  )
}

/** The centre of the table: the auction during bidding, the played trick during play. */
function Centre({ state }: { state: GameState }) {
  if (state.phase === 'play' || state.phase === 'done') return <TrickCentre state={state} />
  return <AuctionHistory state={state} />
}

function AuctionHistory({ state }: { state: GameState }) {
  // Calls shown centred in bidding order, each tagged with the seat that made
  // it (so you can still see who bid what) rather than tucked into a rigid
  // seat column that leaves a lone call off to one side.
  const start = SEAT_COLS.indexOf(state.dealer)
  const seatOf = (i: number) => SEAT_COLS[(start + i) % 4]!
  const seatTag = (s: Seat) => (s === HUMAN ? 'You' : s)
  return (
    <div className="mx-auto w-full max-w-sm rounded-xl border bg-card/85 p-3 text-card-foreground shadow-card">
      <p className="mb-2 text-center text-xs tracking-[0.16em] text-muted-foreground uppercase">
        Auction
      </p>
      {state.auction.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {seatTag(state.dealer)} to open.
        </p>
      ) : (
        <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
          {state.auction.map((e, i) => (
            <span key={i} className="inline-flex items-baseline gap-1">
              <span className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                {seatTag(seatOf(i))}
              </span>
              <span
                className={cn(
                  'font-heading text-xl',
                  e.call.type === 'pass' && 'text-muted-foreground',
                )}
              >
                {callLabel(e.call)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function TrickCentre({ state }: { state: GameState }) {
  const last = state.tricks[state.tricks.length - 1]
  const showing = state.current.cards.length ? state.current : last
  const slot = (seat: Seat): ReactNode => {
    const play = showing?.cards.find((p) => p.seat === seat)
    return play ? (
      <CardChip card={play.card} size="md" />
    ) : (
      <span className="inline-block h-14 w-10" />
    )
  }
  return (
    <div
      className="mx-auto grid grid-cols-3 grid-rows-3 place-items-center gap-1"
      aria-label="Current trick"
    >
      <span /> {slot('N')} <span />
      {slot('W')}
      <span className="text-[0.65rem] text-foreground/80">
        {showing?.winner ? `${SEAT_NAME[showing.winner]} won` : ''}
      </span>
      {slot('E')}
      <span /> {slot('S')} <span />
    </div>
  )
}

/** Level 1–7, denomination C/D/H/S/NT, Pass/Double/Redouble, one submission. */
function BiddingControls({ state, onCall }: { state: GameState; onCall: (c: Call) => void }) {
  const [level, setLevel] = useState<number | null>(null)
  const [strain, setStrain] = useState<Strain | null>(null)
  const yourTurn = state.turn === HUMAN

  if (!yourTurn) {
    return (
      <div className="flex min-h-[8.5rem] items-center justify-center">
        <p className="text-sm text-foreground/80">Waiting for the other players…</p>
      </div>
    )
  }

  const bidLegal = (lv: number, st: Strain) =>
    isLegal(state.auction, { type: 'bid', level: lv, strain: st })
  const levelOpen = (lv: number) => STRAINS.some((st) => bidLegal(lv, st))
  // Default to the lowest legal level so the suit buttons are live right away.
  const lowest = [1, 2, 3, 4, 5, 6, 7].find(levelOpen) ?? 1
  const selLevel = level !== null && levelOpen(level) ? level : lowest
  const strainOpen = (st: Strain) => bidLegal(selLevel, st)
  const canDouble = isLegal(state.auction, { type: 'double' })
  const canRedouble = isLegal(state.auction, { type: 'redouble' })
  const ready = strain !== null && bidLegal(selLevel, strain)

  const pick = (lv: number) => {
    setLevel(lv)
    if (strain && !bidLegal(lv, strain)) setStrain(null)
  }
  const submit = () => {
    if (ready) {
      onCall({ type: 'bid', level: selLevel, strain: strain! })
      setLevel(null)
      setStrain(null)
    }
  }

  return (
    <div className="w-full max-w-md space-y-2" role="group" aria-label="Bidding box">
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" onClick={() => onCall({ type: 'pass' })}>
          Pass
        </Button>
        <Button
          variant="secondary"
          disabled={!canDouble}
          onClick={() => onCall({ type: 'double' })}
          aria-label="Double"
        >
          Double
        </Button>
        <Button
          variant="secondary"
          disabled={!canRedouble}
          onClick={() => onCall({ type: 'redouble' })}
          aria-label="Redouble"
        >
          Redouble
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1" role="radiogroup" aria-label="Level">
        {[1, 2, 3, 4, 5, 6, 7].map((lv) => (
          <button
            key={lv}
            type="button"
            role="radio"
            aria-checked={selLevel === lv}
            aria-label={`Level ${lv}`}
            disabled={!levelOpen(lv)}
            onClick={() => pick(lv)}
            className={cn(
              'focus-ring press h-10 rounded-md border font-heading text-lg font-bold',
              selLevel === lv ? 'bg-primary text-primary-foreground' : 'card-face',
              !levelOpen(lv) && 'opacity-30',
            )}
          >
            {lv}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1" role="radiogroup" aria-label="Denomination">
        {STRAINS.map((st) => (
          <button
            key={st}
            type="button"
            role="radio"
            aria-checked={strain === st}
            aria-label={st === 'NT' ? 'no trump' : SUIT_WORD[st]}
            disabled={!strainOpen(st)}
            onClick={() => setStrain(st)}
            className={cn(
              'focus-ring press card-face h-10 rounded-md border font-heading text-lg font-bold',
              strain === st && 'z-10 ring-3 ring-primary',
              st !== 'NT' && `suit-ink-${st}`,
              !strainOpen(st) && 'opacity-30',
            )}
          >
            {STRAIN_LABEL[st]}
          </button>
        ))}
      </div>

      <Button variant="wood" block size="lg" disabled={!ready} onClick={submit}>
        {ready ? `Bid ${selLevel}${STRAIN_LABEL[strain!]}` : 'Pick a suit'}
      </Button>
    </div>
  )
}

const SUIT_WORD: Record<Strain, string> = {
  C: 'clubs',
  D: 'diamonds',
  H: 'hearts',
  S: 'spades',
  NT: 'no trump',
}

/** A small centred hint that pops open into a bubble and shrinks on close. */
function HintControl({
  shown,
  tip,
  canHint,
  onAsk,
  onClose,
}: {
  shown: { text: string; card?: PlayingCard; call?: Call } | null
  tip: string | null
  canHint: boolean
  onAsk: () => void
  onClose: () => void
}) {
  return (
    <div className="relative flex flex-col items-center gap-1">
      {tip && !shown && <p className="text-center text-sm text-foreground/90">{tip}</p>}
      <div
        className={cn(
          'absolute bottom-full mb-2 w-72 max-w-[80vw] origin-bottom rounded-lg border bg-card p-3 text-center text-base text-card-foreground shadow-popover transition-[transform,opacity] duration-200 ease-spring',
          shown ? 'scale-100 opacity-100' : 'pointer-events-none scale-50 opacity-0',
        )}
        role="status"
        aria-live="polite"
      >
        <p>
          <strong>
            {shown?.call ? callLabel(shown.call) : shown?.card ? 'Play the highlighted card.' : ''}
          </strong>{' '}
          {shown?.text}
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        disabled={!canHint && !shown}
        onClick={() => (shown ? onClose() : onAsk())}
      >
        {shown ? 'Close hint' : 'Hint'}
      </Button>
    </div>
  )
}

function partnerOf(seat: Seat): Seat {
  return ({ N: 'S', S: 'N', E: 'W', W: 'E' } as Record<Seat, Seat>)[seat]
}
