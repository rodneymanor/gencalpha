import { NextRequest, NextResponse } from "next/server";

import { ApifyClient, validateApifyInput, APIFY_ACTORS } from "@/lib/apify";

export interface InstagramReelDownloadData {
  id: string;
  shortcode: string;
  url: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  caption: string;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  duration?: number;
  username: string;
  displayUrl?: string | null;
}

function mapToInstagramReelDownload(item: unknown): InstagramReelDownloadData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = item as any;
  
  // Map presetshubham/instagram-reel-downloader response format
  const videoUrl = data.video_url ?? data.videoUrl ?? data.downloadUrl ?? data.downloadLink ?? "";
  const thumbnailUrl = data.thumbnail_url ?? data.thumbnailUrl ?? data.displayUrl ?? data.thumbnail ?? "";
  const displayUrl = data.display_url ?? data.displayUrl ?? data.thumbnail_url ?? data.thumbnailUrl ?? "";
  
  return {
    id: data.id ?? data.postId ?? data.mediaId ?? "",
    shortcode: data.shortcode ?? data.code ?? "",
    url: data.url ?? data.postUrl ?? data.permalink ?? "",
    videoUrl: videoUrl || null,
    thumbnailUrl: thumbnailUrl || null,
    caption: data.caption ?? data.text ?? data.description ?? "",
    timestamp: data.timestamp ?? data.taken_at_timestamp ?? data.createdAt ?? "",
    likesCount: data.likes ?? data.likesCount ?? data.like_count ?? 0,
    commentsCount: data.comments ?? data.commentsCount ?? data.comment_count ?? 0,
    viewsCount: data.views ?? data.viewsCount ?? data.view_count,
    duration: data.duration ?? data.video_duration ?? data.videoDuration,
    username: data.owner_username ?? data.username ?? data.owner?.username ?? data.author?.username ?? "",
    displayUrl: displayUrl || null,
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
  // eslint-disable-next-line security/detect-unsafe-regex
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i;
  if (!urlPattern.test(input.url)) {
    throw new Error("Invalid Instagram reel URL format. Please provide a valid Instagram reel, post, or TV URL.");
  }

  // The Instagram Reels Downloader expects a 'reelLinks' array
  const apifyInput = {
    reelLinks: [input.url],
    proxyConfiguration: {
      useApifyProxy: true,
    },
  };

  validateApifyInput(apifyInput, ["reelLinks"]);

  console.log(`🎬 Downloading Instagram reel with input:`, apifyInput);

  const results = await client.runActor(APIFY_ACTORS.INSTAGRAM_REEL_DOWNLOADER, apifyInput, true);

  if (!Array.isArray(results)) {
    console.error("❌ Invalid response format from Apify:", results);
    throw new Error("Invalid response format from Instagram downloader");
  }

  if (results.length === 0) {
    console.error("❌ Empty results array from Apify");
    throw new Error("No reel data found. The URL might be private, deleted, or invalid.");
  }

  console.log(`📋 Successfully downloaded reel data:`, {
    hasVideoUrl: !!results[0]?.video_url,
    username: results[0]?.owner_username,
    likes: results[0]?.likes
  });

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