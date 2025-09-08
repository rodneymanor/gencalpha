// Internal transcription endpoint - bypasses user authentication for background processing
import fs from "fs";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

import { detectPlatform } from "@/core/video/platform-detector";

// File upload and processing limits
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
const TRANSCRIPTION_TIMEOUT = 7 * 60 * 1000; // 7 minutes in milliseconds

// Helper function to add timeout to any async operation
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation '${operation}' timed out after ${timeoutMs / 1000} seconds`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// Function to transcribe video from URL using Gemini with proper file upload
async function transcribeVideoFromUrlInternal(url: string, platform: "tiktok" | "instagram" | "youtube" | "unknown") {
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

    // Check file size limit
    if (videoBuffer.byteLength > MAX_FILE_SIZE) {
      throw new Error(
        `Video file too large: ${(videoBuffer.byteLength / 1024 / 1024).toFixed(2)}MB exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      );
    }

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
      displayName: `test-video-${Date.now()}`,
    });

    uploadedFile = uploadResult.file;
    console.log(`✅ [GEMINI] Video uploaded successfully: ${uploadedFile.uri}`);
    console.log(
      `🔍 [GEMINI] File state: ${uploadedFile.state}, MIME: ${uploadedFile.mimeType}, Size: ${uploadedFile.sizeBytes} bytes`,
    );

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
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
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

// Wrapper function that adds timeout to URL transcription
async function transcribeVideoFromUrl(url: string, platform: "tiktok" | "instagram" | "youtube" | "unknown") {
  console.log(
    `⏱️ [TRANSCRIBE_LIMITS] Starting transcription with ${TRANSCRIPTION_TIMEOUT / 1000}s timeout and ${MAX_FILE_SIZE / 1024 / 1024}MB size limit`,
  );

  return withTimeout(
    transcribeVideoFromUrlInternal(url, platform),
    TRANSCRIPTION_TIMEOUT,
    "video transcription from URL",
  );
}

