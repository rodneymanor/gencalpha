"use client";

import { useRef, useState } from "react";

import { ChevronDown, Share2 } from "lucide-react";

import { type PersonaType } from "@/components/chatbot/persona-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ClaudeChat from "@/components/write-chat/claude-chat";
import { Button } from "@/components/write-chat/primitives";

export function WriteClient({
  initialPrompt,
  initialPersona,
}: {
  initialPrompt?: string;
  initialPersona?: PersonaType;
}) {
  const [isHeroState, setIsHeroState] = useState(true);
  const [chatTitle, setChatTitle] = useState<string>("Untitled Chat");
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const handleTitleClick = () => {
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleBlur = () => {
    if (!chatTitle.trim()) {
      setChatTitle("Untitled Chat");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {!isHeroState && (
        <div className="bg-background border-border fixed inset-x-0 top-0 z-50 h-12 w-full border-b backdrop-blur">
          {/* Gradient fade below header */}
          <div
            aria-hidden
            className="from-background via-background to-background/0 pointer-events-none absolute inset-0 -bottom-5 -z-10 bg-gradient-to-b blur-sm"
          />

          <div className="ml-[calc(var(--sidebar-width,0px)+32px)] flex h-full w-full items-center justify-between gap-4 pr-3 pl-4 md:pl-0 lg:gap-6">
            {/* Left Section - Title Area */}
            <div className="flex min-w-0 flex-1 items-center">
              <div className="hover:bg-accent/50 inline-flex items-center rounded-[var(--radius-button)] px-1">
                <input
                  ref={titleInputRef}
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  onClick={handleTitleClick}
                  placeholder="Untitled Chat"
                  className="text-foreground placeholder:text-muted-foreground max-w-sm truncate bg-transparent px-1 py-1 text-base font-semibold tracking-tight outline-none"
                  style={{ minWidth: "120px", maxWidth: "300px" }}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-accent/50 h-7 w-7 rounded-[var(--radius-button)]"
                    >
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                      <span className="sr-only">Chat options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        handleTitleClick();
                      }}
                    >
                      Rename chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Duplicate chat</DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Archive chat</DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                      Delete chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2 pl-4">
              <Button
                variant="outline"
                size="sm"
                className="border-border/50 hover:bg-accent hover:border-border h-9 rounded-md"
              >
                <Share2 className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto pt-12">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <ClaudeChat
            initialPrompt={initialPrompt}
            initialPersona={initialPersona}
            onSend={(msg: string) => {
              if (isHeroState && msg.trim()) {
                setIsHeroState(false);
                if (chatTitle === "Untitled Chat" && msg.length > 0) {
                  const truncatedTitle = msg.length > 30 ? msg.substring(0, 30) + "..." : msg;
                  setChatTitle(truncatedTitle);
                }
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}
