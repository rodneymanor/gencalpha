"use client";

import React from "react";

import { Loader2, Upload, Save, Trash2, Search, Send, RefreshCw } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useLoadingContext } from "./loading-provider";

type IconComponent = React.ComponentType<{ className?: string }>;

const loadingConfigs: Record<string, { icon: IconComponent; defaultMessage?: string }> = {
  fetch: { icon: Loader2, defaultMessage: "Loading..." },
  upload: { icon: Upload, defaultMessage: "Uploading..." },
  save: { icon: Save, defaultMessage: "Saving..." },
  delete: { icon: Trash2, defaultMessage: "Deleting..." },
  search: { icon: Search, defaultMessage: "Searching..." },
  submit: { icon: Send, defaultMessage: "Submitting..." },
  sync: { icon: RefreshCw, defaultMessage: "Syncing..." },
  generate: { icon: Loader2, defaultMessage: "Working..." },
};

type ShadcnLoaderSize = "lg" | "md" | "sm" | "inline";

// Shadcn-style loader using Loader2 icon with consistent sizing
export function ShadcnLoader({
  size = "md",
  message,
  className,
}: {
  size?: ShadcnLoaderSize;
  message?: string;
  className?: string;
}) {
  const sizeClasses = {
    lg: "h-8 w-8",
    md: "h-6 w-6",
    sm: "h-4 w-4",
    inline: "h-3 w-3",
  };

  const containerClasses = {
    lg: "gap-3",
    md: "gap-2",
    sm: "gap-2",
    inline: "gap-1",
  };

  return (
    <div
      role="status"
      aria-busy
      className={cn(
        "flex items-center justify-center",
        // eslint-disable-next-line security/detect-object-injection
        containerClasses[size],
        className,
      )}
    >
      <Loader2 className={cn("animate-spin text-primary-600",
        // eslint-disable-next-line security/detect-object-injection
        sizeClasses[size])} />
      {message && size !== "inline" && (
        <span className="text-sm font-medium text-neutral-600">{message}</span>
      )}
    </div>
  );
}

// Legacy alias for backwards compatibility
export const ClarityLoader = ShadcnLoader;

export function InlineLoader({ action = "fetch", size = "sm", className }: { action?: string; size?: "sm" | "md"; className?: string }) {
  // action kept for API compatibility; message is not shown in inline
  void action;
  return <ShadcnLoader size={size === "sm" ? "inline" : "sm"} className={className} />;
}

export function SectionLoader({ action = "fetch", message: _, className }: { action?: string; message?: string; className?: string }) {
  // For section loading, use appropriate skeleton based on action type
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SkeletonMainContent, SkeletonVideoGrid, SkeletonChatList, CardSkeleton } = require("@/components/ui/skeleton-screens");
  
  // Choose skeleton based on action type
  if (action === "fetch" || action === "search") {
    return <SkeletonMainContent className={className} />;
  } else if (action === "upload" || action === "generate") {
    return <SkeletonVideoGrid count={3} className={className} />;
  } else {
    return <CardSkeleton />;
  }
}

export function PageLoader(_props: { message?: string }) {
  // For backwards compatibility - redirect to skeleton screens
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SkeletonPageLayout } = require("@/components/ui/skeleton-screens");
  return <SkeletonPageLayout />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-soft-drop)]">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4 rounded-[var(--radius-button)]" />
        <Skeleton className="h-4 w-1/2 rounded-[var(--radius-button)]" />
        <Skeleton className="h-4 w-full rounded-[var(--radius-button)]" />
        <Skeleton className="h-4 w-5/6 rounded-[var(--radius-button)]" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-9 w-full rounded-[var(--radius-button)]" />
        <Skeleton className="h-9 w-full rounded-[var(--radius-button)]" />
      </div>
    </div>
  );
}

export function ProgressLoader({ action = "upload", message, progress = 0, className }: { action?: string; message?: string; progress?: number; className?: string }) {
  // eslint-disable-next-line security/detect-object-injection
  const cfg = Object.prototype.hasOwnProperty.call(loadingConfigs, action) ? loadingConfigs[action] : loadingConfigs.upload;
  const Icon = cfg.icon;
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div role="status" aria-busy className={cn("flex w-full items-center justify-center p-6", className)}>
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4 shadow-[var(--shadow-soft-drop)]">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 animate-spin text-primary-600" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm text-neutral-700">{message ?? cfg.defaultMessage ?? "Processing..."}</span>
              <span className="font-sans text-xs text-neutral-500">{safeProgress}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-pill bg-neutral-200">
              <div className="h-2 rounded-pill bg-primary-500 transition-all duration-300 ease-out" style={{ width: `${safeProgress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StreamLoader({ message = "Streaming...", className }: { message?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex items-center justify-center", className)}>
      <ShadcnLoader size="sm" message={message} />
    </div>
  );
}

export function LoadingBoundary({ id, fallback, children }: { id: string; fallback: React.ReactNode; children: React.ReactNode }) {
  const { states } = useLoadingContext();
  const entry = states.get(id);
  const showFallback = !!entry && !!entry.visible;
  if (showFallback) return <>{fallback}</>;
  return <>{children}</>;
}

