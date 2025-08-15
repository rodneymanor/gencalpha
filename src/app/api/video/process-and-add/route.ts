/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
// Production-ready video processing and collection addition endpoint
import { NextRequest, NextResponse } from "next/server";

import {
  uploadToBunnyStream,
  uploadBunnyThumbnailWithRetry,
  generateBunnyThumbnailUrl,
  generateBunnyPreviewUrl,
} from "@/lib/bunny-stream";
import { getAdminAuth, getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 [VIDEO_PROCESS] Starting complete video processing workflow...");

    // Check if Firebase Admin is initialized (it auto-initializes on import)
    if (!isAdminInitialized) {
      throw new Error("Firebase Admin SDK not initialized - check environment variables");
    }

    // Internal secret bypass or Firebase auth
    const internalSecret = request.headers.get("x-internal-secret");
    let userId: string | undefined;

    if (internalSecret && internalSecret === process.env.INTERNAL_API_SECRET) {
      userId = "internal-service";
      console.log("✅ [VIDEO_PROCESS] Internal secret authentication");
    } else {
      // Extract and verify user authentication via Firebase ID token
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          {
            error: "Unauthorized - Missing or invalid authorization header",
          },
          { status: 401 },
        );
      }

      const idToken = authHeader.split("Bearer ")[1];
      try {
        const adminAuth = getAdminAuth();
        if (!adminAuth) {
          throw new Error("Admin auth not available");
        }

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        userId = decodedToken.uid;
        console.log("✅ [VIDEO_PROCESS] User authenticated:", userId);
      } catch (authError) {
        console.error("❌ [VIDEO_PROCESS] Authentication failed:", authError);
        return NextResponse.json(
          {
            error: "Unauthorized - Invalid token",
          },
          { status: 401 },
        );
      }
    }

    const { videoUrl, collectionId, title, thumbnailUrl, scrapedData } = await request.json();
    const baseUrl = getBaseUrl(request);

    console.log("🔍 [VIDEO_PROCESS] Original URL:", videoUrl);

    // Decode URL to handle URL encoding issues (like Instagram)
    const decodedUrl = decodeURIComponent(videoUrl);
    console.log("🔍 [VIDEO_PROCESS] Decoded URL:", decodedUrl);

    // Step 1: Download video (or use scraped data if provided)
    console.log("📥 [VIDEO_PROCESS] Step 1: Processing video...");
    let downloadResult: any;

    if (scrapedData) {
      console.log("🔄 [VIDEO_PROCESS] Using pre-scraped data to avoid re-download");
      // Use the pre-scraped data from the queue
      downloadResult = {
        success: true,
        data: {
          platform: scrapedData.platform,
          videoData: {
            buffer: [], // Will be downloaded in streaming step
            size: 0,
            mimeType: "video/mp4",
            filename: `${scrapedData.platform}-${Date.now()}.mp4`,
          },
          metrics: scrapedData.metrics || {},
          additionalMetadata: {
            author: scrapedData.author,
            description: scrapedData.description,
            hashtags: scrapedData.hashtags,
            duration: scrapedData.metadata?.duration || 0,
            timestamp: scrapedData.metadata?.timestamp,
          },
          thumbnailUrl: scrapedData.thumbnailUrl || thumbnailUrl,
          metadata: {
            originalUrl: decodedUrl,
            platform: scrapedData.platform,
            downloadedAt: new Date().toISOString(),
            shortCode: scrapedData.metadata?.shortCode,
            thumbnailUrl: scrapedData.thumbnailUrl || thumbnailUrl,
          },
        },
      };
    } else {
      // Fall back to downloading via API
      downloadResult = await downloadVideo(baseUrl, decodedUrl);

      if (!downloadResult.success) {
        return NextResponse.json(
          {
            error: "Failed to download video",
            details: downloadResult.error,
          },
          { status: 500 },
        );
      }
    }

    console.log("✅ [VIDEO_PROCESS] Video processing successful");

    // Step 2: Stream to Bunny CDN
    console.log("🎬 [VIDEO_PROCESS] Step 2: Streaming to Bunny CDN...");
    let streamResult: any;

    if (scrapedData?.videoUrl) {
      // Stream directly from the scraped video URL
      console.log("🌊 [VIDEO_PROCESS] Streaming directly from scraped video URL");
      const { streamToBunnyFromUrl } = await import("@/lib/bunny-stream");
      const streamResponse = await streamToBunnyFromUrl(
        scrapedData.videoUrl,
        `${scrapedData.platform}-${Date.now()}.mp4`,
      );

      if (streamResponse) {
        // Extract GUID from iframe URL for thumbnail upload
        const { extractVideoIdFromIframeUrl } = await import("@/lib/bunny-stream");
        const videoGuid = extractVideoIdFromIframeUrl(streamResponse.iframeUrl);

        streamResult = {
          success: true,
          iframeUrl: streamResponse.iframeUrl,
          directUrl: streamResponse.directUrl,
          guid: videoGuid,
        };
      } else {
        streamResult = { success: false, error: "Failed to stream from video URL" };
      }
    } else {
      // Traditional streaming approach
      streamResult = await streamToBunny(downloadResult.data);
    }

    if (!streamResult.success) {
      return NextResponse.json(
        {
          error: "Failed to stream video to CDN",
          details: streamResult.error || "Failed to upload to Bunny CDN",
        },
        { status: 500 },
      );
    }

    console.log("✅ [VIDEO_PROCESS] Streaming successful");

    // Step 2.5: Upload custom thumbnail if available
    if (downloadResult.data.thumbnailUrl && streamResult.guid) {
      console.log("🖼️ [VIDEO_PROCESS] Step 2.5: Uploading custom thumbnail...");
      try {
        const thumbnailSuccess = await uploadBunnyThumbnailWithRetry(
          streamResult.guid,
          downloadResult.data.thumbnailUrl,
          2, // Max 2 retries for thumbnails
        );

        if (thumbnailSuccess) {
          console.log("✅ [VIDEO_PROCESS] Custom thumbnail uploaded successfully");
        } else {
          console.log("⚠️ [VIDEO_PROCESS] Custom thumbnail upload failed, using default");
        }
      } catch (error) {
        console.error("❌ [VIDEO_PROCESS] Thumbnail upload error:", error);
        // Continue processing even if thumbnail fails
      }
    } else {
      console.log("ℹ️ [VIDEO_PROCESS] No custom thumbnail URL provided, using default");
    }

    // Step 3: Add to collection with userId
    console.log("💾 [VIDEO_PROCESS] Step 3: Adding to collection...");
    const videoData = {
      originalUrl: decodedUrl,
      title: title || `Video from ${downloadResult.data.platform ?? "tiktok"}`,
      platform: downloadResult.data.platform ?? "tiktok",
      iframeUrl: streamResult.iframeUrl,
      directUrl: streamResult.directUrl,
      guid: streamResult.guid,
      thumbnailUrl:
        (streamResult.thumbnailUrl ?? (streamResult.guid ? generateBunnyThumbnailUrl(streamResult.guid) : null)) ||
        downloadResult.data.thumbnailUrl,
      previewUrl:
        streamResult.previewUrl ?? (streamResult.guid ? generateBunnyPreviewUrl(streamResult.guid) : undefined),
      metrics: downloadResult.data.metrics || {},
      metadata: {
        ...(downloadResult.data.metadata || {}),
        ...(downloadResult.data.additionalMetadata || {}),
      },
      transcriptionStatus: "pending",
      userId: userId,
    };

    const addResult = await addVideoToCollection(collectionId || "all-videos", videoData);

    if (!addResult.success) {
      return NextResponse.json(
        {
          error: "Failed to add video to collection",
          details: addResult.error,
        },
        { status: 500 },
      );
    }

    // Step 4: Start background transcription (real-time updates)
    console.log("🎙️ [VIDEO_PROCESS] Step 4: Starting background transcription...");
    startBackgroundTranscription(
      baseUrl,
      downloadResult.data.videoData,
      addResult.videoId,
      collectionId || "all-videos",
      downloadResult.data.platform,
      downloadResult.data.additionalMetadata || {},
      streamResult, // Pass stream result to use Bunny CDN URL
    );

    console.log("✅ [VIDEO_PROCESS] Complete workflow successful!");

    return NextResponse.json({
      success: true,
      videoId: addResult.videoId,
      iframe: streamResult.iframeUrl,
      directUrl: streamResult.directUrl,
      platform: downloadResult.data.platform,
      transcriptionStatus: "processing",
      message: "Video added successfully. Transcription in progress.",
    });
  } catch (error) {
    console.error("❌ [VIDEO_PROCESS] Workflow error:", error);
    return NextResponse.json(
      {
        error: "Video processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function getBaseUrl(request: NextRequest): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const host = request.headers.get("host");
  return host ? `http://${host}` : `http://localhost:${process.env.PORT || 3001}`;
}

async function downloadVideo(baseUrl: string, url: string) {
  try {
    console.log("🔄 [VIDEO_PROCESS] Calling downloader service...");

    const response = await fetch(`${baseUrl}/api/video/downloader`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [VIDEO_PROCESS] Download failed:", response.status, errorText);
      return { success: false, error: `Download failed: ${errorText}` };
    }

    const data = await response.json();
    console.log("✅ [VIDEO_PROCESS] Download successful");
    return { success: true, data };
  } catch (error) {
    console.error("❌ [VIDEO_PROCESS] Download error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Download failed" };
  }
}

async function streamToBunny(downloadData: any) {
  try {
    console.log("🐰 [VIDEO_PROCESS] Streaming to Bunny CDN...");

    const buffer = Buffer.from(downloadData.videoData.buffer);
    const filename = downloadData.videoData.filename || `${downloadData.platform}-video.mp4`;
    const mimeType = downloadData.videoData.mimeType || "video/mp4";

    console.log("🔍 [VIDEO_PROCESS] Buffer info:", {
      bufferSize: buffer.length,
      filename,
      mimeType,
    });

    const result = await uploadToBunnyStream(buffer, filename, mimeType);

    console.log("🔍 [VIDEO_PROCESS] Upload result:", result);

    if (!result) {
      console.error("❌ [VIDEO_PROCESS] Bunny stream failed - null result");
      return { success: false, error: "Failed to upload to Bunny CDN" };
    }

    console.log("✅ [VIDEO_PROCESS] Bunny stream successful:", result.cdnUrl);

    // Generate Bunny CDN thumbnail & preview URLs using the video ID
    const thumbnailUrl = generateBunnyThumbnailUrl(result.filename);
    const previewUrl = generateBunnyPreviewUrl(result.filename);

    const returnValue = {
      success: true,
      iframeUrl: result.cdnUrl,
      directUrl: result.cdnUrl,
      guid: result.filename, // This is actually the GUID
      thumbnailUrl,
      previewUrl,
    };

    console.log("🔍 [VIDEO_PROCESS] Returning:", returnValue);
    return returnValue;
  } catch (error) {
    console.error("❌ [VIDEO_PROCESS] Bunny stream error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Bunny stream failed" };
  }
}

async function addVideoToCollection(collectionId: string, videoData: any) {
  try {
    console.log("💾 [VIDEO_PROCESS] Adding video to Firestore collection...");

    if (!isAdminInitialized) {
      throw new Error("Firebase Admin SDK not initialized");
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error("Admin database not available");
    }

    // Add video to collection
    const videoRef = adminDb.collection("videos").doc();
    const timestamp = new Date().toISOString();
    await videoRef.set({
      ...videoData,
      collectionId,
      id: videoRef.id,
      addedAt: timestamp, // ✅ Required by RBAC queries
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Update collection video count (skip for "all-videos" as it's virtual)
    if (collectionId !== "all-videos") {
      const collectionRef = adminDb.collection("collections").doc(collectionId);
      await adminDb.runTransaction(async (transaction) => {
        const collectionDoc = await transaction.get(collectionRef);
        if (collectionDoc.exists) {
          const currentCount = collectionDoc.data()?.videoCount || 0;
          transaction.update(collectionRef, {
            videoCount: currentCount + 1,
            updatedAt: new Date().toISOString(),
          });
        }
      });
    }

    console.log("✅ [VIDEO_PROCESS] Video added to collection:", videoRef.id);
    return { success: true, videoId: videoRef.id };
  } catch (error) {
    console.error("❌ [VIDEO_PROCESS] Firestore error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Database error" };
  }
}

function startBackgroundTranscription(
  baseUrl: string,
  videoData: any,
  videoId: string,
  collectionId: string,
  platform: string,
  additionalMetadata: any = {},
  streamResult: any = null,
) {
  // Use setTimeout to ensure response is sent before starting background work
  setTimeout(async () => {
    try {
      console.log("🎙️ [BACKGROUND] Starting transcription for video:", videoId);

      // Use Bunny CDN URL for transcription if available (most efficient)
      let response;
      const bunnyVideoUrl = streamResult?.directUrl || streamResult?.iframeUrl;

      if (bunnyVideoUrl) {
        console.log("🌐 [BACKGROUND] Using Bunny CDN URL for transcription:", bunnyVideoUrl);
        response = await fetch(`${baseUrl}/api/internal/video/transcribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          },
          body: JSON.stringify({
            videoUrl: bunnyVideoUrl,
            platform: platform,
            useDirectUrl: true, // Use direct URL processing instead of downloading
          }),
        });
      } else if (videoData && videoData.buffer) {
        console.log("📁 [BACKGROUND] Using file-based transcription fallback");
        // Convert buffer array back to proper format for transcription
        const buffer = Buffer.from(videoData.buffer);
        const blob = new Blob([buffer], { type: videoData.mimeType });
        const formData = new FormData();
        formData.append("video", blob, videoData.filename);

        response = await fetch(`${baseUrl}/api/internal/video/transcribe`, {
          method: "POST",
          headers: {
            "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          },
          body: formData,
        });
      } else {
        console.log("⚠️ [BACKGROUND] No video URL or buffer available - skipping transcription");
        await updateVideoTranscriptionStatus(videoId, "failed");
        return;
      }

      if (!response.ok) {
        console.error("❌ [BACKGROUND] Transcription failed:", response.status);
        await updateVideoTranscriptionStatus(videoId, "failed");
        return;
      }

      const { transcript } = await response.json();
      console.log("✅ [BACKGROUND] Transcription completed");

      if (!transcript) {
        console.error("❌ [BACKGROUND] No transcript returned – aborting analysis");
        await updateVideoTranscriptionStatus(videoId, "failed");
        return;
      }

      // 🔍 Analyze script to extract Hook / Bridge / Nugget / WTA components
      const analysisRes = await fetch(`${baseUrl}/api/video/analyze-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      let components = { hook: "", bridge: "", nugget: "", wta: "" } as any;
      if (analysisRes.ok) {
        const analysisJson = await analysisRes.json();
        components = analysisJson.components ?? components;
        console.log("✅ [BACKGROUND] Script analysis succeeded – components extracted");
      } else {
        console.error("⚠️ [BACKGROUND] Script analysis failed – using empty components");
      }

      // 📝 Prepare extra content metadata (caption & hashtags already in additionalMetadata)
      const contentMetadata = {
        platform,
        author: additionalMetadata?.author ?? "Unknown",
        description: additionalMetadata?.description ?? "",
        source: "other",
        hashtags: additionalMetadata?.hashtags ?? [],
      } as any;

      // Merge all transcription-related data and save to Firestore
      await updateVideoTranscription(videoId, {
        transcript,
        components,
        contentMetadata,
        visualContext: "", // reserved for future computer-vision analysis
      });

      // Real-time update hook (WebSocket, etc.) could be invoked here
      console.log("📡 [BACKGROUND] Transcription + analysis ready for video:", videoId);
    } catch (error) {
      console.error("❌ [BACKGROUND] Transcription error:", error);
      await updateVideoTranscriptionStatus(videoId, "failed");
    }
  }, 100);
}

async function updateVideoTranscription(videoId: string, transcriptionData: any) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) return;

    // Filter out undefined values to prevent Firestore errors
    const updateData: any = {
      transcriptionStatus: "completed",
      transcriptionCompletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Only add fields that are not undefined
    if (transcriptionData.transcript !== undefined) {
      updateData.transcript = transcriptionData.transcript;
    }
    if (transcriptionData.components !== undefined) {
      updateData.components = transcriptionData.components;
    }
    if (transcriptionData.contentMetadata !== undefined) {
      updateData.contentMetadata = transcriptionData.contentMetadata;
    }
    if (transcriptionData.visualContext !== undefined) {
      updateData.visualContext = transcriptionData.visualContext;
    }

    await adminDb.collection("videos").doc(videoId).update(updateData);

    console.log("✅ [BACKGROUND] Video transcription updated:", videoId);
  } catch (error) {
    console.error("❌ [BACKGROUND] Failed to update transcription:", error);
  }
}

async function updateVideoTranscriptionStatus(videoId: string, status: string) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) return;

    await adminDb.collection("videos").doc(videoId).update({
      transcriptionStatus: status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [BACKGROUND] Failed to update transcription status:", error);
  }
}
