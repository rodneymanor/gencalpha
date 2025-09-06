import { cn } from "@/lib/utils";

// Base skeleton component with shimmer animation
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-card)] bg-neutral-200",
        className,
      )}
      {...props}
    />
  );
}

// Text line skeleton
function SkeletonText({ className, lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

// Card skeleton
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

// Button skeleton
function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn(
        "h-10 w-24 rounded-[var(--radius-button)]",
        className,
      )}
    />
  );
}

// Avatar skeleton
function SkeletonAvatar({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <Skeleton
      className={cn(
        "rounded-full",
        sizeClasses[size],
        className,
      )}
    />
  );
}

// Input skeleton
function SkeletonInput({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn(
        "h-10 w-full rounded-[var(--radius-button)]",
        className,
      )}
    />
  );
}

// Grid skeleton for persona cards
function SkeletonPersonaGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6"
        >
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// List skeleton for content items
function SkeletonContentList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-32 rounded-[var(--radius-card)] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Chat/Write interface skeleton
function SkeletonWriteInterface() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonButton className="w-32" />
            <SkeletonButton className="w-24" />
          </div>
          <SkeletonAvatar />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 p-6 space-y-4">
        {/* Message bubbles */}
        <div className="flex justify-end">
          <Skeleton className="h-16 w-64 rounded-[var(--radius-card)]" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-24 w-80 rounded-[var(--radius-card)]" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-12 w-48 rounded-[var(--radius-card)]" />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-neutral-200 p-4">
        <div className="flex gap-3">
          <SkeletonButton className="w-10" />
          <SkeletonInput className="flex-1" />
          <SkeletonButton className="w-10" />
        </div>
      </div>
    </div>
  );
}

// Page header skeleton
function SkeletonPageHeader() {
  return (
    <div className="mb-6">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-5 w-64" />
    </div>
  );
}

// Table skeleton
function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-neutral-200">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-neutral-100 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-3/4" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="border-b border-neutral-200 p-4 last:border-b-0"
          >
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={cn(
                    "h-4",
                    colIndex === 0 ? "w-full" : "w-3/4",
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonButton,
  SkeletonAvatar,
  SkeletonInput,
  SkeletonPersonaGrid,
  SkeletonContentList,
  SkeletonWriteInterface,
  SkeletonPageHeader,
  SkeletonTable,
};
