"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

import type { VideoProcessingJob } from "@/lib/simple-video-queue";

interface VideoProcessingContextType {
  jobs: VideoProcessingJob[];
  refreshJobs: () => Promise<void>;
  isPolling: boolean;
}

const VideoProcessingContext = createContext<VideoProcessingContextType | undefined>(undefined);

export function VideoProcessingProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<VideoProcessingJob[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch("/api/video/processing-status");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.activeJobs || []);
        return data.activeJobs || [];
      }
    } catch (error) {
      console.error("Failed to fetch processing jobs:", error);
    }
    return [];
  }, []);

  const refreshJobs = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  // Smart polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (interval) return; // Already polling

      const activeJobs = jobs.filter((job) => job.status === "pending" || job.status === "processing");

      if (activeJobs.length > 0) {
        // Active jobs: poll every 3 seconds
        console.log(`🔄 Starting active polling for ${activeJobs.length} jobs`);
        setIsPolling(true);
        interval = setInterval(fetchJobs, 3000);
      } else {
        // No active jobs: check every 30 seconds for new jobs
        console.log("💤 Starting idle polling");
        setIsPolling(false);
        interval = setInterval(fetchJobs, 30000);
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
        setIsPolling(false);
        console.log("⏹️ Stopped polling");
      }
    };

    // Initial fetch
    fetchJobs().then(() => {
      startPolling();
    });

    return stopPolling;
  }, [jobs.length, fetchJobs]);

  // Log polling status changes
  useEffect(() => {
    const activeCount = jobs.filter((job) => job.status === "pending" || job.status === "processing").length;

    if (activeCount > 0) {
      console.log(`📊 Processing ${activeCount} active jobs`);
    }
  }, [jobs]);

  const value: VideoProcessingContextType = {
    jobs,
    refreshJobs,
    isPolling,
  };

  return <VideoProcessingContext.Provider value={value}>{children}</VideoProcessingContext.Provider>;
}

export function useVideoProcessing() {
  const context = useContext(VideoProcessingContext);
  if (context === undefined) {
    throw new Error("useVideoProcessing must be used within a VideoProcessingProvider");
  }
  return context;
}
