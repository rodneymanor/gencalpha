// Instagram specific helpers
// - Responsible for resolving usernames to user IDs and other IG-only concerns

export async function fetchInstagramUserId(username: string): Promise<{
  success: boolean;
  userId?: string;
  metadata?: any;
  error?: string;
}> {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/instagram/user-id?username=${encodeURIComponent(username)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, error: data.error ?? `HTTP ${response.status}` };
    }

    return {
      success: true,
      userId: data.user_id,
      metadata: { displayName: data.username },
    };
  } catch (error) {
    console.error("❌ [FOLLOW_CREATOR] Instagram user ID fetch failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
