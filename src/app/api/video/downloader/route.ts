import { NextRequest, NextResponse } from "next/server";

import { scrapeVideoUrl, UnifiedVideoScraper } from "@/lib/unified-video-scraper";

export async function POST(request: NextRequest) {
  console.log("📥 [DOWNLOADER] Starting unified video download service...");

  try {
    const { url } = await request.json();

    if (!url) {
      console.error("❌ [DOWNLOADER] No URL provided");
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Decode URL if it's URL-encoded (fixes Instagram issue)
    const decodedUrl = decodeURIComponent(url);
    console.log("🔍 [DOWNLOADER] Processing URL:", url);
    console.log("🔍 [DOWNLOADER] Decoded URL:", decodedUrl);

    // Validate URL with detailed error message
    const validation = UnifiedVideoScraper.validateUrlWithMessage(decodedUrl);
    if (!validation.valid) {
      console.error("❌ [DOWNLOADER] Invalid URL:", validation.message);
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    console.log("🎯 [DOWNLOADER] Platform detected:", validation.platform);

    // Use the new unified scraper to get video data
    const videoData = await scrapeVideoUrl(decodedUrl);

    if (!videoData) {
      console.error("❌ [DOWNLOADER] Failed to scrape video data");
      return NextResponse.json(
        {
          error: "Failed to extract video data from the provided URL",
        },
        { status: 500 },
      );
    }

    console.log("✅ [DOWNLOADER] Video data extracted successfully");
    console.log("📊 [DOWNLOADER] Video info:");
    console.log(`  - Platform: ${videoData.platform}`);
    console.log(`  - Author: @${videoData.author}`);
    console.log(`  - Title: ${videoData.title}`);
    console.log(`  - Views: ${videoData.metrics.views}`);

    // For now, we'll simulate video download by fetching the video URL
    // In the future, you might want to actually download the video buffer
    const videoBuffer = await downloadVideoBuffer(videoData.videoUrl);

    return NextResponse.json({
      success: true,
      platform: videoData.platform,
      videoData: {
        buffer: Array.from(new Uint8Array(videoBuffer)),
        size: videoBuffer.length,
        mimeType: "video/mp4",
        filename: `${videoData.platform}-${videoData.shortCode}.mp4`,
      },
      metrics: videoData.metrics,
      additionalMetadata: {
        author: videoData.author,
        description: videoData.description,
        hashtags: videoData.hashtags,
        duration: videoData.metadata.duration || 0,
        timestamp: videoData.metadata.timestamp,
      },
      thumbnailUrl: videoData.thumbnailUrl, // Add at top level for easy access
      metadata: {
        originalUrl: decodedUrl,
        platform: videoData.platform,
        downloadedAt: new Date().toISOString(),
        shortCode: videoData.shortCode,
        thumbnailUrl: videoData.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error("❌ [DOWNLOADER] Download error:", error);
    return NextResponse.json(
      {
        error: "Failed to download video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Download video buffer from URL
 * This function actually fetches the video file from the direct URL
 */
async function downloadVideoBuffer(videoUrl: string): Promise<ArrayBuffer> {
  console.log("⬇️ [DOWNLOADER] Downloading video from:", videoUrl);

  const response = await fetch(videoUrl);

  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    const sizeMB = Math.round((parseInt(contentLength) / 1024 / 1024) * 100) / 100;
    console.log(`📦 [DOWNLOADER] Video size: ${sizeMB}MB`);
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log(`✅ [DOWNLOADER] Video buffer downloaded: ${arrayBuffer.byteLength} bytes`);

  return arrayBuffer;
}
