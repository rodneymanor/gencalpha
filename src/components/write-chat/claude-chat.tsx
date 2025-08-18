/* eslint-disable max-lines */
/* eslint-disable complexity */
"use client";
//
import { useEffect, useRef, useState } from "react";

//
import { ArrowUp, SlidersHorizontal, Lightbulb, Pencil, Loader2, Mic, Bot, Brain } from "lucide-react";

import { type PersonaType, PERSONAS, PersonaSelector } from "@/components/chatbot/persona-selector";
// header dropdown moved to parent wrapper
import { AdvancedSlidingSwitch, type ModeType } from "@/components/ui/advanced-sliding-switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { startAckWithLoader, finishAndRemoveLoader } from "@/components/write-chat/ack-helpers";
import {
  ACK_BEFORE_SLIDE_MS,
  SLIDE_DURATION_MS,
  ACK_LOADING,
  VIDEO_ACTIONS,
  EMULATE_INPUT,
} from "@/components/write-chat/constants";
import { AckLoader } from "@/components/write-chat/messages/ack-loader";
import { EmulateInputPanel } from "@/components/write-chat/messages/emulate-input-panel";
import { VideoActionsPanel } from "@/components/write-chat/messages/video-actions-panel";
import { PlaybookCards } from "@/components/write-chat/playbook-cards";
import { PromptComposer } from "@/components/write-chat/prompt-composer";
import { type ChatMessage } from "@/components/write-chat/types";
import { sendToSlideout, delay } from "@/components/write-chat/utils";
import { useAuth } from "@/contexts/auth-context";
import { useIdeaInboxFlag } from "@/hooks/use-feature-flag";
import { useScriptGeneration } from "@/hooks/use-script-generation";
import { auth as firebaseAuth } from "@/lib/firebase";
import { buildAuthHeaders } from "@/lib/http/auth-headers";
import { postJson } from "@/lib/http/post-json";
import { clientNotesService, type Note } from "@/lib/services/client-notes-service";
import { detectSocialLink, type DetectionResult } from "@/lib/utils/social-link-detector";
import { ensureResolved } from "@/lib/video/ensure-resolved";

// primitives moved to a separate file to reduce linter max-lines and improve reuse
type ClaudeChatProps = {
  className?: string;
  placeholder?: string;
  onSend?: (message: string, persona: PersonaType) => void;
  onAnswerReady?: () => void;
  onHeroStateChange?: (isHero: boolean) => void;
  initialPrompt?: string;
  initialPersona?: PersonaType;
};