// Buffer transcription function that reuses the existing upload logic
async function transcribeVideoFromBufferInternal(
  videoBuffer: ArrayBuffer,
  platform: "tiktok" | "instagram" | "youtube" | "unknown",
) {
  let tempFilePath: string | null = null;
  let uploadedFile: any = null;

  try {
    console.log("🌐 [GEMINI] Starting video transcription from buffer data");
    console.log(`📦 [GEMINI] Video buffer size: ${videoBuffer.byteLength} bytes`);

    // Check file size limit
    if (videoBuffer.byteLength > MAX_FILE_SIZE) {
      throw new Error(
        `Video buffer too large: ${(videoBuffer.byteLength / 1024 / 1024).toFixed(2)}MB exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ [GEMINI] GEMINI_API_KEY not configured in environment variables");
      return null;
    }

    // Step 1: Save buffer to temporary file
    const tempDir = "/tmp";
    const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 11)}.mp4`;
    tempFilePath = path.join(tempDir, fileName);

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(tempFilePath, Buffer.from(videoBuffer));
    console.log(`💾 [GEMINI] Video saved to temp file: ${tempFilePath}`);

    // Step 2: Upload to Gemini Files API
    console.log("📤 [GEMINI] Uploading video to Gemini Files API...");
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: "video/mp4",
      displayName: `buffer-video-${Date.now()}`,
    });

    uploadedFile = uploadResult.file;
    console.log(`✅ [GEMINI] Video uploaded successfully: ${uploadedFile.uri}`);

    // Step 3: Wait for processing if needed
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

    // Step 4: Transcribe using the uploaded file
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
          source: "gemini_buffer_upload",
          hashtags: [],
        },
        visualContext: "",
        transcriptionMetadata: {
          method: "gemini_buffer_upload",
          fileSize: videoBuffer.byteLength,
          fileName: `${platform}-buffer-upload`,
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
        source: "gemini_buffer_upload",
        hashtags: parsedResponse.contentMetadata?.hashtags ?? [],
      },
      visualContext: parsedResponse.visualContext ?? "",
      transcriptionMetadata: {
        method: "gemini_buffer_upload",
        fileSize: videoBuffer.byteLength,
        fileName: `${platform}-buffer-upload`,
        processedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("❌ [GEMINI] Video transcription failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  } finally {
    // Cleanup: Delete temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
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

// Wrapper function that adds timeout to buffer transcription
async function transcribeVideoFromBuffer(
  videoBuffer: ArrayBuffer,
  platform: "tiktok" | "instagram" | "youtube" | "unknown",
) {
  console.log(
    `⏱️ [TRANSCRIBE_LIMITS] Starting buffer transcription with ${TRANSCRIPTION_TIMEOUT / 1000}s timeout and ${MAX_FILE_SIZE / 1024 / 1024}MB size limit`,
  );

  return withTimeout(
    transcribeVideoFromBufferInternal(videoBuffer, platform),
    TRANSCRIPTION_TIMEOUT,
    "video transcription from buffer",
  );
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
  const { videoUrl, platform, videoBuffer, useBuffer } = await request.json();

  // Prefer using video buffer data (no re-download needed!)
  if (useBuffer && videoBuffer) {
    console.log("🚀 [INTERNAL_TRANSCRIBE] Using provided video buffer (no re-download needed)");

    const detectedPlatform = platform ?? "unknown";

    // Convert the buffer data back to ArrayBuffer and use buffer transcription
    const buffer = new Uint8Array(videoBuffer).buffer;

    // Early size validation before processing
    if (buffer.byteLength > MAX_FILE_SIZE) {
      console.error(
        `❌ [TRANSCRIBE_LIMITS] Buffer too large: ${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      );
      return NextResponse.json(
        {
          error: "File too large",
          details: `Video file size ${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        },
        { status: 413 },
      );
    }

    try {
      const result = await transcribeVideoFromBuffer(buffer, detectedPlatform);

      if (result) {
        console.log("✅ [INTERNAL_TRANSCRIBE] Buffer-based transcription completed successfully");
        return NextResponse.json(result);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("timed out")) {
        console.error(`⏰ [TRANSCRIBE_LIMITS] Transcription timed out after ${TRANSCRIPTION_TIMEOUT / 1000} seconds`);
        return NextResponse.json(
          {
            error: "Transcription timeout",
            details: `Transcription took longer than ${TRANSCRIPTION_TIMEOUT / 1000} seconds and was cancelled`,
          },
          { status: 408 },
        );
      }
      throw error; // Re-throw other errors
    }
  }

  // Fallback to URL-based transcription (less reliable due to Bunny.net URLs)
  if (videoUrl) {
    console.log("🌐 [INTERNAL_TRANSCRIBE] No buffer provided, falling back to URL download:", videoUrl);

    const detectedPlatform = platform ?? detectPlatform(videoUrl).platform;

    try {
      const result = await transcribeVideoFromUrl(videoUrl, detectedPlatform);

      if (result) {
        console.log("✅ [INTERNAL_TRANSCRIBE] URL-based transcription completed successfully");
        return NextResponse.json(result);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("timed out")) {
        console.error(
          `⏰ [TRANSCRIBE_LIMITS] URL transcription timed out after ${TRANSCRIPTION_TIMEOUT / 1000} seconds`,
        );
        return NextResponse.json(
          {
            error: "Transcription timeout",
            details: `Transcription took longer than ${TRANSCRIPTION_TIMEOUT / 1000} seconds and was cancelled`,
          },
          { status: 408 },
        );
      }
      if (error instanceof Error && error.message.includes("too large")) {
        console.error(`📏 [TRANSCRIBE_LIMITS] File size exceeded: ${error.message}`);
        return NextResponse.json(
          {
            error: "File too large",
            details: error.message,
          },
          { status: 413 },
        );
      }
      throw error; // Re-throw other errors
    }
  }

  if (!videoUrl && !videoBuffer) {
    return NextResponse.json({ error: "No video URL or buffer provided" }, { status: 400 });
  }

  // If all methods fail, use fallback
  console.log("⚠️ [INTERNAL_TRANSCRIBE] All transcription methods failed, using fallback");
  const detectedPlatform = platform ?? "unknown";
  const fallbackResult = createFallbackTranscription(detectedPlatform);
  return NextResponse.json(fallbackResult);
}

async function handleFileTranscription(request: NextRequest) {
  return NextResponse.json({ error: "File upload transcription not implemented yet" }, { status: 501 });
}
