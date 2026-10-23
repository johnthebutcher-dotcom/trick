import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from '@/components/states'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

/** Catches render errors so one broken screen does not blank the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <ErrorState
            title="This screen hit a problem"
            message="Reloading usually fixes it."
            onRetry={() => {
              this.reset()
              window.location.reload()
            }}
          />
        )
      )
    }
    return this.props.children
  }
}
