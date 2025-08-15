"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown, Share2 } from "lucide-react";

import { type PersonaType } from "@/components/chatbot/persona-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
  const [sidebarGapPx, setSidebarGapPx] = useState<number>(0);

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

  // Keep header aligned 32px from the visible sidebar by measuring the sidebar gap element
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;

    const update = () => {
      const el = document.querySelector('[data-slot="sidebar-gap"]');
      setSidebarGapPx(el ? (el as HTMLElement).getBoundingClientRect().width : 0);
    };

    update();
    if (typeof ResizeObserver !== "undefined") {
      const el = document.querySelector('[data-slot="sidebar-gap"]');
      if (el) {
        resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(el as HTMLElement);
      }
    }
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header for hero state */}
      {isHeroState && (
        <div className="flex md:hidden items-center p-4">
          <SidebarTrigger className="h-8 w-8" />
        </div>
      )}
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          {!isHeroState && (
            <div
              className="flex items-center justify-between gap-4 pt-3 pb-3 lg:gap-6"
              style={{ paddingLeft: `${sidebarGapPx + 0}px` }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <SidebarTrigger className="md:hidden h-8 w-8" />
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
          )}
          <div className={isHeroState ? "-mt-24 md:-mt-32" : ""}>
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
              onHeroStateChange={(isHero: boolean) => {
                setIsHeroState(isHero);
              }}
              // When an assistant answer is appended, broadcast a DOM event so SlideoutWrapper can open
              onAnswerReady={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("write:answer-ready"));
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
