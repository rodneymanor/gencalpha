import { NextRequest, NextResponse } from "next/server";

interface TestTransferRequest {
  instagramVideoUrl: string;
  testMethod?: "download-upload" | "direct-stream" | "bunny-fetch";
}

interface TestTransferResponse {
  success: boolean;
  method: string;
  bunnyVideoId?: string;
  bunnyPlaybackUrl?: string;
  error?: string;
  details?: any;
  timing?: {
    downloadTime?: number;
    uploadTime?: number;
    totalTime: number;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<TestTransferResponse>> {
  const startTime = Date.now();

  try {
    const body: TestTransferRequest = await request.json();
    const { instagramVideoUrl, testMethod = "download-upload" } = body;

    if (!instagramVideoUrl) {
      return NextResponse.json(
        {
          success: false,
          method: testMethod,
          error: "Instagram video URL is required",
        },
        { status: 400 },
      );
    }

    console.log(`🧪 [TEST_TRANSFER] Starting ${testMethod} test for Instagram URL`);
    console.log(`📹 [TEST_TRANSFER] URL: ${instagramVideoUrl}`);

    // Check environment variables
    const bunnyApiKey = process.env.BUNNY_API_KEY;
    const bunnyLibraryId = process.env.BUNNY_LIBRARY_ID;

    if (!bunnyApiKey || !bunnyLibraryId) {
      return NextResponse.json(
        {
          success: false,
          method: testMethod,
          error: "Bunny.net credentials not configured",
          details: {
            hasBunnyApiKey: !!bunnyApiKey,
            hasBunnyLibraryId: !!bunnyLibraryId,
          },
        },
        { status: 500 },
      );
    }

    let result: TestTransferResponse;

    switch (testMethod) {
      case "download-upload":
        result = await testDownloadUploadMethod(instagramVideoUrl, bunnyApiKey, bunnyLibraryId);
        break;
      case "direct-stream":
        result = await testDirectStreamMethod(instagramVideoUrl, bunnyApiKey, bunnyLibraryId);
        break;
      case "bunny-fetch":
        result = await testBunnyFetchMethod(instagramVideoUrl, bunnyApiKey, bunnyLibraryId);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            method: testMethod,
            error: "Invalid test method",
          },
          { status: 400 },
        );
    }

    result.timing = {
      ...result.timing,
      totalTime: Date.now() - startTime,
    };

    console.log(
      `${result.success ? "✅" : "❌"} [TEST_TRANSFER] ${testMethod} completed in ${result.timing.totalTime}ms`,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ [TEST_TRANSFER] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        method: "unknown",
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timing: {
          totalTime: Date.now() - startTime,
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Method 1: Download video first, then upload to Bunny.net (Recommended)
 */
async function testDownloadUploadMethod(
  instagramVideoUrl: string,
  bunnyApiKey: string,
  bunnyLibraryId: string,
): Promise<TestTransferResponse> {
  const downloadStart = Date.now();

  try {
    console.log("📥 [DOWNLOAD_UPLOAD] Step 1: Downloading video from Instagram CDN");

    // Download video with proper headers to bypass hotlinking protection
    const downloadResponse = await fetch(instagramVideoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
        Accept: "video/mp4,video/*,*/*;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "video",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
    });

    const downloadTime = Date.now() - downloadStart;

    if (!downloadResponse.ok) {
      console.error(`❌ [DOWNLOAD_UPLOAD] Download failed: ${downloadResponse.status} ${downloadResponse.statusText}`);
      return {
        success: false,
        method: "download-upload",
        error: `Instagram CDN returned ${downloadResponse.status}: ${downloadResponse.statusText}`,
        details: {
          status: downloadResponse.status,
          statusText: downloadResponse.statusText,
          headers: Object.fromEntries(downloadResponse.headers.entries()),
        },
        timing: { downloadTime, totalTime: 0 },
      };
    }

    const videoBuffer = await downloadResponse.arrayBuffer();
    const videoSize = videoBuffer.byteLength;

    console.log(`✅ [DOWNLOAD_UPLOAD] Downloaded ${(videoSize / 1024 / 1024).toFixed(2)}MB in ${downloadTime}ms`);

    const uploadStart = Date.now();
    console.log("📤 [DOWNLOAD_UPLOAD] Step 2: Uploading video to Bunny.net");

    // Generate a unique video title for Bunny.net
    const videoTitle = `Instagram Test Video - ${new Date().toISOString()}`;

    // Upload to Bunny.net
    const uploadResponse = await fetch(`https://video.bunnycdn.com/library/${bunnyLibraryId}/videos`, {
      method: "POST",
      headers: {
        AccessKey: bunnyApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: videoTitle,
        collectionId: "", // Empty for root collection
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error(`❌ [DOWNLOAD_UPLOAD] Bunny.net video creation failed: ${uploadResponse.status}`);
      return {
        success: false,
        method: "download-upload",
        error: `Bunny.net API error: ${uploadResponse.status}`,
        details: { errorText, status: uploadResponse.status },
        timing: { downloadTime, totalTime: 0 },
      };
    }

    const videoData = await uploadResponse.json();
    const bunnyVideoId = videoData.guid;

    console.log(`📹 [DOWNLOAD_UPLOAD] Created Bunny video: ${bunnyVideoId}`);

    // Upload the video file
    const fileUploadResponse = await fetch(
      `https://video.bunnycdn.com/library/${bunnyLibraryId}/videos/${bunnyVideoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: bunnyApiKey,
          "Content-Type": "video/mp4",
        },
        body: videoBuffer,
      },
    );

    const uploadTime = Date.now() - uploadStart;

    if (!fileUploadResponse.ok) {
      const errorText = await fileUploadResponse.text();
      console.error(`❌ [DOWNLOAD_UPLOAD] File upload failed: ${fileUploadResponse.status}`);
      return {
        success: false,
        method: "download-upload",
        error: `Bunny.net file upload error: ${fileUploadResponse.status}`,
        details: { errorText, status: fileUploadResponse.status },
        timing: { downloadTime, uploadTime, totalTime: 0 },
      };
    }

    console.log(
      `✅ [DOWNLOAD_UPLOAD] Successfully uploaded ${(videoSize / 1024 / 1024).toFixed(2)}MB in ${uploadTime}ms`,
    );

    return {
      success: true,
      method: "download-upload",
      bunnyVideoId,
      bunnyPlaybackUrl: `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${bunnyVideoId}`,
      details: {
        videoSizeMB: (videoSize / 1024 / 1024).toFixed(2),
        bunnyVideoData: videoData,
      },
      timing: { downloadTime, uploadTime, totalTime: 0 },
    };
  } catch (error) {
    console.error("❌ [DOWNLOAD_UPLOAD] Method failed:", error);
    return {
      success: false,
      method: "download-upload",
      error: error instanceof Error ? error.message : "Unknown error",
      timing: { totalTime: 0 },
    };
  }
}

/**
 * Method 2: Direct stream (will likely fail due to hotlinking protection)
 */
async function testDirectStreamMethod(
  instagramVideoUrl: string,
  bunnyApiKey: string,
  bunnyLibraryId: string,
): Promise<TestTransferResponse> {
  try {
    console.log("🔗 [DIRECT_STREAM] Testing direct stream to Bunny.net (expected to fail)");

    // Create video in Bunny.net first
    const createResponse = await fetch(`https://video.bunnycdn.com/library/${bunnyLibraryId}/videos`, {
      method: "POST",
      headers: {
        AccessKey: bunnyApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `Instagram Direct Stream Test - ${new Date().toISOString()}`,
        collectionId: "",
      }),
    });

    if (!createResponse.ok) {
      return {
        success: false,
        method: "direct-stream",
        error: `Failed to create Bunny video: ${createResponse.status}`,
        timing: { totalTime: 0 },
      };
    }

    const videoData = await createResponse.json();
    const bunnyVideoId = videoData.guid;

    // Try to stream directly from Instagram URL
    const streamResponse = await fetch(instagramVideoUrl);

    if (!streamResponse.ok) {
      return {
        success: false,
        method: "direct-stream",
        error: `Instagram CDN blocked direct access: ${streamResponse.status}`,
        details: {
          status: streamResponse.status,
          statusText: streamResponse.statusText,
        },
        timing: { totalTime: 0 },
      };
    }

    // If we get here, try to pipe to Bunny.net
    const videoBuffer = await streamResponse.arrayBuffer();

    const uploadResponse = await fetch(`https://video.bunnycdn.com/library/${bunnyLibraryId}/videos/${bunnyVideoId}`, {
      method: "PUT",
      headers: {
        AccessKey: bunnyApiKey,
        "Content-Type": "video/mp4",
      },
      body: videoBuffer,
    });

    if (!uploadResponse.ok) {
      return {
        success: false,
        method: "direct-stream",
        error: `Bunny.net upload failed: ${uploadResponse.status}`,
        timing: { totalTime: 0 },
      };
    }

    return {
      success: true,
      method: "direct-stream",
      bunnyVideoId,
      bunnyPlaybackUrl: `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${bunnyVideoId}`,
      timing: { totalTime: 0 },
    };
  } catch (error) {
    return {
      success: false,
      method: "direct-stream",
      error: error instanceof Error ? error.message : "Unknown error",
      timing: { totalTime: 0 },
    };
  }
}

/**
 * Method 3: Use Bunny.net's URL fetch API
 */
async function testBunnyFetchMethod(
  instagramVideoUrl: string,
  bunnyApiKey: string,
  bunnyLibraryId: string,
): Promise<TestTransferResponse> {
  try {
    console.log("🐰 [BUNNY_FETCH] Testing Bunny.net URL fetch API");

    // Create video and tell Bunny.net to fetch from URL
    const response = await fetch(`https://video.bunnycdn.com/library/${bunnyLibraryId}/videos/fetch`, {
      method: "POST",
      headers: {
        AccessKey: bunnyApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: instagramVideoUrl,
        title: `Instagram Bunny Fetch Test - ${new Date().toISOString()}`,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://www.instagram.com/",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        method: "bunny-fetch",
        error: `Bunny.net fetch failed: ${response.status}`,
        details: { errorText, status: response.status },
        timing: { totalTime: 0 },
      };
    }

    const data = await response.json();

    return {
      success: true,
      method: "bunny-fetch",
      bunnyVideoId: data.guid,
      bunnyPlaybackUrl: `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${data.guid}`,
      details: data,
      timing: { totalTime: 0 },
    };
  } catch (error) {
    return {
      success: false,
      method: "bunny-fetch",
      error: error instanceof Error ? error.message : "Unknown error",
      timing: { totalTime: 0 },
    };
  }
}
