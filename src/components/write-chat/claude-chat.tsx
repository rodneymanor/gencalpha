/* eslint-disable max-lines */
/* eslint-disable complexity */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ArrowUp, SlidersHorizontal, Lightbulb, Pencil } from "lucide-react";

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
import { VideoActionsDialog } from "@/components/write-chat/video-actions-dialog";
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
  initialPrompt?: string;
  initialPersona?: PersonaType;
};

export function ClaudeChat({
  className = "",
  placeholder = "How can I help you today?",
  onSend,
  initialPrompt,
  initialPersona,
}: ClaudeChatProps) {
  const [isHeroState, setIsHeroState] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prefetch ideas on mount to keep the menu snappy
  useEffect(() => {
    mountedRef.current = true;
    clientNotesService
      .getIdeaInboxNotes()
      .then((res) => {
        if (mountedRef.current) setIdeas(res.notes || []);
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
          const token = await firebaseAuth?.currentUser?.getIdToken?.();
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

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: trimmed }]);
    setInputValue("");
    setIsHeroState(false);
    onSend?.(trimmed, selectedPersona ?? "MiniBuddy");

    // If no persona selected, treat the input as a script idea and run Speed Write
    if (!selectedPersona) {
      try {
        const res = await generateScript(trimmed, "60");
        if (res.success && res.script) {
          const content = `📝 Generated Script:\n\n**Hook:** ${res.script.hook}\n\n**Bridge:** ${res.script.bridge}\n\n**Golden Nugget:** ${res.script.goldenNugget}\n\n**Call to Action:** ${res.script.wta}`;
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content }]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `Error: ${res.error ?? "Failed to generate script"}`,
            },
          ]);
        }
      } catch (err: unknown) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Error: ${typeof err === "object" && err && "message" in err ? String((err as { message?: unknown }).message) : "Failed to generate script"}`,
          },
        ]);
      }
      return;
    }

    // Script command detection
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("/script ") || lower.includes("generate script")) {
      const idea = trimmed.replace(/^\s*\/script\s+/i, "").replace(/^(generate script\s*:?)\s*/i, "");
      try {
        const res = await generateScript(idea, "60");
        if (res.success && res.script) {
          const content = `📝 Generated Script:\n\n**Hook:** ${res.script.hook}\n\n**Bridge:** ${res.script.bridge}\n\n**Golden Nugget:** ${res.script.goldenNugget}\n\n**Call to Action:** ${res.script.wta}`;
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content }]);
          return;
        }
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: `Error: ${res.error ?? "Failed to generate script"}` },
        ]);
        return;
      } catch (err: unknown) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Error: ${typeof err === "object" && err && "message" in err ? String((err as { message?: unknown }).message) : "Failed to generate script"}`,
          },
        ]);
        return;
      }
    }

    try {
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
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: assistantText }]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${typeof err === "object" && err && "message" in err ? String((err as { message?: unknown }).message) : "Failed to get response"}`,
        },
      ]);
    }
  };

  return (
    <div className={`font-sans ${className}`}>
      {/* Header */}
      {/* Header moved to parent page wrapper */}

      {/* Hero State */}
      {isHeroState && (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center px-4 pt-24 md:pt-52">
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
                        if (hasValidVideoUrl) {
                          setActionsOpen(true);
                          return;
                        }
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
                    className="h-10 gap-2 transition-all"
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
        <div className="flex h-[calc(100vh-4rem)] flex-col">
          <ScrollArea className="flex-1 px-4">
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
                          {/* Assistant message as plain text, no container */}
                          <div className="col-start-2">
                            <div className="prose text-foreground max-w-none">
                              <p className="text-base leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>
                            </div>
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

          {/* Chat Input */}
          <div className="bg-transparent px-4 pt-2 pb-2">
            <div className="mx-auto w-full max-w-3xl">
              <Card className="border-border bg-transparent shadow-sm dark:bg-transparent">
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
      {hasValidVideoUrl && urlSupported && urlCandidate && (
        <VideoActionsDialog
          open={actionsOpen}
          onOpenChange={setActionsOpen}
          platform={urlSupported}
          videoUrl={urlCandidate}
          onStart={(status) => {
            setIsHeroState(false);
            setIsProcessing(status);
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "<processing>" }]);
          }}
          onResult={async ({ type, data }: { type: string; data: any }) => {
            if (type === "transcript") {
              const transcript: string | undefined = data?.transcript;
              if (transcript) {
                // persist transcript
                try {
                  const token = await firebaseAuth?.currentUser?.getIdToken?.();
                  await fetch("/api/transcript/save", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      ...(token ? { authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                      transcript,
                      sourceUrl: urlCandidate,
                      platform: urlSupported === "tiktok" ? "TikTok" : "Instagram",
                    }),
                  });
                } catch {
                  // ignore persistence errors
                }
                setMessages((prev) => {
                  const filtered = prev.filter((m) => m.content !== "<processing>");
                  return [
                    ...filtered,
                    { id: crypto.randomUUID(), role: "assistant", content: `Transcript:\n\n${transcript}` },
                  ];
                });
              }
            }
            if (type === "analysis") {
              const analysis: string | undefined = data?.analysis;
              if (analysis) {
                setMessages((prev) => {
                  const filtered = prev.filter((m) => m.content !== "<processing>");
                  return [...filtered, { id: crypto.randomUUID(), role: "assistant", content: analysis }];
                });
              }
            }
            if (type === "emulation") {
              const script = data?.script;
              if (script) {
                const content = `📝 Generated Script:\n\nHook: ${script.hook}\n\nBridge: ${script.bridge}\n\nGolden Nugget: ${script.goldenNugget}\n\nCall to Action: ${script.wta}`;
                setMessages((prev) => {
                  const filtered = prev.filter((m) => m.content !== "<processing>");
                  return [...filtered, { id: crypto.randomUUID(), role: "assistant", content }];
                });
              }
            }
            if (type === "ideas") {
              const ideas = data?.ideas as string;
              if (ideas) {
                setMessages((prev) => {
                  const filtered = prev.filter((m) => m.content !== "<processing>");
                  return [...filtered, { id: crypto.randomUUID(), role: "assistant", content: ideas }];
                });
              }
            }
            if (type === "hooks") {
              const hooks = data?.hooks as Array<{ hook: string; template: string }> | undefined;
              if (hooks?.length) {
                const list = hooks.map((h, i) => `${i + 1}. ${h.hook} (${h.template})`).join("\n");
                setMessages((prev) => {
                  const filtered = prev.filter((m) => m.content !== "<processing>");
                  return [...filtered, { id: crypto.randomUUID(), role: "assistant", content: `Hooks:\n\n${list}` }];
                });
              }
            }
            setIsProcessing(null);
          }}
        />
      )}
    </div>
  );
}

export default ClaudeChat;
