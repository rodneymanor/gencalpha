"use client";

import React, { useState } from "react";

import { Globe, ScrollText, StickyNote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { SlidingSwitch, SlidingSwitchOption } from "@/components/ui/sliding-switch";

type HelpMode = 'viral' | 'ghostwriter' | 'notes';

export default function HelpNotificationsButtons() {
  const [selectedMode, setSelectedMode] = useState<HelpMode>('viral');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const modeOptions: SlidingSwitchOption[] = [
    { value: 'viral', icon: <Globe size={18} /> },
    { value: 'ghostwriter', icon: <ScrollText size={18} /> },
    { value: 'notes', icon: <StickyNote size={18} /> },
  ];

  const handleModeChange = (index: number, option: SlidingSwitchOption) => {
    setSelectedMode(option.value as HelpMode);
  };

  const getModeContent = () => {
    switch (selectedMode) {
      case 'viral':
        return {
          title: "Search for Viral Content",
          description: "Search the internet for trending content and viral ideas.",
          placeholder: "Enter keywords or phrases to search for viral content...",
          buttonText: "Search Content",
          textareaRows: 2
        };
      case 'ghostwriter':
        return {
          title: "AI Ghostwriter",
          description: "Let AI write scripts based on your content preferences.",
          placeholder: "Describe your content style and preferences...",
          buttonText: "Generate Script",
          textareaRows: 3
        };
      case 'notes':
        return {
          title: "Record or Type Notes",
          description: "Save notes in your idea inbox for later action.",
          placeholder: "Type your notes here or click record to capture voice notes...",
          buttonText: "Save to Idea Inbox",
          textareaRows: 4
        };
    }
  };

  const content = getModeContent();

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div>
          <SlidingSwitch
            options={modeOptions}
            onChange={handleModeChange}
            defaultValue={0}
            className="h-8"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="leading-none font-medium">{content.title}</h4>
          <p className="text-muted-foreground text-sm">{content.description}</p>
          <div className="space-y-2">
            <Textarea
              placeholder={content.placeholder}
              className="resize-none"
              rows={content.textareaRows}
            />
            <Button size="sm" className="w-full">
              {content.buttonText}
            </Button>
            {selectedMode === 'ghostwriter' && (
              <div className="space-y-1">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  Style Templates
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  Content Preferences
                </Button>
              </div>
            )}
            {selectedMode === 'notes' && (
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                Record Voice Note
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
