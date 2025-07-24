import { NextRequest, NextResponse } from "next/server";

import { detectPlatform } from "@/core/video/platform-detector";
import { transcribeVideoData } from "@/core/video/transcriber";

async function handleCdnTranscription(request: NextRequest) {
  const { url, videoId } = await request.json();

  if (!url && !videoId) {
    return NextResponse.json({ error: "Video URL or videoId is required" }, { status: 400 });
  }

  console.log("🎤 [TEST-TRANSCRIBE] Starting CDN transcription for:", url || videoId);

  // For testing, return a mock transcription result
  return NextResponse.json({
    success: true,
    transcription: {
      transcript: "This is a test transcription for the video URL: " + (url || videoId),
      platform: "tiktok",
      components: {
        hook: "Test hook content",
        bridge: "Test bridge content", 
        nugget: "Test main content",
        wta: "Test call to action"
      },
      contentMetadata: {
        platform: "tiktok",
        author: "test_user",
        description: "Test video description",
        source: url || videoId,
        hashtags: ["#test", "#demo"]
      },
      visualContext: "Test visual context",
      transcriptionMetadata: {
        method: "test",
        duration: 30,
        confidence: 0.95
      }
    },
    testMode: true
  });
}

async function handleFileTranscription(request: NextRequest) {
  console.log("🎤 [TEST-TRANSCRIBE] Starting file transcription...");

  const formData = await request.formData();
  const file = formData.get("audio") as File;

  if (!file) {
    return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
  }

  // For testing purposes, return mock transcription result for file uploads
  return NextResponse.json({
    success: true,
    transcription: {
      transcript: `Mock transcription for uploaded file: ${file.name}`,
      platform: "unknown",
      components: {
        hook: "Test hook from file",
        bridge: "Test bridge from file", 
        nugget: "Test main content from file",
        wta: "Test call to action from file"
      },
      contentMetadata: {
        platform: "file",
        author: "uploaded_user",
        description: "Uploaded file transcription",
        source: file.name,
        hashtags: ["#file", "#upload"]
      },
      visualContext: "File upload visual context",
      transcriptionMetadata: {
        method: "test_file",
        fileSize: file.size,
        fileName: file.name,
        processedAt: new Date().toISOString()
      }
    },
    testMode: true
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 [TEST-TRANSCRIBE] Starting test video transcription (no auth required)");

    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return await handleCdnTranscription(request);
    } else {
      return await handleFileTranscription(request);
    }
  } catch (error) {
    console.error("❌ [TEST-TRANSCRIBE] Transcription error:", error);
    return NextResponse.json(
      {
        error: "Failed to transcribe video",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        testMode: true
      },
      { status: 500 },
    );
  }
}