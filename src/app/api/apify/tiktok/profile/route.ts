import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient, validateApifyInput, APIFY_ACTORS, TikTokProfileData } from '@/lib/apify';

// eslint-disable-next-line complexity
function mapToTikTokProfile(item: unknown): TikTokProfileData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = item as any;
  return {
    username: data.username ?? data.uniqueId ?? '',
    displayName: data.displayName ?? data.nickname ?? '',
    bio: data.bio ?? data.signature ?? '',
    followersCount: data.followersCount ?? data.followerCount ?? 0,
    followingCount: data.followingCount ?? data.followingCount ?? 0,
    likesCount: data.likesCount ?? data.heartCount ?? 0,
    videosCount: data.videosCount ?? data.videoCount ?? 0,
    isVerified: data.isVerified ?? data.verified ?? false,
    avatarUrl: data.avatarUrl ?? data.avatarMedium ?? '',
    isPrivate: data.isPrivate ?? data.privateAccount ?? false,
    videos: mapTikTokVideos(data.posts, data.username ?? data.uniqueId ?? ''),
  };
}

// eslint-disable-next-line complexity
function mapTikTokVideos(posts: unknown[], username: string) {
  if (!Array.isArray(posts)) return [];
  return posts.map((video: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videoData = video as any;
    return {
      id: videoData.id ?? '',
      url: videoData.webVideoUrl ?? videoData.videoUrl ?? '',
      videoUrl: videoData.videoUrl ?? videoData.playAddr ?? '',
      thumbnailUrl: videoData.covers?.[0] ?? videoData.dynamicCover ?? videoData.originCover ?? '',
      description: videoData.desc ?? videoData.title ?? '',
      timestamp: videoData.createTime ? new Date(videoData.createTime * 1000).toISOString() : '',
      likesCount: videoData.stats?.diggCount ?? videoData.digg_count ?? 0,
      commentsCount: videoData.stats?.commentCount ?? videoData.comment_count ?? 0,
      sharesCount: videoData.stats?.shareCount ?? videoData.share_count ?? 0,
      viewsCount: videoData.stats?.playCount ?? videoData.play_count ?? 0,
      duration: videoData.video?.duration ?? 0,
      username,
    };
  });
}

function downloadTikTokVideosInBackground(client: ApifyClient, profiles: TikTokProfileData[]): void {
  setTimeout(async () => {
    for (const profile of profiles) {
      if (profile.videos) {
        if (profile.videos) {
          for (const video of profile.videos) {
            if (video.videoUrl) {
              try {
              await client.downloadMedia(video.videoUrl);
              console.log(`✅ Downloaded TikTok video: ${video.id}`);
              } catch (error) {
                console.error(`❌ Failed to download TikTok video ${video.id}:`, error);
              }
            }
          }
        }
      }
    }
  }, 100);
}

export interface TikTokProfileRequest {
  username?: string;
  usernames?: string[];
  includeVideos?: boolean;
  resultsLimit?: number;
  downloadVideos?: boolean;
}

export interface TikTokProfileResponse {
  success: boolean;
  data?: TikTokProfileData[];
  error?: string;
  timestamp: string;
}

async function scrapeTikTokProfile(input: TikTokProfileRequest): Promise<TikTokProfileData[]> {
  const client = new ApifyClient();
  
  const apifyInput = {
    profiles: input.username ? [input.username] : input.usernames || [],
    resultsLimit: input.resultsLimit ?? 50,
    shouldDownloadVideos: input.downloadVideos ?? false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
  };

  validateApifyInput(apifyInput, ['profiles']);

  if (apifyInput.profiles.length === 0) {
    throw new Error('At least one username is required');
  }

  console.log(`📱 Scraping TikTok profiles: ${apifyInput.profiles.join(', ')}`);

  const results = await client.runActor(APIFY_ACTORS.TIKTOK_PROFILE, apifyInput, true);
  
  if (!Array.isArray(results)) {
    throw new Error('Invalid response format from Apify');
  }

  const profiles: TikTokProfileData[] = results.map((item: unknown): TikTokProfileData => mapToTikTokProfile(item));

  if (input.downloadVideos) {
    console.log('🎥 Starting background video downloads...');
    
    downloadTikTokVideosInBackground(client, profiles);
  }

  return profiles;
}

export async function POST(request: NextRequest) {
  try {
    const body: TikTokProfileRequest = await request.json();
    
    console.log('🎯 TikTok Profile API called with:', body);

    if (!body.username && (!body.usernames || body.usernames.length === 0)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either username or usernames array is required',
          timestamp: new Date().toISOString()
        } satisfies TikTokProfileResponse,
        { status: 400 }
      );
    }

    const profiles = await scrapeTikTokProfile(body);

    const response: TikTokProfileResponse = {
      success: true,
      data: profiles,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Successfully scraped ${profiles.length} TikTok profiles`);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ TikTok profile scraping failed:', error);
    
    const response: TikTokProfileResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const usernames = searchParams.get('usernames')?.split(',');
  const includeVideos = searchParams.get('includeVideos') === 'true';
  const resultsLimit = searchParams.get('resultsLimit') ? parseInt(searchParams.get('resultsLimit')!) : undefined;
  const downloadVideos = searchParams.get('downloadVideos') === 'true';

  if (!username && !usernames) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Username parameter is required',
        timestamp: new Date().toISOString()
      } satisfies TikTokProfileResponse,
      { status: 400 }
    );
  }

  try {
    const profiles = await scrapeTikTokProfile({
      username,
      usernames,
      includeVideos,
      resultsLimit,
      downloadVideos,
    });

    const response: TikTokProfileResponse = {
      success: true,
      data: profiles,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ TikTok profile scraping failed:', error);
    
    const response: TikTokProfileResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}