"use client";

import { Loader2, ArrowUp, SlidersHorizontal, Lightbulb, Pencil, Bot, Brain, Mic } from "lucide-react";

import { type AssistantType, AssistantSelector } from "@/components/chatbot/persona-selector";
import { AdvancedSlidingSwitch } from "@/components/ui/advanced-sliding-switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaybookCards } from "@/components/write-chat/playbook-cards";
import { PromptComposer } from "@/components/write-chat/prompt-composer";
import type { DetectionResult } from "@/lib/utils/social-link-detector";

// eslint-disable-next-line complexity
export function HeroSection(props: {
  resolvedName?: string | null;
  inputValue: string;
  setInputValue: (v: string) => void;
  placeholder: string;
  isRecording: boolean;
  showListening: boolean;
  isUrlProcessing: boolean;
  linkDetection: DetectionResult | null;
  hasValidVideoUrl: boolean;
  handleSend: (value: string) => void;
  heroInputRef: React.RefObject<HTMLTextAreaElement | null>;
  selectedAssistant: AssistantType | null;
  setSelectedAssistant: (p: AssistantType | null) => void;
  isIdeaMode: boolean;
  setIsIdeaMode: (v: boolean) => void;
  ideaSaveMessage: string | null;
  ideas: Array<{ id: string; title: string; content: string }>;
  ideasOpen: boolean;
  setIdeasOpen: (v: boolean) => void;
  isIdeaInboxEnabled: boolean;
  onVoiceClick: () => void;
}) {
  const {
    resolvedName,
    inputValue,
    setInputValue,
    placeholder,
    isRecording,
    showListening,
    isUrlProcessing,
    linkDetection,
    hasValidVideoUrl,
    handleSend,
    heroInputRef,
    selectedAssistant,
    setSelectedAssistant,
    isIdeaMode,
    setIsIdeaMode,
    ideaSaveMessage, // eslint-disable-line @typescript-eslint/no-unused-vars
    ideas,
    ideasOpen,
    setIdeasOpen,
    isIdeaInboxEnabled,
    onVoiceClick,
  } = props;

  return (
    <div className="flex max-h-screen min-h-screen flex-col items-center justify-center overflow-y-auto px-4 py-8 transition-all duration-300">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 px-5">
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
                    setIsIdeaMode(!isIdeaMode);
                    setTimeout(() => heroInputRef.current?.focus(), 0);
                  }}
                  title="Write to Idea Inbox"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="size-8">
                  <SlidersHorizontal className="h-3 w-3" />
                </Button>
                <AdvancedSlidingSwitch
                  options={[
                    { value: "ghost-write", icon: <Bot className="h-[18px] w-[18px]" />, tooltip: "Ghost Write" },
                    { value: "web-search", icon: <Brain className="h-[18px] w-[18px]" />, tooltip: "Web Search" },
                  ]}
                  onChange={() => {}}
                  disabled={isIdeaMode}
                />
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
                              requestAnimationFrame(() => heroInputRef.current?.focus());
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
                    if (!isUrlProcessing) onVoiceClick();
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
                title={inputValue.trim() ? "Send message" : isRecording ? "Stop recording" : "Start voice recording"}
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
            <AssistantSelector
              selectedAssistant={selectedAssistant}
              onAssistantChange={setSelectedAssistant}
              className="justify-center"
              showCallout={Boolean(selectedAssistant)}
            />
          </div>
        )}
        {isIdeaMode && (
          <div className="mx-auto w-full max-w-2xl">
            <div className="bg-accent text-foreground mt-2 rounded-[var(--radius-input)] px-3 py-2 text-sm">
              Idea mode is active. Your input will be saved to your Idea Inbox.
            </div>
            {props.ideaSaveMessage && <div className="text-muted-foreground mt-1 text-xs">{props.ideaSaveMessage}</div>}
          </div>
        )}

        <div className="mt-6 w-full">
          <PlaybookCards />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
