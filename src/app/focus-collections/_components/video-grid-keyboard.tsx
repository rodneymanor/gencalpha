"use client";

import { useEffect } from "react";

import { Video } from "@/lib/collections";

interface VideoGridKeyboardProps {
  selectedVideoId?: string;
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

export function useVideoGridKeyboard({ selectedVideoId, videos, onVideoSelect }: VideoGridKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedVideoId || videos.length === 0) return;

      const currentIndex = videos.findIndex((v) => v.id === selectedVideoId);
      if (currentIndex === -1) return;

      let newIndex = currentIndex;

      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          newIndex = Math.min(currentIndex + 1, videos.length - 1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
          break;
        case "ArrowDown":
          event.preventDefault();
          newIndex = Math.min(currentIndex + 2, videos.length - 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          newIndex = Math.max(currentIndex - 2, 0);
          break;
        default:
          return;
      }

      if (newIndex !== currentIndex) {
        // eslint-disable-next-line security/detect-object-injection
        onVideoSelect(videos[newIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedVideoId, videos, onVideoSelect]);
}
