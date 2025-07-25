import { NextRequest, NextResponse } from 'next/server';
import { ApifyClient, validateApifyInput, APIFY_ACTORS } from '@/lib/apify';

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
    type: 'image' | 'video' | 'carousel';
    caption: string;
    timestamp: string;
    likesCount: number;
    commentsCount: number;
    videoUrl?: string;
    imageUrl?: string;
    displayUrl: string;
  }[];
}

// eslint-disable-next-line complexity
function mapToInstagramProfile(item: unknown): InstagramProfileData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = item as any;
  return {
    username: data.username ?? '',
    fullName: data.fullName ?? '',
    biography: data.biography ?? '',
    followersCount: data.followersCount ?? 0,
    followingCount: data.followingCount ?? 0,
    postsCount: data.postsCount ?? 0,
    isVerified: data.isVerified ?? false,
    profilePicUrl: data.profilePicUrl ?? '',
    isPrivate: data.isPrivate ?? false,
    externalUrl: data.externalUrl,
    posts: data.latestPosts?.map((post: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const postData = post as any;
      return {
        id: postData.id ?? '',
        shortcode: postData.shortcode ?? '',
        url: postData.url ?? '',
        type: postData.type ?? 'image',
        caption: postData.caption ?? '',
        timestamp: postData.timestamp ?? '',
        likesCount: postData.likesCount ?? 0,
        commentsCount: postData.commentsCount ?? 0,
        videoUrl: postData.videoUrl,
        imageUrl: postData.imageUrl,
        displayUrl: postData.displayUrl ?? '',
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
  
  const usernames = input.username ? [input.username] : input.usernames ?? [];
  
  if (usernames.length === 0) {
    throw new Error('At least one username is required');
  }

  console.log(`📸 Scraping Instagram profiles: ${usernames.join(', ')}`);

  const apifyInput = {
    usernames: usernames,
    resultsType: input.includeDetails ? 'details' : 'posts', 
    resultsLimit: input.resultsLimit ?? 50,
    proxyConfiguration: {
      useApifyProxy: true
    }
  };

  validateApifyInput(apifyInput, ['usernames']);

  const results = await client.runActor(APIFY_ACTORS.INSTAGRAM_PROFILE, apifyInput, true);
  
  if (!Array.isArray(results)) {
    throw new Error('Invalid response format from Apify');
  }

  return results.map((item: unknown): InstagramProfileData => mapToInstagramProfile(item));
}

export async function POST(request: NextRequest) {
  try {
    const body: InstagramProfileRequest = await request.json();
    
    console.log('🎯 Instagram Profile API called with:', body);

    if (!body.username && (!body.usernames || body.usernames.length === 0)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either username or usernames array is required',
          timestamp: new Date().toISOString()
        } satisfies InstagramProfileResponse,
        { status: 400 }
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
    console.error('❌ Instagram profile scraping failed:', error);
    
    const response: InstagramProfileResponse = {
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
  const includeDetails = searchParams.get('includeDetails') === 'true';
  const resultsLimit = searchParams.get('resultsLimit') ? parseInt(searchParams.get('resultsLimit')!) : undefined;

  if (!username && !usernames) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Username parameter is required',
        timestamp: new Date().toISOString()
      } satisfies InstagramProfileResponse,
      { status: 400 }
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
    console.error('❌ Instagram profile scraping failed:', error);
    
    const response: InstagramProfileResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}