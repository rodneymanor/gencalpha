"use client";

import { buildAuthHeaders } from "@/lib/http/auth-headers";

export async function createConversation(persona: string, initialPrompt?: string) {
  const headers = await buildAuthHeaders();
  const res = await fetch("/api/chat/conversations", {
    method: "POST",
    headers,
    body: JSON.stringify({ persona, initialPrompt: initialPrompt ?? null }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; conversationId?: string };
  return json.success ? json.conversationId ?? null : null;
}

export async function saveMessage(conversationId: string, role: "user" | "assistant", content: string) {
  const headers = await buildAuthHeaders();
  await fetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({ role, content }),
  });
}

export async function chatbotReply(
  message: string,
  persona: string | null,
  conversationHistory: Array<{ role: string; content: string }>,
) {
  const headers = await buildAuthHeaders();
  const response = await fetch("/api/chatbot", {
    method: "POST",
    headers,
    body: JSON.stringify({ message, persona, conversationHistory }),
  });
  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorData.error ?? `HTTP error ${response.status}`);
  }
  const data = (await response.json()) as { response?: string };
  return data.response ?? "I'm sorry, I didn't receive a proper response.";
}


