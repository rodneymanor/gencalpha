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
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              The application encountered an unexpected error. This has been logged for investigation.
            </p>
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Technical details
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
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
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
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
