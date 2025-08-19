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

type ClarityLoaderSize = "lg" | "md" | "sm" | "inline";

export function ClarityLoader({
  size = "md",
  message,
  inverted = false,
  className,
}: {
  size?: ClarityLoaderSize;
  message?: string;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy
      className={cn(
        "clarity-loader",
        size === "lg" && "clarity-size-lg",
        size === "md" && "clarity-size-md",
        size === "sm" && "clarity-size-sm",
        size === "inline" && "clarity-size-inline",
        inverted && "clarity-inverted",
        className,
      )}
    >
      <div className="clarity-ring" />
      <div className="clarity-ring clarity-ring-2" />
      <div className="clarity-orb-core" />
      <div className="clarity-dot dot-1" />
      <div className="clarity-dot dot-2" />
      <div className="clarity-dot dot-3" />
      {message ? <div className="clarity-loading-text">{message}</div> : null}
    </div>
  );
}

export function InlineLoader({ action = "fetch", size = "sm", className }: { action?: string; size?: "sm" | "md"; className?: string }) {
  // action kept for API compatibility; message is not shown in inline
  void action;
  return <ClarityLoader size={size === "sm" ? "inline" : "sm"} className={className} />;
}

export function SectionLoader({ action = "fetch", message, className }: { action?: string; message?: string; className?: string }) {
  const cfg = Object.prototype.hasOwnProperty.call(loadingConfigs, action) ? loadingConfigs[action] : loadingConfigs.fetch;
  return (
    <div role="status" aria-busy className={cn("flex w-full items-center justify-center p-6", className)}>
      <ClarityLoader size="md" message={message ?? cfg.defaultMessage ?? "Loading..."} />
    </div>
  );
}

export function PageLoader({ message }: { message?: string }) {
  // For backwards compatibility - redirect to skeleton screens
  const { SkeletonPageLayout } = require("@/components/ui/skeleton-screens");
  return <SkeletonPageLayout />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-[var(--shadow-soft-drop)]">
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
  const cfg = Object.prototype.hasOwnProperty.call(loadingConfigs, action) ? loadingConfigs[action] : loadingConfigs.upload;
  const Icon = cfg.icon;
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div role="status" aria-busy className={cn("flex w-full items-center justify-center p-6", className)}>
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-[var(--shadow-soft-drop)]">
        <div className="flex items-center gap-3">
          <Icon className={cn("h-5 w-5 text-foreground", cfg.animation)} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm text-muted-foreground">{message ?? cfg.defaultMessage ?? "Processing..."}</span>
              <span className="font-sans text-xs text-muted-foreground">{safeProgress}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-pill bg-accent">
              <div className="h-2 rounded-pill bg-primary" style={{ width: `${safeProgress}%` }} />
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
      <ClarityLoader size="sm" message={message} />
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

