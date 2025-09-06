import { useState, useCallback } from "react";

export interface VideoUrl {
  url: string;
  platform: "instagram" | "tiktok";
}

export interface UseVideoStateReturn {
  // Video processing state
  pendingVideoUrl: VideoUrl | null;
  setPendingVideoUrl: React.Dispatch<React.SetStateAction<VideoUrl | null>>;

  // Helper methods
  setPendingVideo: (url: string, platform: "instagram" | "tiktok") => void;
  clearPendingVideo: () => void;
  hasPendingVideo: () => boolean;
}

export function useVideoState(): UseVideoStateReturn {
  const [pendingVideoUrl, setPendingVideoUrl] = useState<VideoUrl | null>(null);

  const setPendingVideo = useCallback((url: string, platform: "instagram" | "tiktok") => {
    setPendingVideoUrl({ url, platform });
  }, []);

  const clearPendingVideo = useCallback(() => {
    setPendingVideoUrl(null);
  }, []);

  const hasPendingVideo = useCallback((): boolean => {
    return pendingVideoUrl !== null;
  }, [pendingVideoUrl]);

  return {
    // State
    pendingVideoUrl,
    setPendingVideoUrl,

    // Methods
    setPendingVideo,
    clearPendingVideo,
    hasPendingVideo,
  };
}
