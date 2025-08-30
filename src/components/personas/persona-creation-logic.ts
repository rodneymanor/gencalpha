// Persona creation logic extracted to reduce complexity

interface AnalysisProgress {
  step: string;
  current: number;
  total: number;
}

export async function fetchUserVideos(cleanUsername: string) {
  const feedResponse = await fetch("/api/tiktok/user-feed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: cleanUsername,
      count: 20,
    }),
  });

  const feedData = await feedResponse.json();
  if (!feedData.success || !feedData.videos || feedData.videos.length === 0) {
    throw new Error(feedData.error ?? "No videos found for this user");
  }

  return feedData;
}

export async function transcribeVideos(videoUrls: string[], onProgress?: (current: number, total: number) => void) {
  const transcriptResults = [];

  for (let i = 0; i < videoUrls.length; i++) {
    try {
      if (onProgress) {
        onProgress(i + 1, videoUrls.length);
      }

      const transcriptResponse = await fetch("/api/video/transcribe-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoUrls[i] }),
      });

      const transcriptData = await transcriptResponse.json();
      if (transcriptData.success && transcriptData.transcript) {
        transcriptResults.push(transcriptData.transcript);
      }

      // Stop after 10 successful transcriptions
      if (transcriptResults.length >= 10) break;
    } catch (error) {
      console.error(`Failed to transcribe video ${i + 1}:`, error);
    }
  }

  if (transcriptResults.length < 3) {
    throw new Error("Not enough videos could be transcribed. Please try another creator.");
  }

  return transcriptResults;
}

export async function analyzeVoicePatterns(transcripts: string[]) {
  const analysisResponse = await fetch("/api/voice/analyze-patterns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcripts }),
  });

  if (!analysisResponse.ok) {
    throw new Error("Failed to analyze voice patterns");
  }

  return await analysisResponse.json();
}

export async function generatePersonaMetadata(voiceAnalysis: any, token: string) {
  const metadataResponse = await fetch("/api/personas/generate-metadata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ voiceAnalysis }),
  });

  let personaName = "";
  let personaDescription = "";
  let personaTags: string[] = [];

  if (metadataResponse.ok) {
    const metadataData = await metadataResponse.json();
    if (metadataData.success) {
      personaName = metadataData.title;
      personaDescription = metadataData.description;
      personaTags = metadataData.suggestedTags;
    }
  }

  return { personaName, personaDescription, personaTags };
}

export async function createPersona(
  cleanUsername: string,
  voiceAnalysis: any,
  metadata: { personaName: string; personaDescription: string; personaTags: string[] },
  token: string,
) {
  const createResponse = await fetch("/api/personas/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: metadata.personaName || `${cleanUsername} Voice`,
      description: metadata.personaDescription || `Voice persona based on @${cleanUsername}'s content style`,
      platform: "tiktok",
      username: cleanUsername,
      analysis: voiceAnalysis,
      tags: metadata.personaTags,
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json();
    throw new Error(errorData.error ?? "Failed to create persona");
  }

  return await createResponse.json();
}
