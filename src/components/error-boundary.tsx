"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 [ErrorBoundary] Caught error:", error);
    console.error("🚨 [ErrorBoundary] Error info:", errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // Add your error reporting service here (e.g., Sentry, PostHog)
      console.error("Production Error:", { error: error.message, stack: error.stack, errorInfo });
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-md">
            <div className="mb-4 text-6xl text-red-500">⚠️</div>
            <h1 className="mb-2 text-xl font-semibold text-gray-900">Something went wrong</h1>
            <p className="mb-4 text-gray-600">
              The application encountered an unexpected error. This has been logged for investigation.
            </p>
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">Technical details</summary>
              <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                {this.state.error.message}
                {process.env.NODE_ENV === "development" && (
                  <>
                    {"\n\nStack:\n"}
                    {this.state.error.stack}
                  </>
                )}
              </pre>
            </details>
            <div className="space-x-3">
              <button
                onClick={this.retry}
                className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
