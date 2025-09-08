import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Check if admin is initialized
    if (!isAdminInitialized) {
      return NextResponse.json({ error: "Admin not initialized" }, { status: 500 });
    }

    const db = getAdminDb();
    
    console.log("🔍 [DEBUG] Fetching video GUIDs from database...");
    
    // Query recent videos - we'll filter for GUIDs after fetching
    const videosQuery = db
      .collectionGroup("videos")
      .limit(20);
      
    const snapshot = await videosQuery.get();
    
    const videos = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          guid: data.guid,
          iframeUrl: data.iframeUrl,
          directUrl: data.directUrl,
          thumbnailUrl: data.thumbnailUrl,
          platform: data.platform,
          title: data.title,
          addedAt: data.addedAt,
        };
      })
      .filter(video => video.guid) // Only include videos with GUIDs
      .slice(0, 10); // Limit to 10 results
    
    console.log(`🔍 [DEBUG] Found ${videos.length} videos with GUIDs`);
    
    return NextResponse.json({
      success: true,
      count: videos.length,
      videos,
    });

  } catch (error) {
    console.error("❌ [DEBUG] Error fetching video GUIDs:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
