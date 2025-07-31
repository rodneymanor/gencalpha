// Internal video processing endpoint - bypasses user authentication for background processing
import { NextRequest, NextResponse } from "next/server";

import { uploadToBunnyStream, generateBunnyThumbnailUrl, uploadBunnyThumbnailWithRetry } from "@/lib/bunny-stream";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 [INTERNAL_VIDEO] Starting internal video processing workflow...");

    // Verify internal request authorization
    const internalSecret = request.headers.get("x-internal-secret");
    if (!internalSecret || internalSecret !== process.env.INTERNAL_API_SECRET) {
      console.error("❌ [INTERNAL_VIDEO] Unauthorized internal request");
      return NextResponse.json({ error: "Unauthorized - Invalid internal secret" }, { status: 401 });
    }

    console.log("✅ [INTERNAL_VIDEO] Internal request authorized");

    // Check if Firebase Admin is initialized
    if (!isAdminInitialized) {
      throw new Error("Firebase Admin SDK not initialized - check environment variables");
    }

    const { videoUrl, collectionId, userId, title, thumbnailUrl, scrapedData } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required for internal processing" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(request);

    console.log("🔍 [INTERNAL_VIDEO] Processing for user:", userId);
    console.log("🔍 [INTERNAL_VIDEO] Original URL:", videoUrl);

    // Decode URL to handle URL encoding issues (like Instagram)
    const decodedUrl = decodeURIComponent(videoUrl);
    console.log("🔍 [INTERNAL_VIDEO] Decoded URL:", decodedUrl);

    // Step 1: Download video (or use scraped data if provided)
    console.log("📥 [INTERNAL_VIDEO] Step 1: Processing video...");
    let downloadResult: any;

    if (scrapedData?.videoUrl) {
      console.log("🔄 [INTERNAL_VIDEO] Downloading video from scraped Apify URL for transcription buffer");
      // Download the video from Apify storage to get buffer for transcription
      downloadResult = await downloadVideo(baseUrl, scrapedData.videoUrl);
      
      if (downloadResult.success) {
        // Merge scraped metadata with downloaded video data (including metrics!)
        downloadResult.data = {
          ...downloadResult.data,
          platform: scrapedData.platform,
          metrics: scrapedData.metrics || {}, // ✅ Extract metrics from scraped data
          additionalMetadata: {
            author: scrapedData.author,
            description: scrapedData.description,
            hashtags: scrapedData.hashtags,
            duration: scrapedData.metadata?.duration || 0,
            timestamp: scrapedData.metadata?.timestamp,
          },
          thumbnailUrl: scrapedData.thumbnailUrl || thumbnailUrl,
          metadata: {
            ...(downloadResult.data.metadata || {}),
            originalUrl: decodedUrl,
            platform: scrapedData.platform,
            shortCode: scrapedData.metadata?.shortCode || scrapedData.shortCode || "unknown",
            thumbnailUrl: scrapedData.thumbnailUrl || thumbnailUrl,
          },
        };
      } else {
        return NextResponse.json(
          {
            error: "Failed to download video from scraped URL",
            details: downloadResult.error,
          },
          { status: 500 },
        );
      }
    } else if (scrapedData) {
      console.log("🔄 [INTERNAL_VIDEO] Using pre-scraped metadata (no video URL available)");
      // Use the pre-scraped data from the queue when no video URL available
      downloadResult = {
        success: true,
        data: {
          platform: scrapedData.platform,
          videoData: null, // No buffer available
          metrics: scrapedData.metrics || {}, // ✅ Extract metrics from scraped data
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
            shortCode: scrapedData.metadata?.shortCode || scrapedData.shortCode || "unknown",
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

    console.log("✅ [INTERNAL_VIDEO] Video processing successful");

    // Step 2: Stream to Bunny CDN
    console.log("🎬 [INTERNAL_VIDEO] Step 2: Streaming to Bunny CDN...");
    let streamResult: any;

    if (scrapedData?.videoUrl) {
      // Stream directly from the scraped video URL
      console.log("🌊 [INTERNAL_VIDEO] Streaming directly from scraped video URL");
      const { streamToBunnyFromUrl } = await import("@/lib/bunny-stream");
      const streamResponse = await streamToBunnyFromUrl(scrapedData.videoUrl, `${scrapedData.platform}-${Date.now()}.mp4`);

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

    console.log("✅ [INTERNAL_VIDEO] Streaming successful");

    // Step 2.5: Upload custom thumbnail if available
    if (downloadResult.data.thumbnailUrl && streamResult.guid) {
      console.log("🖼️ [INTERNAL_VIDEO] Step 2.5: Uploading custom thumbnail...");
      console.log("🔗 [INTERNAL_VIDEO] Thumbnail URL:", downloadResult.data.thumbnailUrl);
      console.log("🆔 [INTERNAL_VIDEO] Video GUID:", streamResult.guid);
      try {
        const thumbnailSuccess = await uploadBunnyThumbnailWithRetry(
          streamResult.guid,
          downloadResult.data.thumbnailUrl,
          2, // Max 2 retries for thumbnails
        );

        if (thumbnailSuccess) {
          console.log("✅ [INTERNAL_VIDEO] Custom thumbnail uploaded successfully");
        } else {
          console.log("⚠️ [INTERNAL_VIDEO] Custom thumbnail upload failed, using default");
        }
      } catch (error) {
        console.error("❌ [INTERNAL_VIDEO] Thumbnail upload error:", error);
        // Continue processing even if thumbnail fails
      }
    } else {
      console.log("ℹ️ [INTERNAL_VIDEO] No custom thumbnail URL provided, using default");
    }

    // Step 3: Add to collection with userId
    console.log("💾 [INTERNAL_VIDEO] Step 3: Adding to collection...");
    const videoData = {
      originalUrl: decodedUrl,
      title: title || `Video from ${downloadResult.data.platform}`,
      platform: downloadResult.data.platform,
      iframeUrl: streamResult.iframeUrl,
      directUrl: streamResult.directUrl,
      guid: streamResult.guid,
      thumbnailUrl: streamResult.thumbnailUrl || downloadResult.data.thumbnailUrl,
      caption: downloadResult.data.additionalMetadata?.caption || downloadResult.data.additionalMetadata?.description || "",
      hashtags: downloadResult.data.additionalMetadata?.hashtags || [],
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
    console.log("🎙️ [INTERNAL_VIDEO] Step 4: Starting background transcription...");
    startBackgroundTranscription(
      baseUrl,
      downloadResult.data.videoData,
      addResult.videoId,
      collectionId || "all-videos",
      downloadResult.data.platform,
      downloadResult.data.additionalMetadata || {},
      scrapedData, // Pass scraped data for URL-based transcription
      streamResult, // Pass stream result to use Bunny CDN URL
    );

    console.log("✅ [INTERNAL_VIDEO] Complete internal workflow successful!");

    return NextResponse.json({
      success: true,
      videoId: addResult.videoId,
      iframe: streamResult.iframeUrl,
      directUrl: streamResult.directUrl,
      platform: downloadResult.data.platform,
      transcriptionStatus: "processing",
      message: "Video added successfully via internal processing. Transcription in progress.",
    });
  } catch (error) {
    console.error("❌ [INTERNAL_VIDEO] Internal workflow error:", error);
    return NextResponse.json(
      {
        error: "Internal video processing failed",
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
    console.log("🔄 [INTERNAL_VIDEO] Calling downloader service...");

    const response = await fetch(`${baseUrl}/api/video/downloader`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [INTERNAL_VIDEO] Download failed:", response.status, errorText);
      return { success: false, error: `Download failed: ${errorText}` };
    }

    const data = await response.json();
    console.log("✅ [INTERNAL_VIDEO] Download successful");
    return { success: true, data };
  } catch (error) {
    console.error("❌ [INTERNAL_VIDEO] Download error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Download failed" };
  }
}

async function streamToBunny(downloadData: any) {
  try {
    console.log("🐰 [INTERNAL_VIDEO] Streaming to Bunny CDN...");

    const buffer = Buffer.from(downloadData.videoData.buffer);
    const filename = downloadData.videoData.filename || `${downloadData.platform}-video.mp4`;
    const mimeType = downloadData.videoData.mimeType || "video/mp4";

    console.log("🔍 [INTERNAL_VIDEO] Buffer info:", {
      bufferSize: buffer.length,
      filename,
      mimeType,
    });

    const result = await uploadToBunnyStream(buffer, filename, mimeType);

    console.log("🔍 [INTERNAL_VIDEO] Upload result:", result);

    if (!result) {
      console.error("❌ [INTERNAL_VIDEO] Bunny stream failed - null result");
      return { success: false, error: "Failed to upload to Bunny CDN" };
    }

    console.log("✅ [INTERNAL_VIDEO] Bunny stream successful:", result.cdnUrl);

    // Generate Bunny CDN thumbnail URL using the video ID
    const thumbnailUrl = generateBunnyThumbnailUrl(result.filename);

    const returnValue = {
      success: true,
      iframeUrl: result.cdnUrl,
      directUrl: result.cdnUrl,
      guid: result.filename, // This is actually the GUID
      thumbnailUrl,
    };

    console.log("🔍 [INTERNAL_VIDEO] Returning:", returnValue);
    return returnValue;
  } catch (error) {
    console.error("❌ [INTERNAL_VIDEO] Bunny stream error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Bunny stream failed" };
  }
}

async function addVideoToCollection(collectionId: string, videoData: any) {
  try {
    console.log("💾 [INTERNAL_VIDEO] Adding video to Firestore collection...");

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

    console.log("✅ [INTERNAL_VIDEO] Video added to collection:", videoRef.id);
    return { success: true, videoId: videoRef.id };
  } catch (error) {
    console.error("❌ [INTERNAL_VIDEO] Firestore error:", error);
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
  scrapedData: any = null,
  streamResult: any = null,
) {
  // Use setTimeout to ensure response is sent before starting background work
  setTimeout(async () => {
    let hasCompleted = false;

    // Set a timeout to prevent infinite processing
    const timeoutId = setTimeout(
      () => {
        if (!hasCompleted) {
          console.error("⏱️ [INTERNAL_BACKGROUND] Transcription timeout after 5 minutes for video:", videoId);
          updateVideoTranscriptionStatus(videoId, "failed").catch(console.error);
        }
      },
      5 * 60 * 1000,
    ); // 5 minute timeout

    try {
      console.log("🎙️ [INTERNAL_BACKGROUND] Starting transcription for video:", videoId);

      console.log("🎙️ [INTERNAL_BACKGROUND] Attempting transcription...");
      
      let response;
      
      if (videoData && videoData.buffer) {
        // Use buffer-based transcription (no re-download needed!)
        console.log("📁 [INTERNAL_BACKGROUND] Using buffer-based transcription with original video data");
        
        response = await fetch(`${baseUrl}/api/internal/video/transcribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          },
          body: JSON.stringify({
            videoBuffer: Array.from(new Uint8Array(videoData.buffer)),
            platform: platform,
            useBuffer: true
          }),
        });
      } else if (scrapedData) {
        // For scraped data without buffer, use original URL for transcription
        console.log("📁 [INTERNAL_BACKGROUND] Scraped data detected, using original URL for transcription");
        console.log("🔗 [INTERNAL_BACKGROUND] Original URL:", additionalMetadata?.originalUrl);
        
        const originalUrl = additionalMetadata?.originalUrl;
        if (originalUrl) {
          response = await fetch(`${baseUrl}/api/internal/video/transcribe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
            },
            body: JSON.stringify({
              videoUrl: originalUrl,
              platform: platform,
            }),
          });
        } else {
          console.log("⚠️ [INTERNAL_BACKGROUND] No original URL available for transcription");
          response = null;
        }
      } else {
        // Try URL-based transcription with direct MP4 URL
        const bunnyVideoUrl = streamResult?.directUrl || streamResult?.iframeUrl;
        
        if (bunnyVideoUrl) {
          console.log("🌐 [INTERNAL_BACKGROUND] Using URL-based transcription with direct MP4 URL");
          console.log("🔗 [INTERNAL_BACKGROUND] Transcription URL:", bunnyVideoUrl);
          
          response = await fetch(`${baseUrl}/api/internal/video/transcribe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
            },
            body: JSON.stringify({
              videoUrl: bunnyVideoUrl,
              videoId: videoId,
              collectionId: collectionId,
              useDirectUrl: true, // Use direct URL processing instead of downloading
              platform: platform,
            }),
          });
        } else {
          console.log("⚠️ [INTERNAL_BACKGROUND] No video URL available - using metadata for transcription");
          
          // Fallback to metadata-based transcription
          const contentDescription = additionalMetadata?.description || scrapedData?.description || "";
          const videoCaption = scrapedData?.title || additionalMetadata?.title || "";
          const combinedContent = [videoCaption, contentDescription].filter(Boolean).join(". ");
          
          // Mark transcription as completed using existing content
          await updateVideoTranscription(videoId, {
            transcript: combinedContent || "Video content processed successfully",
            components: {
              hook: videoCaption || "Engaging video content",
              bridge: "Social media video", 
              nugget: contentDescription || "Video ready for viewing",
              wta: "Check video for full content"
            },
            contentMetadata: {
              platform,
              author: additionalMetadata?.author ?? scrapedData?.author ?? "Unknown",
              description: contentDescription,
              source: "social_media",
              hashtags: additionalMetadata?.hashtags ?? scrapedData?.hashtags ?? [],
            },
            visualContext: `${platform} video processed successfully`,
          });
          
          hasCompleted = true;
          clearTimeout(timeoutId);
          return;
        }
      }

      if (!response) {
        console.error("❌ [INTERNAL_BACKGROUND] No transcription response received");
        await updateVideoTranscriptionStatus(videoId, "failed");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [INTERNAL_BACKGROUND] Transcription failed:", response.status, errorText);
        await updateVideoTranscriptionStatus(videoId, "failed");
        return; // Exit immediately on failure - no retry
      }

      const { transcript } = await response.json();
      console.log("✅ [INTERNAL_BACKGROUND] Transcription completed");

      if (!transcript) {
        console.error("❌ [INTERNAL_BACKGROUND] No transcript returned – aborting analysis");
        await updateVideoTranscriptionStatus(videoId, "failed");
        return;
      }

      // 🔍 Analyze script to extract Hook / Bridge / Nugget / WTA components
      const analysisRes = await fetch(`${baseUrl}/api/video/analyze-script`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
        },
        body: JSON.stringify({ transcript }),
      });

      let components = { hook: "", bridge: "", nugget: "", wta: "" } as any;
      if (analysisRes.ok) {
        const analysisJson = await analysisRes.json();
        components = analysisJson.components ?? components;
        console.log("✅ [INTERNAL_BACKGROUND] Script analysis succeeded – components extracted");
      } else {
        console.error("⚠️ [INTERNAL_BACKGROUND] Script analysis failed – using empty components");
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
      console.log("📡 [INTERNAL_BACKGROUND] Transcription + analysis ready for video:", videoId);

      // Mark as completed and clear timeout
      hasCompleted = true;
      clearTimeout(timeoutId);
    } catch (error) {
      console.error("❌ [INTERNAL_BACKGROUND] Transcription error:", error);
      hasCompleted = true;
      clearTimeout(timeoutId);
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

    console.log("✅ [INTERNAL_BACKGROUND] Video transcription updated:", videoId);
  } catch (error) {
    console.error("❌ [INTERNAL_BACKGROUND] Failed to update transcription:", error);
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
    console.error("❌ [INTERNAL_BACKGROUND] Failed to update transcription status:", error);
  }
}
