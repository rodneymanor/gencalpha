import { NextRequest, NextResponse } from "next/server";

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
  const data = item as any;

  // Map RapidAPI Instagram response format - select smallest video file to reduce size
  const videoVersions = data.video_versions ?? [];
  let videoUrl = "";

  if (videoVersions.length > 0) {
    // Sort by width to get smallest resolution (smallest file size)
    const sortedVersions = videoVersions.sort((a: any, b: any) => (a.width ?? 0) - (b.width ?? 0));
    videoUrl = sortedVersions[0]?.url ?? "";
    console.log(
      `📱 Selected smallest video version: ${sortedVersions[0]?.width ?? 0}x${sortedVersions[0]?.height ?? 0} from ${videoVersions.length} available versions`,
    );
  }

  const thumbnailUrl = data.image_versions2?.candidates?.[0]?.url ?? "";

  return {
    id: String(data.id ?? data.pk ?? ""),
    shortcode: data.code ?? "",
    url: `https://www.instagram.com/reel/${data.code}/`,
    videoUrl: videoUrl ?? null,
    thumbnailUrl: thumbnailUrl ?? null,
    caption: data.caption?.text ?? "",
    timestamp: data.taken_at ? String(data.taken_at) : "",
    likesCount: data.like_count ?? 0,
    commentsCount: data.comment_count ?? 0,
    viewsCount: data.play_count ?? 0,
    duration: data.video_duration ?? 0,
    username: data.user?.username ?? "",
    displayUrl: thumbnailUrl ?? null,
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

function extractShortcodeFromUrl(url: string): string {
  // Extract shortcode from Instagram URL
  const match = url.match(/\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : "";
}

async function downloadInstagramReel(input: InstagramReelDownloadRequest): Promise<InstagramReelDownloadData> {
  if (!input.url) {
    throw new Error("Instagram reel URL is required");
  }

  // Validate URL format and extract shortcode
  // eslint-disable-next-line security/detect-unsafe-regex
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i;
  if (!urlPattern.test(input.url)) {
    throw new Error("Invalid Instagram reel URL format. Please provide a valid Instagram reel, post, or TV URL.");
  }

  const shortcode = extractShortcodeFromUrl(input.url);
  if (!shortcode) {
    throw new Error("Could not extract shortcode from Instagram URL");
  }

  console.log(`🎬 Downloading Instagram reel with shortcode: ${shortcode}`);

  // Call RapidAPI Instagram scraper
  const rapidApiUrl = `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/post?shortcode=${shortcode}`;

  const response = await fetch(rapidApiUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "instagram-api-fast-reliable-data-scraper.p.rapidapi.com",
      "x-rapidapi-key": process.env.RAPIDAPI_KEY ?? "",
    },
  });

  if (!response.ok) {
    console.error("❌ RapidAPI request failed:", response.status, response.statusText);
    throw new Error(`Instagram API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || typeof data !== "object") {
    console.error("❌ Invalid response format from RapidAPI:", data);
    throw new Error("Invalid response format from Instagram API");
  }

  console.log(`📋 Successfully downloaded reel data:`, {
    hasVideoUrl: !!data.video_versions?.[0]?.url,
    username: data.user?.username,
    likes: data.like_count,
  });

  const reel: InstagramReelDownloadData = mapToInstagramReelDownload(data);

  if (!reel.videoUrl) {
    console.error("❌ No video URL found in response:", data);
    throw new Error("Could not extract video download URL from the reel. The content may be private or unavailable.");
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
