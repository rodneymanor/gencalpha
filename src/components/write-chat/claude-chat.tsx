/* eslint-disable max-lines */
/* eslint-disable complexity */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ArrowUp,
  SlidersHorizontal,
  Lightbulb,
  Pencil,
  Loader2,
  FileText,
  Sparkles,
  CopyCheck,
  Megaphone,
} from "lucide-react";

import { type PersonaType, PERSONAS } from "@/components/chatbot/persona-selector";
// header dropdown moved to parent wrapper
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, Card, ScrollArea } from "@/components/write-chat/primitives";
import { useAuth } from "@/contexts/auth-context";
import { useScriptGeneration } from "@/hooks/use-script-generation";
import { auth as firebaseAuth } from "@/lib/firebase";
import { clientNotesService, type Note } from "@/lib/services/client-notes-service";
import { detectSocialLink, type DetectionResult } from "@/lib/utils/social-link-detector";

// primitives moved to a separate file to reduce linter max-lines and improve reuse

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
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
  const [isHeroState, setIsHeroState] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Processing UI managed via messages; keep variable for future state hooks if needed
  const [, setIsProcessing] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(initialPersona ?? null);
  const [ideas, setIdeas] = useState<Note[]>([]);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [isIdeaMode, setIsIdeaMode] = useState(false);
  const [ideaSaveMessage, setIdeaSaveMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const [linkDetection, setLinkDetection] = useState<DetectionResult | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [urlCandidate, setUrlCandidate] = useState<string | null>(null);
  const [urlSupported, setUrlSupported] = useState<false | "instagram" | "tiktok" | null>(null);
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
    if (initialPersona) setSelectedPersona(initialPersona);
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

  // Debounced URL detection + validation (300ms)
  useEffect(() => {
    const controller = new AbortController();
    const handle = setTimeout(async () => {
      const detection = detectSocialLink(inputValue);
      setLinkDetection(detection);
      if (detection.type === "instagram" || detection.type === "tiktok") {
        setUrlCandidate(detection.url ?? null);
        // no-op visual loading; we avoid unused state
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
          // keep UI responsive without extra state churn
          void 0;
        }
      } else {
        setUrlCandidate(null);
        setUrlSupported(null);
        /* no-op */
      }
    }, 300);
    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [inputValue]);

  const hasValidVideoUrl = Boolean(urlCandidate && urlSupported);

  const personas = useMemo(() => PERSONAS.map((p) => ({ key: p.key, label: p.label })), []);
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

    // Helper: timing utilities for staged UX
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ACK_BEFORE_SLIDE_MS = 1500; // how long the ack+loader shows before slideout
    const SLIDE_DURATION_MS = 350; // approximate slideout animation time

    // If a valid social video URL is present, transition to chat and show inline action options
    if (hasValidVideoUrl && urlCandidate && urlSupported) {
      setIsHeroState(false);
      // Append the user message for context
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: trimmed },
        { id: crypto.randomUUID(), role: "assistant", content: "Choose an action to process this video:" },
        { id: crypto.randomUUID(), role: "assistant", content: "<video-actions>" },
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
      { id: ackLoadingId, role: "assistant", content: "<ack-loading>" },
    ]);
    setInputValue("");
    setIsHeroState(false);
    onSend?.(trimmed, selectedPersona ?? "MiniBuddy");

    // Helper: route structured content to slideout BlockNote editor
    const sendToSlideout = (markdown: string) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("write:editor-set-content", {
            detail: { markdown },
          }),
        );
      }
    };

    // If no persona selected, treat the input as a script idea and run Speed Write
    if (!selectedPersona) {
      const startTs = Date.now();
      try {
        const res = await generateScript(trimmed, "60");
        await delay(ACK_BEFORE_SLIDE_MS);
        if (res.success && res.script) {
          const markdown = `# Generated Script\n\n## Hook\n${res.script.hook}\n\n## Bridge\n${res.script.bridge}\n\n## Golden Nugget\n${res.script.goldenNugget}\n\n## Call to Action\n${res.script.wta}`;
          sendToSlideout(markdown);
          onAnswerReady?.();
          await delay(SLIDE_DURATION_MS);
          // Remove loader only; do not append structured answer to chat
          setMessages((prev): ChatMessage[] =>
            prev.filter((m) => m.id !== ackLoadingId && m.content !== "<ack-loading>"),
          );
        } else {
          // Keep error in chat; do not open slideout
          await delay(SLIDE_DURATION_MS);
          setMessages((prev): ChatMessage[] => {
            const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== "<ack-loading>");
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
          const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== "<ack-loading>");
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
      const startTs = Date.now();
      try {
        const res = await generateScript(idea, "60");
        await delay(ACK_BEFORE_SLIDE_MS);
        if (res.success && res.script) {
          const markdown = `# Generated Script\n\n## Hook\n${res.script.hook}\n\n## Bridge\n${res.script.bridge}\n\n## Golden Nugget\n${res.script.goldenNugget}\n\n## Call to Action\n${res.script.wta}`;
          sendToSlideout(markdown);
          onAnswerReady?.();
          await delay(SLIDE_DURATION_MS);
          setMessages((prev): ChatMessage[] =>
            prev.filter((m) => m.id !== ackLoadingId && m.content !== "<ack-loading>"),
          );
          return;
        }
        await delay(SLIDE_DURATION_MS);
        setMessages((prev): ChatMessage[] => {
          const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== "<ack-loading>");
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
          const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== "<ack-loading>");
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
      const startTs = Date.now();
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          persona: selectedPersona,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? `HTTP error ${response.status}`);
      }
      const data = await response.json();
      const assistantText = data.response ?? "I'm sorry, I didn't receive a proper response.";
      // Stage timing: ack -> (1.5s) -> slideout -> (slide duration) -> show answer
      await delay(ACK_BEFORE_SLIDE_MS);
      await delay(SLIDE_DURATION_MS);
      setMessages((prev): ChatMessage[] => {
        const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== "<ack-loading>");
        const next: ChatMessage[] = [
          ...filtered,
          { id: crypto.randomUUID(), role: "assistant", content: assistantText },
        ];
        return next;
      });
    } catch (err: unknown) {
      // Stage timing on error as well
      await delay(ACK_BEFORE_SLIDE_MS);
      await delay(SLIDE_DURATION_MS);
      setMessages((prev): ChatMessage[] => {
        const filtered = prev.filter((m) => m.id !== ackLoadingId && m.content !== "<ack-loading>");
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

  // Helpers for inline actions
  const buildAuthHeaders = async (): Promise<HeadersInit> => {
    const token =
      firebaseAuth && firebaseAuth.currentUser && typeof firebaseAuth.currentUser.getIdToken === "function"
        ? await firebaseAuth.currentUser.getIdToken()
        : undefined;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["authorization"] = `Bearer ${token}`;
    return headers;
  };

  const postJson = async <T,>(path: string, body: unknown): Promise<T> => {
    const headers = await buildAuthHeaders();
    const res = await fetch(path, { method: "POST", headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return (await res.json()) as T;
  };

  const ensureResolved = async (input: {
    url: string;
    platform: "instagram" | "tiktok";
  }): Promise<{ url: string; platform: "instagram" | "tiktok" }> => {
    try {
      const res = await postJson<{ success: boolean; videoUrl?: string; platform?: "instagram" | "tiktok" }>(
        "/api/video/resolve",
        { url: input.url },
      );
      return { url: res.videoUrl ?? input.url, platform: (res.platform as typeof input.platform) ?? input.platform };
    } catch {
      return input;
    }
  };

  const sendToSlideout = (markdown: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("write:editor-set-content", {
          detail: { markdown },
        }),
      );
    }
  };

  const startAckWithLoader = (ackText: string) => {
    const ackMessageId = crypto.randomUUID();
    const ackLoadingId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: ackMessageId, role: "assistant", content: ackText },
      { id: ackLoadingId, role: "assistant", content: "<ack-loading>" },
    ]);
  };

  const finishAndRemoveLoader = () => {
    setMessages((prev) => prev.filter((m) => m.content !== "<ack-loading>"));
    setIsProcessing(null);
  };

  const handleInlineTranscribe = async () => {
    if (!videoPanel) return;
    setActiveAction("transcribe");
    startAckWithLoader("I'll transcribe this video for you.");
    try {
      const { url, platform } = await ensureResolved(videoPanel);
      const t = await postJson<{ transcript: string }>("/api/video/transcribe", { videoUrl: url, platform });
      if (!t.transcript) throw new Error("No transcript received from server");
      const markdown = `# Transcript\n\n${t.transcript}`;
      sendToSlideout(markdown);
      finishAndRemoveLoader();
      onAnswerReady?.();
    } catch (error) {
      finishAndRemoveLoader();
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
    startAckWithLoader("I'll perform advanced stylometric analysis using Gemini AI.");
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
      finishAndRemoveLoader();
      onAnswerReady?.();
    } catch (error) {
      finishAndRemoveLoader();
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
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "<emulate-input>" }]);
  };

  const handleInlineEmulateSubmit = async () => {
    if (!videoPanel || !emulateIdea.trim()) return;
    setActiveAction("emulate");
    startAckWithLoader("I'll help you write a script about your idea in this creator's style.");
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
      finishAndRemoveLoader();
      onAnswerReady?.();
      setAwaitingEmulateInput(false);
      setEmulateIdea("");
    } catch (error) {
      finishAndRemoveLoader();
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
    startAckWithLoader("I'll help you create 10 content ideas.");
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
      finishAndRemoveLoader();
      onAnswerReady?.();
    } catch (error) {
      finishAndRemoveLoader();
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
    startAckWithLoader("I'll help you write hooks.");
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
      finishAndRemoveLoader();
      onAnswerReady?.();
    } catch (error) {
      finishAndRemoveLoader();
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
      {/* Header */}
      {/* Header moved to parent page wrapper */}

      {/* Hero State */}
      {isHeroState && (
        <div className="mt-18 flex min-h-[calc(100vh-4rem)] flex-col items-center px-4 pt-24 md:pt-52">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 pb-8">
            <div>
              <h1 className="text-foreground text-4xl leading-10 font-bold tracking-tight">
                {`Hello${resolvedName ? ", " + resolvedName : ""}`}
                <br />
                <span className="text-muted-foreground">What will you script today?</span>
              </h1>
            </div>

            <div className="w-full max-w-2xl">
              <Card className="shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="flex flex-col gap-3 p-4">
                  <div className={`relative ${isIdeaMode ? "rounded-[var(--radius-input)]" : ""}`}>
                    <textarea
                      ref={heroInputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(inputValue);
                        }
                      }}
                      placeholder={placeholder}
                      className="max-h-[200px] min-h-[48px] w-full resize-none bg-transparent text-base leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-600"
                      rows={1}
                    />
                  </div>
                  {selectedPersona && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="bg-secondary/10 text-secondary flex h-6 w-6 items-center justify-center rounded-[var(--radius-button)]">
                        {getPersonaByKey(selectedPersona)?.icon}
                      </div>
                      <span className="text-foreground font-medium">{getPersonaByKey(selectedPersona)?.label}</span>
                      <span className="text-muted-foreground">mode</span>
                    </div>
                  )}
                  {linkDetection && linkDetection.type !== "text" && !hasValidVideoUrl && (
                    <div className="bg-muted/80 border-border/50 text-muted-foreground flex items-center gap-2 rounded-md border p-2 text-sm">
                      <span className="text-foreground font-medium">
                        {linkDetection.type === "other_url" ? "Link" : linkDetection.type}
                      </span>
                      {linkDetection.extracted.username && <span>@{linkDetection.extracted.username}</span>}
                      {linkDetection.extracted.postId && <span>#{linkDetection.extracted.postId}</span>}
                      {linkDetection.extracted.contentType && <span>· {linkDetection.extracted.contentType}</span>}
                    </div>
                  )}
                  {hasValidVideoUrl && (
                    <div className="bg-accent text-foreground animate-in fade-in-0 rounded-[var(--radius-card)] px-3 py-2 text-sm duration-200">
                      ✓ Link identified. Press submit to continue
                    </div>
                  )}
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`!h-8 !w-8 ${isIdeaMode ? "bg-accent" : ""}`}
                        onClick={() => {
                          setIsIdeaMode((v) => !v);
                          setTimeout(() => heroInputRef.current?.focus(), 0);
                        }}
                        title="Write to Idea Inbox"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="icon" className="!h-8 !w-8">
                        <SlidersHorizontal className="h-3 w-3" />
                      </Button>
                      <DropdownMenu open={ideasOpen} onOpenChange={setIdeasOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="!h-8 gap-1.5">
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
                                  // Focus the textarea in chat input (non-hero state)
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
                    </div>
                    <Button
                      size="icon"
                      className={`size-8 transition-shadow ${
                        hasValidVideoUrl || inputValue.trim()
                          ? `bg-primary text-primary-foreground hover:opacity-90 ${hasValidVideoUrl ? "animate-clarity-pulse shadow-[var(--shadow-soft-drop)]" : ""}`
                          : "bg-muted text-muted-foreground"
                      } focus-visible:ring-ring focus-visible:ring-2`}
                      disabled={!(hasValidVideoUrl || inputValue.trim())}
                      onClick={() => {
                        handleSend(inputValue);
                      }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {!isIdeaMode && (
              <div className="mx-auto flex w-full max-w-2xl flex-wrap justify-center gap-2">
                {personas.map((p) => (
                  <Button
                    key={p.key}
                    variant={selectedPersona === p.key ? "default" : "outline"}
                    size="sm"
                    className="rounded-pill h-8 gap-2 px-4 transition-all"
                    onClick={() => setSelectedPersona((prev) => (prev === p.key ? null : p.key))}
                  >
                    {getPersonaByKey(p.key)?.icon}
                    <span>{p.label}</span>
                  </Button>
                ))}
              </div>
            )}
            {isIdeaMode && (
              <div className="mx-auto w-full max-w-2xl">
                <div className="bg-accent text-foreground mt-2 rounded-[var(--radius-card)] px-3 py-2 text-sm">
                  Idea mode is active. Your input will be saved to your Idea Inbox.
                </div>
                {ideaSaveMessage && <div className="text-muted-foreground mt-1 text-xs">{ideaSaveMessage}</div>}
              </div>
            )}
            {selectedPersona && (
              <div className="bg-card border-border mx-auto mt-2 w-full max-w-2xl rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-soft-drop)]">
                <div className="flex items-start gap-3">
                  <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
                    {getPersonaByKey(selectedPersona)?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-semibold">
                      {getPersonaByKey(selectedPersona)?.label} Mode Active
                    </div>
                    <p className="text-muted-foreground text-sm">{getPersonaByKey(selectedPersona)?.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat State */}
      {!isHeroState && (
        <div className="relative flex h-[calc(100vh-4rem)] flex-col">
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
                            <div className="bg-accent text-foreground inline-flex max-w-[min(85%,_60ch)] items-center gap-2 rounded-[var(--radius-card)] px-4 py-3">
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
                            {m.content === "<ack-loading>" ? (
                              <div className="flex items-center gap-2 pt-1 pl-1">
                                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                                <span className="sr-only">Analyzing…</span>
                              </div>
                            ) : m.content === "<video-actions>" && videoPanel ? (
                              <div className="bg-card border-border text-card-foreground rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft-drop)]">
                                <div className="text-foreground mb-3 font-semibold">Choose an action</div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                  <button
                                    className={`bg-card text-card-foreground hover:bg-accent/70 border-border rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-soft-drop)] transition-transform duration-150 hover:scale-[1.01] ${activeAction ? "opacity-70" : ""}`}
                                    onClick={handleInlineTranscribe}
                                    disabled={activeAction !== null}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
                                        <FileText className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <div className="text-foreground font-semibold">Transcribe</div>
                                        <div className="text-muted-foreground text-sm">
                                          Extract plain text transcript
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                  <button
                                    className={`bg-card text-card-foreground hover:bg-accent/70 border-border rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-soft-drop)] transition-transform duration-150 hover:scale-[1.01] ${activeAction ? "opacity-70" : ""}`}
                                    onClick={handleInlineAnalyze}
                                    disabled={activeAction !== null}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
                                        <Sparkles className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <div className="text-foreground font-semibold">
                                          Advanced Stylometric Analysis
                                        </div>
                                        <div className="text-muted-foreground text-sm">
                                          Deep linguistic forensics & voice replication analysis
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                  <button
                                    className={`bg-card text-card-foreground hover:bg-accent/70 border-border rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-soft-drop)] transition-transform duration-150 hover:scale-[1.01] ${activeAction ? "opacity-70" : ""}`}
                                    onClick={handleInlineEmulateStart}
                                    disabled={activeAction !== null}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
                                        <CopyCheck className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <div className="text-foreground font-semibold">Emulate Style (@Analyze)</div>
                                        <div className="text-muted-foreground text-sm">
                                          Generate new script in source style
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                  <button
                                    className={`bg-card text-card-foreground hover:bg-accent/70 border-border rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-soft-drop)] transition-transform duration-150 hover:scale-[1.01] ${activeAction ? "opacity-70" : ""}`}
                                    onClick={handleInlineIdeas}
                                    disabled={activeAction !== null}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
                                        <Lightbulb className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <div className="text-foreground font-semibold">
                                          Create Content Ideas (@Content Ideas.md)
                                        </div>
                                        <div className="text-muted-foreground text-sm">
                                          New content angles using PEQ
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                  <button
                                    className={`bg-card text-card-foreground hover:bg-accent/70 border-border rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-soft-drop)] transition-transform duration-150 hover:scale-[1.01] ${activeAction ? "opacity-70" : ""}`}
                                    onClick={handleInlineHooks}
                                    disabled={activeAction !== null}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
                                        <Megaphone className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <div className="text-foreground font-semibold">Hook Generation</div>
                                        <div className="text-muted-foreground text-sm">
                                          High-performing hooks for Shorts
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            ) : m.content === "<emulate-input>" && awaitingEmulateInput ? (
                              <div className="bg-card border-border text-card-foreground rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft-drop)]">
                                <div className="text-foreground mb-2 font-semibold">Describe your video idea</div>
                                <div className="flex items-end gap-2">
                                  <textarea
                                    value={emulateIdea}
                                    onChange={(e) => setEmulateIdea(e.target.value)}
                                    rows={2}
                                    className="text-foreground placeholder:text-muted-foreground bg-background/60 w-full resize-none rounded-[var(--radius-input)] p-2 text-sm focus:outline-none"
                                    placeholder="e.g., Teach the simplest habit that boosted my productivity"
                                  />
                                  <Button size="sm" disabled={!emulateIdea.trim()} onClick={handleInlineEmulateSubmit}>
                                    Generate
                                  </Button>
                                </div>
                              </div>
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
          <div className="bg-background/95 border-border absolute right-0 bottom-0 left-0 z-10 border-t px-4 py-4 backdrop-blur-sm">
            <div className="mx-auto w-full max-w-3xl">
              <Card className="border-border bg-card/95 shadow-[var(--shadow-soft-drop)] backdrop-blur-sm">
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-end gap-3">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(inputValue);
                        }
                      }}
                      placeholder="Reply to Gen.C..."
                      className="text-foreground placeholder:text-muted-foreground max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent text-base leading-relaxed focus:outline-none"
                      rows={1}
                    />
                    <Button
                      size="icon"
                      className={`size-8 transition-shadow ${
                        inputValue.trim()
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "bg-muted text-muted-foreground"
                      } focus-visible:ring-ring focus-visible:ring-2`}
                      disabled={!inputValue.trim()}
                      onClick={() => handleSend(inputValue)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
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
