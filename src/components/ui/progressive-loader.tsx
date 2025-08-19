"use client";

import React, { useState, useEffect } from "react";
import { 
  SkeletonPageLayout,
  SkeletonChatPage,
  SkeletonHeader,
  SkeletonSidebar,
  SkeletonMainContent,
  ThinkingIndicator 
} from "./skeleton-screens";

// ========================================
// PROGRESSIVE LOADING STRATEGY
// Claude-style "Never Show a Spinner"
// ========================================

export type LoadingStage = "skeleton" | "partial" | "complete";

interface ProgressivePageLoaderProps {
  children: React.ReactNode;
  type?: "page" | "chat" | "dashboard";
  duration?: number;
  onStageChange?: (stage: LoadingStage) => void;
}

/**
 * Progressive Page Loader - Claude's Three-Stage Strategy
 * 
 * Stage 1 (0-100ms): Show skeleton layout immediately
 * Stage 2 (100-300ms): Show partial content with shell
 * Stage 3 (300ms+): Show complete content
 */
export function ProgressivePageLoader({
  children,
  type = "page",
  duration = 300,
  onStageChange
}: ProgressivePageLoaderProps) {
  const [stage, setStage] = useState<LoadingStage>("skeleton");

  useEffect(() => {
    // Stage 1: Skeleton (immediate)
    onStageChange?.("skeleton");

    // Stage 2: Partial content
    const partialTimer = setTimeout(() => {
      setStage("partial");
      onStageChange?.("partial");
    }, Math.min(100, duration / 3));

    // Stage 3: Complete content
    const completeTimer = setTimeout(() => {
      setStage("complete");
      onStageChange?.("complete");
    }, duration);

    return () => {
      clearTimeout(partialTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onStageChange]);

  // Stage 1: Skeleton screens
  if (stage === "skeleton") {
    switch (type) {
      case "chat":
        return <SkeletonChatPage />;
      case "dashboard":
        return <SkeletonPageLayout />;
      default:
        return <SkeletonPageLayout />;
    }
  }

  // Stage 2: Partial content with shell
  if (stage === "partial") {
    return (
      <div className="animate-in fade-in duration-200">
        <SkeletonHeader />
        <div className="flex">
          <SkeletonSidebar />
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <ThinkingIndicator message="Loading content" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stage 3: Complete content
  return (
    <div className="animate-in fade-in duration-300">
      {children}
    </div>
  );
}

/**
 * Route-specific progressive loaders
 */
export function ProgressiveChatLoader({ 
  children, 
  duration = 300 
}: { 
  children: React.ReactNode; 
  duration?: number; 
}) {
  return (
    <ProgressivePageLoader type="chat" duration={duration}>
      {children}
    </ProgressivePageLoader>
  );
}

export function ProgressiveDashboardLoader({ 
  children, 
  duration = 300 
}: { 
  children: React.ReactNode; 
  duration?: number; 
}) {
  return (
    <ProgressivePageLoader type="dashboard" duration={duration}>
      {children}
    </ProgressivePageLoader>
  );
}

/**
 * Content-specific progressive loaders
 */
interface ProgressiveContentLoaderProps {
  children: React.ReactNode;
  isLoading: boolean;
  type: "video-grid" | "chat-messages" | "sidebar" | "content";
  skeletonCount?: number;
}

export function ProgressiveContentLoader({
  children,
  isLoading,
  type,
  skeletonCount = 3
}: ProgressiveContentLoaderProps) {
  const [showingSkeleton, setShowingSkeleton] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowingSkeleton(true);
    } else {
      // Small delay to avoid jarring transitions
      const timer = setTimeout(() => {
        setShowingSkeleton(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (showingSkeleton) {
    switch (type) {
      case "video-grid":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="skeleton aspect-video rounded-lg" />
            ))}
          </div>
        );
      
      case "chat-messages":
        return (
          <div className="space-y-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        );
      
      case "sidebar":
        return <SkeletonSidebar />;
      
      case "content":
      default:
        return <SkeletonMainContent />;
    }
  }

  return (
    <div className="animate-in fade-in duration-200">
      {children}
    </div>
  );
}

/**
 * Hook for managing progressive loading states
 */
export function useProgressiveLoading(initialState: LoadingStage = "skeleton") {
  const [stage, setStage] = useState<LoadingStage>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  const startLoading = () => {
    setStage("skeleton");
    setIsLoading(true);
  };

  const setPartial = () => {
    setStage("partial");
  };

  const finishLoading = () => {
    setStage("complete");
    setIsLoading(false);
  };

  const reset = () => {
    setStage("skeleton");
    setIsLoading(true);
  };

  return {
    stage,
    isLoading,
    startLoading,
    setPartial,
    finishLoading,
    reset
  };
}

/**
 * Route transition loader - maintains context during navigation
 */
interface RouteTransitionLoaderProps {
  children: React.ReactNode;
  isTransitioning: boolean;
  persistentElements?: React.ReactNode;
}

export function RouteTransitionLoader({
  children,
  isTransitioning,
  persistentElements
}: RouteTransitionLoaderProps) {
  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-background">
        {persistentElements}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <SkeletonMainContent />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Data fetching progressive loader
 */
interface DataProgressiveLoaderProps<T> {
  data: T | null;
  isLoading: boolean;
  error?: Error | null;
  children: (data: T) => React.ReactNode;
  skeleton: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function DataProgressiveLoader<T>({
  data,
  isLoading,
  error,
  children,
  skeleton,
  errorFallback
}: DataProgressiveLoaderProps<T>) {
  // Show error state
  if (error) {
    return (
      <div className="text-center p-6">
        {errorFallback || (
          <div className="text-muted-foreground">
            <p>Something went wrong</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}
      </div>
    );
  }

  // Show skeleton while loading or no data
  if (isLoading || !data) {
    return <>{skeleton}</>;
  }

  // Show content with fade-in
  return (
    <div className="animate-in fade-in duration-200">
      {children(data)}
    </div>
  );
}