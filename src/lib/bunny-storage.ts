/*
 * Bunny Storage image upload helper
 * - Uploads arbitrary images to Bunny Storage (not Stream)
 * - Preserves original mime/extension when possible
 */

function getBunnyStorageConfig() {
  const storageZone = process.env.BUNNY_STORAGE_ZONE;
  const apiKey = process.env.BUNNY_STORAGE_API_KEY;
  const pullZone = process.env.BUNNY_STORAGE_PULL_ZONE;

  if (!storageZone || !apiKey || !pullZone) {
    console.error("❌ [BUNNY_STORAGE] Missing env: BUNNY_STORAGE_ZONE, BUNNY_STORAGE_API_KEY, BUNNY_STORAGE_PULL_ZONE");
    return null;
  }

  return { storageZone, apiKey, pullZone } as const;
}

function extensionFromContentType(contentType?: string | null): string {
  if (!contentType) return "";
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };
  return map[contentType.toLowerCase()] ?? "";
}

export async function uploadImageToBunnyStorage(
  imageUrl: string,
  opts: { path: string; filenameBase: string },
): Promise<{ success: true; publicUrl: string } | { success: false; error: string }> {
  const config = getBunnyStorageConfig();
  if (!config) return { success: false, error: "Bunny storage not configured" };

  try {
    // Step 1: Fetch image from source
    const sourceResp = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
      },
    });

    if (!sourceResp.ok) {
      const txt = await sourceResp.text().catch(() => "");
      console.warn("⚠️ [BUNNY_STORAGE] Source fetch failed:", sourceResp.status, txt.substring(0, 120));
      return { success: false, error: `Source fetch failed: ${sourceResp.status}` };
    }

    const contentType = sourceResp.headers.get("content-type") ?? undefined;
    const arrayBuffer = await sourceResp.arrayBuffer();
    const ext = extensionFromContentType(contentType) || "jpg"; // default to jpg if unknown

    // Step 2: Upload to Bunny Storage
    const cleanPath = opts.path.replace(/^\/+|\/+$/g, "");
    const filename = `${opts.filenameBase}.${ext}`;
    const uploadUrl = `https://${config.storageZone}.storage.bunnycdn.com/${cleanPath}/${filename}`;

    const uploadResp = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: config.apiKey,
        "Content-Type": contentType ?? "image/jpeg",
      },
      body: arrayBuffer,
    });

    if (uploadResp.status !== 201 && uploadResp.status !== 200) {
      const txt = await uploadResp.text().catch(() => "");
      console.warn("⚠️ [BUNNY_STORAGE] Upload failed:", uploadResp.status, txt.substring(0, 120));
      return { success: false, error: `Upload failed: ${uploadResp.status}` };
    }

    const publicUrl = `https://${config.pullZone}.b-cdn.net/${cleanPath}/${filename}`;
    return { success: true, publicUrl };
  } catch (error) {
    console.error("❌ [BUNNY_STORAGE] Upload error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
