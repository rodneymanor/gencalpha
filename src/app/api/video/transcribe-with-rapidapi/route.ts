import { NextRequest, NextResponse } from "next/server";
import { scrapeVideoUrl } from "@/lib/unified-video-scraper";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

interface TranscriptionRequest {
  rapidApiVideoData: {
    itemId?: string;
    description?: string;
    duration?: number;
    url?: string; // CDN URL from RapidAPI
    views?: number;
    likes?: number;
    platform?: string;
  };
  originalUrl?: string; // Original TikTok/Instagram URL for fallback
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
  approach?: string; // Which approach was used
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

// Try to download video using RapidAPI CDN URL with enhanced TikTok headers
async function downloadFromRapidApiUrl(
  url: string,
): Promise<{ success: boolean; buffer?: ArrayBuffer; error?: string }> {
  console.log("⬇️ [RAPIDAPI_TRANSCRIBE] Attempting download from RapidAPI CDN URL:", url);
  
  const parsed = new URL(url);
  const isTikTok = parsed.hostname.includes('tiktok');
  
  const headers: Record<string, string> = {
    "User-Agent": "TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "sec-fetch-dest": "video",
    "sec-fetch-mode": "no-cors", 
    "sec-fetch-site": "same-site",
  };
  
  if (isTikTok) {
    headers["Referer"] = "https://www.tiktok.com/";
    headers["Origin"] = "https://www.tiktok.com";
    // Use a more realistic mobile user agent for better success
    headers["User-Agent"] = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1";
  }

  try {
    // Try without cookies first (faster)
    const response = await fetch(url, { 
      headers, 
      redirect: 'follow' as RequestRedirect,
      cache: 'no-store' as RequestCache
    });
    
    if (!response.ok) {
      console.warn(`⚠️ [RAPIDAPI_TRANSCRIBE] CDN URL failed: ${response.status} ${response.statusText}`);
      return { success: false, error: `CDN URL failed: ${response.status} ${response.statusText}` };
    }

    const buffer = await response.arrayBuffer();
    console.log(`✅ [RAPIDAPI_TRANSCRIBE] Downloaded ${buffer.byteLength} bytes from CDN URL`);

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (buffer.byteLength > maxSize) {
      return { success: false, error: `Video file too large: ${buffer.byteLength} bytes (max ${maxSize} bytes)` };
    }

    return { success: true, buffer };
  } catch (error) {
    console.error("❌ [RAPIDAPI_TRANSCRIBE] CDN download failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "CDN download failed",
    };
  }
}

// Try to reconstruct original TikTok URL from itemId for fallback
function reconstructTikTokUrl(itemId: string): string | null {
  if (!itemId || !/^\d+$/.test(itemId)) {
    return null;
  }
  
  // Standard TikTok URL format: https://www.tiktok.com/@placeholder/video/{itemId}
  // We use a generic username since we don't have the actual author username
  return `https://www.tiktok.com/@user/video/${itemId}`;
}

// Fallback to unified video scraper if CDN URL fails
async function downloadFromUnifiedScraper(
  originalUrl: string | null,
  itemId?: string,
): Promise<{ success: boolean; buffer?: ArrayBuffer; error?: string }> {
  let urlToTry = originalUrl;
  
  // If no original URL provided, try to reconstruct from itemId
  if (!urlToTry && itemId) {
    urlToTry = reconstructTikTokUrl(itemId);
    if (urlToTry) {
      console.log("🔧 [RAPIDAPI_TRANSCRIBE] Reconstructed TikTok URL from itemId:", urlToTry);
    }
  }
  
  if (!urlToTry) {
    return {
      success: false,
      error: "No original URL provided and cannot reconstruct from itemId",
    };
  }
  
  console.log("🔄 [RAPIDAPI_TRANSCRIBE] Falling back to unified video scraper for:", urlToTry);
  
  try {
    const scrapedData = await scrapeVideoUrl(urlToTry);
    
    if (!scrapedData.success || !scrapedData.data?.videoData?.buffer) {
      return { 
        success: false, 
        error: scrapedData.error || "Failed to scrape video from original URL" 
      };
    }

    const buffer = Buffer.from(scrapedData.data.videoData.buffer);
    console.log(`✅ [RAPIDAPI_TRANSCRIBE] Downloaded ${buffer.byteLength} bytes via unified scraper`);
    
    return { success: true, buffer: buffer.buffer };
  } catch (error) {
    console.error("❌ [RAPIDAPI_TRANSCRIBE] Unified scraper failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unified scraper failed",
    };
  }
}

// Transcribe video using Gemini
async function transcribeVideo(videoBuffer: ArrayBuffer, requestId: string): Promise<TranscriptionResponse> {
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
  console.log(`🚀 [${requestId}] Starting RapidAPI video transcription`);

  try {
    const body: TranscriptionRequest = await request.json();
    const { rapidApiVideoData, originalUrl } = body;

    if (!rapidApiVideoData?.url && !originalUrl && !rapidApiVideoData?.itemId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Either RapidAPI video data with CDN URL, original URL, or itemId is required" 
        } satisfies TranscriptionResponse,
        { status: 400 },
      );
    }

    // Validate environment
    if (!process.env.GEMINI_API_KEY) {
      console.error(`❌ [${requestId}] Missing GEMINI_API_KEY`);
      return NextResponse.json(
        { success: false, error: "Server configuration incomplete" } satisfies TranscriptionResponse,
        { status: 500 },
      );
    }

    let downloadResult: { success: boolean; buffer?: ArrayBuffer; error?: string };
    let approachUsed = "unknown";

    // Approach 1: Try RapidAPI CDN URL first
    if (rapidApiVideoData?.url) {
      console.log(`📹 [${requestId}] Attempting RapidAPI CDN URL approach`);
      downloadResult = await downloadFromRapidApiUrl(rapidApiVideoData.url);
      if (downloadResult.success) {
        approachUsed = "rapidapi_cdn";
      }
    }

    // Approach 2: Fallback to unified video scraper if CDN fails
    if (!downloadResult || !downloadResult.success) {
      console.log(`📹 [${requestId}] Falling back to unified video scraper approach`);
      downloadResult = await downloadFromUnifiedScraper(originalUrl, rapidApiVideoData?.itemId);
      if (downloadResult.success) {
        approachUsed = "unified_scraper";
      }
    }

    if (!downloadResult || !downloadResult.success || !downloadResult.buffer) {
      console.error(`❌ [${requestId}] All download approaches failed:`, downloadResult?.error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to download video",
          details: downloadResult?.error || "All download approaches failed",
          approach: approachUsed,
        } satisfies TranscriptionResponse,
        { status: 400 },
      );
    }

    console.log(`✅ [${requestId}] Video downloaded successfully via ${approachUsed}: ${downloadResult.buffer.byteLength} bytes`);

    // Step 2: Transcribe video
    const transcriptionResult = await transcribeVideo(downloadResult.buffer, requestId);

    if (!transcriptionResult.success) {
      console.error(`❌ [${requestId}] Transcription failed:`, transcriptionResult.error);
      return NextResponse.json({
        ...transcriptionResult,
        approach: approachUsed,
      }, { status: 500 });
    }

    console.log(`🎉 [${requestId}] Transcription completed successfully via ${approachUsed}`);
    return NextResponse.json({
      ...transcriptionResult,
      approach: approachUsed,
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Unexpected error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      } satisfies TranscriptionResponse,
      { status: 500 },
    );
  }
}
