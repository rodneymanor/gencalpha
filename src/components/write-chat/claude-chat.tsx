"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ChevronDown, Ellipsis, Plus, Search, SendHorizonal, SlidersHorizontal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Suggestion = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

export type ClaudeChatProps = {
  className?: string;
  placeholder?: string;
  onSend?: (message: string) => void;
};

export function ClaudeChat({ className, placeholder = "How can I help you today?", onSend }: ClaudeChatProps) {
  const [isHeroState, setIsHeroState] = useState(true);
  const [title, setTitle] = useState<string>("New conversation");
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // no-op ref to preserve potential future use without linter complaints

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    setTitle(greeting);
  }, []);

  const suggestions: Suggestion[] = useMemo(
    () => [
      { id: "write", label: "Write", icon: <Sparkles className="text-muted-foreground h-4 w-4" /> },
      { id: "learn", label: "Learn", icon: <Search className="text-muted-foreground h-4 w-4" /> },
      { id: "code", label: "Code", icon: <SlidersHorizontal className="text-muted-foreground h-4 w-4" /> },
      { id: "plan", label: "Life stuff", icon: <Ellipsis className="text-muted-foreground h-4 w-4" /> },
    ],
    [],
  );

  const handleSend = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: trimmed }]);
    setInputValue("");
    setIsHeroState(false);
    setTitle(trimmed.length > 50 ? `${trimmed.slice(0, 50)}...` : trimmed);
    onSend?.(trimmed);

    // Simulate assistant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'd be happy to help you with that! Let me provide you with some information.",
        },
      ]);
    }, 900);
  };

  return (
    <div className={className}>
      {/* Sticky header with gradient backdrop */}
      <div className="sticky top-0 z-20 -mb-6 h-12 w-full opacity-100 transition-all">
        <div className="from-background to-background/0 pointer-events-none absolute inset-x-0 top-0 -bottom-5 -z-10 bg-gradient-to-b blur-sm" />
        <div className="flex w-full items-center justify-between gap-6 pr-3 pl-8">
          <button
            type="button"
            className="text-foreground hover:bg-accent inline-flex h-7 min-w-20 items-center gap-1.5 rounded-[var(--radius-button)] px-1 text-sm font-medium tracking-[var(--tracking-normal)] transition-colors"
          >
            <span className="truncate">{title}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1 rounded-[var(--radius-button)] px-3">
              <Plus className="h-4 w-4" /> Share
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-[var(--radius-button)]">
              <Ellipsis className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero State */}
      {isHeroState && (
        <div className="flex h-[calc(100vh-6rem)] flex-col items-center px-4 pt-24 md:pt-48">
          <div className="mx-auto flex w-full max-w-[672px] flex-col items-center gap-6 pb-8 text-center">
            <div className="text-muted-foreground inline-flex items-center gap-3 text-3xl font-semibold text-balance md:text-4xl">
              <div className="text-brand h-8 w-8 animate-[spin_20s_linear_infinite]">●</div>
              <span className="font-sans">{title}</span>
            </div>

            <div className="w-full max-w-[672px]">
              <Card className="bg-card border-input rounded-[var(--radius-card)] border shadow-[var(--shadow-input)] transition-shadow focus-within:shadow-[var(--shadow-soft-drop)] hover:shadow-[var(--shadow-input)]">
                <div className="flex flex-col gap-4 p-4">
                  <div className="relative">
                    <div className="max-h-96 min-h-12 w-full overflow-y-auto">
                      <div
                        className="text-foreground placeholder:text-muted-foreground max-w-[60ch] p-1 text-base leading-relaxed break-words whitespace-pre-wrap outline-none"
                        role="textbox"
                        aria-label="Write your prompt"
                        contentEditable
                        onInput={(e) => setInputValue((e.target as HTMLDivElement).innerText)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(inputValue);
                          }
                        }}
                        data-placeholder={placeholder}
                        suppressContentEditableWarning
                      />
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-3">
                    <div className="flex flex-1 items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 min-w-8 rounded-[var(--radius-button)] px-2">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 min-w-8 rounded-[var(--radius-button)] px-2">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 gap-1 rounded-[var(--radius-button)] px-2">
                        <Search className="h-4 w-4" />
                        <span className="hidden sm:inline">Research</span>
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      className="bg-secondary text-secondary-foreground h-8 w-8 rounded-[var(--radius-button)]"
                      disabled={!inputValue.trim()}
                      onClick={() => handleSend(inputValue)}
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mx-auto flex w-full max-w-[672px] flex-wrap justify-center gap-2 pt-6">
              {suggestions.map((s) => (
                <Button
                  key={s.id}
                  variant="outline"
                  size="sm"
                  className="bg-card text-foreground hover:bg-accent hover:text-accent-foreground border-input inline-flex items-center gap-2 rounded-[var(--radius-button)] border px-3 py-2"
                  onClick={() => setInputValue(s.label)}
                >
                  {s.icon}
                  <span className="sm:inline">{s.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat State */}
      {!isHeroState && (
        <div className="flex h-[calc(100vh-6rem)] flex-col pt-14">
          <ScrollArea className="h-full px-4">
            <div className="mx-auto max-w-3xl py-6">
              {messages.map((m) => (
                <div key={m.id} className="animate-in fade-in-0 zoom-in-95 mb-6">
                  {m.role === "assistant" ? (
                    <div className="flex items-start gap-3">
                      <div className="bg-secondary text-secondary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] font-bold">
                        C
                      </div>
                      <Card className="bg-card border-input rounded-[var(--radius-card)] border p-4">
                        <p className="text-sm leading-relaxed">{m.content}</p>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Card className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-input)]">
                        <p className="text-sm leading-relaxed">{m.content}</p>
                      </Card>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="px-4 py-4">
            <div className="mx-auto w-full max-w-3xl">
              <Card className="bg-card border-input rounded-[var(--radius-card)] border shadow-[var(--shadow-input)]">
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(inputValue);
                        }
                      }}
                      placeholder="Reply to Claude..."
                      className="font-sans"
                    />
                    <Button
                      size="icon"
                      className="bg-secondary text-secondary-foreground h-8 w-8 rounded-[var(--radius-button)]"
                      disabled={!inputValue.trim()}
                      onClick={() => handleSend(inputValue)}
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 min-w-8 rounded-[var(--radius-button)] px-2">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 min-w-8 rounded-[var(--radius-button)] px-2">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1 rounded-[var(--radius-button)] px-2">
                      <Search className="h-4 w-4" />
                      <span className="hidden sm:inline">Research</span>
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
