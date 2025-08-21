"use client";

import { buildAuthHeaders } from "@/lib/http/auth-headers";

export interface ChatConversation {
  id: string;
  title: string | null;
  status: "untitled" | "saved";
  lastMessageAt: string;
  messagesCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface LoadedConversation {
  id: string;
  title: string | null;
  status: "untitled" | "saved";
  persona: string | null;
  messages: ChatMessage[];
}

export async function createConversation(persona: string, initialPrompt?: string) {
  const headers = await buildAuthHeaders();
  const res = await fetch("/api/chat/conversations", {
    method: "POST",
    headers,
    body: JSON.stringify({ persona, initialPrompt: initialPrompt ?? null }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; conversationId?: string };
  return json.success ? (json.conversationId ?? null) : null;
}

export async function saveMessage(conversationId: string, role: "user" | "assistant", content: string) {
  const headers = await buildAuthHeaders();
  await fetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({ role, content }),
  });
}

export async function generateTitle(
  conversationId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string | null> {
  const headers = await buildAuthHeaders();
  const res = await fetch(`/api/chat/conversations/${conversationId}/generate-title`, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; title?: string };
  return json.success ? (json.title ?? null) : null;
}

export async function updateTitle(conversationId: string, title: string): Promise<boolean> {
  const headers = await buildAuthHeaders();
  const res = await fetch(`/api/chat/conversations/${conversationId}/update-title`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ title }),
  });
  return res.ok;
}

export async function listConversations(): Promise<ChatConversation[]> {
  const headers = await buildAuthHeaders();
  const res = await fetch("/api/chat/conversations/list", {
    method: "GET",
    headers,
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { success: boolean; conversations?: ChatConversation[] };
  return json.success ? (json.conversations ?? []) : [];
}

export async function loadConversation(conversationId: string): Promise<LoadedConversation | null> {
  const headers = await buildAuthHeaders();
  const res = await fetch(`/api/chat/conversations/${conversationId}/load`, {
    method: "GET",
    headers,
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; conversation?: LoadedConversation };
  return json.success ? (json.conversation ?? null) : null;
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
