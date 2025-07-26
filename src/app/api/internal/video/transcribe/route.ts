// Internal transcription endpoint - bypasses user authentication for background processing
import { NextRequest, NextResponse } from "next/server";

import { detectPlatform } from "@/core/video/platform-detector";
import { VideoTranscriber } from "@/core/video/transcriber";

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 [INTERNAL_TRANSCRIBE] Starting internal transcription workflow...");

    // Verify internal request authorization
    const internalSecret = request.headers.get("x-internal-secret");
    if (!internalSecret || internalSecret !== process.env.INTERNAL_API_SECRET) {
      console.error("❌ [INTERNAL_TRANSCRIBE] Unauthorized internal request");
      return NextResponse.json({ error: "Unauthorized - Invalid internal secret" }, { status: 401 });
    }

    console.log("✅ [INTERNAL_TRANSCRIBE] Internal request authorized");

    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return await handleCdnTranscription(request);
    } else {
      return await handleFileTranscription(request);
    }
  } catch (error) {
    console.error("❌ [INTERNAL_TRANSCRIBE] Transcription error:", error);
    return NextResponse.json(
      {
        error: "Failed to transcribe video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

async function handleCdnTranscription(request: NextRequest) {
  const { videoUrl, platform } = await request.json();

  if (!videoUrl) {
    return NextResponse.json({ error: "No video URL provided" }, { status: 400 });
  }

  console.log("🌐 [INTERNAL_TRANSCRIBE] Transcribing CDN-hosted video:", videoUrl);

  const detectedPlatform = platform || detectPlatform(videoUrl).platform;
  const result = await VideoTranscriber.transcribeFromUrl(videoUrl, detectedPlatform);

  if (!result) {
    return NextResponse.json({ error: "Failed to transcribe video from URL" }, { status: 500 });
  }

  console.log("✅ [INTERNAL_TRANSCRIBE] CDN transcription completed successfully");
  return NextResponse.json({
    success: true,
    transcript: result.transcript,
    platform: result.platform,
    components: result.components,
    contentMetadata: result.contentMetadata,
    visualContext: result.visualContext,
    transcriptionMetadata: result.transcriptionMetadata,
  });
}

async function handleFileTranscription(request: NextRequest) {
  const formData = await request.formData();
  const videoFile = formData.get("video") as File;

  if (!videoFile) {
    return NextResponse.json({ error: "No video file provided" }, { status: 400 });
  }

  console.log("📁 [INTERNAL_TRANSCRIBE] Processing uploaded video file:", videoFile.name);

  // Detect platform from filename if possible
  const detectedPlatform = detectPlatform(videoFile.name);
  console.log("🔍 [PLATFORM] Analyzing URL for platform detection:", videoFile.name);
  if (detectedPlatform.platform === "unknown") {
    console.log("⚠️ [PLATFORM] Platform unknown for URL:", videoFile.name);
  }

  // Convert file to video data for transcription
  const arrayBuffer = await videoFile.arrayBuffer();
  const videoData = {
    buffer: arrayBuffer,
    size: videoFile.size,
    mimeType: videoFile.type,
    filename: videoFile.name,
  };

  const result = await VideoTranscriber.transcribe(videoData, detectedPlatform.platform);

  if (!result) {
    return NextResponse.json({ error: "Failed to transcribe video file" }, { status: 500 });
  }

  console.log("✅ [INTERNAL_TRANSCRIBE] File transcription completed successfully");
  return NextResponse.json({
    success: true,
    transcript: result.transcript,
    platform: result.platform,
    components: result.components,
    contentMetadata: result.contentMetadata,
    visualContext: result.visualContext,
    transcriptionMetadata: result.transcriptionMetadata,
  });
}
