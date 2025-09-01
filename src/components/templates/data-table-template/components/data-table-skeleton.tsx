"use client";

// Data Table Skeleton Component
// Loading state for the data table

import React from "react";

import { cn } from "@/lib/utils";

interface DataTableSkeletonProps {
  columns: number;
  rows: number;
  viewMode: "table" | "grid" | "list" | "kanban";
  className?: string;
}

export function DataTableSkeleton({ columns, rows, viewMode, className }: DataTableSkeletonProps) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: rows * 2 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4">
            <div className="space-y-3">
              <div className="h-4 animate-pulse rounded bg-neutral-200" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-4">
              <div className="h-4 w-4 animate-pulse rounded bg-neutral-200" />
              <div className="flex flex-1 items-center gap-4">
                {Array.from({ length: Math.min(columns, 4) }).map((_, j) => (
                  <div key={j} className="h-4 flex-1 animate-pulse rounded bg-neutral-200" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table skeleton
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50", className)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-neutral-200">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-4 text-left">
                  <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-neutral-100">
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="p-4">
                    <div className="h-4 animate-pulse rounded bg-neutral-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
