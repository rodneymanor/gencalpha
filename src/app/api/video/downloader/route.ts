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
  
  // Check if this is an Apify URL (key-value store)
  if (videoUrl.includes('api.apify.com/v2/key-value-stores')) {
    console.log("🔍 [DOWNLOADER] Detected Apify key-value store URL, fetching directly");
  }

  const response = await fetch(videoUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  console.log(`🔍 [DOWNLOADER] Response status: ${response.status}`);
  console.log(`🔍 [DOWNLOADER] Response headers:`, Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const responseText = await response.text();
    console.error(`❌ [DOWNLOADER] Failed response body:`, responseText);
    throw new Error(`Failed to download video: ${response.status} ${response.statusText} - ${responseText}`);
  }

  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");
  
  console.log(`📋 [DOWNLOADER] Content-Type: ${contentType}`);
  console.log(`📋 [DOWNLOADER] Content-Length: ${contentLength}`);

  if (contentLength) {
    const sizeMB = Math.round((parseInt(contentLength) / 1024 / 1024) * 100) / 100;
    console.log(`📦 [DOWNLOADER] Video size: ${sizeMB}MB`);
  }

  // Verify we're getting video content
  if (contentType && !contentType.includes('video') && !contentType.includes('application/octet-stream')) {
    console.warn(`⚠️ [DOWNLOADER] Unexpected content type: ${contentType}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log(`✅ [DOWNLOADER] Video buffer downloaded: ${arrayBuffer.byteLength} bytes`);

  // Verify buffer contains video data (basic check)
  if (arrayBuffer.byteLength < 1000) {
    console.error(`❌ [DOWNLOADER] Buffer too small (${arrayBuffer.byteLength} bytes), likely not a video file`);
    throw new Error(`Downloaded file too small: ${arrayBuffer.byteLength} bytes`);
  }

  return arrayBuffer;
}
