import { NextRequest, NextResponse } from "next/server";

import { UnifiedVideoScraper } from "@/lib/unified-video-scraper";

// Interface for the generation request
interface PersonaGenerationRequest {
  username: string;
  platform: "tiktok" | "instagram";
}

// Helper to create SSE response
function createSSEResponse(data: any): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  console.log("🎭 [PERSONA_GENERATION] Starting persona generation request");

  try {
    const body: PersonaGenerationRequest = await request.json();
    const { username, platform } = body;

    // Validation
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    if (platform === "instagram") {
      return NextResponse.json({ error: "Instagram support is not yet available" }, { status: 400 });
    }

    console.log(`🎯 [PERSONA_GENERATION] Generating persona for @${username} on ${platform}`);

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Fetch user feed
          controller.enqueue(
            encoder.encode(
              createSSEResponse({
                type: "progress",
                step: "fetching",
                progress: 20,
                message: `Fetching videos from @${username}...`,
              }),
            ),
          );

          const feedResponse = await fetch(
            `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/tiktok/user-feed`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, count: 10 }), // Fetch 10 videos for analysis
            },
          );

          if (!feedResponse.ok) {
            throw new Error(`Failed to fetch user feed: ${feedResponse.statusText}`);
          }

          const feedData = await feedResponse.json();

          if (!feedData.success || !feedData.videos || feedData.videos.length === 0) {
            throw new Error("No videos found for this user");
          }

          console.log(`✅ [PERSONA_GENERATION] Fetched ${feedData.videos.length} videos`);

          // Step 2: Process videos for transcription
          controller.enqueue(
            encoder.encode(
              createSSEResponse({
                type: "progress",
                step: "transcribing",
                progress: 40,
                message: "Transcribing video content...",
                totalVideos: feedData.videos.length,
                videosProcessed: 0,
              }),
            ),
          );

          const videoUrls = feedData.videos.map((video: any) => {
            // Construct TikTok URL from video ID
            const videoId = video.id;
            const authorUsername = video.author?.username ?? username;
            return `https://www.tiktok.com/@${authorUsername}/video/${videoId}`;
          });

          const scraper = new UnifiedVideoScraper();
          const transcriptions = [];
          let processedCount = 0;

          // Process videos in batches of 3 to avoid overwhelming the API
          for (let i = 0; i < videoUrls.length; i += 3) {
            const batch = videoUrls.slice(i, Math.min(i + 3, videoUrls.length));

            const batchPromises = batch.map(async (url: string) => {
              try {
                console.log(`🎬 [PERSONA_GENERATION] Processing video: ${url}`);
                const videoData = await scraper.scrapeUrl(url);

                // Get transcription if available
                if (videoData.transcription?.text) {
                  return {
                    url,
                    transcription: videoData.transcription.text,
                    description: videoData.description ?? "",
                    hashtags: videoData.hashtags ?? [],
                  };
                } else if (videoData.description) {
                  // Use description as fallback if no transcription
                  return {
                    url,
                    transcription: videoData.description,
                    description: videoData.description,
                    hashtags: videoData.hashtags ?? [],
                  };
                }
                return null;
              } catch (error) {
                console.error(`❌ [PERSONA_GENERATION] Failed to process video ${url}:`, error);
                return null;
              }
            });

            const batchResults = await Promise.allSettled(batchPromises);

            for (const result of batchResults) {
              if (result.status === "fulfilled" && result.value) {
                transcriptions.push(result.value);
                processedCount++;

                // Send progress update
                controller.enqueue(
                  encoder.encode(
                    createSSEResponse({
                      type: "progress",
                      step: "transcribing",
                      progress: 40 + (processedCount / videoUrls.length) * 30,
                      message: "Transcribing video content...",
                      totalVideos: videoUrls.length,
                      videosProcessed: processedCount,
                    }),
                  ),
                );
              }
            }

            // Add a small delay between batches to avoid rate limiting
            if (i + 3 < videoUrls.length) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          if (transcriptions.length === 0) {
            throw new Error("Failed to transcribe any videos");
          }

          console.log(`✅ [PERSONA_GENERATION] Transcribed ${transcriptions.length} videos`);

          // Step 3: Analyze voice patterns
          controller.enqueue(
            encoder.encode(
              createSSEResponse({
                type: "progress",
                step: "analyzing",
                progress: 80,
                message: "Analyzing voice patterns and style...",
              }),
            ),
          );

          // Combine all transcriptions for analysis
          const combinedTranscript = transcriptions.map((t) => t.transcription).join("\n\n---\n\n");

          // Read the analysis prompt
          const fs = await import("fs/promises");
          const path = await import("path");
          const promptPath = path.join(process.cwd(), "src/lib/prompts/Analyze");
          const analysisPrompt = await fs.readFile(promptPath, "utf-8");

          // Call OpenAI for deep analysis
          const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4-turbo-preview",
              messages: [
                {
                  role: "system",
                  content: analysisPrompt,
                },
                {
                  role: "user",
                  content: `Analyze this creator's content and generate a comprehensive voice profile:\n\n${combinedTranscript}`,
                },
              ],
              temperature: 0.7,
              max_tokens: 4000,
            }),
          });

          if (!openaiResponse.ok) {
            throw new Error("Failed to analyze voice patterns");
          }

          const analysisData = await openaiResponse.json();
          const voiceProfile = analysisData.choices[0].message.content;

          console.log("✅ [PERSONA_GENERATION] Voice analysis complete");

          // Step 4: Create persona profile
          const personaProfile = {
            personaId: `persona_${username}_${Date.now()}`,
            username,
            platform,
            name: feedData.userInfo?.nickname ?? username,
            initials: (feedData.userInfo?.nickname ?? username)
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            followers: feedData.userInfo?.stats?.followerCount
              ? `${(feedData.userInfo.stats.followerCount / 1000).toFixed(1)}K`
              : "0",
            avatar: feedData.userInfo?.avatar ?? null,
            voiceProfile,
            createdAt: new Date().toISOString(),
            metadata: {
              videosAnalyzed: transcriptions.length,
              totalVideosFound: feedData.videos.length,
              analysisDate: new Date().toISOString(),
            },
          };

          // Send completion
          controller.enqueue(
            encoder.encode(
              createSSEResponse({
                type: "complete",
                persona: personaProfile,
              }),
            ),
          );

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("❌ [PERSONA_GENERATION] Generation error:", error);

          controller.enqueue(
            encoder.encode(
              createSSEResponse({
                type: "error",
                message: error instanceof Error ? error.message : "Failed to generate persona",
              }),
            ),
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("❌ [PERSONA_GENERATION] Request error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate persona",
      },
      { status: 500 },
    );
  }
}
