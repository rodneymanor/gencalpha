"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

import type { VideoProcessingJob } from "@/lib/simple-video-queue";

interface VideoProcessingContextType {
  jobs: VideoProcessingJob[];
  refreshJobs: () => Promise<void>;
  isPolling: boolean;
  /* Manually start polling when needed */
  startPolling: () => void;
}

const VideoProcessingContext = createContext<VideoProcessingContextType | undefined>(undefined);

export function VideoProcessingProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<VideoProcessingJob[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch("/api/video/processing-status");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.activeJobs ?? []);
        return data.activeJobs ?? [];
      }
    } catch (error) {
      console.error("Failed to fetch processing jobs:", error);
    }
    return [];
  }, []);

  const refreshJobs = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  // Manually trigger polling when a component or action needs it
  const startPolling = useCallback(() => {
    setShouldPoll(true);
  }, []);

  // Smart polling logic - only runs when polling is enabled
  useEffect(() => {
    if (!shouldPoll) {
      setIsPolling(false);
      return;
    }

    const activeJobs = jobs.filter((job) => job.status === "pending" || job.status === "processing");

    let interval: NodeJS.Timeout | null = null;

    if (activeJobs.length > 0) {
      // Active jobs: poll every 3 seconds
      console.log(`🔄 Starting polling for ${activeJobs.length} active jobs`);
      setIsPolling(true);
      interval = setInterval(fetchJobs, 3000);
    } else {
      // No active jobs: stop polling completely
      console.log("⏹️ No active jobs - stopping polling");
      setIsPolling(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        console.log("🛑 Cleaned up polling interval");
      }
    };
  }, [shouldPoll, jobs, fetchJobs]); // Include fetchJobs since it's stable (memoized)

  // Initial fetch – only when polling has been requested
  useEffect(() => {
    if (shouldPoll) {
      console.log("🚀 VideoProcessingContext: Initial fetch");
      fetchJobs();
    }
  }, [shouldPoll, fetchJobs]); // Run when polling starts

  // Log polling status changes
  useEffect(() => {
    const activeCount = jobs.filter((job) => job.status === "pending" || job.status === "processing").length;

    if (activeCount > 0) {
      console.log(`📊 Processing ${activeCount} active jobs`);
    }
  }, [jobs]);

  const value: VideoProcessingContextType = useMemo(
    () => ({
      jobs,
      refreshJobs,
      isPolling,
      startPolling,
    }),
    [jobs, refreshJobs, isPolling, startPolling],
  );

  return <VideoProcessingContext.Provider value={value}>{children}</VideoProcessingContext.Provider>;
}

export function useVideoProcessing() {
  const context = useContext(VideoProcessingContext);
  if (context === undefined) {
    throw new Error("useVideoProcessing must be used within a VideoProcessingProvider");
  }
  return context;
}
