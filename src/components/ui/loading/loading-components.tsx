"use client";

import React from "react";

import { Loader2, Upload, Save, Trash2, Search, Send, RefreshCw } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useLoadingContext } from "./loading-provider";

type IconComponent = React.ComponentType<{ className?: string }>;

const loadingConfigs: Record<string, { icon: IconComponent; defaultMessage?: string; animation?: string }> = {
  fetch: { icon: Loader2, defaultMessage: "Loading...", animation: "animate-spin" },
  upload: { icon: Upload, defaultMessage: "Uploading..." },
  save: { icon: Save, defaultMessage: "Saving..." },
  delete: { icon: Trash2, defaultMessage: "Deleting..." },
  search: { icon: Search, defaultMessage: "Searching..." },
  submit: { icon: Send, defaultMessage: "Submitting..." },
  sync: { icon: RefreshCw, defaultMessage: "Syncing...", animation: "animate-spin" },
  generate: { icon: Loader2, defaultMessage: "Working...", animation: "animate-spin" },
};

export function InlineLoader({ action = "fetch", size = "sm", className }: { action?: string; size?: "sm" | "md"; className?: string }) {
  const cfg = Object.prototype.hasOwnProperty.call(loadingConfigs, action) ? loadingConfigs[action] : loadingConfigs.fetch;
  const Icon = cfg.icon;
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex items-center gap-2", className)}>
      <Icon className={cn("text-foreground", size === "sm" ? "h-4 w-4" : "h-5 w-5", cfg.animation)} />
    </span>
  );
}

export function SectionLoader({ action = "fetch", message, className }: { action?: string; message?: string; className?: string }) {
  const cfg = Object.prototype.hasOwnProperty.call(loadingConfigs, action) ? loadingConfigs[action] : loadingConfigs.fetch;
  const Icon = cfg.icon;
  return (
    <div role="status" aria-busy className={cn("flex w-full items-center justify-center p-6", className)}>
      <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-card px-4 py-3 shadow-[var(--shadow-soft-drop)]">
        <Icon className={cn("h-5 w-5 text-foreground", cfg.animation)} />
        <span className="font-sans text-sm text-muted-foreground">{message ?? cfg.defaultMessage ?? "Loading..."}</span>
      </div>
    </div>
  );
}

export function PageLoader({ message }: { message?: string }) {
  return (
    <div role="status" aria-busy className="flex h-[60vh] w-full items-center justify-center">
      <SectionLoader action="fetch" message={message ?? "Loading page..."} />
    </div>
  );
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
    <div role="status" aria-live="polite" className={cn("flex items-center gap-3 text-muted-foreground", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="font-sans text-sm">{message}</span>
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

