import { NextRequest, NextResponse } from 'next/server';

interface TikTokUserFeedRequest {
  username: string;
  count?: number;
}

interface TikTokVideoInfo {
  id: string;
  desc: string;
  createTime: number;
  video: {
    id: string;
    height: number;
    width: number;
    duration: number;
    ratio: string;
    cover: string;
    originCover: string;
    dynamicCover: string;
    playAddr: string;
    downloadAddr: string;
    shareCover: string[];
    reflowCover: string;
    bitrate: number;
    encodedType: string;
    format: string;
    videoQuality: string;
    encodeUserTag: string;
    codecType: string;
    definition: string;
  };
  author: {
    id: string;
    uniqueId: string;
    nickname: string;
    avatarThumb: string;
    avatarMedium: string;
    avatarLarger: string;
    signature: string;
    verified: boolean;
    secUid: string;
    secret: boolean;
    ftc: boolean;
    relation: number;
    openFavorite: boolean;
    commentSetting: number;
    duetSetting: number;
    stitchSetting: number;
    privateAccount: boolean;
  };
  music: {
    id: string;
    title: string;
    playUrl: string;
    coverThumb: string;
    coverMedium: string;
    coverLarge: string;
    authorName: string;
    original: boolean;
    duration: number;
    album: string;
  };
  challenges: Array<{
    id: string;
    title: string;
    desc: string;
    profileThumb: string;
    profileMedium: string;
    profileLarger: string;
    coverThumb: string;
    coverMedium: string;
    coverLarger: string;
    isCommerce: boolean;
  }>;
  stats: {
    diggCount: number;
    shareCount: number;
    commentCount: number;
    playCount: number;
    collectCount: number;
  };
  duetInfo: {
    duetFromId: string;
  };
  originalItem: boolean;
  officalItem: boolean;
  textExtra: Array<{
    awemeId: string;
    start: number;
    end: number;
    hashtagName: string;
    hashtagId: string;
    type: number;
    userId: string;
    isCommerce: boolean;
    userUniqueId: string;
    secUid: string;
  }>;
  secret: boolean;
  forFriend: boolean;
  digged: boolean;
  itemCommentStatus: number;
  showNotPass: boolean;
  vl1: boolean;
  takeDown: number;
  itemMute: boolean;
  effectStickers: any[];
  authorStats: {
    followingCount: number;
    followerCount: number;
    heartCount: number;
    videoCount: number;
    diggCount: number;
    heart: number;
  };
  privateItem: boolean;
  duetEnabled: boolean;
  stitchEnabled: boolean;
  shareEnabled: boolean;
  isAd: boolean;
  collectStat: number;
}

interface TikTokUserInfo {
  user: {
    id: string;
    shortId: string;
    uniqueId: string;
    nickname: string;
    avatarThumb: string;
    avatarMedium: string;
    avatarLarger: string;
    signature: string;
    verified: boolean;
    secUid: string;
    secret: boolean;
    ftc: boolean;
    relation: number;
    openFavorite: boolean;
    commentSetting: number;
    duetSetting: number;
    stitchSetting: number;
    privateAccount: boolean;
    downloadSetting: number;
    profileEmbedPermission: number;
    commentFilterStatus: number;
    duetFilterStatus: number;
    stitchFilterStatus: number;
    followingVisibility: number;
    followerVisibility: number;
    favoriteVisibility: number;
    profileTab: boolean;
  };
  stats: {
    followingCount: number;
    followerCount: number;
    heartCount: number;
    videoCount: number;
    diggCount: number;
    heart: number;
  };
  videos: TikTokVideoInfo[];
}

interface TikTokAPIResponse {
  code: number;
  msg: string;
  processed_time: number;
  data: TikTokUserInfo;
}

interface TikTokUserFeedResponse {
  success: boolean;
  userInfo?: {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    signature: string;
    verified: boolean;
    privateAccount: boolean;
    stats: {
      followingCount: number;
      followerCount: number;
      heartCount: number;
      videoCount: number;
      diggCount: number;
      heart: number;
    };
  };
  videos?: Array<{
    id: string;
    description: string;
    createTime: number;
    duration: number;
    cover: string;
    playUrl: string;
    downloadUrl: string;
    stats: {
      diggCount: number;
      shareCount: number;
      commentCount: number;
      playCount: number;
      collectCount: number;
    };
    music: {
      id: string;
      title: string;
      author: string;
      playUrl: string;
      cover: string;
      original: boolean;
      duration: number;
    };
    challenges: Array<{
      id: string;
      title: string;
      description: string;
      cover: string;
    }>;
    hashtags: Array<{
      id: string;
      name: string;
      start: number;
      end: number;
    }>;
    author: {
      id: string;
      username: string;
      nickname: string;
      avatar: string;
      verified: boolean;
      signature: string;
      stats: {
        followingCount: number;
        followerCount: number;
        heartCount: number;
        videoCount: number;
        diggCount: number;
        heart: number;
      };
    };
  }>;
  metadata?: {
    totalVideos: number;
    processedTime: number;
    fetchedAt: string;
  };
  error?: string;
  details?: string;
  rawError?: string;
  rawResponse?: any;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  console.log('🎵 TikTok User Feed API - Starting request');

