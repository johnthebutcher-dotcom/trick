import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { Lightbulb } from 'lucide-react'
import { Button, ButtonLink, Card, CardDescription, CardTitle } from '@/components/ui'
import { ErrorState, LoadingState } from '@/components/states'
import { CardBack, CardChip } from '@/components/bridge/CardChip'
import { SUITS, type Card as PlayingCard, type Hand } from '@/features/bridge/cards'
import { useLearner } from '@/features/bridge/store'
import {
  callLabel,
  contractLabel,
  legalCalls,
  STRAIN_LABEL,
  type Call,
} from '@/features/play/auction'
import { SEAT_NAME, cardsOf, type Seat } from '@/features/play/deal'
import { legalCards } from '@/features/play/play'
import { tipFor } from '@/features/play/tips'
import {
  controller,
  dummySeat,
  useGame,
  visibleHand,
  type GameState,
} from '@/features/play/useGame'
import { cn } from '@/lib/utils'

const HUMAN: Seat = 'S'

/** /play?board=N — one deal against three bots, with a coach. */
export function PlayPage() {
  const [params] = useSearchParams()
  const board = Number(params.get('board') ?? 1) || 1
  const learner = useLearner()
  if (learner.status === 'loading' || !learner.state) return <LoadingState variant="screen" />
  if (learner.status === 'error') return <ErrorState onRetry={learner.reload} />
  return (
    <Table
      key={board}
      board={board}
      tips={learner.state.prefs.tips}
      setTips={(v) => learner.setPrefs({ ...learner.state!.prefs, tips: v })}
    />
  )
}

