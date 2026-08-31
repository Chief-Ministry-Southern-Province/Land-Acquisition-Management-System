import type { ErrorInfo, ReactNode } from 'react';
import React, { Component } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      'Uncaught error caught by GlobalErrorBoundary:',
      error,
      errorInfo,
    );
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 transition-colors duration-200">
          <div className="border-border bg-card w-full max-w-md rounded-2xl border p-8 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="bg-destructive/10 text-destructive mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-10 w-10 animate-pulse"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>

              <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Something went wrong
              </h1>

              <p className="text-muted-foreground mt-4 text-sm">
                An unexpected application error occurred on the client side. We
                apologize for the inconvenience.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="border-border bg-muted/50 text-destructive mt-6 max-h-40 w-full overflow-auto rounded-lg border p-4 text-left font-mono text-xs">
                  <p className="font-bold">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  <p className="text-muted-foreground mt-2 whitespace-pre text-[10px]">
                    {this.state.error.stack}
                  </p>
                </div>
              )}

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <button
                  onClick={this.handleReload}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring inline-flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2"
                >
                  Reload Application
                </button>
                <a
                  href="/"
                  className="border-border bg-card text-foreground hover:bg-muted/50 focus:ring-ring inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
