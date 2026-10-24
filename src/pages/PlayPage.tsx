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

  function onCall(c: Call) {
    setShown(null)
    call(c)
  }
  function onPlay(card: PlayingCard) {
    setShown(null)
    play(card)
  }

  // A bridge table is a diamond: partner North across the top, opponents on the
  // sides, your hand along the bottom, and one anchor panel dead-centre. The
  // column fills the screen — North pinned to the top edge, your hand to the
  // bottom edge, the centre band filling the space between — so the four seats
  // stay symmetric around the middle in both orientations.
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-1">
      <StatusHeader state={state} />

      {/* justify-evenly fills the height with balanced spacing in both
          orientations: a tight diamond in the short landscape viewport, an
          evenly spread one in portrait — never one lopsided felt void. */}
      <div className="flex min-h-0 flex-1 flex-col justify-evenly gap-2">
        <div className="flex justify-center">
          <SeatArea
            seat="N"
            state={state}
            showAll={showAll}
            onPlay={onPlay}
            hintCard={shown?.card}
          />
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <SeatArea seat="W" state={state} showAll={showAll} />
          <CentreHub
            state={state}
            board={board}
            result={result}
            humanTurn={humanTurn}
            tip={tip}
            shown={shown}
            onCall={onCall}
            onAsk={() => setShown(hint())}
            onCloseHint={() => setShown(null)}
          />
          <SeatArea seat="E" state={state} showAll={showAll} />
        </div>

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

/**
 * The anchor at the centre of the table. One card-coloured panel in every
 * phase, so the table has a solid heart instead of a sea of felt: the auction
 * (history + your bidding box) while bidding, the played trick while playing,
 * and the result when the hand ends.
 */
function CentreHub({
  state,
  board,
  result,
  humanTurn,
  tip,
  shown,
  onCall,
  onAsk,
  onCloseHint,
}: {
  state: GameState
  board: number
  result: ReturnType<typeof useGame>['result']
  humanTurn: boolean
  tip: string | null
  shown: { text: string; card?: PlayingCard; call?: Call } | null
  onCall: (c: Call) => void
  onAsk: () => void
  onCloseHint: () => void
}) {
  const over = state.phase === 'passed-out' || state.phase === 'done'

  // Result / passed-out: the panel becomes the outcome card.
  if (over) {
    return (
      <div className="w-full max-w-[30rem] min-w-0">
        {state.phase === 'passed-out' && !result && (
          <Card className="animate-pop-in w-full space-y-3 text-center">
            <CardTitle className="font-heading font-normal">Everyone passed</CardTitle>
            <CardDescription>No contract this time. Deal again.</CardDescription>
            <ButtonLink to={`/play?board=${board + 1}`} variant="wood" size="lg" block>
              Next board
            </ButtonLink>
          </Card>
        )}
        {result && (
          <Card className="animate-pop-in w-full space-y-3 text-center">
            <CardTitle className="font-heading font-normal">
              {contractLabel(result.contract)} by {SEAT_NAME[result.contract.declarer]}:{' '}
              {result.made
                ? `made${result.diff > 0 ? ` +${result.diff}` : ''}`
                : `down ${-result.diff}`}
            </CardTitle>
            <CardDescription className="text-base">
              {result.declarerSide === 'NS' ? 'Your side' : 'They'} took {result.tricks} tricks.{' '}
              {result.humanPoints >= 0 ? `+${result.humanPoints}` : result.humanPoints} for you.
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
      </div>
    )
  }

  // During play the trick is the focus, so the panel hugs it (a small mat on the
  // felt) instead of the wide box the bidding box needs.
  if (state.phase === 'play') {
    return (
      <div className="flex w-full max-w-[19rem] min-w-0 flex-col items-center gap-2 rounded-2xl border bg-card/90 px-4 py-3 text-card-foreground shadow-card">
        <TrickCentre state={state} />
        <p className="min-h-5 text-center text-sm text-card-foreground/80">
          {humanTurn ? 'Tap a card to play it.' : `${SEAT_NAME[state.turn]} is playing…`}
        </p>
        <HintControl
          shown={shown}
          tip={tip}
          canHint={humanTurn}
          onAsk={onAsk}
          onClose={onCloseHint}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[30rem] min-w-0 space-y-3 rounded-2xl border bg-card/90 px-3 py-3 text-card-foreground shadow-card sm:px-4">
      <AuctionHistory state={state} />
      {humanTurn ? (
        <BiddingControls state={state} onCall={onCall} />
      ) : (
        <p className="py-2 text-center text-sm text-card-foreground/80">
          Waiting for the other players…
        </p>
      )}
      <HintControl
        shown={shown}
        tip={tip}
        canHint={humanTurn}
        onAsk={onAsk}
        onClose={onCloseHint}
      />
    </div>
  )
}

/** One seat: its label (with dealer/turn markers) and its cards — a fan of
 *  backs while concealed, readable faces when the game state reveals them. The
 *  bottom seat (you) is the hero hand: big faces fanned in one row. */
function SeatArea({
  seat,
  state,
  showAll,
  onPlay,
  hintCard,
}: {
  seat: Seat
  state: GameState
  showAll: boolean
  onPlay?: (c: PlayingCard) => void
  hintCard?: PlayingCard
}) {
  const hand = visibleHand(state, seat, showAll)
  const remaining = cardsOf(state.hands[seat]).length
  const active = state.turn === seat && (state.phase === 'auction' || state.phase === 'play')
  const playable =
    state.phase === 'play' && active && controller(state, seat) === 'human' && Boolean(onPlay)
  const legal = playable ? legalCards(state.hands[seat], state.current) : []
  const side = seat === 'W' || seat === 'E'

  const partnerTag = seat === partnerOf(HUMAN) ? ' · Partner' : ''
  const youTag = seat === HUMAN ? 'You' : `${SEAT_NAME[seat]}${partnerTag}`
  const label = (
    <div className="flex items-center justify-center gap-1.5">
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[0.7rem] tracking-[0.08em] uppercase',
          active ? 'bg-primary/25 text-foreground ring-1 ring-primary' : 'text-foreground/80',
        )}
      >
        {youTag}
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

  if (seat === HUMAN) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <HandFaces
          hand={hand!}
          size="xl"
          hero
          legal={playable ? legal : undefined}
          onPlay={playable ? onPlay : undefined}
          hintCard={hintCard}
        />
        {label}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {label}
      {hand ? (
        <HandFaces
          hand={hand}
          size={side ? 'xs' : 'sm'}
          columns={side}
          legal={playable ? legal : undefined}
          onPlay={playable ? onPlay : undefined}
          hintCard={hintCard}
        />
      ) : (
        <Fan
          count={remaining}
          orient={side ? 'vertical' : 'horizontal'}
          size={side ? 'sm' : 'md'}
        />
      )}
    </div>
  )
}

/**
 * A readable hand of faces, grouped by suit. The hero hand (your cards) fans
 * with a slight in-suit overlap so all thirteen stay big and fit one row; the
 * top-left corner index keeps every covered card readable. Side hands (revealed
 * dummy/teaching) stack as compact columns.
 */
function HandFaces({
  hand,
  size,
  legal,
  onPlay,
  hintCard,
  columns,
  hero,
}: {
  hand: Hand
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  legal?: PlayingCard[]
  onPlay?: (c: PlayingCard) => void
  hintCard?: PlayingCard
  columns?: boolean
  hero?: boolean
}) {
  return (
    <div
      className={cn(
        'flex justify-center',
        columns ? 'max-w-[7.5rem] flex-wrap gap-x-1 gap-y-1' : 'items-end',
        hero ? 'gap-x-2' : !columns && 'gap-x-2',
      )}
    >
      {HAND_SUITS.map((suit) =>
        hand[suit].length ? (
          <div key={suit} className={cn('flex', hero ? '' : 'gap-0.5')}>
            {hand[suit].map((rank, i) => {
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
                  className={cn(
                    hero && i > 0 && '-ml-[1.5rem]',
                    hero && 'transition-transform hover:z-10 focus-visible:z-10',
                  )}
                />
              )
            })}
          </div>
        ) : null,
      )}
    </div>
  )
}

