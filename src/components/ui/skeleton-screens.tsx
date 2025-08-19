"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ========================================
// CLAUDE-STYLE SKELETON SCREENS
// Following "Progressive Skeleton" Strategy
// ========================================

// Base skeleton element with shimmer animation
export function SkeletonElement({ 
  className,
  children,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ========================================
// MICRO SKELETONS - Individual elements
// ========================================

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };
  
  return (
    <SkeletonElement 
      className={cn("rounded-full", sizeClasses[size])}
    />
  );
}

export function SkeletonText({ 
  lines = 1,
  className 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonElement
          key={i}
          className={cn(
            "h-4 rounded",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonButton({ 
  variant = "default",
  size = "md" 
}: { 
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-8 px-3",
    md: "h-9 px-4",
    lg: "h-10 px-6"
  };
  
  return (
    <SkeletonElement 
      className={cn("rounded-md", sizeClasses[size])}
    />
  );
}

// ========================================
// MESSAGE SKELETONS - Chat interface
// ========================================

export function SkeletonMessage({ 
  role = "assistant",
  lines = 2 
}: { 
  role?: "user" | "assistant";
  lines?: number;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-accent/10 rounded-lg p-3">
          <SkeletonText lines={lines} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex gap-3">
      <SkeletonAvatar size="md" />
      <div className="flex-1 space-y-2">
        <SkeletonText lines={lines} />
      </div>
    </div>
  );
}

export function SkeletonChatList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMessage 
          key={i}
          role={i % 3 === 0 ? "user" : "assistant"}
          lines={Math.floor(Math.random() * 3) + 1}
        />
      ))}
    </div>
  );
}

// ========================================
// THINKING INDICATOR - AI Processing
// ========================================

export function ThinkingIndicator({ 
  message = "Thinking",
  className 
}: { 
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2", className)}>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

// ========================================
// PAGE SKELETONS - Full layouts
// ========================================

export function SkeletonHeader() {
  return (
    <div className="h-14 border-b border-border-subtle bg-background">
      <div className="flex items-center h-full px-4 gap-4">
        <SkeletonElement className="w-32 h-6" />
        <div className="ml-auto flex gap-3">
          <SkeletonButton size="sm" />
          <SkeletonButton size="sm" />
          <SkeletonAvatar size="sm" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonSidebar() {
  return (
    <div className="w-64 border-r border-border-subtle bg-background h-full">
      <div className="p-4 space-y-4">
        {/* Navigation items */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <SkeletonElement className="w-4 h-4 rounded" />
            <SkeletonElement className="flex-1 h-4 rounded" />
          </div>
        ))}
        
        <div className="pt-4 border-t border-border-subtle">
          {/* Secondary navigation */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <SkeletonElement className="w-4 h-4 rounded" />
              <SkeletonElement className="flex-1 h-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonMainContent() {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page title */}
        <div className="space-y-2">
          <SkeletonElement className="h-8 w-48 rounded" />
          <SkeletonElement className="h-4 w-96 rounded" />
        </div>
        
        {/* Content cards */}
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border-subtle bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <SkeletonElement className="h-5 w-3/4 rounded" />
            <SkeletonElement className="h-4 w-1/2 rounded" />
          </div>
        </div>
        
        <div className="space-y-2">
          <SkeletonElement className="h-4 w-full rounded" />
          <SkeletonElement className="h-4 w-5/6 rounded" />
          <SkeletonElement className="h-4 w-4/5 rounded" />
        </div>
        
        <div className="flex gap-2 pt-2">
          <SkeletonButton size="sm" />
          <SkeletonButton size="sm" />
        </div>
      </div>
    </div>
  );
}

// ========================================
// GRID SKELETONS - Collections, videos
// ========================================

export function SkeletonVideoCard() {
  return (
    <div className="rounded-lg border border-border-subtle bg-card overflow-hidden">
      {/* Video thumbnail */}
      <SkeletonElement className="w-full aspect-video" />
      
      <div className="p-4 space-y-3">
        {/* Title */}
        <SkeletonElement className="h-5 w-full rounded" />
        
        {/* Creator info */}
        <div className="flex items-center gap-2">
          <SkeletonAvatar size="sm" />
          <SkeletonElement className="h-4 w-24 rounded" />
        </div>
        
        {/* Metadata */}
        <div className="flex gap-2">
          <SkeletonElement className="h-3 w-16 rounded" />
          <SkeletonElement className="h-3 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonVideoGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonVideoCard key={i} />
      ))}
    </div>
  );
}

// ========================================
// FULL PAGE LAYOUTS
// ========================================

export function SkeletonPageLayout() {
  return (
    <div className="min-h-screen bg-background">
      <SkeletonHeader />
      <div className="flex">
        <SkeletonSidebar />
        <SkeletonMainContent />
      </div>
    </div>
  );
}

export function SkeletonChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <SkeletonHeader />
      <div className="flex h-[calc(100vh-56px)]">
        {/* Chat sidebar */}
        <div className="w-80 border-r border-border-subtle bg-background">
          <div className="p-4 space-y-4">
            {/* Search */}
            <SkeletonElement className="h-9 w-full rounded-md" />
            
            {/* Conversations */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <SkeletonElement className="h-4 w-3/4 rounded" />
                <SkeletonElement className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="max-w-3xl mx-auto">
              <SkeletonChatList count={4} />
            </div>
          </div>
          
          {/* Input area */}
          <div className="border-t border-border-subtle p-4">
            <div className="max-w-3xl mx-auto">
              <SkeletonElement className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// PROGRESSIVE LOADER
// ========================================

export function ProgressiveLoader({ 
  stage = "skeleton",
  children 
}: { 
  stage?: "skeleton" | "partial" | "complete";
  children?: React.ReactNode;
}) {
  if (stage === "skeleton") {
    return <SkeletonPageLayout />;
  }
  
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
  
  return <>{children}</>;
}