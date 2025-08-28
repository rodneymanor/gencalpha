import { NextRequest, NextResponse } from "next/server";

import { UnifiedVideoScraper } from "@/lib/unified-video-scraper";

// Simple persona generation without OpenAI dependency
interface PersonaGenerationRequest {
  username: string;
  platform: "tiktok" | "instagram";
}

// Helper to create SSE response
function createSSEResponse(data: any): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Helper to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  console.log("🎭 [SIMPLE_PERSONA] Starting simplified persona generation");

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

    console.log(`🎯 [SIMPLE_PERSONA] Generating persona for @${username}`);

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Fetch user feed (limit to 5 videos for testing)
          controller.enqueue(
            encoder.encode(
              createSSEResponse({
                type: "progress",
                step: "fetching",
                progress: 10,
                message: `Fetching recent videos from @${username}...`,
              }),
            ),
          );

          const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

          const feedResponse = await fetch(`${baseUrl}/api/tiktok/user-feed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, count: 5 }), // Only fetch 5 videos
          });

          if (!feedResponse.ok) {
            const errorData = await feedResponse.json();
            throw new Error(errorData.error ?? `Failed to fetch user feed: ${feedResponse.statusText}`);
          }

          const feedData = await feedResponse.json();

          if (!feedData.success || !feedData.videos || feedData.videos.length === 0) {
            throw new Error("No videos found for this user. Please check the username.");
          }

          console.log(`✅ [SIMPLE_PERSONA] Fetched ${feedData.videos.length} videos`);

          // Step 2: Process videos ONE BY ONE with delays
          controller.enqueue(
            encoder.encode(
              createSSEResponse({
                type: "progress",
                step: "transcribing",
                progress: 30,
                message: "Processing video content...",
                totalVideos: feedData.videos.length,
                videosProcessed: 0,
              }),
            ),
          );

          const scraper = new UnifiedVideoScraper();
          const transcriptions = [];
          let processedCount = 0;

          // Process videos one by one with 2-second delay between each
          for (const video of feedData.videos) {
            try {
              // Construct TikTok URL from video data
              const videoId = video.id;
              const authorUsername = video.author?.username ?? username;
              const videoUrl = `https://www.tiktok.com/@${authorUsername}/video/${videoId}`;

              console.log(
                `🎬 [SIMPLE_PERSONA] Processing video ${processedCount + 1}/${feedData.videos.length}: ${videoUrl}`,
              );

              // Add delay before processing (except for first video)
              if (processedCount > 0) {
                await delay(2000); // 2 second delay between videos
              }

              const videoData = await scraper.scrapeUrl(videoUrl);

              // Extract content (transcription or description)
              let content = "";
              if (videoData.transcription?.text) {
                content = videoData.transcription.text;
              } else if (videoData.description) {
                content = videoData.description;
              }

              if (content) {
                transcriptions.push({
                  url: videoUrl,
                  content,
                  description: videoData.description ?? "",
                  hashtags: videoData.hashtags ?? [],
                  stats: {
                    views: video.stats?.playCount ?? 0,
                    likes: video.stats?.diggCount ?? 0,
                    comments: video.stats?.commentCount ?? 0,
                    shares: video.stats?.shareCount ?? 0,
                  },
                });
              }

              processedCount++;

              // Send progress update
              controller.enqueue(
                encoder.encode(
                  createSSEResponse({
                    type: "progress",
                    step: "transcribing",
                    progress: 30 + (processedCount / feedData.videos.length) * 40,
                    message: `Processing video ${processedCount} of ${feedData.videos.length}...`,
                    totalVideos: feedData.videos.length,
                    videosProcessed: processedCount,
                  }),
                ),
              );
            } catch (error) {
              console.error(`❌ [SIMPLE_PERSONA] Failed to process video:`, error);
              // Continue with next video instead of failing entirely
            }
          }

          if (transcriptions.length === 0) {
            throw new Error("Could not extract content from any videos. Please try a different user.");
          }

          console.log(`✅ [SIMPLE_PERSONA] Successfully processed ${transcriptions.length} videos`);

          // Step 3: Generate basic persona analysis (without OpenAI)
          controller.enqueue(
            encoder.encode(
              createSSEResponse({
                type: "progress",
                step: "analyzing",
                progress: 80,
                message: "Analyzing content patterns...",
              }),
            ),
          );

          // Basic analysis without OpenAI
          const analysis = analyzeContentBasic(transcriptions);

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
              ? formatFollowerCount(feedData.userInfo.stats.followerCount)
              : "0",
            avatar: feedData.userInfo?.avatar ?? null,
            voiceProfile: analysis,
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
          console.error("❌ [SIMPLE_PERSONA] Generation error:", error);

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
    console.error("❌ [SIMPLE_PERSONA] Request error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate persona" },
      { status: 500 },
    );
  }
}

// Basic content analysis without AI
function analyzeContentBasic(transcriptions: any[]): string {
  const allContent = transcriptions.map((t) => t.content).join(" ");
  const words = allContent.toLowerCase().split(/\s+/);

  // Count word frequencies
  const wordFreq: Record<string, number> = {};
  words.forEach((word) => {
    if (word.length > 4) {
      // Only count meaningful words
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Get top words
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  // Extract hashtags
  const allHashtags = transcriptions.flatMap((t) => t.hashtags ?? []);
  const uniqueHashtags = [...new Set(allHashtags)].slice(0, 10);

  // Calculate average engagement
  const avgViews = Math.round(
    transcriptions.reduce((sum, t) => sum + (t.stats?.views ?? 0), 0) / transcriptions.length,
  );

  // Generate basic profile
  const profile = `
## Creator Voice Profile

### Content Overview
- Analyzed ${transcriptions.length} recent videos
- Average views: ${avgViews.toLocaleString()}
- Top hashtags: ${uniqueHashtags.join(", ") || "None detected"}

### Key Topics & Themes
Common words/phrases: ${topWords.join(", ")}

### Content Style
- Posts regularly about: ${uniqueHashtags.slice(0, 3).join(", ") || "Various topics"}
- Content length: ${transcriptions[0]?.content.length > 500 ? "Long-form detailed" : "Short and concise"}

### Engagement Pattern
${transcriptions
  .map((t) => `- Views: ${(t.stats?.views ?? 0).toLocaleString()} | Likes: ${(t.stats?.likes ?? 0).toLocaleString()}`)
  .join("\n")}

### Sample Content
"${transcriptions[0]?.content.slice(0, 200)}..."

---
*Note: This is a basic analysis. For detailed voice pattern analysis, OpenAI integration is required.*
`;

  return profile;
}

// Format follower count
function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
