// Internal transcription endpoint - bypasses user authentication for background processing
import fs from "fs";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

import { detectPlatform } from "@/core/video/platform-detector";
import { VideoTranscriber } from "@/core/video/transcriber";

// Function to transcribe video from URL using Gemini with proper file upload
async function transcribeVideoFromUrl(url: string, platform: "tiktok" | "instagram" | "youtube" | "unknown") {
  let tempFilePath: string | null = null;
  let uploadedFile: any = null;

  try {
    console.log("🌐 [GEMINI] Starting video transcription from URL:", url);

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ [GEMINI] GEMINI_API_KEY not configured in environment variables");
      return null;
    }

    // Step 1: Download video from URL
    console.log("⬇️ [GEMINI] Downloading video from CDN...");
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
    }

    const videoBuffer = await response.arrayBuffer();
    console.log(`📦 [GEMINI] Video downloaded: ${videoBuffer.byteLength} bytes`);

    // Step 2: Save to temporary file
    const tempDir = "/tmp";
    const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 11)}.mp4`;
    tempFilePath = path.join(tempDir, fileName);

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(tempFilePath, Buffer.from(videoBuffer));
    console.log(`💾 [GEMINI] Video saved to temp file: ${tempFilePath}`);

    // Step 3: Upload to Gemini Files API
    console.log("📤 [GEMINI] Uploading video to Gemini Files API...");
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: "video/mp4",
      displayName: `${platform}-video-${Date.now()}`,
    });

    uploadedFile = uploadResult.file;
    console.log(`✅ [GEMINI] Video uploaded successfully: ${uploadedFile.uri}`);

    // Step 4: Wait for processing if needed
    let file = uploadedFile;
    while (file.state === "PROCESSING") {
      console.log("⏳ [GEMINI] Waiting for video processing...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(file.name);
    }

    if (file.state === "FAILED") {
      throw new Error("Video processing failed on Gemini side");
    }

    console.log("🎬 [GEMINI] Video processing completed, starting transcription...");

    // Step 5: Transcribe using the uploaded file
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
          fileUri: file.uri, // Use the Google-hosted URI
          mimeType: file.mimeType,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    console.log("📄 [GEMINI] Received transcription response");

    // Parse the JSON response
    let parsedResponse;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ?? responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : responseText;
      parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("❌ [GEMINI] Failed to parse JSON response:", parseError);
      console.log("📄 [GEMINI] Raw response:", responseText);

      // Fallback: return basic transcription
      return {
        success: true,
        transcript: responseText,
        platform: platform,
        components: { hook: "", bridge: "", nugget: "", wta: "" },
        contentMetadata: {
          platform: platform,
          author: "Unknown",
          description: "Video transcribed successfully",
          source: "gemini_file_upload",
          hashtags: [],
        },
        visualContext: "",
        transcriptionMetadata: {
          method: "gemini_file_upload",
          fileSize: videoBuffer.byteLength,
          fileName: `${platform}-file-upload`,
          processedAt: new Date().toISOString(),
        },
      };
    }

    console.log("✅ [GEMINI] Transcription completed successfully");

    return {
      success: true,
      transcript: parsedResponse.transcript ?? "",
      platform: platform,
      components: parsedResponse.components ?? { hook: "", bridge: "", nugget: "", wta: "" },
      contentMetadata: {
        platform: platform,
        author: parsedResponse.contentMetadata?.author ?? "Unknown",
        description: parsedResponse.contentMetadata?.description ?? "",
        source: "gemini_file_upload",
        hashtags: parsedResponse.contentMetadata?.hashtags ?? [],
      },
      visualContext: parsedResponse.visualContext ?? "",
      transcriptionMetadata: {
        method: "gemini_file_upload",
        fileSize: videoBuffer.byteLength,
        fileName: `${platform}-file-upload`,
        processedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("❌ [GEMINI] Video transcription failed:", error);
    if (error instanceof Error) {
      console.error("📄 [GEMINI] Error details:", error.message);
    }
    return null;
  } finally {
    // Cleanup: Delete temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlinkSync(tempFilePath);
        console.log("🗑️ [GEMINI] Temporary file cleaned up");
      } catch (cleanupError) {
        console.error("⚠️ [GEMINI] Failed to cleanup temp file:", cleanupError);
      }
    }

    // Cleanup: Delete uploaded file from Gemini
    if (uploadedFile) {
      try {
        const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
        await fileManager.deleteFile(uploadedFile.name);
        console.log("🗑️ [GEMINI] Uploaded file cleaned up from Gemini");
      } catch (cleanupError) {
        console.error("⚠️ [GEMINI] Failed to cleanup uploaded file:", cleanupError);
      }
    }
  }
}

// Function to transcribe by downloading video first (legacy approach)
async function transcribeByDownload(url: string, platform: "tiktok" | "instagram" | "youtube" | "unknown") {
  try {
    console.log("⬇️ [DOWNLOAD] Downloading video from URL for transcription:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      console.error(`❌ [DOWNLOAD] Failed to fetch video: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log(`📦 [DOWNLOAD] Video downloaded: ${arrayBuffer.byteLength} bytes`);

    // Create VideoData object and use existing transcription logic
    const videoData = {
      buffer: arrayBuffer,
      size: arrayBuffer.byteLength,
      mimeType: "video/mp4",
      filename: `${platform}-${Date.now()}.mp4`,
    };

    const result = await VideoTranscriber.transcribe(videoData, platform);
    console.log("✅ [DOWNLOAD] Download-based transcription completed");
    return result;
  } catch (error) {
    console.error("❌ [DOWNLOAD] Download-based transcription failed:", error);
    return null;
  }
}