function Table({
  board,
  tips,
  setTips,
}: {
  board: number
  tips: boolean
  setTips: (v: boolean) => void
}) {
  const { state, call, play, hint, result } = useGame(board)
  const [shown, setShown] = useState<{ text: string; card?: PlayingCard; call?: Call } | null>(null)
  const humanTurn =
    controller(state, state.turn) === 'human' &&
    (state.phase === 'auction' || state.phase === 'play')
  const tip = tips && humanTurn ? tipFor(state, HUMAN) : null

  function askHint() {
    setShown(hint())
  }
  function onCall(c: Call) {
    setShown(null)
    call(c)
  }
  function onPlay(card: PlayingCard) {
    setShown(null)
    play(card)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Banner state={state} />

      {/* North */}
      <Seatbox seat="N" state={state} onPlay={onPlay} hintCard={shown?.card} />

      {/* Middle: West, trick, East */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Seatbox seat="W" state={state} compact />
        <TrickArea state={state} />
        <Seatbox seat="E" state={state} compact />
      </div>

      {/* Auction or South */}
      {state.phase === 'auction' && (
        <AuctionPanel state={state} onCall={onCall} hintCall={shown?.call} />
      )}
      <Seatbox seat="S" state={state} onPlay={onPlay} hintCard={shown?.card} />

      {/* Coach */}
      {(state.phase === 'auction' || state.phase === 'play') && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="font-heading font-normal">Coach</CardTitle>
            <label className="flex min-h-11 items-center gap-2 text-base">
              <input
                type="checkbox"
                checked={tips}
                onChange={(e) => setTips(e.target.checked)}
                className="size-5 accent-primary"
              />
              Tips
            </label>
          </div>
          {tip && <p className="text-base text-card-foreground">{tip}</p>}
          {shown ? (
            <p className="text-base text-card-foreground" role="status" aria-live="polite">
              <strong>
                {shown.call
                  ? callLabel(shown.call)
                  : shown.card
                    ? 'Play the highlighted card.'
                    : ''}
              </strong>{' '}
              {shown.text}
            </p>
          ) : (
            <Button variant="secondary" onClick={askHint} disabled={!humanTurn}>
              <Lightbulb className="size-5" aria-hidden />
              {humanTurn ? 'Give me a hint' : 'Waiting for the others…'}
            </Button>
          )}
        </Card>
      )}

      {state.phase === 'passed-out' && (
        <Card className="space-y-3">
          <CardTitle className="font-heading font-normal">Everyone passed</CardTitle>
          <CardDescription>No contract this time. Deal again.</CardDescription>
          <ButtonLink to={`/play?board=${board + 1}`} block>
            Next board
          </ButtonLink>
        </Card>
      )}

      {result && (
        <Card className="animate-pop-in space-y-3">
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
            <ButtonLink to={`/play?board=${board + 1}`} size="lg" block>
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

function Banner({ state }: { state: GameState }) {
  const turnName = SEAT_NAME[state.turn]
  const who = controller(state, state.turn) === 'human' ? 'Your turn' : `${turnName} is thinking`
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-foreground/90">
      <span className="text-xs tracking-[0.12em] uppercase">
        Board {state.seed} · Dealer {SEAT_NAME[state.dealer]}
      </span>
      <span className="font-heading text-lg">
        {state.phase === 'auction' && `Bidding · ${who}`}
        {state.phase === 'play' &&
          state.contract &&
          `${contractLabel(state.contract)} by ${SEAT_NAME[state.contract.declarer]} · ${who}`}
        {state.phase === 'done' && 'Hand over'}
        {state.phase === 'passed-out' && 'Passed out'}
      </span>
      {state.phase === 'play' && (
        <span className="text-sm tabular-nums">
          Tricks: we {state.won.NS} · they {state.won.EW}
        </span>
      )}
    </div>
  )
}

function Seatbox({
  seat,
  state,
  onPlay,
  hintCard,
  compact,
}: {
  seat: Seat
  state: GameState
  onPlay?: (c: PlayingCard) => void
  hintCard?: PlayingCard
  compact?: boolean
}) {
  const hand = visibleHand(state, seat)
  const count = cardsOf(state.hands[seat]).length
  const isTurn = state.turn === seat && (state.phase === 'auction' || state.phase === 'play')
  const playable = state.phase === 'play' && isTurn && controller(state, seat) === 'human' && onPlay
  const legal = playable ? legalCards(state.hands[seat], state.current) : []
  const isDummy = dummySeat(state) === seat && state.phase !== 'auction'

  const title = (
    <div className="flex items-center gap-2 text-foreground/90">
      <span className={cn('font-heading text-lg', isTurn && 'underline underline-offset-4')}>
        {seat === HUMAN ? 'You' : SEAT_NAME[seat]}
      </span>
      {isDummy && <span className="text-xs tracking-[0.12em] uppercase">dummy</span>}
      {seat !== HUMAN && state.phase === 'play' && controller(state, seat) === 'human' && (
        <span className="text-xs tracking-[0.12em] uppercase">you play this hand</span>
      )}
      {state.contract && seat === state.contract.declarer && state.phase !== 'auction' && (
        <span className="text-xs tracking-[0.12em] uppercase">declarer</span>
      )}
    </div>
  )

  if (!hand) {
    return (
      <div
        className={cn('flex flex-col gap-1', compact ? 'items-center text-center' : 'items-start')}
      >
        {title}
        <div
          className={cn('flex', compact ? 'flex-wrap justify-center' : '')}
          aria-label={`${count} cards`}
        >
          {Array.from({ length: Math.min(count, compact ? 4 : 13) }).map((_, i) => (
            <CardBack key={i} className={i > 0 ? '-ml-4' : ''} />
          ))}
          {compact && (
            <span className="ml-2 self-center text-sm text-foreground/90 tabular-nums">
              {count}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {title}
      <HandRows
        hand={hand}
        legal={legal}
        onPlay={playable ? onPlay : undefined}
        hintCard={hintCard}
      />
    </div>
  )
}

function HandRows({
  hand,
  legal,
  onPlay,
  hintCard,
}: {
  hand: Hand
  legal: PlayingCard[]
  onPlay?: (c: PlayingCard) => void
  hintCard?: PlayingCard
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUITS.map((suit) =>
        hand[suit].map((rank) => {
          const card = { suit, rank }
          const isLegal = legal.some((c) => c.suit === suit && c.rank === rank)
          const hint = hintCard?.suit === suit && hintCard?.rank === rank
          return (
            <CardChip
              key={rank + suit}
              card={card}
              size="md"
              highlight={hint}
              onClick={onPlay ? () => onPlay(card) : undefined}
              disabled={onPlay ? !isLegal : false}
            />
          )
        }),
      )}
    </div>
  )
}

function TrickArea({ state }: { state: GameState }) {
  const last = state.tricks[state.tricks.length - 1]
  const showing = state.current.cards.length ? state.current : last
  const slot = (seat: Seat): ReactNode => {
    const play = showing?.cards.find((p) => p.seat === seat)
    return play ? (
      <CardChip card={play.card} size="sm" />
    ) : (
      <span className="inline-block h-12 w-9" />
    )
  }
  return (
    <div
      className="grid grid-cols-3 grid-rows-3 place-items-center gap-1"
      aria-label="Current trick"
    >
      <span /> {slot('N')} <span />
      {slot('W')}{' '}
      <span className="text-xs text-foreground/90">
        {showing?.winner ? `${SEAT_NAME[showing.winner]} won` : ''}
      </span>{' '}
      {slot('E')}
      <span /> {slot('S')} <span />
    </div>
  )
}

function AuctionPanel({
  state,
  onCall,
  hintCall,
}: {
  state: GameState
  onCall: (c: Call) => void
  hintCall?: Call
}) {
  const humanTurn = state.turn === HUMAN
  const calls = legalCalls(state.auction)
  const bids = calls.filter((c) => c.type === 'bid')
  const levels = [...new Set(bids.map((c) => (c.type === 'bid' ? c.level : 0)))].slice(0, 3)
  return (
    <Card className="space-y-3">
      <div className="grid grid-cols-4 gap-1 text-center text-sm">
        {(['W', 'N', 'E', 'S'] as Seat[]).map((s) => (
          <span key={s} className="text-xs tracking-[0.12em] text-muted-foreground uppercase">
            {s === HUMAN ? 'You' : SEAT_NAME[s]}
          </span>
        ))}
        {Array.from({ length: (['W', 'N', 'E', 'S'] as Seat[]).indexOf(state.dealer) }).map(
          (_, i) => (
            <span key={`pad${i}`} />
          ),
        )}
        {state.auction.map((e, i) => (
          <span key={i} className="font-heading text-lg">
            {callLabel(e.call)}
          </span>
        ))}
      </div>
      {humanTurn && (
        <div className="space-y-2" role="group" aria-label="Bidding box">
          <Button
            variant={hintCall?.type === 'pass' ? 'primary' : 'secondary'}
            size="lg"
            block
            onClick={() => onCall({ type: 'pass' })}
          >
            Pass
          </Button>
          {levels.map((level) => (
            <div key={level} className="grid grid-cols-5 gap-2">
              {(['C', 'D', 'H', 'S', 'NT'] as const).map((strain) => {
                const c = bids.find(
                  (b) => b.type === 'bid' && b.level === level && b.strain === strain,
                )
                const isHint =
                  hintCall?.type === 'bid' && hintCall.level === level && hintCall.strain === strain
                return (
                  <button
                    key={strain}
                    type="button"
                    disabled={!c}
                    onClick={() => c && onCall(c)}
                    className={cn(
                      'focus-ring press h-12 rounded-md border font-heading text-lg',
                      c ? 'bg-card text-card-foreground' : 'opacity-30',
                      isHint && 'ring-4 ring-primary',
                      (strain === 'H' || strain === 'D') && 'text-suit-red',
                    )}
                  >
                    {level}
                    {STRAIN_LABEL[strain]}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
