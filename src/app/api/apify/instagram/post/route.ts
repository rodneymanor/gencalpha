import { NextRequest, NextResponse } from "next/server";
import { ApifyClient, APIFY_ACTORS } from "@/lib/apify";

export interface InstagramPostData {
  id: string;
  shortCode: string;
  url: string;
  videoUrl?: string;
  videoUrlBackup?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  displayUrl?: string;
  caption: string;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  videoViewCount?: number;
  videoDurationSeconds?: number;
  ownerUsername: string;
  ownerFullName?: string;
  hashtags?: string[];
  location?: {
    name: string;
    id: string;
  };
}

export interface InstagramPostRequest {
  url: string;
  shortcode: string;
}

export interface InstagramPostResponse {
  success: boolean;
  data?: InstagramPostData;
  error?: string;
  timestamp: string;
}

function mapToInstagramPost(item: any): InstagramPostData {
  return {
    id: item.id ?? item.pk ?? "",
    shortCode: item.shortcode ?? item.code ?? "",
    url: item.url ?? `https://www.instagram.com/p/${item.shortcode || item.code}/`,
    videoUrl: item.videoUrl ?? item.video_url ?? item.videoUrlHd ?? item.video_versions?.[0]?.url,
    videoUrlBackup: item.videoUrlBackup ?? item.video_url_backup,
    imageUrl: item.imageUrl ?? item.image_url ?? item.display_url,
    thumbnailUrl: item.thumbnailUrl ?? item.thumbnail_url ?? item.display_url,
    displayUrl: item.displayUrl ?? item.display_url ?? item.image_url,
    caption: item.caption ?? item.caption_text ?? item.edge_media_to_caption?.edges?.[0]?.node?.text ?? "",
    timestamp: item.timestamp ?? item.taken_at_timestamp ?? item.taken_at ?? "",
    likesCount: item.likesCount ?? item.like_count ?? item.edge_media_preview_like?.count ?? 0,
    commentsCount: item.commentsCount ?? item.comment_count ?? item.edge_media_to_comment?.count ?? 0,
    videoViewCount: item.videoViewCount ?? item.video_view_count ?? item.play_count,
    videoDurationSeconds: item.videoDurationSeconds ?? item.video_duration ?? item.duration,
    ownerUsername: item.ownerUsername ?? item.owner?.username ?? item.user?.username ?? "unknown",
    ownerFullName: item.ownerFullName ?? item.owner?.full_name ?? item.user?.full_name,
    hashtags: extractHashtagsFromCaption(item.caption ?? item.caption_text ?? ""),
    location: item.location ? {
      name: item.location.name ?? "",
      id: item.location.id ?? "",
    } : undefined,
  };
}

function extractHashtagsFromCaption(caption: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return caption.match(hashtagRegex) || [];
}

async function scrapeInstagramPost(url: string, shortcode: string): Promise<InstagramPostData> {
  console.log(`📸 [INSTAGRAM_POST] Scraping post with shortcode: ${shortcode}`);
  
  // For now, return a clear indication that this format is not supported
  // This will allow the error to bubble up with a clear message
  throw new Error(
    `Instagram post format not supported yet. ` +
    `URL: ${url} with shortcode: ${shortcode}. ` +
    `Please use Instagram reel URLs or provide a username for profile scraping.`
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: InstagramPostRequest = await request.json();
    
    console.log("🎯 Instagram Post API called with:", { url: body.url, shortcode: body.shortcode });

    if (!body.url || !body.shortcode) {
      return NextResponse.json(
        {
          success: false,
          error: "Both url and shortcode are required",
          timestamp: new Date().toISOString(),
        } satisfies InstagramPostResponse,
        { status: 400 }
      );
    }

    const postData = await scrapeInstagramPost(body.url, body.shortcode);

    const response: InstagramPostResponse = {
      success: true,
      data: postData,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Successfully scraped Instagram post: ${body.shortcode}`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Instagram post scraping failed:", error);

    const response: InstagramPostResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}