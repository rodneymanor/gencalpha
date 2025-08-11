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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!chatTitle.trim()) {
      setChatTitle("Untitled Chat");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {!isHeroState && (
        <div
          className="border-border/50 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur"
          style={{
            height: "52px",
          }}
        >
          {/* Gradient fade effect below header */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-full -z-10"
            style={{
              height: "24px",
              background: "linear-gradient(to bottom, rgba(var(--background-rgb), 0.8), transparent)",
              filter: "blur(8px)",
            }}
          />

          <div className="flex h-full w-full items-center justify-between px-6 lg:px-8">
            {/* Left Section - Title Area */}
            <div className="flex min-w-0 flex-1 items-center gap-1">
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
                className={`text-foreground placeholder:text-muted-foreground max-w-xs truncate bg-transparent px-2 py-1 text-sm font-medium transition-all duration-200 outline-none ${
                  isEditingTitle
                    ? "bg-accent/50 ring-primary/20 rounded-md ring-2"
                    : "hover:bg-accent/50 cursor-pointer hover:rounded-md"
                }`}
                style={{
                  minWidth: "120px",
                  maxWidth: "300px",
                }}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-accent h-8 w-8 rounded-md">
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

      <main className="min-h-0 flex-1 overflow-y-auto">
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
