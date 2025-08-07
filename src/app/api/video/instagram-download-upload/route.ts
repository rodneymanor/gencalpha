import { NextRequest, NextResponse } from "next/server";
import { uploadToBunnyStream } from "@/lib/bunny-stream";

interface DownloadUploadRequest {
  instagramVideoUrl: string;
  filename?: string;
}

interface DownloadUploadResponse {
  success: boolean;
  video?: {
    cdnUrl: string;
    directUrl: string;
    filename: string;
  };
  error?: string;
  timing?: {
    downloadTime: number;
    uploadTime: number;
    totalTime: number;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<DownloadUploadResponse>> {
  const startTime = Date.now();
  
  try {
    const { instagramVideoUrl, filename }: DownloadUploadRequest = await request.json();

    if (!instagramVideoUrl) {
      return NextResponse.json({
        success: false,
        error: "Instagram video URL is required"
      }, { status: 400 });
    }

    console.log("🚀 [INSTAGRAM_DOWNLOAD_UPLOAD] Starting download and upload process...");
    console.log("📹 [INSTAGRAM_DOWNLOAD_UPLOAD] Instagram URL:", instagramVideoUrl);

    const downloadStart = Date.now();

    // Download video first
    console.log("📥 [INSTAGRAM_DOWNLOAD_UPLOAD] Downloading video from Instagram...");
    const response = await fetch(instagramVideoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.instagram.com/'
      }
    });

    if (!response.ok) {
      console.error(`❌ [INSTAGRAM_DOWNLOAD_UPLOAD] Download failed: ${response.status} ${response.statusText}`);
      return NextResponse.json({
        success: false,
        error: `Failed to download video: ${response.status} ${response.statusText}`
      }, { status: 500 });
    }

    const videoBuffer = Buffer.from(await response.arrayBuffer());
    const downloadTime = Date.now() - downloadStart;
    
    console.log(`✅ [INSTAGRAM_DOWNLOAD_UPLOAD] Downloaded ${(videoBuffer.length / 1024 / 1024).toFixed(2)}MB in ${downloadTime}ms`);

    const uploadStart = Date.now();

    // Then upload to Bunny.net
    console.log("📤 [INSTAGRAM_DOWNLOAD_UPLOAD] Uploading to Bunny Stream...");
    const videoFilename = filename || `instagram-video-${Date.now()}.mp4`;
    const bunnyResponse = await uploadToBunnyStream(videoBuffer, videoFilename, "video/mp4");

    const uploadTime = Date.now() - uploadStart;
    const totalTime = Date.now() - startTime;

    if (!bunnyResponse) {
      console.error("❌ [INSTAGRAM_DOWNLOAD_UPLOAD] Bunny upload failed");
      return NextResponse.json({
        success: false,
        error: "Failed to upload video to Bunny Stream",
        timing: {
          downloadTime,
          uploadTime,
          totalTime
        }
      }, { status: 500 });
    }

    console.log(`✅ [INSTAGRAM_DOWNLOAD_UPLOAD] Successfully uploaded to Bunny Stream in ${uploadTime}ms`);
    console.log(`🎯 [INSTAGRAM_DOWNLOAD_UPLOAD] Total process completed in ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      video: {
        cdnUrl: bunnyResponse.cdnUrl,
        directUrl: bunnyResponse.cdnUrl, // Use cdnUrl as directUrl since that's what's available
        filename: bunnyResponse.filename
      },
      timing: {
        downloadTime,
        uploadTime,
        totalTime
      }
    });

  } catch (error) {
    console.error("❌ [INSTAGRAM_DOWNLOAD_UPLOAD] Process failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timing: {
        downloadTime: 0,
        uploadTime: 0,
        totalTime: Date.now() - startTime
      }
    }, { status: 500 });
  }
}