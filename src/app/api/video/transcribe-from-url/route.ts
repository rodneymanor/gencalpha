import fs from "fs";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

interface TranscriptionRequest {
  videoUrl: string;
}

interface TranscriptionResponse {
  success: boolean;
  transcript?: string;
  components?: {
    hook: string;
    bridge: string;
    nugget: string;
    wta: string;
  };
  contentMetadata?: {
    platform: string;
    author: string;
    description: string;
    hashtags: string[];
  };
  visualContext?: string;
  error?: string;
  details?: string;
}

// Helper function to add timeout to any async operation
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation '${operation}' timed out after ${timeoutMs / 1000} seconds`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// Download video from CDN URL
async function downloadVideo(url: string): Promise<{ success: boolean; buffer?: ArrayBuffer; error?: string }> {
  try {
    console.log("⬇️ Downloading video from CDN:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    console.log(`✅ Video downloaded successfully: ${buffer.byteLength} bytes`);

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.byteLength > maxSize) {
      throw new Error(`Video file too large: ${buffer.byteLength} bytes (max ${maxSize} bytes)`);
    }

    return { success: true, buffer };
  } catch (error) {
    console.error("❌ Failed to download video:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to download video",
    };
  }
}

// Transcribe video using Gemini
async function transcribeVideo(
  videoBuffer: ArrayBuffer,
  requestId: string,
): Promise<TranscriptionResponse> {
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

    // Step 2: Upload to Gemini Files API with timeout
    console.log(`📤 [${requestId}] Uploading to Gemini Files API...`);
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    const uploadResult = await withTimeout(
      fileManager.uploadFile(tempFilePath, {
        mimeType: "video/mp4",
        displayName: `transcribe-video-${Date.now()}`,
      }),
      60000, // 60 second timeout
      "Gemini file upload",
    );

    uploadedFile = uploadResult.file;
    console.log(`✅ [${requestId}] Video uploaded to Gemini: ${uploadedFile.uri}`);

    // Step 3: Wait for processing with timeout
    let file = uploadedFile;
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes
    const startWait = Date.now();

    while (file.state === "PROCESSING") {
      if (Date.now() - startWait > maxWaitTime) {
        throw new Error("Video processing timeout - exceeded 5 minutes");
      }

      console.log(`⏳ [${requestId}] Waiting for Gemini video processing...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(file.name);
    }

    if (file.state === "FAILED") {
      throw new Error("Video processing failed on Gemini side");
    }

    console.log(`🎬 [${requestId}] Video processing completed, starting transcription...`);

    // Step 4: Transcribe with simplified prompt for faster processing
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Please transcribe this video and provide a complete word-for-word transcription of all spoken content. Focus on accuracy and completeness.

Return the response in this exact JSON format:
{
  "transcript": "full transcript here",
  "components": {
    "hook": "opening line that grabs attention",
    "bridge": "transition from hook to main content", 
    "nugget": "main value/content point",
    "wta": "call to action at the end"
  },
  "contentMetadata": {
    "author": "speaker name if identifiable",
    "description": "brief content description",
    "hashtags": ["relevant", "hashtags"]
  },
  "visualContext": "brief description of visual elements"
}`;

    const result = await withTimeout(
      model.generateContent([
        {
          fileData: {
            fileUri: file.uri,
            mimeType: file.mimeType,
          },
        },
        { text: prompt },
      ]),
      120000, // 2 minute timeout
      "Gemini transcription",
    );

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

      // Fallback response with raw transcript
      return {
        success: true,
        transcript: responseText,
        components: { hook: "", bridge: "", nugget: "", wta: "" },
        contentMetadata: {
          platform: "tiktok",
          author: "Unknown",
          description: "Video transcribed successfully",
          hashtags: [],
        },
        visualContext: "",
      };
    }

    const transcriptionData = {
      success: true,
      transcript: parsedResponse.transcript ?? "",
      components: parsedResponse.components ?? { hook: "", bridge: "", nugget: "", wta: "" },
      contentMetadata: {
        platform: "tiktok",
        author: parsedResponse.contentMetadata?.author ?? "Unknown",
        description: parsedResponse.contentMetadata?.description ?? "",
        hashtags: parsedResponse.contentMetadata?.hashtags ?? [],
      },
      visualContext: parsedResponse.visualContext ?? "",
    };

    console.log(`✅ [${requestId}] Transcription completed successfully`);
    console.log(`📋 [${requestId}] Transcript Length: ${transcriptionData.transcript.length} characters`);

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

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`🚀 [${requestId}] Starting video transcription from URL`);

  try {
    const body: TranscriptionRequest = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "Video URL is required" } satisfies TranscriptionResponse,
        { status: 400 }
      );
    }

    // Validate environment
    if (!process.env.GEMINI_API_KEY) {
      console.error(`❌ [${requestId}] Missing GEMINI_API_KEY`);
      return NextResponse.json(
        { success: false, error: "Server configuration incomplete" } satisfies TranscriptionResponse,
        { status: 500 }
      );
    }

    console.log(`📹 [${requestId}] Processing video URL: ${videoUrl}`);

    // Step 1: Download video from CDN
    const downloadResult = await downloadVideo(videoUrl);
    if (!downloadResult.success || !downloadResult.buffer) {
      console.error(`❌ [${requestId}] Download failed:`, downloadResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to download video",
          details: downloadResult.error,
        } satisfies TranscriptionResponse,
        { status: 400 }
      );
    }

    console.log(`✅ [${requestId}] Video downloaded successfully: ${downloadResult.buffer.byteLength} bytes`);

    // Step 2: Transcribe video
    const transcriptionResult = await transcribeVideo(downloadResult.buffer, requestId);

    if (!transcriptionResult.success) {
      console.error(`❌ [${requestId}] Transcription failed:`, transcriptionResult.error);
      return NextResponse.json(transcriptionResult, { status: 500 });
    }

    console.log(`🎉 [${requestId}] Transcription completed successfully`);
    return NextResponse.json(transcriptionResult);

  } catch (error) {
    console.error(`❌ [${requestId}] Unexpected error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      } satisfies TranscriptionResponse,
      { status: 500 }
    );
  }
}