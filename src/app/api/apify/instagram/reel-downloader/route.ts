import { NextRequest, NextResponse } from "next/server";

import { ApifyClient, validateApifyInput, APIFY_ACTORS } from "@/lib/apify";

export interface InstagramReelDownloadData {
  id: string;
  shortcode: string;
  url: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  duration?: number;
  username: string;
  displayUrl?: string;
}

function mapToInstagramReelDownload(item: unknown): InstagramReelDownloadData {
  const data = item as any;
  
  // Map various possible field names from the downloader API
  return {
    id: data.id ?? data.postId ?? data.mediaId ?? "",
    shortcode: data.shortcode ?? data.code ?? "",
    url: data.url ?? data.postUrl ?? data.permalink ?? "",
    videoUrl: data.videoUrl ?? data.video_url ?? data.downloadUrl ?? data.downloadLink ?? "",
    thumbnailUrl: data.thumbnailUrl ?? data.thumbnail_url ?? data.displayUrl ?? data.thumbnail ?? "",
    caption: data.caption ?? data.text ?? data.description ?? "",
    timestamp: data.timestamp ?? data.taken_at_timestamp ?? data.createdAt ?? "",
    likesCount: data.likesCount ?? data.like_count ?? data.likes ?? 0,
    commentsCount: data.commentsCount ?? data.comment_count ?? data.comments ?? 0,
    viewsCount: data.viewsCount ?? data.view_count ?? data.views,
    duration: data.duration ?? data.video_duration ?? data.videoDuration,
    username: data.username ?? data.owner?.username ?? data.author?.username ?? "",
    displayUrl: data.displayUrl ?? data.display_url ?? data.thumbnailUrl ?? data.thumbnail_url ?? "",
  };
}

export interface InstagramReelDownloadRequest {
  url: string;
  downloadVideo?: boolean;
}

export interface InstagramReelDownloadResponse {
  success: boolean;
  data?: InstagramReelDownloadData;
  error?: string;
  timestamp: string;
}

async function downloadInstagramReel(input: InstagramReelDownloadRequest): Promise<InstagramReelDownloadData> {
  const client = new ApifyClient();

  if (!input.url) {
    throw new Error("Instagram reel URL is required");
  }

  // Validate URL format
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i;
  if (!urlPattern.test(input.url)) {
    throw new Error("Invalid Instagram reel URL format. Please provide a valid Instagram reel, post, or TV URL.");
  }

  // The Instagram Reels Downloader expects a 'links' array
  const apifyInput = {
    links: [input.url],
    proxyConfiguration: {
      useApifyProxy: true,
    },
  };

  validateApifyInput(apifyInput, ["links"]);

  console.log(`🎬 Downloading Instagram reel with input:`, apifyInput);

  const results = await client.runActor(APIFY_ACTORS.INSTAGRAM_REEL_DOWNLOADER, apifyInput, true);

  if (!Array.isArray(results)) {
    console.error("❌ Invalid response format from Apify:", results);
    throw new Error("Invalid response format from Instagram downloader");
  }

  if (results.length === 0) {
    throw new Error("No reel data found. The URL might be private, deleted, or invalid.");
  }

  console.log(`📋 Raw response from downloader:`, JSON.stringify(results[0], null, 2));

  const reel: InstagramReelDownloadData = mapToInstagramReelDownload(results[0]);

  if (!reel.videoUrl && !reel.displayUrl) {
    console.error("❌ No video URL found in response:", results[0]);
    throw new Error("Could not extract video download URL from the reel");
  }

  console.log(`✅ Successfully mapped reel data:`, {
    id: reel.id,
    shortcode: reel.shortcode,
    username: reel.username,
    hasVideoUrl: !!reel.videoUrl,
    hasThumbnail: !!reel.thumbnailUrl,
  });

  return reel;
}

export async function POST(request: NextRequest) {
  try {
    const body: InstagramReelDownloadRequest = await request.json();

    console.log("🎯 Instagram Reel Downloader API called with:", body);

    if (!body.url) {
      return NextResponse.json(
        {
          success: false,
          error: "Instagram reel URL is required",
          timestamp: new Date().toISOString(),
        } satisfies InstagramReelDownloadResponse,
        { status: 400 },
      );
    }

    const reel = await downloadInstagramReel(body);

    const response: InstagramReelDownloadResponse = {
      success: true,
      data: reel,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Successfully downloaded Instagram reel: ${reel.id}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Instagram reel download failed:", error);

    const response: InstagramReelDownloadResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const downloadVideo = searchParams.get("downloadVideo") === "true";

  if (!url) {
    return NextResponse.json(
      {
        success: false,
        error: "Instagram reel URL parameter is required",
        timestamp: new Date().toISOString(),
      } satisfies InstagramReelDownloadResponse,
      { status: 400 },
    );
  }

  try {
    const reel = await downloadInstagramReel({
      url,
      downloadVideo,
    });

    const response: InstagramReelDownloadResponse = {
      success: true,
      data: reel,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Instagram reel download failed:", error);

    const response: InstagramReelDownloadResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}