
export interface ApifyConfig {
  token: string;
  baseUrl: string;
}

export interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    startedAt: string;
    finishedAt?: string;
    defaultDatasetId: string;
  };
}

export interface ApifyDatasetItem {
  [key: string]: unknown;
}

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
  posts?: InstagramPost[];
}

export interface InstagramPost {
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
}

export interface InstagramReelData {
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
}

export interface TikTokProfileData {
  username: string;
  displayName: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  videosCount: number;
  isVerified: boolean;
  avatarUrl: string;
  isPrivate: boolean;
  videos?: TikTokVideo[];
}

export interface TikTokVideo {
  id: string;
  url: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  duration: number;
  username: string;
}

export class ApifyClient {
  private config: ApifyConfig;

  constructor(token?: string) {
    this.config = {
      token: token ?? process.env.APIFY_TOKEN ?? '',
      baseUrl: 'https://api.apify.com/v2'
    };

    if (!this.config.token) {
      throw new Error('Apify token is required');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apify API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async runActor(actorId: string, input: object, waitForFinish = true): Promise<unknown> {
    const endpoint = waitForFinish 
      ? `/acts/${actorId}/run-sync-get-dataset-items?token=${this.config.token}`
      : `/acts/${actorId}/runs?token=${this.config.token}`;

    console.log(`🚀 Running Apify actor: ${actorId}`);
    console.log(`📝 Input:`, JSON.stringify(input, null, 2));

    try {
      const result = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(input),
      });

      console.log(`✅ Actor ${actorId} completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Actor ${actorId} failed:`, error);
      throw error;
    }
  }

  async getDatasetItems(datasetId: string): Promise<ApifyDatasetItem[]> {
    const endpoint = `/datasets/${datasetId}/items?token=${this.config.token}`;
    
    console.log(`📊 Fetching dataset items: ${datasetId}`);
    
    try {
      const items = await this.makeRequest(endpoint);
      console.log(`✅ Retrieved ${items.length} items from dataset`);
      return items;
    } catch (error) {
      console.error(`❌ Failed to fetch dataset items:`, error);
      throw error;
    }
  }

  async downloadMedia(url: string): Promise<Buffer> {
    console.log(`⬇️ Downloading media: ${url}`);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }
      
      const buffer = Buffer.from(await response.arrayBuffer());
      console.log(`✅ Downloaded ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      console.error(`❌ Media download failed:`, error);
      throw error;
    }
  }
}

export function validateApifyInput(input: Record<string, unknown>, requiredFields: string[]): void {
  for (const field of requiredFields) {
    // eslint-disable-next-line security/detect-object-injection
    if (!input[field as keyof typeof input]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : 'https://localhost:3000';
}

export const APIFY_ACTORS = {
  INSTAGRAM_PROFILE: 'apify/instagram-profile-scraper',
  INSTAGRAM_REEL: 'website-scraper/instagram-reel-scraper',
  INSTAGRAM_HASHTAG: 'apify/instagram-hashtag-scraper',
  TIKTOK_PROFILE: 'clockworks/tiktok-profile-scraper',
  TIKTOK_SCRAPER: 'clockworks/tiktok-scraper',
} as const;