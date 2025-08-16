"use client";

import { useEffect, useRef } from "react";

import { useNotifications } from "@/contexts/notification-context";
import { useVideoProcessing } from "@/contexts/video-processing-context";

/**
 * Component that monitors video processing and creates notifications
 * Should be placed high in the component tree to ensure it's always active
 */
export function VideoProcessingNotifier() {
  const { jobs } = useVideoProcessing();
  const { addNotification } = useNotifications();
  const processedJobsRef = useRef(new Set<string>());

  useEffect(() => {
    // Check for newly completed or failed jobs
    jobs.forEach((job) => {
      // Skip if we've already processed this job
      if (processedJobsRef.current.has(job.id)) {
        return;
      }

      // Only create notifications for completed or failed jobs
      if (job.status === "completed") {
        addNotification({
          type: "processing_complete",
          title: "Video Added Successfully!",
          message: job.result?.title
            ? `"${job.result.title}" by @${job.result.author} has been added to your collection`
            : "Video has been processed and added to your collection",
          data: {
            videoId: job.result?.videoId,
            collectionId: job.collectionId,
            thumbnailUrl: job.result?.thumbnailUrl,
            videoUrl: job.result?.videoUrl,
            jobId: job.id,
          },
        });

        processedJobsRef.current.add(job.id);
      } else if (job.status === "failed") {
        addNotification({
          type: "processing_failed",
          title: "Video Processing Failed",
          message: job.error ?? "Failed to process video. Please try again.",
          data: {
            jobId: job.id,
          },
        });

        processedJobsRef.current.add(job.id);
      }
    });
  }, [jobs, addNotification]);

  // Clean up processed jobs that are no longer in the jobs list
  useEffect(() => {
    const currentJobIds = new Set(jobs.map((job) => job.id));
    const processedJobIds = Array.from(processedJobsRef.current);

    processedJobIds.forEach((jobId) => {
      if (!currentJobIds.has(jobId)) {
        processedJobsRef.current.delete(jobId);
      }
    });
  }, [jobs]);

  // This component doesn't render anything
  return null;
}
