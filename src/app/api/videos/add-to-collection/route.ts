import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, isAdminInitialized } from '@/lib/firebase-admin';
import type { Video } from '@/lib/collections';

// Define the request body type
interface AddVideoRequest {
  userId: string;
  collectionId: string;
  videoData: {
    originalUrl: string;
    platform: string;
    addedAt: string;
    processing?: {
      scrapeAttempted: boolean;
      transcriptAttempted: boolean;
      components: {
        hook: string;
        bridge: string;
        nugget: string;
        wta: string;
      };
    };
    metrics?: {
      views: number;
      likes: number;
      comments: number;
      saves: number;
    };
  };
}

// Helper function to generate title from URL
function generateTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('tiktok')) {
      return `TikTok Video - ${new Date().toLocaleDateString()}`;
    }

    if (hostname.includes('instagram')) {
      return `Instagram Video - ${new Date().toLocaleDateString()}`;
    }

    return `Video - ${new Date().toLocaleDateString()}`;
  } catch {
    return `Video - ${new Date().toLocaleDateString()}`;
  }
}

// Helper function to get default thumbnail
function getDefaultThumbnail(platform: string): string {
  const platformLower = platform.toLowerCase();

  if (platformLower.includes('tiktok')) {
    return '/images/placeholder.svg';
  }

  if (platformLower.includes('instagram')) {
    return '/images/instagram-placeholder.jpg';
  }

  return '/images/video-placeholder.jpg';
}

// Helper function to extract hashtags from title
function extractHashtagsFromTitle(title: string): string[] {
  const hashtagRegex = /#[\w-]+/g;
  const matches = title.match(hashtagRegex);
  return matches ? matches.map((tag) => tag.substring(1)) : [];
}

// Helper function to infer content type
function inferContentType(platform: string): string {
  const platformLower = platform.toLowerCase();

  if (platformLower.includes('tiktok')) {
    return 'short-form';
  }

  if (platformLower.includes('instagram')) {
    return 'social-media';
  }

  return 'general';
}

// Create the video object with all required fields
function createVideoObject(
  userId: string,
  collectionId: string,
  videoData: AddVideoRequest['videoData']
): Omit<Video, 'id'> {
  const title = generateTitleFromUrl(videoData.originalUrl);
  
  return {
    url: videoData.originalUrl,
    title,
    platform: videoData.platform,
    thumbnailUrl: getDefaultThumbnail(videoData.platform),
    author: 'Unknown Creator',
    transcript: 'Transcript not available',
    visualContext: 'Basic video import',
    fileSize: 0,
    duration: 0,
    userId,
    collectionId,
    addedAt: videoData.addedAt ?? new Date().toISOString(),
    components: videoData.processing?.components ?? {
      hook: 'Auto-generated hook',
      bridge: 'Auto-generated bridge',
      nugget: 'Auto-generated nugget',
      wta: 'Auto-generated CTA',
    },
    contentMetadata: {
      hashtags: extractHashtagsFromTitle(title),
      mentions: [],
      description: title,
    },
    insights: {
      engagementRate: 0,
      contentType: inferContentType(videoData.platform),
      keyTopics: [],
      sentiment: 'neutral' as const,
      difficulty: 'beginner' as const,
    },
  };
}

// Update collection video count
async function updateCollectionCount(
  adminDb: FirebaseFirestore.Firestore,
  collectionId: string,
  userId: string,
  increment: number
): Promise<void> {
  if (collectionId !== 'all-videos') {
    const collectionRef = adminDb.collection('collections').doc(collectionId);
    const collectionDoc = await collectionRef.get();

    if (collectionDoc.exists && collectionDoc.data()?.userId === userId) {
      const currentCount = collectionDoc.data()?.videoCount ?? 0;
      await collectionRef.update({
        videoCount: Math.max(0, currentCount + increment),
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AddVideoRequest = await request.json();
    const { userId, collectionId, videoData } = body;

    // Validate required fields
    if (!userId || !collectionId || !videoData) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!videoData.originalUrl) {
      return NextResponse.json(
        { success: false, message: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(videoData.originalUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid video URL format' },
        { status: 400 }
      );
    }

    // Check if Firebase Admin is initialized
    if (!isAdminInitialized) {
      console.error('Firebase Admin SDK not initialized');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      console.error('Firebase Admin DB not available');
      return NextResponse.json(
        { success: false, message: 'Database connection error' },
        { status: 500 }
      );
    }

    // Create video object
    const video = createVideoObject(userId, collectionId, videoData);

    // Add video to Firestore
    const videoRef = adminDb.collection('videos').doc();
    await videoRef.set(video);
    const videoId = videoRef.id;

    // Update collection video count
    await updateCollectionCount(adminDb, collectionId, userId, 1);

    // Return success response
    return NextResponse.json({
      success: true,
      videoId,
      message: 'Video added successfully to collection',
    });

  } catch (error) {
    console.error('Failed to add video to collection:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to add video to collection',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}