import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui'
import { HandView } from '@/components/bridge/HandView'
import { dealHand } from '@/features/bridge/cards'
import { useOnboarding } from '@/features/onboarding/useOnboarding'

const steps = [
  {
    title: 'Five minutes a day.',
    body: 'Eight hands, one idea. Nothing to read first.',
  },
  {
    title: 'Tap the answer. We say why.',
    body: 'Get one wrong and it comes back tomorrow. Get it right and it fades away.',
  },
  {
    title: 'Start with counting points.',
    body: 'Ace 4, king 3, queen 2, jack 1. Everything else builds on this.',
  },
]

const sample = dealHand(7)

/** First run, no sign-in. Three screens, then straight into the first drill. */
export function OnboardingPage() {
  const { complete } = useOnboarding('local')
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const step = steps[index] ?? steps[0]!
  const last = index === steps.length - 1

  function go() {
    complete()
    navigate(`/drill?n=${Date.now()}`, { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col gap-8 pt-6">
      <div key={index} className="animate-pop-in space-y-3">
        <p className="text-xs tracking-[0.12em] text-muted-foreground uppercase">
          {index + 1} of {steps.length}
        </p>
        <h1 className="text-display font-heading font-medium">{step.title}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{step.body}</p>
      </div>

      {index === 2 && <HandView hand={sample} className="animate-pop-in" />}

      <div className="mt-auto flex flex-col gap-2">
        <Button size="lg" block onClick={() => (last ? go() : setIndex((i) => i + 1))}>
          {last ? 'Deal me in' : 'Next'}
        </Button>
        {!last && (
          <Button variant="ghost" block onClick={go}>
            Skip
          </Button>
        )}
      </div>
    </div>
  )
}
