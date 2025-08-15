import fs from "fs";
import { NextRequest, NextResponse } from "next/server";

import { uploadToBunnyStream, generateBunnyThumbnailUrl, uploadBunnyThumbnailWithRetry } from "@/lib/bunny-stream";
import { scrapeVideoUrl, UnifiedVideoScraper } from "@/lib/unified-video-scraper";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import path from "path";

// Environment variables validation
interface RequiredEnvVars {
  RAPIDAPI_KEY?: string;
  BUNNY_STREAM_API_KEY?: string;
  BUNNY_STREAM_LIBRARY_ID?: string;
  GEMINI_API_KEY?: string;
}

function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const requiredVars: Array<keyof RequiredEnvVars> = [
    "RAPIDAPI_KEY",
    "BUNNY_STREAM_API_KEY",
    "BUNNY_STREAM_LIBRARY_ID",
    "GEMINI_API_KEY",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Video processing workflow
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`🚀 [${requestId}] Starting consolidated video processing workflow at ${new Date().toISOString()}`);

  try {
    // Step 1: Environment validation
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.valid) {
      console.error(`❌ [${requestId}] Missing environment variables:`, envValidation.missing);
      return NextResponse.json(
        {
          error: "Server configuration incomplete",
          details: `Missing required environment variables: ${envValidation.missing.join(", ")}`,
        },
        { status: 500 },
      );
    }

    // Step 2: Request validation
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    // Step 3: URL validation
    const urlValidation = UnifiedVideoScraper.validateUrlWithMessage(videoUrl);
    if (!urlValidation.valid) {
      console.error(`❌ [${requestId}] Invalid URL:`, urlValidation.message);
      return NextResponse.json({ error: urlValidation.message }, { status: 400 });
    }

    console.log(`✅ [${requestId}] URL validated - Platform: ${urlValidation.platform}`);

    // Start background processing and return immediate response
    setTimeout(() => {
      processVideoWorkflow(requestId, videoUrl);
    }, 0);

    return NextResponse.json({
      success: true,
      message: "Video processing workflow started successfully",
      requestId,
      status: "processing",
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Request processing failed:`, error);
    return NextResponse.json(
      {
        error: "Failed to start video processing",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Main processing workflow (runs in background)
export async function processVideoWorkflow(requestId: string, videoUrl: string) {
  const startTime = Date.now();

  try {
    console.log(`🔄 [${requestId}] Step 1: Downloading and scraping video...`);

    // Step 1: Download and scrape video
    const videoData = await downloadAndScrapeVideo(videoUrl, requestId);
    if (!videoData.success || !videoData.videoBuffer) {
      console.error(`❌ [${requestId}] Download/scrape failed:`, videoData.error);
      return;
    }

    console.log(
      `✅ [${requestId}] Video downloaded - Platform: ${videoData.platform}, Size: ${videoData.videoBuffer.byteLength} bytes`,
    );

    // Step 2: Upload to Bunny CDN
    console.log(`🐰 [${requestId}] Step 2: Uploading to Bunny CDN...`);
    const cdnResult = await uploadToCDN(videoData, requestId);
    if (!cdnResult.success) {
      console.error(`❌ [${requestId}] CDN upload failed:`, cdnResult.error);
      return;
    }

    console.log(`✅ [${requestId}] CDN upload successful - URL: ${cdnResult.cdnUrl}`);

    // Step 3: Upload custom thumbnail if available
    if (videoData.thumbnailUrl && cdnResult.guid) {
      console.log(`🖼️ [${requestId}] Step 3: Uploading custom thumbnail...`);
      await uploadCustomThumbnail(cdnResult.guid, videoData.thumbnailUrl, requestId);
    }

    // Step 4: AI Transcription and Analysis
    console.log(`🎙️ [${requestId}] Step 4: Starting AI transcription...`);
    const transcriptionResult = await transcribeAndAnalyze(
      videoData.videoBuffer,
      videoData.platform || "unknown",
      requestId,

    if (!transcriptionResult.success) {
      console.error(
        `❌ [${requestId}] Transcription failed:`,
        "error" in transcriptionResult ? transcriptionResult.error : "Unknown error",
      );
      // Continue with fallback data
    }

    const processingTime = Date.now() - startTime;
    console.log(`🎉 [${requestId}] WORKFLOW COMPLETED SUCCESSFULLY in ${processingTime}ms`);

    // Log detailed transcription results
    if (transcriptionResult.success) {
      console.log(`📝 [${requestId}] TRANSCRIPTION RESULTS:`);
      console.log(`📝 [${requestId}] Transcript: "${transcriptionResult.transcript}"`);
      console.log(`📝 [${requestId}] Hook: "${transcriptionResult.components?.hook || "N/A"}"`);
      console.log(`📝 [${requestId}] Bridge: "${transcriptionResult.components?.bridge || "N/A"}"`);
      console.log(`📝 [${requestId}] Nugget: "${transcriptionResult.components?.nugget || "N/A"}"`);
      console.log(`📝 [${requestId}] WTA: "${transcriptionResult.components?.wta || "N/A"}"`);
      console.log(`📝 [${requestId}] Visual Context: "${transcriptionResult.visualContext || "N/A"}"`);
    } else {
      console.log(
        `❌ [${requestId}] TRANSCRIPTION FAILED: ${"error" in transcriptionResult ? transcriptionResult.error : "Unknown error"}`,
      );
    }

    // Return consolidated response
    const finalResult = {
      success: true,
      requestId,
      processingTime,
      videoData: {
        platform: videoData.platform,
        author: videoData.author,
        title: videoData.title,
        description: videoData.description,
        hashtags: videoData.hashtags,
        metrics: videoData.metrics,
      },
      cdnUrls: {
        iframe: cdnResult.cdnUrl,
        direct: cdnResult.cdnUrl,
        thumbnail: cdnResult.thumbnailUrl,
      },
      transcription: transcriptionResult.success
        ? {
            transcript: transcriptionResult.transcript,
            components: transcriptionResult.components,
            contentMetadata: transcriptionResult.contentMetadata,
            visualContext: transcriptionResult.visualContext,
          }
        : {
            transcript: "Transcription failed",
            components: { hook: "", bridge: "", nugget: "", wta: "" },
            contentMetadata: { platform: videoData.platform, author: videoData.author, description: "" },
            visualContext: "",
          },
    };

    console.log(`📄 [${requestId}] Final result prepared:`, {
      platform: finalResult.videoData.platform,
      cdnUrl: finalResult.cdnUrls.iframe,
      transcriptionSuccess: transcriptionResult.success,
    });

    return finalResult;
  } catch (error) {
    console.error(`❌ [${requestId}] Workflow failed:`, error);
  }
}

// Video download and scraping
async function downloadAndScrapeVideo(
  videoUrl: string,
  requestId: string,
): Promise<{
  success: boolean;
  error?: string;
  platform?: string;
  videoBuffer?: ArrayBuffer;
  title?: string;
  author?: string;
  description?: string;
  hashtags?: string[];
  metrics?: any;
  thumbnailUrl?: string;
}> {
  try {
    // Scrape video metadata and get download URL
    const videoData = await scrapeVideoUrl(videoUrl);

    if (!videoData.videoUrl) {
      return { success: false, error: "No video download URL found" };
    }

    // Download video buffer
    console.log(`⬇️ [${requestId}] Downloading video from:`, videoData.videoUrl);
    const response = await fetch(videoData.videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
    }

    const videoBuffer = await response.arrayBuffer();

    return {
      success: true,
      platform: videoData.platform,
      videoBuffer,
      title: videoData.title,
      author: videoData.author,
      description: videoData.description,
      hashtags: videoData.hashtags,
      metrics: videoData.metrics,
      thumbnailUrl: videoData.thumbnailUrl,
    };
  } catch (error) {
    console.error(`❌ [${requestId}] Download/scrape error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Download failed",
    };
  }
}

