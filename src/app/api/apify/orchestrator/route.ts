import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/apify';

interface APIRequest {
  type: string;
  platform: string;
  result: unknown;
}

interface APIError {
  instagram?: string[];
  tiktok?: string[];
}

function createInstagramRequests(instagram: BatchRequest['instagram'], resultsLimit?: number): Promise<APIRequest>[] {
  const requests: Promise<APIRequest>[] = [];
  const errors: string[] = [];
  
  if (instagram?.profiles && instagram.profiles.length > 0) {
    requests.push(
      callInternalAPI('instagram/profile', {
        usernames: instagram.profiles,
        includeDetails: instagram.includeDetails,
        resultsLimit,
      })
        .then(result => ({ type: 'profiles', platform: 'instagram', result }))
        .catch(error => {
          errors.push(`Profile scraping: ${error.message}`);
          return { type: 'profiles', platform: 'instagram', result: null };
        })
    );
  }
  
  if (instagram?.reels && instagram.reels.length > 0) {
    requests.push(
      callInternalAPI('instagram/reel', {
        urls: instagram.reels,
        downloadVideo: instagram.downloadVideos,
        resultsLimit,
      })
        .then(result => ({ type: 'reels', platform: 'instagram', result }))
        .catch(error => {
          errors.push(`Reel scraping: ${error.message}`);
          return { type: 'reels', platform: 'instagram', result: null };
        })
    );
  }
  
  return requests;
}

function createTikTokRequests(tiktok: BatchRequest['tiktok'], resultsLimit?: number): Promise<APIRequest>[] {
  const requests: Promise<APIRequest>[] = [];
  
  if (tiktok?.profiles && tiktok.profiles.length > 0) {
    requests.push(
      callInternalAPI('tiktok/profile', {
        usernames: tiktok.profiles,
        includeVideos: tiktok.includeVideos,
        downloadVideos: tiktok.downloadVideos,
        resultsLimit,
      })
        .then(result => ({ type: 'profiles', platform: 'tiktok', result }))
        .catch(error => {
          const errorMsg = `Profile scraping: ${error.message}`;
          return { type: 'profiles', platform: 'tiktok', result: null, error: errorMsg };
        })
    );
  }
  
  return requests;
}

// eslint-disable-next-line complexity
function processResults(results: PromiseSettledResult<APIRequest>[]): {
  data: Record<string, Record<string, unknown>>;
  errors: APIError;
  stats: { successful: number; failed: number; profiles: number; videos: number };
} {
  const data: Record<string, Record<string, unknown>> = {
    instagram: {},
    tiktok: {},
  };
  
  const errors: APIError = {};
  let successfulRequests = 0;
  let failedRequests = 0;
  let totalProfiles = 0;
  let totalVideos = 0;
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { type, platform, result: apiResult } = result.value;
      
      if (apiResult && (apiResult as { success: boolean }).success) {
        successfulRequests++;
        const apiData = (apiResult as { data: unknown[] }).data;
        // eslint-disable-next-line security/detect-object-injection
        data[platform as keyof typeof data][type] = apiData;
        
        if (type === 'profiles') {
          totalProfiles += apiData.length;
          if (platform === 'instagram') {
            totalVideos += apiData.reduce((sum: number, profile: { posts?: unknown[] }) => 
              sum + (profile.posts?.length ?? 0), 0);
          } else if (platform === 'tiktok') {
            totalVideos += apiData.reduce((sum: number, profile: { videos?: unknown[] }) => 
              sum + (profile.videos?.length ?? 0), 0);
          }
        } else if (type === 'reels') {
          totalVideos += apiData.length;
        }
      } else {
        failedRequests++;
      }
    } else {
      failedRequests++;
      console.error('❌ Request failed:', result.reason);
    }
  }
  
  return {
    data,
    errors,
    stats: {
      successful: successfulRequests,
      failed: failedRequests,
      profiles: totalProfiles,
      videos: totalVideos,
    },
  };
}

export interface BatchRequest {
  instagram?: {
    profiles?: string[];
    reels?: string[];
    includeDetails?: boolean;
    downloadVideos?: boolean;
  };
  tiktok?: {
    profiles?: string[];
    includeVideos?: boolean;
    downloadVideos?: boolean;
  };
  resultsLimit?: number;
}

export interface BatchResponse {
  success: boolean;
  data?: {
    instagram?: {
      profiles?: any[];
      reels?: any[];
    };
    tiktok?: {
      profiles?: any[];
    };
  };
  errors?: {
    instagram?: string[];
    tiktok?: string[];
  };
  timestamp: string;
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalProfiles: number;
    totalVideos: number;
  };
}

async function callInternalAPI(endpoint: string, body: Record<string, unknown>): Promise<unknown> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/apify/${endpoint}`;
  
  console.log(`📡 Calling internal API: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Internal API call failed for ${endpoint}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json();
    
    console.log('🎯 Apify Orchestrator API called with:', body);

    if (!body.instagram && !body.tiktok) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one platform (instagram or tiktok) is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const requests: Promise<APIRequest>[] = [];
    const errors: APIError = {};

    if (body.instagram) {
      requests.push(...createInstagramRequests(body.instagram, body.resultsLimit));
    }

    if (body.tiktok) {
      requests.push(...createTikTokRequests(body.tiktok, body.resultsLimit));
    }

    console.log(`🚀 Processing ${requests.length} parallel requests...`);

    const results = await Promise.allSettled(requests);
    const { data, errors: processErrors, stats } = processResults(results);
    
    Object.assign(errors, processErrors);

    const response: BatchResponse = {
      success: successfulRequests > 0,
      data,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: requests.length,
        successfulRequests: stats.successful,
        failedRequests: stats.failed,
        totalProfiles: stats.profiles,
        totalVideos: stats.videos,
      },
    };

    console.log(`✅ Orchestrator completed:`, response.summary);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Apify orchestrator failed:', error);
    
    const response: BatchResponse = {
      success: false,
      errors: { instagram: [error instanceof Error ? error.message : 'Unknown error'] },
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 1,
        totalProfiles: 0,
        totalVideos: 0,
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}