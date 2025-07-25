import { NextRequest, NextResponse } from "next/server";

import { ApifyClient, validateApifyInput, APIFY_ACTORS } from "@/lib/apify";

export interface InstagramProfileData {
  username: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  profilePicUrl: string;
  isPrivate: boolean;
  externalUrl?: string;
  posts?: {
    id: string;
    shortcode: string;
    url: string;
    type: "image" | "video" | "carousel";
    caption: string;
    timestamp: string;
    likesCount: number;
    commentsCount: number;
    videoUrl?: string;
    imageUrl?: string;
    displayUrl: string;
  }[];
}

function mapToInstagramProfile(item: unknown): InstagramProfileData {
  const data = item as any;

  // Instagram Profile Scraper output format
  return {
    username: data.username ?? data.userName ?? "",
    fullName: data.fullName ?? data.full_name ?? "",
    biography: data.biography ?? data.bio ?? "",
    followersCount: data.followersCount ?? data.followers_count ?? data.followedByCount ?? 0,
    followingCount: data.followingCount ?? data.following_count ?? data.followsCount ?? 0,
    postsCount: data.postsCount ?? data.posts_count ?? data.mediaCount ?? 0,
    isVerified: data.isVerified ?? data.is_verified ?? data.verified ?? false,
    profilePicUrl: data.profilePicUrl ?? data.profile_pic_url ?? data.profilePictureUrl ?? "",
    isPrivate: data.isPrivate ?? data.is_private ?? data.private ?? false,
    externalUrl: data.externalUrl ?? data.external_url ?? data.website ?? data.bioLinks?.[0],
    posts:
      data.posts?.map((post: unknown) => {
        const postData = post as any;
        return {
          id: postData.id ?? "",
          shortcode: postData.shortcode ?? postData.code ?? "",
          url: postData.url ?? `https://www.instagram.com/p/${postData.shortcode ?? postData.code}/`,
          type: postData.type ?? (postData.isVideo ? "video" : "image"),
          caption: postData.caption ?? postData.text ?? "",
          timestamp: postData.timestamp ?? postData.taken_at ?? postData.createdTime ?? "",
          likesCount: postData.likesCount ?? postData.likes_count ?? postData.likeCount ?? 0,
          commentsCount: postData.commentsCount ?? postData.comments_count ?? postData.commentCount ?? 0,
          videoUrl: postData.videoUrl ?? postData.video_url,
          imageUrl: postData.imageUrl ?? postData.image_url ?? postData.displayUrl,
          displayUrl: postData.displayUrl ?? postData.display_url ?? postData.imageUrl ?? "",
        };
      }) ?? [],
  };
}

export interface InstagramProfileRequest {
  username?: string;
  usernames?: string[];
  includeDetails?: boolean;
  resultsLimit?: number;
}

export interface InstagramProfileResponse {
  success: boolean;
  data?: InstagramProfileData[];
  error?: string;
  timestamp: string;
}

async function scrapeInstagramProfile(input: InstagramProfileRequest): Promise<InstagramProfileData[]> {
  const client = new ApifyClient();

  const usernames = input.username ? [input.username] : (input.usernames ?? []);

  if (usernames.length === 0) {
    throw new Error("At least one username is required");
  }

  console.log(`📸 Scraping Instagram profiles: ${usernames.join(", ")}`);

  // Instagram Profile Scraper input schema - simple usernames array
  const apifyInput = {
    usernames: usernames,
    // Optional parameters for Instagram Profile Scraper
    proxyConfiguration: {
      useApifyProxy: true,
    },
  };

  validateApifyInput(apifyInput, ["usernames"]);

  const results = await client.runActor(APIFY_ACTORS.INSTAGRAM_PROFILE, apifyInput, true);

  if (!Array.isArray(results)) {
    throw new Error("Invalid response format from Apify");
  }

  return results.map((item: unknown): InstagramProfileData => mapToInstagramProfile(item));
}

export async function POST(request: NextRequest) {
  try {
    const body: InstagramProfileRequest = await request.json();

    console.log("🎯 Instagram Profile API called with:", body);

    if (!body.username && (!body.usernames || body.usernames.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "Either username or usernames array is required",
          timestamp: new Date().toISOString(),
        } satisfies InstagramProfileResponse,
        { status: 400 },
      );
    }

    const profiles = await scrapeInstagramProfile(body);

    const response: InstagramProfileResponse = {
      success: true,
      data: profiles,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Successfully scraped ${profiles.length} Instagram profiles`);

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Instagram profile scraping failed:", error);

    const response: InstagramProfileResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const usernames = searchParams.get("usernames")?.split(",");
  const includeDetails = searchParams.get("includeDetails") === "true";
  const resultsLimit = searchParams.get("resultsLimit") ? parseInt(searchParams.get("resultsLimit")!) : undefined;

  if (!username && !usernames) {
    return NextResponse.json(
      {
        success: false,
        error: "Username parameter is required",
        timestamp: new Date().toISOString(),
      } satisfies InstagramProfileResponse,
      { status: 400 },
    );
  }

  try {
    const profiles = await scrapeInstagramProfile({
      username,
      usernames,
      includeDetails,
      resultsLimit,
    });

    const response: InstagramProfileResponse = {
      success: true,
      data: profiles,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Instagram profile scraping failed:", error);

    const response: InstagramProfileResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}
