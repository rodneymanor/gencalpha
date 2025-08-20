"use client";

import { useRef, useState } from "react";

import { ChevronDown } from "lucide-react";

import { type AssistantType } from "@/components/chatbot/persona-selector";
import { Button } from "@/components/ui/button";
import { CollectionCombobox } from "@/components/ui/collection-combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ClaudeChat from "@/components/write-chat/claude-chat";

export function WriteClient({
  initialPrompt,
  initialAssistant,
}: {
  initialPrompt?: string;
  initialAssistant?: AssistantType;
}) {
  const [isHeroState, setIsHeroState] = useState(true);
  const [chatTitle, setChatTitle] = useState<string>("Untitled Chat");
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all-videos");

  return (
    <>
      {!isHeroState && (
        <div className="bg-background border-border sticky top-0 z-10 -mb-6 border-b">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10"
            style={{
              bottom: "-20px",
              backgroundImage: "linear-gradient(var(--background), var(--background) 65%, rgba(0,0,0,0))",
              filter: "blur(4px)",
            }}
          />
          <div className="flex h-12 w-full items-center justify-between pr-3 pl-8">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <input
                ref={titleInputRef}
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="Untitled Chat"
                className="text-foreground placeholder:text-muted-foreground hover:border-input focus:border-input w-full max-w-sm rounded-[var(--radius-input)] border border-transparent bg-transparent px-3 py-2 text-sm font-medium outline-none"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-[var(--radius-button)]">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      const el = titleInputRef.current;
                      if (el) {
                        el.focus();
                        el.select();
                      }
                    }}
                  >
                    Rename title
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit options</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <CollectionCombobox
                selectedCollectionId={selectedCollectionId}
                onChange={setSelectedCollectionId}
                placeholder="Select collection"
                className="hidden sm:flex"
              />
            </div>
          </div>
        </div>
      )}

      <ClaudeChat
        initialPrompt={initialPrompt}
        initialAssistant={initialAssistant}
        onSend={(msg: string) => {
          if (isHeroState && msg.trim()) setIsHeroState(false);
        }}
      />
    </>
  );
}