function AuctionHistory({ state }: { state: GameState }) {
  const pad = SEAT_COLS.indexOf(state.dealer)
  return (
    <div>
      <p className="mb-1.5 text-center text-xs tracking-[0.16em] text-muted-foreground uppercase">
        Auction
      </p>
      <div className="grid grid-cols-4 gap-x-1 text-center">
        {SEAT_COLS.map((s) => (
          <span
            key={s}
            className={cn(
              'flex items-center justify-center gap-1 border-b border-border/60 pb-1 text-xs tracking-[0.08em] uppercase',
              state.turn === s && state.phase === 'auction'
                ? 'font-bold text-primary'
                : 'text-muted-foreground',
            )}
          >
            {s === HUMAN ? 'You' : SEAT_NAME[s]}
            {state.dealer === s && (
              <span className="rounded-full bg-foreground/80 px-1 text-[0.6rem] text-background">
                D
              </span>
            )}
          </span>
        ))}
        {Array.from({ length: pad }).map((_, i) => (
          <span key={`pad${i}`} />
        ))}
        {state.auction.map((e, i) => (
          <span
            key={i}
            className={cn(
              'py-0.5 font-heading text-xl',
              e.call.type === 'pass' && 'text-muted-foreground',
            )}
          >
            {callLabel(e.call)}
          </span>
        ))}
      </div>
    </div>
  )
}

function TrickCentre({ state }: { state: GameState }) {
  const last = state.tricks[state.tricks.length - 1]
  const showing = state.current.cards.length ? state.current : last
  const slot = (seat: Seat): ReactNode => {
    const play = showing?.cards.find((p) => p.seat === seat)
    return play ? (
      <CardChip card={play.card} size="lg" />
    ) : (
      <span className="inline-block h-[4.5rem] w-[3.25rem] rounded-md border border-dashed border-card-foreground/15" />
    )
  }
  return (
    <div
      className="mx-auto grid grid-cols-3 grid-rows-3 place-items-center gap-x-2 gap-y-1"
      aria-label="Current trick"
    >
      <span /> {slot('N')} <span />
      {slot('W')}
      <span className="px-1 text-center text-xs font-bold text-primary">
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
    <div className="space-y-2" role="group" aria-label="Bidding box">
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
      {tip && !shown && <p className="text-center text-sm text-card-foreground/90">{tip}</p>}
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
