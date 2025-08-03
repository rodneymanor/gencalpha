"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { useResizableLayout } from "@/contexts/resizable-layout-context";

interface PenFabProps {
  onClick?: () => void;
  className?: string;
}

export function PenFab({ onClick, className }: PenFabProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={cn(
        "fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-black shadow-lg transition-all duration-300",
        "hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
        isHovered ? "scale-110" : "",
        className,
      )}
      aria-label="Open writing panel"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex items-center justify-center">
        <Pencil
          className={cn(
            "h-5 w-5 text-white transition-all duration-300",
            isHovered ? "stroke-[2.5px]" : "stroke-[2px]",
          )}
        />
        <div
          className={cn(
            "absolute h-full w-full rounded-full bg-white/10 transition-all duration-300",
            isHovered ? "scale-150 opacity-0" : "scale-100 opacity-0",
          )}
        />
      </div>
    </button>
  );
}

export function FloatingActionButton() {
  const { toggleChatbotPanel } = useResizableLayout();

  return <PenFab onClick={toggleChatbotPanel} />;
}
