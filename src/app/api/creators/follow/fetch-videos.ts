// Fetch videos from platform APIs
// - Responsible for retrieving recent content given a platform user identifier

export async function fetchCreatorVideos(
  platform: "instagram" | "tiktok",
  platformUserId: string,
  username: string,
): Promise<{ success: boolean; videos?: any[]; error?: string }> {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

    if (platform === "instagram") {
      const response = await fetch(
        `${baseUrl}/api/instagram/user-reels?user_id=${encodeURIComponent(platformUserId)}&include_feed_video=true`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error ?? `HTTP ${response.status}` };
      }

      const videos = data.data?.items?.slice(0, 10) ?? [];
      return { success: true, videos };
    }

    // TikTok
    const response = await fetch(`${baseUrl}/api/tiktok/user-feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, count: 10 }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, error: data.error ?? `HTTP ${response.status}` };
    }

    return { success: true, videos: data.videos ?? [] };
  } catch (error) {
    console.error(`❌ [FOLLOW_CREATOR] ${platform} videos fetch failed:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