// Upload to Bunny CDN
async function uploadToCDN(videoData: any, requestId: string) {
  try {
    const buffer = Buffer.from(videoData.videoBuffer);
    const filename = `${videoData.platform}-${Date.now()}.mp4`;
    const mimeType = "video/mp4";

    console.log(`🔍 [${requestId}] Buffer info:`, {
      bufferSize: buffer.length,
      filename,
      mimeType,
    });

    const result = await uploadToBunnyStream(buffer, filename, mimeType);

    if (!result) {
      return { success: false, error: "Failed to upload to Bunny CDN" };
    }

    // Generate thumbnail URL
    const thumbnailUrl = generateBunnyThumbnailUrl(result.filename);

    return {
      success: true,
      cdnUrl: result.cdnUrl,
      guid: result.filename,
      thumbnailUrl,
    };
  } catch (error) {
    console.error(`❌ [${requestId}] CDN upload error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "CDN upload failed",
    };
  }
}

// Upload custom thumbnail
async function uploadCustomThumbnail(guid: string, thumbnailUrl: string, requestId: string) {
  try {
    console.log(`🖼️ [${requestId}] Uploading thumbnail:`, thumbnailUrl);

    const success = await uploadBunnyThumbnailWithRetry(guid, thumbnailUrl, 2);

    if (success) {
      console.log(`✅ [${requestId}] Custom thumbnail uploaded successfully`);
    } else {
      console.log(`⚠️ [${requestId}] Custom thumbnail upload failed, using default`);
    }
  } catch (error) {
    console.error(`❌ [${requestId}] Thumbnail upload error:`, error);
  }
}

// AI Transcription and Analysis
async function transcribeAndAnalyze(videoBuffer: ArrayBuffer, platform: string, requestId: string) {
  let tempFilePath: string | null = null;
  let uploadedFile: any = null;

  try {
    console.log(`🎙️ [${requestId}] Starting Gemini transcription...`);

    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY not configured" };
    }

    // Step 1: Save buffer to temporary file
    const tempDir = "/tmp";
    const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 11)}.mp4`;
    tempFilePath = path.join(tempDir, fileName);

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(tempFilePath, Buffer.from(videoBuffer));
    console.log(`💾 [${requestId}] Video saved to temp file: ${tempFilePath}`);

    // Step 2: Upload to Gemini Files API
    console.log(`📤 [${requestId}] Uploading to Gemini Files API...`);
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: "video/mp4",
      displayName: `process-video-${Date.now()}`,
    });

    uploadedFile = uploadResult.file;
    console.log(`✅ [${requestId}] Video uploaded to Gemini: ${uploadedFile.uri}`);

    // Step 3: Wait for processing
    let file = uploadedFile;
    while (file.state === "PROCESSING") {
      console.log(`⏳ [${requestId}] Waiting for Gemini video processing...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(file.name);
    }

    if (file.state === "FAILED") {
      throw new Error("Video processing failed on Gemini side");
    }

    console.log(`🎬 [${requestId}] Video processing completed, starting transcription...`);

    // Step 4: Transcribe and analyze
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Please analyze this video and provide:
1. A complete word-for-word transcription of all spoken content
2. Identify the following components in the script:
   - Hook: The opening line/statement that grabs attention
   - Bridge: The transition from hook to main content
   - Nugget: The main value/content/teaching point
   - WTA (What To Action): The call to action at the end

Return the response in this exact JSON format:
{
  "transcript": "full transcript here",
  "components": {
    "hook": "identified hook text",
    "bridge": "identified bridge text",
    "nugget": "identified nugget text",
    "wta": "identified call to action"
  },
  "contentMetadata": {
    "author": "speaker name if identifiable",
    "description": "brief content description",
    "hashtags": ["relevant", "hashtags"]
  },
  "visualContext": "brief description of visual elements"
}`;

    const result = await model.generateContent([
      {
        fileData: {
          fileUri: file.uri,
          mimeType: file.mimeType,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    console.log(`📄 [${requestId}] Received transcription response`);

    // Parse JSON response
    let parsedResponse;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ?? responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : responseText;
      parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse JSON response:`, parseError);

      // Fallback response
      return {
        success: true,
        transcript: responseText,
        components: { hook: "", bridge: "", nugget: "", wta: "" },
        contentMetadata: {
          platform: platform,
          author: "Unknown",
          description: "Video transcribed successfully",
        },
        visualContext: "",
      };
    }

    const transcriptionData = {
      success: true,
      transcript: parsedResponse.transcript ?? "",
      components: parsedResponse.components ?? { hook: "", bridge: "", nugget: "", wta: "" },
      contentMetadata: {
        platform: platform,
        author: parsedResponse.contentMetadata?.author ?? "Unknown",
        description: parsedResponse.contentMetadata?.description ?? "",
        hashtags: parsedResponse.contentMetadata?.hashtags ?? [],
      },
      visualContext: parsedResponse.visualContext ?? "",
    };

    console.log(`✅ [${requestId}] Transcription completed successfully`);
    console.log(`📋 [${requestId}] Transcript Length: ${transcriptionData.transcript.length} characters`);
    console.log(
      `📋 [${requestId}] Components Found: Hook=${!!transcriptionData.components.hook}, Bridge=${!!transcriptionData.components.bridge}, Nugget=${!!transcriptionData.components.nugget}, WTA=${!!transcriptionData.components.wta}`,
    );

    return transcriptionData;
  } catch (error) {
    console.error(`❌ [${requestId}] Transcription failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transcription failed",
    };
  } finally {
    // Cleanup: Delete temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`🗑️ [${requestId}] Temporary file cleaned up`);
      } catch (cleanupError) {
        console.error(`⚠️ [${requestId}] Failed to cleanup temp file:`, cleanupError);
      }
    }

    // Cleanup: Delete uploaded file from Gemini
    if (uploadedFile) {
      try {
        const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
        await fileManager.deleteFile(uploadedFile.name);
        console.log(`🗑️ [${requestId}] Uploaded file cleaned up from Gemini`);
      } catch (cleanupError) {
        console.error(`⚠️ [${requestId}] Failed to cleanup uploaded file:`, cleanupError);
      }
    }
  }
}
