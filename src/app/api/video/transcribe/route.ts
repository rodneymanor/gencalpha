import { NextRequest, NextResponse } from "next/server";

import { detectPlatform } from "@/core/video/platform-detector";
import { VideoTranscriber } from "@/core/video/transcriber";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { ApifyClient, APIFY_ACTORS } from "@/lib/apify";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (keeping existing auth)
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return await handleCdnTranscription(request, authResult);
    } else {
      return await handleFileTranscription(request, authResult);
    }
  } catch (error) {
    console.error("❌ [TRANSCRIBE] Transcription error:", error);
    return NextResponse.json(
      {
        error: "Failed to transcribe video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

async function handleCdnTranscription(request: NextRequest, authResult: { user: { uid: string } }) {
  const { videoUrl, platform } = await request.json();

  if (!videoUrl) {
    return NextResponse.json({ error: "No video URL provided" }, { status: 400 });
  }

  console.log("🌐 [TRANSCRIBE] Transcribing CDN-hosted video:", videoUrl);

  const detectedPlatform = platform ?? detectPlatform(videoUrl).platform;

  try {
    // Try primary transcription method first
    const result = await VideoTranscriber.transcribeFromUrl(videoUrl, detectedPlatform);

    if (result && result.transcript) {
      // Check if this is a fallback transcript (indicating the primary method failed)
      const isFallbackTranscript =
        result.transcript.includes("temporarily unavailable") ||
        result.transcript.includes("transcription pending") ||
        result.transcriptionMetadata?.method === "fallback";

      if (!isFallbackTranscript) {
        console.log("✅ [TRANSCRIBE] CDN transcription completed successfully");
        // Best-effort save transcript
        try {
          if (isAdminInitialized) {
            const adminDb = getAdminDb();
            await adminDb.collection("transcripts").add({
              userId: authResult.user.uid,
              sourceUrl: videoUrl,
              platform: detectedPlatform,
              transcript: result.transcript,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (persistErr) {
          console.warn("⚠️ [TRANSCRIBE] Failed to persist transcript:", persistErr);
        }

        return NextResponse.json({
          success: true,
          transcript: result.transcript,
          platform: result.platform,
          components: result.components,
          contentMetadata: result.contentMetadata,
          visualContext: result.visualContext,
          transcriptionMetadata: result.transcriptionMetadata,
        });
      } else {
        console.log("⚠️ [TRANSCRIBE] Primary method returned fallback transcript, trying TikTok scraper");
      }
    }
  } catch (error) {
    console.log("⚠️ [TRANSCRIBE] Primary method failed, trying TikTok scraper fallback:", error);
  }

  // Fallback: Try TikTok scraper if platform is TikTok and primary method failed
  if (detectedPlatform === "tiktok") {
    try {
      console.log("🎯 [TRANSCRIBE] Attempting TikTok scraper fallback");
      const fallbackResult = await tryTikTokScraperFallback(videoUrl);

      if (fallbackResult) {
        console.log("✅ [TRANSCRIBE] TikTok scraper fallback successful");
        // Best-effort save transcript
        try {
          if (isAdminInitialized) {
            const adminDb = getAdminDb();
            await adminDb.collection("transcripts").add({
              userId: authResult.user.uid,
              sourceUrl: videoUrl,
              platform: "tiktok",
              transcript: fallbackResult.transcript,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (persistErr) {
          console.warn("⚠️ [TRANSCRIBE] Failed to persist transcript (fallback):", persistErr);
        }

        return NextResponse.json({
          success: true,
          transcript: fallbackResult.transcript,
          platform: "tiktok",
          transcriptionMetadata: {
            method: "tiktok-scraper-fallback",
            processedAt: new Date().toISOString(),
            fallbackUsed: true,
            ...fallbackResult.metadata,
          },
        });
      }
    } catch (fallbackError) {
      console.error("❌ [TRANSCRIBE] TikTok scraper fallback also failed:", fallbackError);
    }
  }

  return NextResponse.json({ error: "Failed to transcribe video from URL" }, { status: 500 });
}

async function tryTikTokScraperFallback(videoUrl: string) {
  const client = new ApifyClient();

  const apifyInput = {
    postURLs: [videoUrl],
    resultsPerPage: 1,
    shouldDownloadVideos: false, // We only need transcript
    shouldDownloadAvatars: false,
    shouldDownloadCovers: false,
  };

  const results = await client.runActor(APIFY_ACTORS.TIKTOK_SCRAPER, apifyInput, true);

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("No data returned from TikTok scraper");
  }

  const videoData = results[0];
  const transcript = videoData.text;

  if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
    throw new Error("No transcript found in TikTok scraper response");
  }

  return {
    transcript: transcript.trim(),
    metadata: {
      duration: videoData.videoMeta?.duration,
      author: videoData.authorMeta?.nickName,
      videoId: videoData.id,
      createTime: videoData.createTimeISO,
    },
  };
}

async function handleFileTranscription(request: NextRequest, authResult: { user: { uid: string } }) {
  const formData = await request.formData();
  const file = formData.get("video") as File;

  if (!file) {
    return NextResponse.json({ error: "No video file provided" }, { status: 400 });
  }

  console.log("📁 [TRANSCRIBE] Processing uploaded video file:", file.name);

  // Validate file
  const validation = VideoTranscriber.validateFile(file);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Convert file to video data for transcription
  const arrayBuffer = await file.arrayBuffer();
  const videoData = {
    buffer: arrayBuffer,
    size: file.size,
    mimeType: file.type,
    filename: file.name,
  };

  const detectedPlatform = detectPlatform(file.name).platform;
  const result = await VideoTranscriber.transcribe(videoData, detectedPlatform);

  if (!result) {
    return NextResponse.json({ error: "Failed to transcribe video" }, { status: 500 });
  }

  console.log("✅ [TRANSCRIBE] File transcription completed successfully");

  return NextResponse.json({
    success: true,
    transcript: result.transcript,
    platform: result.platform,
    components: result.components,
    contentMetadata: result.contentMetadata,
    visualContext: result.visualContext,
    transcriptionMetadata: {
      method: "direct",
      fileSize: file.size,
      fileName: file.name,
      processedAt: new Date().toISOString(),
    },
  });
}