export function ClaudeChat({
  className = "",
  placeholder = "How can I help you today?",
  onSend,
  onAnswerReady,
  onHeroStateChange,
  initialPrompt,
  initialPersona,
}: ClaudeChatProps) {
  // Chat renders conversational text; structured results (scripts, analysis, hooks) are sent to the
  // BlockNote slideout via a global event. The slideout listens for `write:editor-set-content` and
  // replaces its content, opening automatically. This keeps the chat thread clean while preserving
  // a rich, editable surface for AI deliverables.
  const isIdeaInboxEnabled = useIdeaInboxFlag();
  const [isHeroState, setIsHeroState] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Processing UI is represented via ACK_LOADING messages
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(initialPersona ?? null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Note[]>([]);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [isIdeaMode, setIsIdeaMode] = useState(false);
  const [ideaSaveMessage, setIdeaSaveMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const [linkDetection, setLinkDetection] = useState<DetectionResult | null>(null);
  // removed unused: actionsOpen state
  const [urlCandidate, setUrlCandidate] = useState<string | null>(null);
  const [urlSupported, setUrlSupported] = useState<false | "instagram" | "tiktok" | null>(null);
  const [isUrlProcessing, setIsUrlProcessing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setUrlReachable = (_v: boolean | null) => {};
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const heroInputRef = useRef<HTMLTextAreaElement | null>(null);
  const { user, userProfile } = useAuth();
  const { generateScript } = useScriptGeneration();
  // header state moved to parent wrapper

  // Inline video action selection state
  const [videoPanel, setVideoPanel] = useState<{ url: string; platform: "instagram" | "tiktok" } | null>(null);
  const [activeAction, setActiveAction] = useState<null | "transcribe" | "analyze" | "emulate" | "ideas" | "hooks">(
    null,
  );
  const [awaitingEmulateInput, setAwaitingEmulateInput] = useState(false);
  const [emulateIdea, setEmulateIdea] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showListening, setShowListening] = useState(true);
  const [_activeMode, setActiveMode] = useState<ModeType>("ghost-write");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prefetch ideas on mount to keep the menu snappy
  useEffect(() => {
    mountedRef.current = true;
    clientNotesService
      .getIdeaInboxNotes()
      .then((res) => {
        // Set immediately; in-flight cleanup will prevent later updates
        setIdeas(res.notes || []);
      })
      .catch(() => void 0);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initialize from props
  useEffect(() => {
    if (initialPrompt) setInputValue(initialPrompt);
    setSelectedPersona(initialPersona ?? null);
  }, [initialPrompt, initialPersona]);

  // Notify parent when hero state changes
  useEffect(() => {
    onHeroStateChange?.(isHeroState);
  }, [isHeroState, onHeroStateChange]);

  // Auto-resize textarea
  useEffect(() => {
    const textareaEl = isHeroState ? heroInputRef.current : textareaRef.current;
    if (textareaEl) {
      textareaEl.style.height = "auto";
      textareaEl.style.height = Math.min(textareaEl.scrollHeight, 200) + "px";
    }
  }, [inputValue, isHeroState]);

  // Blinking "listening" label when recording
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRecording) {
      interval = setInterval(() => setShowListening((prev) => !prev), 800);
    } else {
      setShowListening(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Debounced URL detection + validation (300ms)
  useEffect(() => {
    const controller = new AbortController();
    const handle = setTimeout(async () => {
      const detection = detectSocialLink(inputValue);
      setLinkDetection(detection);
      if (detection.type === "instagram" || detection.type === "tiktok") {
        setUrlCandidate(detection.url ?? null);
        setIsUrlProcessing(true);
        try {
          const token =
            firebaseAuth && firebaseAuth.currentUser && typeof firebaseAuth.currentUser.getIdToken === "function"
              ? await firebaseAuth.currentUser.getIdToken()
              : undefined;
          const res = await fetch("/api/url/validate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ url: detection.url }),
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(String(res.status));
          const data: {
            success: boolean;
            isSupported: boolean;
            isReachable: boolean;
            platform: "instagram" | "tiktok" | null;
          } = await res.json();
          if (data.success && data.isSupported && data.platform) {
            setUrlSupported(data.platform);
            setUrlReachable(!!data.isReachable);
          } else {
            setUrlSupported(false);
            setUrlReachable(false);
          }
        } catch {
          setUrlSupported(false);
          setUrlReachable(false);
        } finally {
          setIsUrlProcessing(false);
        }
      } else {
        setUrlCandidate(null);
        setUrlSupported(null);
        setIsUrlProcessing(false);
      }
    }, 300);
    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [inputValue]);

  const hasValidVideoUrl = Boolean(urlCandidate && urlSupported);

  // Personas list no longer needed here; PersonaSelector renders from internal source
  const getPersonaByKey = (key: PersonaType | null) => PERSONAS.find((p) => p.key === key);
  const resolvedName = userProfile?.displayName ?? user?.displayName;

  const handleSend = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Helper: create a short acknowledgement message describing the task.
    // This gives immediate feedback and sets expectations while we "think".
    const createAcknowledgementFor = (text: string): string => {
      const lower = text.toLowerCase();

      // 1) Script intent has top priority (even if the text also mentions "ideas")
      const hasScriptIntent = Boolean(
        lower.match(/\bwrite\s+(?:a\s+)?script\b/i) ??
          lower.match(/\bscript\b/i) ??
          lower.match(/^\s*\/script\b/i) ??
          lower.match(/generate\s+script/i),
      );
      if (hasScriptIntent) {
        // Try to extract the topic from common patterns
        const topicAboutMatch = text.match(/\b(?:about|on)\s+([^.!?\n\r]{3,})/i);
        const topicFromAbout = topicAboutMatch ? topicAboutMatch[1].trim() : undefined;
        const topic = topicFromAbout
          ? topicFromAbout.split(/\s+/).slice(0, 10).join(" ")
          : text
              .replace(/^\s*\/script\s+/i, "")
              .replace(/^(generate\s+script\s*:?)\s*/i, "")
              .replace(/\bwrite\s+(a\s+)?script\b/i, "")
              .replace(/\bscript\b/i, "")
              .trim()
              .split(/\s+/)
              .slice(0, 10)
              .join(" ");
        const safeTopic = topic ?? "your idea";
        return `I'll help you write a script about ${safeTopic}.`;
      }

      // 2) Hooks
      if (/(^|\s)#?hooks?\b/.test(lower)) {
        return "I'll help you write 20 hooks.";
      }

      // 3) Analysis
      if (/analys(is|e)|\breport\b/.test(lower)) {
        return "I'll help you generate an analysis report.";
      }

      // 4) Ideas (lowest priority among the above)
      if (/\bideas?\b/.test(lower)) {
        return "I'll help you create 10 content ideas.";
      }

      return "I'll help you with that.";
    };

    // Timing utilities and constants imported from helpers

    // If a valid social video URL is present, transition to chat and show inline action options
    if (hasValidVideoUrl && urlCandidate && urlSupported) {
      setIsHeroState(false);
      // Append the user message for context
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: trimmed },
        { id: crypto.randomUUID(), role: "assistant", content: "Choose an action to process this video:" },
        { id: crypto.randomUUID(), role: "assistant", content: VIDEO_ACTIONS },
      ]);
      setVideoPanel({ url: urlCandidate, platform: urlSupported });
      setInputValue("");
      return;
    }

    // Idea Inbox submission from hero input when Idea Mode is active
    if (isHeroState && isIdeaMode) {
      try {
        const firstLine = trimmed.split("\n")[0]?.trim() ?? "Untitled";
        const title = firstLine.length > 60 ? firstLine.slice(0, 60) + "…" : firstLine || "Untitled";
        await clientNotesService.createNote({
          title,
          content: trimmed,
          type: "idea_inbox",
          source: "manual",
          starred: false,
        });
        setIdeaSaveMessage("Saved to Idea Inbox");
        setTimeout(() => setIdeaSaveMessage(null), 3000);
        setInputValue("");
        return; // do not transition to chat state
      } catch {
        setIdeaSaveMessage("Failed to save idea");
        setTimeout(() => setIdeaSaveMessage(null), 4000);
        return;
      }
    }

    // URL detection (for potential future embed/preview behavior)
    const detection = detectSocialLink(trimmed);
    setLinkDetection(detection);

    // 1) Push user message immediately
    const userMessageId = crypto.randomUUID();
    // 2) Push acknowledgement message immediately below user message
    const ackMessageId = crypto.randomUUID();
    const ackLoadingId = crypto.randomUUID();
    const ackText = createAcknowledgementFor(trimmed);
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", content: trimmed },
      { id: ackMessageId, role: "assistant", content: ackText },
      // 2.1) Small loading indicator placeholder shown during analysis phase
      { id: ackLoadingId, role: "assistant", content: ACK_LOADING },
    ]);
    setInputValue("");
    setIsHeroState(false);
    onSend?.(trimmed, selectedPersona ?? "MiniBuddy");
    // Persist user message
    (async () => {
      try {
        const headers = await buildAuthHeaders();
        let convId: string | null = conversationId;
        if (!convId) {
          const res = await fetch("/api/chat/conversations", {
            method: "POST",
            headers,
            body: JSON.stringify({ persona: selectedPersona ?? "MiniBuddy", initialPrompt: initialPrompt ?? null }),
          });
          if (res.ok) {
            const json = (await res.json()) as { success: boolean; conversationId?: string };
            if (json.success && json.conversationId) {
              convId = json.conversationId;
              setConversationId(json.conversationId);
            }
          }
        }
        if (!convId) {
          console.warn("⚠️ [ClaudeChat] No conversation id available; skipping message persistence");
          return;
        }
        await fetch(`/api/chat/conversations/${convId}/messages`, {
          method: "POST",
          headers,
          body: JSON.stringify({ role: "user", content: trimmed }),
        });
      } catch (e) {
        console.warn("⚠️ [ClaudeChat] Failed to persist user message:", e);
      }
    })();

    // Helper: route structured content to slideout BlockNote editor

    // If no persona selected, treat the input as a script idea and run Speed Write
    if (!selectedPersona) {
      try {
        const res = await generateScript(trimmed, "60");
        await delay(ACK_BEFORE_SLIDE_MS);
        if (res.success && res.script) {
          const markdown = `# Generated Script\n\n## Hook\n${res.script.hook}\n\n## Bridge\n${res.script.bridge}\n\n## Golden Nugget\n${res.script.goldenNugget}\n\n## Call to Action\n${res.script.wta}`;
          sendToSlideout(markdown);
          onAnswerReady?.();
          await delay(SLIDE_DURATION_MS);
          // Remove loader only; do not append structured answer to chat
          setMessages((prev): ChatMessage[] => prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING));
        } else {
          // Keep error in chat; do not open slideout
          await delay(SLIDE_DURATION_MS);
          setMessages((prev): ChatMessage[] => {
            const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
            const next: ChatMessage[] = [
              ...filtered,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `Error: ${res.error ?? "Failed to generate script"}`,
              },
            ];
            return next;
          });
        }
      } catch (err: unknown) {
        await delay(ACK_BEFORE_SLIDE_MS);
        await delay(SLIDE_DURATION_MS);
        setMessages((prev): ChatMessage[] => {
          const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
          const next: ChatMessage[] = [
            ...filtered,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Error: ${typeof err === "object" && err && "message" in err ? String((err as { message?: unknown }).message) : "Failed to generate script"}`,
            },
          ];
          return next;
        });
      }
      return;
    }

    // Script command detection
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("/script ") || lower.includes("generate script")) {
      const idea = trimmed.replace(/^\s*\/script\s+/i, "").replace(/^(generate script\s*:?)\s*/i, "");

      try {
        const res = await generateScript(idea, "60");
        await delay(ACK_BEFORE_SLIDE_MS);
        if (res.success && res.script) {
          const markdown = `# Generated Script\n\n## Hook\n${res.script.hook}\n\n## Bridge\n${res.script.bridge}\n\n## Golden Nugget\n${res.script.goldenNugget}\n\n## Call to Action\n${res.script.wta}`;
          sendToSlideout(markdown);
          onAnswerReady?.();
          await delay(SLIDE_DURATION_MS);
          setMessages((prev): ChatMessage[] => prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING));
          return;
        }
        await delay(SLIDE_DURATION_MS);
        setMessages((prev): ChatMessage[] => {
          const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
          const next: ChatMessage[] = [
            ...filtered,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Error: ${res.error ?? "Failed to generate script"}`,
            },
          ];
          return next;
        });
        return;
      } catch (err: unknown) {
        await delay(ACK_BEFORE_SLIDE_MS);
        await delay(SLIDE_DURATION_MS);
        setMessages((prev): ChatMessage[] => {
          const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
          const next: ChatMessage[] = [
            ...filtered,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Error: ${typeof err === "object" && err && "message" in err ? String((err as { message?: unknown }).message) : "Failed to generate script"}`,
            },
          ];
          return next;
        });
        return;
      }
    }

    try {
      const authHeaders = await buildAuthHeaders();
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          message: trimmed,
          persona: selectedPersona,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error ?? `HTTP error ${response.status}`);
      }
      const data = await response.json();
      const assistantText = data.response ?? "I'm sorry, I didn't receive a proper response.";
      // Stage timing: ack -> (1.5s) -> slideout -> (slide duration) -> show answer
      await delay(ACK_BEFORE_SLIDE_MS);
      await delay(SLIDE_DURATION_MS);
      setMessages((prev): ChatMessage[] => {
        const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
        const next: ChatMessage[] = [
          ...filtered,
          { id: crypto.randomUUID(), role: "assistant", content: assistantText },
        ];
        return next;
      });
      // Persist assistant message (best-effort)
      (async () => {
        try {
          const headers = await buildAuthHeaders();
          const convId = conversationId;
          if (!convId) {
            console.warn("⚠️ [ClaudeChat] No conversation id available; skipping assistant message persistence");
            return;
          }
          await fetch(`/api/chat/conversations/${convId}/messages`, {
            method: "POST",
            headers,
            body: JSON.stringify({ role: "assistant", content: assistantText }),
          });
        } catch (e) {
          console.warn("⚠️ [ClaudeChat] Failed to persist assistant message:", e);
        }
      })();
    } catch (err: unknown) {
      // Stage timing on error as well
      await delay(ACK_BEFORE_SLIDE_MS);
      await delay(SLIDE_DURATION_MS);
      setMessages((prev): ChatMessage[] => {
        const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== ACK_LOADING);
        return [
          ...filtered,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Error: ${typeof err === "object" && err && "message" in err ? String((err as { message?: unknown }).message) : "Failed to get response"}`,
          },
        ];
      });
    }
  };

  // Helpers for inline actions are imported

  // Voice recording
  const handleVoiceRecording = async () => {
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        await processVoiceRecording(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const processVoiceRecording = async (audioBlob: Blob) => {
    try {
      const user = firebaseAuth?.currentUser;
      if (!user || typeof user.getIdToken !== "function") {
        console.error("Please sign in to use voice transcription");
        return;
      }
      const token = await user.getIdToken();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString("base64");
      const response = await fetch("/api/transcribe/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ audio: base64Audio, format: "wav" }),
      });
      const result = await response.json();
      if (result.success && result.transcription) {
        setInputValue(result.transcription as string);
      } else {
        console.error("Transcription failed:", result.error);
      }
    } catch (error) {
      console.error("Error processing voice recording:", error);
    }
  };

  const handleInlineTranscribe = async () => {
    if (!videoPanel) return;
    setActiveAction("transcribe");
    startAckWithLoader(setMessages, "I'll transcribe this video for you.");
    try {
      const { url, platform } = await ensureResolved(videoPanel);
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform });
      if (!t.transcript) throw new Error("No transcript received from server");
      const markdown = `# Transcript\n\n${t.transcript}`;
      sendToSlideout(markdown);
      finishAndRemoveLoader(setMessages);
      onAnswerReady?.();
    } catch (error) {
      finishAndRemoveLoader(setMessages);
      const errorMessage = error instanceof Error ? error.message : "Transcription failed";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setActiveAction(null);
    }
  };

  const handleInlineAnalyze = async () => {
    if (!videoPanel) return;
    setActiveAction("analyze");
    startAckWithLoader(setMessages, "I'll perform advanced stylometric analysis using Gemini AI.");
    try {
      const { url, platform } = await ensureResolved(videoPanel);
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform });
      if (!t.transcript) throw new Error("Could not get transcript for analysis");
      const analysisData = await postJson<{ analysis: string }>("/api/gemini/stylometric-analysis", {
        transcript: t.transcript,
        sourceUrl: url,
        platform,
      });
      const markdown = `# Advanced Stylometric Analysis\n\n${analysisData.analysis}`;
      sendToSlideout(markdown);
      finishAndRemoveLoader(setMessages);
      onAnswerReady?.();
    } catch (error) {
      finishAndRemoveLoader(setMessages);
      const errorMessage = error instanceof Error ? error.message : "Stylometric analysis failed";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setActiveAction(null);
    }
  };

  const handleInlineEmulateStart = () => {
    setAwaitingEmulateInput(true);
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: EMULATE_INPUT }]);
  };

  const handleInlineEmulateSubmit = async () => {
    if (!videoPanel || !emulateIdea.trim()) return;
    setActiveAction("emulate");
    startAckWithLoader(setMessages, "I'll help you write a script about your idea in this creator's style.");
    try {
      const { url, platform } = await ensureResolved(videoPanel);
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform });
      if (!t.transcript) throw new Error("Could not get transcript for script generation");
      const emulationData = await postJson<{
        script: { hook: string; bridge: string; goldenNugget: string; wta: string };
      }>("/api/style/emulate", {
        transcript: t.transcript,
        sourceUrl: url,
        platform,
        newTopic: emulateIdea.trim(),
      });
      const markdown = `# Generated Script\n\n## Hook\n${emulationData.script.hook}\n\n## Bridge\n${emulationData.script.bridge}\n\n## Golden Nugget\n${emulationData.script.goldenNugget}\n\n## Call to Action\n${emulationData.script.wta}`;
      sendToSlideout(markdown);
      finishAndRemoveLoader(setMessages);
      onAnswerReady?.();
      setAwaitingEmulateInput(false);
      setEmulateIdea("");
    } catch (error) {
      finishAndRemoveLoader(setMessages);
      const errorMessage = error instanceof Error ? error.message : "Script generation failed";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setActiveAction(null);
    }
  };

  const handleInlineIdeas = async () => {
    if (!videoPanel) return;
    setActiveAction("ideas");
    startAckWithLoader(setMessages, "I'll help you create 10 content ideas.");
    try {
      const { url, platform } = await ensureResolved(videoPanel);
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform });
      if (!t.transcript) throw new Error("Could not get transcript for idea generation");
      const ideasData = await postJson<{ ideas: string }>("/api/content/ideas", {
        transcript: t.transcript,
        sourceUrl: url,
      });
      const markdown = `# Content Ideas\n\n${ideasData.ideas}`;
      sendToSlideout(markdown);
      finishAndRemoveLoader(setMessages);
      onAnswerReady?.();
    } catch (error) {
      finishAndRemoveLoader(setMessages);
      const errorMessage = error instanceof Error ? error.message : "Ideas generation failed";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setActiveAction(null);
    }
  };

  const handleInlineHooks = async () => {
    if (!videoPanel) return;
    setActiveAction("hooks");
    startAckWithLoader(setMessages, "I'll help you write hooks.");
    try {
      const { url, platform } = await ensureResolved(videoPanel);
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform });
      if (!t.transcript) throw new Error("Could not get transcript for hook generation");
      const hooksResp = await postJson<{
        success: boolean;
        hooks: Array<{ text: string; rating: number; focus: string; rationale: string }>;
        topHook: { text: string; rating: number };
      }>("/api/video/generate-hooks", { transcript: t.transcript });
      if (!hooksResp.success || !Array.isArray(hooksResp.hooks)) throw new Error("Hook generation failed");
      const list = hooksResp.hooks.map((h, i) => `${i + 1}. ${h.text} — ${h.rating}/100 (${h.focus})`).join("\n");
      const markdown = `# Hooks\n\n${list}\n\n**Top Hook:** ${hooksResp.topHook.text} (${hooksResp.topHook.rating}/100)`;
      sendToSlideout(markdown);
      finishAndRemoveLoader(setMessages);
      onAnswerReady?.();
    } catch (error) {
      finishAndRemoveLoader(setMessages);
      const errorMessage = error instanceof Error ? error.message : "Hooks generation failed";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className={`font-sans ${className}`}>
      {/* Floating Slideout Toggle */}
      {/* Header */}
      {/* Header moved to parent page wrapper */}

      {/* Hero State */}
      {isHeroState && (
        <div className="mt-18 flex min-h-[calc(100vh-4rem)] flex-col items-center px-4 pt-24 transition-all duration-300 md:pt-52">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 px-5 pb-8">
            <div>
              <h1 className="text-foreground text-4xl leading-10 font-bold tracking-tight">
                {`Hello${resolvedName ? ", " + resolvedName : ""}`}
                <br />
                <span className="text-muted-foreground">What will you script today?</span>
              </h1>
            </div>

            <div className="w-full max-w-3xl">
              <PromptComposer
                value={inputValue}
                onChange={setInputValue}
                placeholder={isRecording ? (showListening ? "listening..." : "") : placeholder}
                onSubmit={() => handleSend(inputValue)}
                isProcessing={isUrlProcessing}
                textareaRef={heroInputRef}
                submitEnabled={!isUrlProcessing && (hasValidVideoUrl || inputValue.trim().length > 0)}
                highlightSubmit={hasValidVideoUrl}
                submitIcon={
                  isUrlProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />
                }
                footerBanner={
                  isUrlProcessing &&
                  linkDetection &&
                  (linkDetection.type === "instagram" || linkDetection.type === "tiktok") ? (
                    <div className="bg-muted text-muted-foreground animate-in fade-in-0 rounded-[var(--radius-input)] px-3 py-2 text-sm duration-200">
                      🔄 Validating URL...
                    </div>
                  ) : hasValidVideoUrl && !isUrlProcessing ? (
                    <div className="bg-accent text-foreground animate-in fade-in-0 rounded-[var(--radius-input)] px-3 py-2 text-sm duration-200">
                      ✓ Link identified. Press submit to continue
                    </div>
                  ) : linkDetection && linkDetection.type !== "text" ? (
                    <div className="bg-muted/80 border-border/50 text-muted-foreground flex items-center gap-2 rounded-[var(--radius-input)] border p-2 text-sm">
                      <span className="text-foreground font-medium">
                        {linkDetection.type === "other_url" ? "Link" : linkDetection.type}
                      </span>
                      {linkDetection.extracted.username && <span>@{linkDetection.extracted.username}</span>}
                      {linkDetection.extracted.postId && <span>#{linkDetection.extracted.postId}</span>}
                      {linkDetection.extracted.contentType && <span>· {linkDetection.extracted.contentType}</span>}
                    </div>
                  ) : undefined
                }
                leftControls={
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${isIdeaMode ? "bg-accent" : ""} size-8 rounded-full p-0`}
                      onClick={() => {
                        setIsIdeaMode((v) => !v);
                        setTimeout(() => heroInputRef.current?.focus(), 0);
                      }}
                      title="Write to Idea Inbox"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AdvancedSlidingSwitch
                      options={[
                        { value: "ghost-write", icon: <Bot className="h-[18px] w-[18px]" />, tooltip: "Ghost Write" },
                        { value: "web-search", icon: <Brain className="h-[18px] w-[18px]" />, tooltip: "Web Search" },
                      ]}
                      onChange={(_i, option) => setActiveMode(option.value)}
                      disabled={isIdeaMode}
                    />
                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="h-3 w-3" />
                    </Button>
                    {isIdeaInboxEnabled && (
                      <DropdownMenu open={ideasOpen} onOpenChange={setIdeasOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Lightbulb className="h-3 w-3" />
                            <span className="hidden sm:inline">Ideas</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[280px]">
                          <DropdownMenuLabel>Idea Inbox</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {ideas.length === 0 ? (
                            <DropdownMenuItem disabled>No ideas yet</DropdownMenuItem>
                          ) : (
                            ideas.slice(0, 12).map((note) => (
                              <DropdownMenuItem
                                key={note.id}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  const text = note.title ? `${note.title}: ${note.content}` : note.content;
                                  setInputValue(text);
                                  setIdeasOpen(false);
                                  requestAnimationFrame(() => textareaRef.current?.focus());
                                }}
                              >
                                <div className="flex min-w-0 flex-col">
                                  <span className="truncate text-sm font-medium">{note.title || "Untitled"}</span>
                                  <span className="text-muted-foreground truncate text-xs">{note.content}</span>
                                </div>
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                }
                rightControls={
                  <Button
                    onClick={() => {
                      if (inputValue.trim()) {
                        if (!isUrlProcessing) handleSend(inputValue);
                      } else {
                        if (!isUrlProcessing) handleVoiceRecording();
                      }
                    }}
                    disabled={isUrlProcessing}
                    className={`size-9 rounded-full transition-colors ${
                      inputValue.trim() && !isUrlProcessing
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : isRecording
                          ? "animate-pulse bg-red-500 text-white hover:bg-red-600"
                          : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground border"
                    }`}
                    title={
                      inputValue.trim() ? "Send message" : isRecording ? "Stop recording" : "Start voice recording"
                    }
                  >
                    {isUrlProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : inputValue.trim() ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                }
              />
            </div>

            {!isIdeaMode && (
              <div className="mx-auto w-full max-w-3xl">
                <PersonaSelector
                  selectedPersona={selectedPersona}
                  onPersonaChange={setSelectedPersona}
                  className="justify-center"
                  showCallout={Boolean(selectedPersona)}
                />
              </div>
            )}
            {isIdeaMode && (
              <div className="mx-auto w-full max-w-2xl">
                <div className="bg-accent text-foreground mt-2 rounded-[var(--radius-input)] px-3 py-2 text-sm">
                  Idea mode is active. Your input will be saved to your Idea Inbox.
                </div>
                {ideaSaveMessage && <div className="text-muted-foreground mt-1 text-xs">{ideaSaveMessage}</div>}
              </div>
            )}
            {/* Removed legacy duplicate callout: PersonaSelector renders the callout when a persona is selected */}

            {/* Playbook Cards Section */}
            <div className="mt-8 w-full">
              <PlaybookCards />
            </div>
          </div>
        </div>
      )}

      {/* Chat State */}
      {!isHeroState && (
        <div className="relative flex h-[calc(100vh-4rem)] flex-col transition-all duration-300">
          {/* Messages Area with bottom padding for sticky input */}
          <ScrollArea className="flex-1 px-4 pb-32">
            <div className="mx-auto max-w-3xl py-6">
              <div className="space-y-6">
                {messages.map((m) => (
                  <div key={m.id} className="animate-in fade-in-0 zoom-in-95">
                    {/* Two-column layout: avatar column (40px) + content column */}
                    <div className="grid grid-cols-[40px_1fr] items-start gap-x-3">
                      {m.role === "user" ? (
                        <>
                          {/* Placeholder to align with content column start */}
                          <div aria-hidden className="h-8 w-8" />
                          {/* User message single pill containing avatar + text */}
                          <div className="col-start-2">
                            <div className="bg-accent text-foreground inline-flex max-w-[min(85%,_60ch)] items-center gap-2 rounded-[var(--radius-input)] px-4 py-3">
                              <div className="bg-secondary text-secondary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                                {(resolvedName?.[0] ?? "U").toUpperCase()}
                              </div>
                              <p className="text-base leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Placeholder to align with content column start */}
                          <div aria-hidden className="h-8 w-8" />
                          {/* Assistant message */}
                          <div className="col-start-2">
                            {m.content === ACK_LOADING ? (
                              <AckLoader />
                            ) : m.content === VIDEO_ACTIONS && videoPanel ? (
                              <VideoActionsPanel
                                active={activeAction === null}
                                onTranscribe={handleInlineTranscribe}
                                onAnalyze={handleInlineAnalyze}
                                onEmulate={handleInlineEmulateStart}
                                onIdeas={handleInlineIdeas}
                                onHooks={handleInlineHooks}
                              />
                            ) : m.content === EMULATE_INPUT && awaitingEmulateInput ? (
                              <EmulateInputPanel
                                value={emulateIdea}
                                onChange={setEmulateIdea}
                                onSubmit={handleInlineEmulateSubmit}
                                disabled={!emulateIdea.trim()}
                              />
                            ) : (
                              <div className="prose text-foreground max-w-none">
                                <p className="text-base leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>

          {/* Sticky Chat Input */}
          <div className="bg-background/95 border-border absolute right-0 bottom-0 left-0 z-10 border-t py-4 backdrop-blur-sm transition-all duration-300">
            <div className="mx-auto w-full max-w-3xl">
              <Card className="border-border bg-card/95 rounded-xl shadow-[var(--shadow-soft-drop)] backdrop-blur-sm">
                <div className="px-2">
                  <PromptComposer
                    wrapInCard={false}
                    variant="compact"
                    value={inputValue}
                    onChange={setInputValue}
                    placeholder="Reply to Gen.C..."
                    onSubmit={() => handleSend(inputValue)}
                    isProcessing={isUrlProcessing}
                    textareaRef={textareaRef}
                    submitEnabled={!isUrlProcessing && (hasValidVideoUrl || inputValue.trim().length > 0)}
                    highlightSubmit={false}
                    submitIcon={
                      isUrlProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />
                    }
                    leftControls={
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${isIdeaMode ? "bg-accent" : ""} size-8 rounded-full p-0`}
                          onClick={() => {
                            setIsIdeaMode((v) => !v);
                            setTimeout(() => textareaRef.current?.focus(), 0);
                          }}
                          title="Write to Idea Inbox"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AdvancedSlidingSwitch
                          options={[
                            {
                              value: "ghost-write",
                              icon: <Bot className="h-[18px] w-[18px]" />,
                              tooltip: "Ghost Write",
                            },
                            {
                              value: "web-search",
                              icon: <Brain className="h-[18px] w-[18px]" />,
                              tooltip: "Web Search",
                            },
                          ]}
                          onChange={(_i, option) => setActiveMode(option.value)}
                          disabled={false}
                        />
                      </div>
                    }
                    rightControls={
                      <Button
                        onClick={() => {
                          if (inputValue.trim()) {
                            if (!isUrlProcessing) handleSend(inputValue);
                          } else {
                            if (!isUrlProcessing) handleVoiceRecording();
                          }
                        }}
                        disabled={isUrlProcessing}
                        className={`size-9 rounded-full transition-colors ${
                          inputValue.trim() && !isUrlProcessing
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : isRecording
                              ? "animate-pulse bg-red-500 text-white hover:bg-red-600"
                              : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground border"
                        }`}
                        title={
                          inputValue.trim() ? "Send message" : isRecording ? "Stop recording" : "Start voice recording"
                        }
                      >
                        {isUrlProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : inputValue.trim() ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    }
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
      {/* Inline actions replace the modal; no modal rendering here */}
    </div>
  );
}

export default ClaudeChat;
