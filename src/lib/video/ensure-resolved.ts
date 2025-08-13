import { postJson } from "@/lib/http/post-json";

export async function ensureResolved(input: {
  url: string;
  platform: "instagram" | "tiktok";
}): Promise<{ url: string; platform: "instagram" | "tiktok" }> {
  try {
    const res = await postJson<{
      success: boolean;
      videoUrl?: string;
      platform?: "instagram" | "tiktok";
    }>("/api/video/resolve", { url: input.url });
    return {
      url: res.videoUrl ?? input.url,
      platform: (res.platform as typeof input.platform) ?? input.platform,
    };
  } catch {
    return input;
  }
}
