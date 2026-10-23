import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import { Check, X } from 'lucide-react'
import { Button, ButtonLink, Card, CardDescription, CardTitle } from '@/components/ui'
import { ErrorState, LoadingState } from '@/components/states'
import { HandView } from '@/components/bridge/HandView'
import { SKILLS, type SkillId } from '@/features/bridge/skills'
import { useLearner } from '@/features/bridge/store'
import { useDrill } from '@/features/bridge/useDrill'
import { cn } from '@/lib/utils'

/** /drill (today's mix) or /drill/:skill (practise one thing). */
export function DrillPage() {
  const { skill } = useParams()
  const [params] = useSearchParams()
  const learner = useLearner()
  const skillId = SKILLS.some((s) => s.id === skill) ? (skill as SkillId) : undefined
  const key = `${skillId ?? 'today'}-${params.get('n') ?? '0'}`

  if (learner.status === 'loading' || !learner.state) return <LoadingState variant="screen" />
  if (learner.status === 'error') return <ErrorState onRetry={learner.reload} />
  if (skill && !skillId) return <Navigate to="/" replace />

  return (
    <Drill
      key={key}
      skill={skillId}
      handSize={learner.state.prefs.handSize}
      progress={learner.state.progress}
      setProgress={learner.setProgress}
      sessions={learner.state.sessions}
      setSessions={learner.setSessions}
    />
  )
}

function Drill(props: {
  skill?: SkillId
  handSize: 'normal' | 'large'
  progress: ReturnType<typeof useLearner>['state'] extends infer S
    ? S extends { progress: infer P }
      ? P
      : never
    : never
  setProgress: ReturnType<typeof useLearner>['setProgress']
  sessions: NonNullable<ReturnType<typeof useLearner>['state']>['sessions']
  setSessions: ReturnType<typeof useLearner>['setSessions']
}) {
  const { state, answer, next } = useDrill(
    props.progress,
    props.setProgress,
    props.sessions,
    props.setSessions,
    props.skill,
  )
  const [showMore, setShowMore] = useState(false)
  const skillMeta = SKILLS.find((s) => s.id === state.skill)

  if (state.finished) return <Summary state={state} />
  if (!state.question) return <ErrorState title="No hand to show" message="Try again from Today." />

  const q = state.question
  const correct = state.chosen === q.answer

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-foreground/90">
        <span className="text-xs tracking-[0.12em] uppercase">{skillMeta?.title}</span>
        <span className="tabular-nums">
          {state.index + 1} of {state.ids.length}
        </span>
      </div>

      <HandView hand={q.hand} size={props.handSize} />

      <h1 className="text-title font-heading font-normal">{q.prompt}</h1>

      <div
        className={cn(
          'grid gap-3',
          q.options.length === 2 || q.options.length === 4 ? 'grid-cols-2' : 'grid-cols-3',
        )}
        role="group"
        aria-label="Answers"
      >
        {q.options.map((option) => {
          const picked = state.chosen === option
          const isAnswer = option === q.answer
          const revealed = state.chosen !== null
          return (
            <button
              key={option}
              type="button"
              disabled={revealed}
              onClick={() => {
                setShowMore(false)
                answer(option)
              }}
              className={cn(
                'focus-ring press flex h-16 items-center justify-center gap-2 rounded-md font-heading text-2xl font-normal transition-[background-color,color,box-shadow] duration-200 ease-soft',
                !revealed && 'neu on-felt',
                revealed && isAnswer && 'bg-success text-success-foreground',
                revealed && picked && !isAnswer && 'animate-shake bg-danger text-danger-foreground',
                revealed && !picked && !isAnswer && 'neu-inset on-felt opacity-60',
              )}
            >
              {revealed && isAnswer && <Check className="size-6" aria-hidden />}
              {revealed && picked && !isAnswer && <X className="size-6" aria-hidden />}
              {option}
              {revealed && isAnswer && <span className="sr-only">, correct</span>}
            </button>
          )
        })}
      </div>

      {state.chosen !== null && (
        <Card
          className={cn('animate-pop-in space-y-2', correct ? 'border-success' : 'border-danger')}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            {correct ? (
              <Check className="size-5 text-success" aria-hidden />
            ) : (
              <X className="size-5 text-danger" aria-hidden />
            )}
            <CardTitle className="font-heading font-normal">
              {correct ? 'Yes.' : `It's ${q.answer}.`}
            </CardTitle>
          </div>
          <CardDescription className="text-lg leading-relaxed text-card-foreground">
            {q.why}
          </CardDescription>
          {showMore ? (
            <p className="text-base leading-relaxed text-card-foreground">{q.more}</p>
          ) : (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="focus-ring -ml-2 min-h-11 self-start px-2 text-base text-primary underline underline-offset-4"
            >
              Show me
            </button>
          )}
        </Card>
      )}

      <div className="mt-auto pt-2">
        {state.chosen !== null ? (
          <Button block size="lg" onClick={next}>
            {state.index + 1 >= state.ids.length ? 'Finish' : 'Next hand'}
          </Button>
        ) : (
          <Link
            to="/"
            className="focus-ring block min-h-11 py-3 text-center text-base text-foreground/90 underline underline-offset-4"
          >
            Stop for now
          </Link>
        )}
      </div>
    </div>
  )
}

function Summary({ state }: { state: ReturnType<typeof useDrill>['state'] }) {
  const [stamp] = useState(() => Date.now())
  const right = state.answered.filter((a) => a.correct).length
  const missed = state.answered.filter((a) => !a.correct)
  const all = right === state.answered.length
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="animate-pop-in space-y-2 py-4 text-center">
        <p className="text-display font-heading font-normal tabular-nums">
          {right} of {state.answered.length}
        </p>
        <p className="text-foreground/90">
          {all
            ? 'Every one. That skill is settling in.'
            : right >= state.answered.length / 2
              ? 'Good. The ones you missed come back tomorrow.'
              : 'Hard set. Those hands come back tomorrow, when they will feel easier.'}
        </p>
      </div>

      {missed.length > 0 && (
        <Card className="space-y-3">
          <CardTitle className="font-heading font-normal">Worth a second look</CardTitle>
          <ul className="divide-y">
            {missed.map(({ question, chosen }) => (
              <li key={question.id} className="space-y-1 py-3">
                <p className="text-base">
                  You said <strong>{chosen}</strong>; it's <strong>{question.answer}</strong>.
                </p>
                <p className="text-base text-muted-foreground">{question.why}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        <ButtonLink to={`/drill?n=${stamp}`} size="lg" block>
          Another eight
        </ButtonLink>
        <ButtonLink to="/" variant="ghost" block>
          Done for today
        </ButtonLink>
      </div>
    </div>
  )
}
