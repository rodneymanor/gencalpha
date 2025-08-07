import { NextRequest, NextResponse } from 'next/server';

import { authenticateApiKey } from '@/lib/api-key-auth';
import { CreatorService } from '@/lib/creator-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Followed creators videos API route called');
    
    // Authenticate the request
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      // Authentication failed, return the error response
      return authResult;
    }

    const { userId, limit = 50 } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log(`📹 Fetching videos from followed creators for user: ${userId}`);

    // Get videos from followed creators using the server-side CreatorService
    const videos = await CreatorService.getFollowedCreatorsVideos(userId, limit);

    console.log(`✅ Found ${videos.length} videos from followed creators`);

    return NextResponse.json({ 
      success: true,
      videos 
    });

  } catch (error) {
    console.error('❌ Error fetching followed creators videos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch videos from followed creators' 
      },
      { status: 500 }
    );
  }
}