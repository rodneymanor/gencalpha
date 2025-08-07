// DASH manifest parsing utilities
// - Responsible for extracting the lowest quality video URL from a DASH manifest

export function extractLowestQualityFromDashManifest(manifest: string): string | null {
  try {
    console.log("🔍 [DASH_PARSER] Parsing DASH manifest for lowest quality video");

    const regex240p = /<Representation[^>]*FBQualityLabel="240p"[^>]*>[\s\S]*?<BaseURL[^>]*>(.*?)<\/BaseURL>/i;
    const match240p = manifest.match(regex240p);
    if (match240p && match240p[1]) {
      const videoUrl = match240p[1].trim();
      console.log("✅ [DASH_PARSER] Found 240p video URL from DASH manifest");
      return videoUrl;
    }

    const representationRegex = /<Representation[^>]*bandwidth="(\d+)"[^>]*>[\s\S]*?<BaseURL[^>]*>(.*?)<\/BaseURL>/gi;
    const representations: { bandwidth: number; url: string }[] = [];

    let match: RegExpExecArray | null;
    while ((match = representationRegex.exec(manifest)) !== null) {
      const bandwidth = parseInt(match[1]);
      const url = match[2].trim();
      if (url && bandwidth) {
        representations.push({ bandwidth, url });
      }
    }

    if (representations.length > 0) {
      representations.sort((a, b) => a.bandwidth - b.bandwidth);
      const lowestQuality = representations[0];
      console.log(`✅ [DASH_PARSER] Found lowest bandwidth video (${lowestQuality.bandwidth}) from DASH manifest`);
      return lowestQuality.url;
    }

    console.log("⚠️ [DASH_PARSER] No video URLs found in DASH manifest");
    return null;
  } catch (error) {
    console.error("❌ [DASH_PARSER] Error parsing DASH manifest:", error);
    return null;
  }
}
