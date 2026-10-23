import { Link, Navigate } from 'react-router'
import { ButtonLink, Card, CardDescription, CardTitle } from '@/components/ui'
import { ErrorState, LoadingState } from '@/components/states'
import { SKILLS } from '@/features/bridge/skills'
import { planDrill, seenCount, streak, today, unlockedSkills } from '@/features/bridge/scheduler'
import { useLearner } from '@/features/bridge/store'
import { useOnboarding } from '@/features/onboarding/useOnboarding'
import { cn } from '@/lib/utils'
import { useState, type CSSProperties } from 'react'

/** Home. One thing to do, and how today is going. */
export function TodayPage() {
  const learner = useLearner()
  const onboarding = useOnboarding('local')
  const [stamp] = useState(() => Date.now())
  const [nextBoard] = useState(() => 1 + Math.floor(Math.random() * 1000))

  if (!onboarding.done) return <Navigate to="/onboarding" replace />
  if (learner.status === 'loading' || !learner.state) return <LoadingState variant="screen" />
  if (learner.status === 'error') return <ErrorState onRetry={learner.reload} />

  const { progress, sessions, prefs } = learner.state
  const date = today()
  const answeredToday = sessions.filter((s) => s.date === date).reduce((sum, s) => sum + s.total, 0)
  const goal = 8
  const pct = Math.min(100, Math.round((answeredToday / goal) * 100))
  const plan = planDrill(progress, undefined, prefs.system)
  const s = streak(sessions.map((x) => x.date))
  const unlocked = unlockedSkills(progress)
  const current = SKILLS.find((x) => x.id === plan.skill)

  const greeting = s.practisedToday
    ? answeredToday >= goal
      ? 'Done for today. Come back tomorrow.'
      : 'Keep going?'
    : s.days > 0
      ? `${s.days} day${s.days === 1 ? '' : 's'} in a row. Nice.`
      : s.lastDate
        ? 'Welcome back.'
        : 'Five minutes. One idea.'

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <section className="flex items-center gap-6 py-4">
        <div
          className="ring-progress relative size-24 shrink-0"
          style={{ '--progress': pct, '--ring-thickness': '9px' } as CSSProperties}
          role="img"
          aria-label={`${answeredToday} of ${goal} hands today`}
        />
        <div className="space-y-1">
          <p className="text-display font-heading font-normal">{greeting}</p>
          <p className="text-foreground/90">
            {answeredToday > 0
              ? `${answeredToday} of ${goal} hands today.`
              : `Today: ${current?.title ?? 'a drill'}.`}
            {plan.dueCount > 0 && ` ${plan.dueCount} to revisit.`}
          </p>
        </div>
      </section>

      <ButtonLink to={`/drill?n=${stamp}`} size="lg" block className="hover-lift">
        {answeredToday > 0 ? 'Another eight' : "Start today's drill"}
      </ButtonLink>
      <ButtonLink to={`/play?board=${nextBoard}`} variant="secondary" size="lg" block>
        Play a hand
      </ButtonLink>

      <section className="reveal space-y-3">
        <h2 className="text-xs tracking-[0.12em] text-foreground/90 uppercase">
          Practise one thing
        </h2>
        <Card className="p-0">
          <ul className="divide-y">
            {SKILLS.map((skill, i) => {
              const open = unlocked.includes(skill.id)
              const seen = seenCount(progress, skill.id)
              return (
                <li key={skill.id}>
                  {open ? (
                    <Link
                      to={`/drill/${skill.id}?n=${stamp}`}
                      className="focus-ring hover-lift flex items-center gap-4 px-5 py-4"
                    >
                      <span className="font-heading text-xl text-muted-foreground tabular-nums">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{skill.title}</span>
                        <span className="block text-base text-muted-foreground">{skill.blurb}</span>
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {seen > 0 ? `${seen} hands` : 'new'}
                      </span>
                    </Link>
                  ) : (
                    <div className={cn('flex items-center gap-4 px-5 py-4 text-muted-foreground')}>
                      <span className="font-heading text-xl tabular-nums">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{skill.title}</span>
                        <span className="block text-base">
                          Opens after {skill.unlockAfter} hands of the one before.
                        </span>
                      </span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>
        <p className="text-base text-foreground/90">
          Hands you miss come back tomorrow. Hands you know come back less and less.
        </p>
      </section>

      <section className="reveal">
        <Card className="space-y-1">
          <CardTitle className="font-heading font-normal">At the table?</CardTitle>
          <CardDescription>
            The cheat-sheet tab has every bid on one screen. It works without a connection.
          </CardDescription>
        </Card>
      </section>
    </div>
  )
}
