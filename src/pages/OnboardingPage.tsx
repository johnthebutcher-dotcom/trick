import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Card, CardDescription, CardTitle } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useOnboarding } from '@/features/onboarding/useOnboarding'

/** Replace the steps with the app's own first-run tour. Keep it to three screens. */
const steps = [
  { title: 'Welcome', body: 'Here is what this app does, in one sentence.' },
  { title: 'How it works', body: 'The one thing to know before the first use.' },
  { title: 'Ready', body: 'Any permission you will ask for, and why, goes here.' },
]

export function OnboardingPage() {
  const { user } = useAuth()
  const { complete } = useOnboarding(user?.id ?? null)
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const step = steps[index] ?? steps[0]!
  const last = index === steps.length - 1

  function next() {
    if (last) {
      complete()
      navigate('/', { replace: true })
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 pt-6">
      <Card className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Step {index + 1} of {steps.length}
        </p>
        <CardTitle>{step.title}</CardTitle>
        <CardDescription>{step.body}</CardDescription>
      </Card>
      <Button block onClick={next}>
        {last ? 'Get started' : 'Next'}
      </Button>
      {!last && (
        <Button
          variant="ghost"
          block
          onClick={() => {
            complete()
            navigate('/', { replace: true })
          }}
        >
          Skip
        </Button>
      )}
    </div>
  )
}
