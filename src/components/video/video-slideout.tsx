"use client";

import { useEffect, useRef } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

import VideoInspirationPlayerWrapper, { VideoInspirationPlayerWrapperFloating } from "./video-inspiration-player";

interface VideoSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  video?: Video | null;
}

export function VideoSlideout({ isOpen, onClose, className, video }: VideoSlideoutProps) {
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
          "fixed top-4 right-0 bottom-4 z-50 w-full max-w-6xl",
          "bg-card",
          "shadow-[var(--shadow-soft-drop)]",
          "transform transition-transform duration-300 ease-out",
          "translate-x-0",
          "flex flex-col",
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
        <div className="flex-1 overflow-hidden">
          <div className="h-full">
            {video ? <VideoInspirationPlayerWrapperFloating video={video} /> : <VideoInspirationPlayerWrapper />}
          </div>
        </div>
      </div>
    </>
  );
}