// Create fallback transcription when processing fails
function createFallbackTranscription(platform: "tiktok" | "instagram" | "youtube" | "unknown") {
  return {
    success: true,
    transcript:
      "Transcription temporarily unavailable. Video content analysis will be available once transcription service is configured.",
    platform: platform,
    components: {
      hook: "Video content analysis pending",
      bridge: "Transcription service configuration needed",
      nugget: "Main content insights will be available after transcription",
      wta: "Configure Gemini API key to enable full video analysis",
    },
    contentMetadata: {
      platform: platform,
      author: "Unknown",
      description: "Video added successfully - transcription pending service configuration",
      source: "other",
      hashtags: [],
    },
    visualContext: "Visual analysis will be available once transcription service is configured",
    transcriptionMetadata: {
      method: "fallback",
      fileSize: 0,
      fileName: "fallback-transcription",
      processedAt: new Date().toISOString(),
    },
  };
}

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

  const detectedPlatform = platform ?? detectPlatform(videoUrl).platform;

  // Always try direct URL transcription first
  console.log("🚀 [INTERNAL_TRANSCRIBE] Processing URL directly with Gemini...");
  const result = await transcribeVideoFromUrl(videoUrl, detectedPlatform);

  if (result) {
    console.log("✅ [INTERNAL_TRANSCRIBE] Direct URL transcription completed successfully");
    return NextResponse.json(result);
  }

  // Fallback to download-based transcription if direct URL fails
  console.log("⬇️ [INTERNAL_TRANSCRIBE] Direct URL failed, trying download-based transcription...");
  const downloadResult = await transcribeByDownload(videoUrl, detectedPlatform);

  if (!downloadResult) {
    console.log("🔄 [INTERNAL_TRANSCRIBE] Both methods failed, using fallback transcription");
    const fallbackResult = createFallbackTranscription(detectedPlatform);
    return NextResponse.json(fallbackResult);
  }

  console.log("✅ [INTERNAL_TRANSCRIBE] Download-based transcription completed successfully");
  return NextResponse.json({
    success: true,
    transcript: downloadResult.transcript,
    platform: downloadResult.platform,
    components: downloadResult.components,
    contentMetadata: downloadResult.contentMetadata,
    visualContext: downloadResult.visualContext,
    transcriptionMetadata: downloadResult.transcriptionMetadata,
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
