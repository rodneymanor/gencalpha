/**
 * Simple In-Memory Video Processing Queue
 * Idiot-proof solution for Instagram video processing
 */

import { scrapeInstagramUrl } from "@/lib/apify-instagram-scraper";

export interface VideoProcessingJob {
  id: string;
  url: string;
  collectionId?: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  message: string;
  startedAt: Date;
  completedAt?: Date;
  result?: {
    videoId: string;
    thumbnailUrl?: string;
    title?: string;
    author?: string;
    videoUrl?: string;
  };
  error?: string;
}

export interface ProcessingStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

class SimpleVideoQueue {
  private jobs = new Map<string, VideoProcessingJob>();
  private processing = new Set<string>();

  /**
   * Add new video to processing queue
   * Returns immediately with job info
   */
  addJob(url: string, userId: string, collectionId?: string): VideoProcessingJob {
    const jobId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: VideoProcessingJob = {
      id: jobId,
      url,
      collectionId,
      userId,
      status: "pending",
      progress: 0,
      message: "Queued for processing...",
      startedAt: new Date(),
    };

    this.jobs.set(jobId, job);
    console.log("📋 [QUEUE] Added job:", jobId, "for URL:", url);
    
    // Start processing in background (don't await)
    this.processJob(jobId).catch(error => {
      console.error("❌ [QUEUE] Background processing failed:", error);
    });
    
    return job;
  }

  /**
   * Get job status
   */
  getJob(jobId: string): VideoProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs for a user
   */
  getUserJobs(userId: string): VideoProcessingJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  /**
   * Get processing statistics
   */
  getStats(): ProcessingStats {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === "pending").length,
      processing: jobs.filter(j => j.status === "processing").length,
      completed: jobs.filter(j => j.status === "completed").length,
      failed: jobs.filter(j => j.status === "failed").length,
    };
  }

  /**
   * Get jobs that should show notifications (active jobs)
   */
  getActiveJobs(): VideoProcessingJob[] {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    return Array.from(this.jobs.values())
      .filter(job => 
        job.status === "processing" || 
        job.status === "pending" ||
        (job.completedAt && job.completedAt.getTime() > oneHourAgo)
      )
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  /**
   * Process a video job in background
   */
  private async processJob(jobId: string): Promise<void> {
    if (this.processing.has(jobId)) {
      return; // Already processing
    }

    this.processing.add(jobId);
    const job = this.jobs.get(jobId);
    
    if (!job) {
      this.processing.delete(jobId);
      return;
    }

    try {
      console.log("🚀 [QUEUE] Starting job:", jobId);
      
      // Update to processing
      job.status = "processing";
      job.progress = 10;
      job.message = "Starting Instagram scrape...";
      this.jobs.set(jobId, job);

      // Step 1: Scrape Instagram data
      job.progress = 25;
      job.message = "Extracting video metadata...";
      this.jobs.set(jobId, job);

      const instagramData = await scrapeInstagramUrl(job.url);
      
      if (!instagramData) {
        throw new Error("Failed to extract video data from Instagram");
      }

      // Step 2: Get video download URL
      job.progress = 50;
      job.message = "Getting video download link...";
      this.jobs.set(jobId, job);

      const videoUrl = instagramData.videoUrl || instagramData.videoUrlBackup;
      if (!videoUrl) {
        throw new Error("No video download URL found");
      }

      // Step 3: Call your existing video processing API
      job.progress = 75;
      job.message = "Adding to collection...";
      this.jobs.set(jobId, job);

      const response = await this.callVideoProcessingAPI(job, instagramData);
      
      if (!response.success) {
        throw new Error(response.error || "Video processing failed");
      }

      // Step 4: Complete
      job.status = "completed";
      job.progress = 100;
      job.message = "Video added successfully!";
      job.completedAt = new Date();
      job.result = {
        videoId: response.video?.id || instagramData.shortCode,
        thumbnailUrl: instagramData.thumbnailUrl || instagramData.imageUrl,
        title: instagramData.caption || `Video by @${instagramData.ownerUsername}`,
        author: instagramData.ownerUsername,
        videoUrl: videoUrl,
      };
      this.jobs.set(jobId, job);

      console.log("✅ [QUEUE] Job completed:", jobId);

    } catch (error) {
      console.error("❌ [QUEUE] Job failed:", jobId, error);
      
      job.status = "failed";
      job.progress = 100;
      job.message = "Processing failed";
      job.error = error instanceof Error ? error.message : "Unknown error";
      job.completedAt = new Date();
      this.jobs.set(jobId, job);
    } finally {
      this.processing.delete(jobId);
    }
  }

  /**
   * Call your existing video processing API
   */
  private async callVideoProcessingAPI(job: VideoProcessingJob, instagramData: any) {
    try {
      // Determine the base URL
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/video/process-and-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // In production, you'd need to pass authentication headers
        },
        body: JSON.stringify({
          videoUrl: job.url,
          collectionId: job.collectionId,
          userId: job.userId,
          // Pass the scraped data to avoid re-scraping
          scrapedData: {
            videoUrl: instagramData.videoUrl || instagramData.videoUrlBackup,
            thumbnailUrl: instagramData.thumbnailUrl || instagramData.imageUrl,
            title: instagramData.caption,
            author: instagramData.ownerUsername,
            metadata: instagramData,
          }
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("❌ [QUEUE] API call failed:", error);
      return { 
        success: false, 
        error: "Failed to process video through API" 
      };
    }
  }

  /**
   * Clean up old completed jobs (run periodically)
   */
  cleanup() {
    const now = Date.now();
    const fourHoursAgo = now - (4 * 60 * 60 * 1000);
    
    let cleaned = 0;
    for (const [jobId, job] of this.jobs.entries()) {
      if (
        (job.status === "completed" || job.status === "failed") &&
        job.completedAt &&
        job.completedAt.getTime() < fourHoursAgo
      ) {
        this.jobs.delete(jobId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log("🧹 [QUEUE] Cleaned up", cleaned, "old jobs");
    }
  }
}

// Singleton instance
const videoQueue = new SimpleVideoQueue();

// Clean up old jobs every hour
setInterval(() => {
  videoQueue.cleanup();
}, 60 * 60 * 1000);

export { videoQueue };