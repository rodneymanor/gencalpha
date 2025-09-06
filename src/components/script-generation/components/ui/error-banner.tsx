import React from "react";

interface ErrorBannerProps {
  error: string;
  onDismiss: () => void;
}

/**
 * Error banner component for displaying generation notices
 * Extracted from lines 637-654 of the original component
 */
export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  return (
    <div className="mb-4 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <div className="flex items-start space-x-2">
        <span className="text-amber-500">⚠️</span>
        <div className="flex-1">
          <p className="font-medium">Generation Notice</p>
          <p className="mt-1">{error}</p>
        </div>
        <button onClick={onDismiss} className="p-1 text-amber-500 hover:text-amber-700" aria-label="Dismiss">
          ×
        </button>
      </div>
    </div>
  );
}
