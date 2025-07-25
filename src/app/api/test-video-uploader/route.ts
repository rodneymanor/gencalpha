import { NextRequest, NextResponse } from "next/server";

import { isBunnyStreamConfigured, uploadToBunnyStream } from "@/lib/bunny-stream";

async function handleFileUpload(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("video") as File;

  if (!file) {
    return NextResponse.json({ error: "Video file is required" }, { status: 400 });
  }

  console.log("📤 [TEST-UPLOADER] Processing file upload:", file.name, `(${file.size} bytes)`);

  if (!isBunnyStreamConfigured()) {
    return NextResponse.json({ error: "Bunny Stream not configured" }, { status: 500 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await uploadToBunnyStream(arrayBuffer, file.name);

  if (!result) {
    return NextResponse.json({ error: "Failed to upload to CDN" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    uploadResult: result,
    testMode: true,
  });
}

async function handleJsonUpload(request: NextRequest) {
  const { videoBuffer, fileName, videoData } = await request.json();

  if (!videoBuffer || !fileName) {
    return NextResponse.json({ error: "videoBuffer and fileName are required" }, { status: 400 });
  }

  console.log("📤 [TEST-UPLOADER] Processing JSON upload:", fileName);

  if (!isBunnyStreamConfigured()) {
    return NextResponse.json({ error: "Bunny Stream not configured" }, { status: 500 });
  }

  // For testing, return a mock success response
  return NextResponse.json({
    success: true,
    uploadResult: {
      iframeUrl: "https://iframe.mediadelivery.net/embed/459811/test-video-id",
      directUrl: "https://vz-8416c36e-556.b-cdn.net/test-video-id/play_1080p.mp4",
      guid: "test-video-id-" + Date.now(),
    },
    videoData,
    testMode: true,
    message: "Mock upload successful - actual upload would require real video data",
  });
}

export async function POST(request: NextRequest) {
  console.log("🧪 [TEST-UPLOADER] Starting test video upload service (no auth required)...");

  try {
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      return await handleFileUpload(request);
    } else if (contentType?.includes("application/json")) {
      return await handleJsonUpload(request);
    } else {
      return NextResponse.json(
        {
          error: "Content-Type must be multipart/form-data or application/json",
          received: contentType,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("❌ [TEST-UPLOADER] Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload video to CDN",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        testMode: true,
      },
      { status: 500 },
    );
  }
}
