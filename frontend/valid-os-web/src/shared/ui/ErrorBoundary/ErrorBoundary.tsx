import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = Readonly<{
  children: ReactNode
  fallback?: ReactNode
}>

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Unhandled render error:', error, info.componentStack)
    }
  }

  private readonly handleReset = (): void => {
    this.setState({ error: null })
  }

  override render() {
    if (this.state.error === null) {
      return this.props.children
    }

    if (this.props.fallback !== undefined) {
      return this.props.fallback
    }

    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold text-neutral-900">
          Algo deu errado.
        </h1>
        <p className="text-sm text-neutral-600">
          Ocorreu um erro inesperado ao renderizar a página. Tente recarregar; se o
          problema persistir, contate o suporte.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={() => globalThis.location.reload()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Recarregar
          </button>
        </div>
      </div>
    )
  }
}
