"use client";

import { postJson } from "@/lib/http/post-json";

export async function transcribeVideo(args: { url: string; platform: "instagram" | "tiktok" }) {
  const { url, platform } = args;
  const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform });
  if (!t.transcript) throw new Error("No transcript received from server");
  return t.transcript;
}

export async function stylometricAnalysis(args: { transcript: string; url: string; platform: "instagram" | "tiktok" }) {
  const { transcript, url, platform } = args;
  const analysisData = await postJson<{ success: boolean; analysis: unknown }>("/api/voice/analyze", {
    transcript,
    sourceUrl: url,
    platform,
  });
  if (!analysisData?.success || !analysisData.analysis) throw new Error("Forensic analysis failed");
  return analysisData.analysis as unknown;
}

export async function emulateStyle(args: {
  transcript: string;
  url: string;
  platform: "instagram" | "tiktok";
  newTopic: string;
}) {
  const { transcript, url, platform, newTopic } = args;
  const emulationData = await postJson<{
    script: { hook: string; bridge: string; goldenNugget: string; wta: string };
  }>("/api/style/emulate", { transcript, sourceUrl: url, platform, newTopic });
  return emulationData.script;
}

export async function generateIdeas(args: { transcript: string; url: string }) {
  const { transcript, url } = args;
  const ideasData = await postJson<{ ideas: string }>("/api/content/ideas", { transcript, sourceUrl: url });
  return ideasData.ideas;
}

export async function generateHooks(args: { transcript: string }) {
  const { transcript } = args;
  const hooksResp = await postJson<{
    success: boolean;
    hooks: Array<{ text: string; rating: number; focus: string; rationale: string }>;
    topHook: { text: string; rating: number };
  }>("/api/video/generate-hooks", { transcript });
  if (!hooksResp.success || !Array.isArray(hooksResp.hooks)) throw new Error("Hook generation failed");
  return hooksResp;
}

export async function generateScriptFromVoice(args: {
  analysis: unknown;
  topic: string;
  length: "short" | "medium" | "long";
}) {
  const { analysis, topic, length } = args;
  const resp = await postJson<{ success: boolean; script: unknown }>("/api/voice/generate", {
    analysis,
    topic,
    length,
  });
  if (!resp.success) throw new Error("Script generation failed");
  return resp.script;
}