  try {
    const body: TikTokUserFeedRequest = await request.json();
    const { username, count = 20 } = body;

    if (!username) {
      console.log('❌ Missing username parameter');
      return NextResponse.json(
        { 
          success: false,
          error: 'Username is required',
          timestamp: new Date().toISOString(),
        } satisfies TikTokUserFeedResponse,
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching TikTok user feed for: ${username} (${count} videos)`);

    const rapidApiKey = process.env.RAPIDAPI_KEY || '7d8697833dmsh0919d85dc19515ap1175f7jsn0f8bb6dae84e';
    
    const response = await fetch(
      `https://tiktok-scrapper-videos-music-challenges-downloader.p.rapidapi.com/user/tiktok/feed?username=${encodeURIComponent(username)}&count=${count}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'tiktok-scrapper-videos-music-challenges-downloader.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey,
        },
      }
    );

    if (!response.ok) {
      console.log(`❌ RapidAPI request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch TikTok user feed',
          details: `API returned ${response.status}: ${response.statusText}`,
          rawError: errorText,
          timestamp: new Date().toISOString(),
        } satisfies TikTokUserFeedResponse,
        { status: response.status }
      );
    }

    const apiData = await response.json();
    console.log('✅ Successfully fetched TikTok user feed');
    console.log('📊 Raw API response structure:', JSON.stringify(apiData, null, 2));

    // Check if we have valid data structure
    if (!apiData || !apiData.data) {
      console.log('❌ Invalid API response structure');
      return NextResponse.json({
        success: false,
        error: 'Invalid API response structure',
        details: 'API returned data in unexpected format',
        rawResponse: apiData,
        timestamp: new Date().toISOString(),
      } satisfies TikTokUserFeedResponse, { status: 500 });
    }

    const userData = apiData.data.user || {};
    const statsData = apiData.data.stats || {};
    const videosData = apiData.data.videos || [];

    console.log(`📊 Retrieved ${videosData.length} videos`);

    // Extract and structure the essential information for other processes
    const processedResponse: TikTokUserFeedResponse = {
      success: true,
      userInfo: {
        id: userData.id || '',
        username: userData.uniqueId || '',
        nickname: userData.nickname || '',
        avatar: userData.avatarLarger || userData.avatarMedium || userData.avatarThumb || '',
        signature: userData.signature || '',
        verified: userData.verified || false,
        privateAccount: userData.privateAccount || false,
        stats: {
          followingCount: statsData.followingCount || 0,
          followerCount: statsData.followerCount || 0,
          heartCount: statsData.heartCount || 0,
          videoCount: statsData.videoCount || 0,
          diggCount: statsData.diggCount || 0,
          heart: statsData.heart || 0
        }
      },
      videos: videosData.map((video: any) => ({
        id: video.id || '',
        description: video.desc || '',
        createTime: video.createTime || 0,
        duration: video.video?.duration || 0,
        cover: video.video?.cover || video.video?.originCover || '',
        playUrl: video.video?.playAddr || '',
        downloadUrl: video.video?.downloadAddr || '',
        stats: {
          diggCount: video.stats?.diggCount || 0,
          shareCount: video.stats?.shareCount || 0,
          commentCount: video.stats?.commentCount || 0,
          playCount: video.stats?.playCount || 0,
          collectCount: video.stats?.collectCount || 0
        },
        music: {
          id: video.music?.id || '',
          title: video.music?.title || '',
          author: video.music?.authorName || '',
          playUrl: video.music?.playUrl || '',
          cover: video.music?.coverLarge || video.music?.coverMedium || '',
          original: video.music?.original || false,
          duration: video.music?.duration || 0
        },
        challenges: (video.challenges || []).map((challenge: any) => ({
          id: challenge.id || '',
          title: challenge.title || '',
          description: challenge.desc || '',
          cover: challenge.coverLarger || challenge.coverMedium || ''
        })),
        hashtags: (video.textExtra || [])
          .filter((item: any) => item.hashtagName)
          .map((hashtag: any) => ({
            id: hashtag.hashtagId || '',
            name: hashtag.hashtagName || '',
            start: hashtag.start || 0,
            end: hashtag.end || 0
          })),
        author: {
          id: video.author?.id || '',
          username: video.author?.uniqueId || '',
          nickname: video.author?.nickname || '',
          avatar: video.author?.avatarLarger || video.author?.avatarMedium || '',
          verified: video.author?.verified || false,
          signature: video.author?.signature || '',
          stats: {
            followingCount: video.authorStats?.followingCount || 0,
            followerCount: video.authorStats?.followerCount || 0,
            heartCount: video.authorStats?.heartCount || 0,
            videoCount: video.authorStats?.videoCount || 0,
            diggCount: video.authorStats?.diggCount || 0,
            heart: video.authorStats?.heart || 0
          }
        }
      })),
      metadata: {
        totalVideos: videosData.length,
        processedTime: apiData.processed_time || 0,
        fetchedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    console.log('🎯 Data processing complete');
    return NextResponse.json(processedResponse);

  } catch (error) {
    console.error('💥 TikTok User Feed API Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      } satisfies TikTokUserFeedResponse,
      { status: 500 }
    );
  }
}

// GET endpoint for testing purposes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const count = parseInt(searchParams.get('count') || '20');

  if (!username) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Username parameter is required',
        timestamp: new Date().toISOString(),
      } satisfies TikTokUserFeedResponse,
      { status: 400 }
    );
  }

  // Forward to POST endpoint by creating a new request
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, count })
  });

  return POST(postRequest);
}