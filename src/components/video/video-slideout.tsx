"use client";

import { useEffect, useRef } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import VideoInspirationPlayerWrapper from "./video-inspiration-player";

interface VideoSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function VideoSlideout({ isOpen, onClose, className }: VideoSlideoutProps) {
  const slideoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="bg-background/60 fixed inset-0 z-50 backdrop-blur-md transition-all duration-300 ease-out"
        onClick={onClose}
      />

      {/* Slideout Panel */}
      <div
        ref={slideoutRef}
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-6xl",
          "bg-card/95 backdrop-blur-sm",
          "shadow-[var(--shadow-soft-drop)]",
          "transform transition-transform duration-300 ease-out",
          "translate-x-0",
          className,
        )}
      >
        {/* Header */}
        <div className="from-muted/30 flex items-center justify-between bg-gradient-to-b to-transparent p-6">
          <h2 className="text-foreground text-lg font-semibold">Video Inspiration</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-accent h-8 w-8 rounded-[var(--radius-button)] p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-5rem)] overflow-hidden">
          <div className="h-full">
            <VideoInspirationPlayerWrapper />
          </div>
        </div>
      </div>
    </>
  );
}
