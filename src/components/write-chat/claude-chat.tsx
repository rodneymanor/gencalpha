/* eslint-disable max-lines */
/* eslint-disable complexity */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Plus, Search, SendHorizontal, SlidersHorizontal, Share2 } from "lucide-react";

import { type PersonaType, PERSONAS } from "@/components/chatbot/persona-selector";
import { Button, Card, ScrollArea } from "@/components/write-chat/primitives";
import { useAuth } from "@/contexts/auth-context";
import { useScriptGeneration } from "@/hooks/use-script-generation";
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
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(initialPersona ?? null);
  const [linkDetection, setLinkDetection] = useState<DetectionResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const heroInputRef = useRef<HTMLTextAreaElement | null>(null);
  const { user, userProfile } = useAuth();
  const { generateScript } = useScriptGeneration();
  const [chatTitle, setChatTitle] = useState<string>("Untitled Chat");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const personas = useMemo(() => PERSONAS.map((p) => ({ key: p.key, label: p.label })), []);
  const getPersonaByKey = (key: PersonaType | null) => PERSONAS.find((p) => p.key === key);
  const resolvedName = userProfile?.displayName ?? user?.displayName;

  const handleSend = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

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
      <div className="bg-background border-border sticky top-0 z-10 border-b">
        <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between px-4">
          <input
            value={chatTitle}
            onChange={(e) => setChatTitle(e.target.value)}
            placeholder="Untitled Chat"
            className="text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full max-w-sm rounded-[var(--radius-input)] border border-transparent bg-transparent px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-1"
          />
          <Button variant="outline" size="sm" className="ml-3 h-8 gap-2 rounded-[var(--radius-button)]">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      {/* Hero State */}
      {isHeroState && (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center px-4 pt-24 md:pt-32">
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
                  <div className="relative">
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
                  {linkDetection && linkDetection.type !== "text" && (
                    <div className="bg-muted/80 border-border/50 text-muted-foreground flex items-center gap-2 rounded-md border p-2 text-sm">
                      <span className="text-foreground font-medium">
                        {linkDetection.type === "other_url" ? "Link" : linkDetection.type}
                      </span>
                      {linkDetection.extracted.username && <span>@{linkDetection.extracted.username}</span>}
                      {linkDetection.extracted.postId && <span>#{linkDetection.extracted.postId}</span>}
                      {linkDetection.extracted.contentType && <span>· {linkDetection.extracted.contentType}</span>}
                    </div>
                  )}
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 gap-1.5">
                        <Search className="h-4 w-4" />
                        <span className="hidden sm:inline">Research</span>
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      className={`h-8 w-8 transition-all ${
                        inputValue.trim()
                          ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                          : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                      }`}
                      disabled={!inputValue.trim()}
                      onClick={() => handleSend(inputValue)}
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

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
                          {/* User avatar */}
                          <div className="bg-secondary text-secondary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                            {(resolvedName?.[0] ?? "U").toUpperCase()}
                          </div>
                          {/* User message bubble */}
                          <div className="col-start-2">
                            <div className="bg-accent text-foreground inline-block max-w-[min(85%,_60ch)] rounded-[var(--radius-input)] px-4 py-3">
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
                      className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent text-base leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-600"
                      rows={1}
                    />
                    <Button
                      size="icon"
                      className={`h-8 w-8 transition-all ${
                        inputValue.trim()
                          ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                          : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                      }`}
                      disabled={!inputValue.trim()}
                      onClick={() => handleSend(inputValue)}
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClaudeChat;
