import { NextRequest, NextResponse } from "next/server";

import { UnifiedVideoScraper } from "@/lib/unified-video-scraper";
import { videoQueue } from "@/lib/simple-video-queue";

interface AddToQueueRequest {
  videoUrl: string;
  collectionId?: string;
  userId?: string; // In production, get from auth
}

export async function POST(request: NextRequest) {
  console.log("🚀 [ADD-TO-QUEUE] Starting video queue process...");

  try {
    const { videoUrl, collectionId, userId }: AddToQueueRequest = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ success: false, error: "Video URL is required" }, { status: 400 });
    }

    // Validate video URL using unified scraper
    const validation = UnifiedVideoScraper.validateUrlWithMessage(videoUrl);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.message,
        },
        { status: 400 },
      );
    }

    // For now, use a default userId if not provided (in production, get from auth)
    const actualUserId = userId ?? "default_user";

    // Add to queue (returns immediately)
    const job = videoQueue.addJob(videoUrl, actualUserId, collectionId);

    console.log("✅ [ADD-TO-QUEUE] Video added to queue:", job.id);

    return NextResponse.json({
      success: true,
      message: "Video added to processing queue",
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        message: job.message,
        estimatedTime: "30-60 seconds",
      },
      instructions: {
        polling: "Check /api/video/processing-status for updates",
        notification: "Watch the notification badge in the top-right corner",
        timeline: [
          "Extracting video metadata (10-20s)",
          "Getting download links (5-10s)",
          "Adding to collection (10-20s)",
          "Complete!",
        ],
      },
    });
  } catch (error) {
    console.error("❌ [ADD-TO-QUEUE] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add video to queue",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Video Queue API",
    description: "Add TikTok and Instagram videos to background processing queue",
    usage: {
      "POST /api/video/add-to-queue": {
        body: {
          videoUrl: "TikTok or Instagram URL (required)",
          collectionId: "Collection ID (optional)",
          userId: "User ID (optional, get from auth in production)",
        },
        response: {
          success: true,
          job: "Job details with ID and status",
          instructions: "How to track progress",
        },
      },
    },
    features: [
      "Immediate response (< 500ms)",
      "Background processing with Apify",
      "Real-time progress updates",
      "Notification badge integration",
      "Automatic retry on failure",
      "Supports both TikTok and Instagram",
    ],
    supportedPlatforms: {
      tiktok: ["https://www.tiktok.com/@user/video/123", "https://vm.tiktok.com/ABC123", "https://tiktok.com/t/ABC123"],
      instagram: ["https://www.instagram.com/reel/ABC123", "https://www.instagram.com/p/ABC123", "https://www.instagram.com/tv/ABC123"],
    },
  });
}
