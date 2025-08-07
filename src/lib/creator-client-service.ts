import { getAuth } from 'firebase/auth';

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  profilePictureUrl?: string;
  platform: 'tiktok' | 'instagram';
  followerCount?: number;
  isFollowing?: boolean;
}

export interface CreatorVideo {
  id?: string;
  creatorId: string;
  platform: "instagram" | "tiktok";
  platformVideoId: string;
  originalUrl: string;
  iframeUrl?: string;
  directUrl?: string;
  thumbnailUrl: string;
  title: string;
  description?: string;
  hashtags?: string[];
  duration?: number;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
  };
  author: {
    username: string;
    displayName?: string;
    isVerified?: boolean;
    followerCount?: number;
  };
  publishedAt: string;
  fetchedAt: string;
  bunnyVideoGuid?: string;
  processedAt?: string;
}

class CreatorClientService {
  private async getIdToken(): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  }

  async getCreatorVideos(creatorId: string): Promise<CreatorVideo[]> {
    try {
      const idToken = await this.getIdToken();
      
      const response = await fetch('/api/creators/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ creatorId })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch creator videos: ${response.status}`);
      }

      const data = await response.json();
      return data.videos || [];
    } catch (error) {
      console.error('Error fetching creator videos:', error);
      return [];
    }
  }

  async getFollowedCreatorsVideos(userId: string, limit: number = 50): Promise<CreatorVideo[]> {
    try {
      const idToken = await this.getIdToken();
      
      const response = await fetch('/api/creators/followed-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ userId, limit })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch followed creators videos: ${response.status}`);
      }

      const data = await response.json();
      return data.videos || [];
    } catch (error) {
      console.error('Error fetching followed creators videos:', error);
      return [];
    }
  }

  async followCreator(username: string, userId: string): Promise<{
    success: boolean;
    creator?: Creator;
    videos?: CreatorVideo[];
    error?: string;
  }> {
    try {
      const idToken = await this.getIdToken();
      
      const response = await fetch('/api/creators/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ username, userId })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Failed to follow creator: ${response.status}`
        };
      }

      return {
        success: true,
        creator: data.creator,
        videos: data.videos
      };
    } catch (error) {
      console.error('Error following creator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to follow creator'
      };
    }
  }
}

export const creatorClientService = new CreatorClientService();