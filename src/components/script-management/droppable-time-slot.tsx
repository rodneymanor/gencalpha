"use client";

import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";

interface DroppableTimeSlotProps {
  id: string;
  time: string;
  scriptId: string | null;
  children: React.ReactNode;
}

export function DroppableTimeSlot({ id, time, scriptId, children }: DroppableTimeSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border-2 border-dashed p-4 transition-all duration-200",
        isOver
          ? "border-primary bg-primary/10 scale-105"
          : scriptId
            ? "border-border bg-card"
            : "border-border/50 bg-muted/20",
      )}
    >
      {children}
    </div>
  );
}
