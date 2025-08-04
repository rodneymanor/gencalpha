"use client";

import React from "react";

import { Globe, ScrollText, StickyNote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function HelpNotificationsButtons() {
  return (
    <TooltipProvider>
      <div className="bg-muted inline-flex items-center overflow-hidden rounded-full border p-0.5">
        {/* Search for Viral Content Button */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group hover:bg-background data-[state=open]:bg-background pointer-events-auto relative inline-flex h-[30px] w-[32px] cursor-pointer items-center justify-center rounded-none border-transparent px-2.5 py-1 text-center text-xs font-normal outline-0 transition-all duration-200 ease-out outline-none focus-visible:outline-4 focus-visible:outline-offset-1"
                >
                  <Globe className="text-muted-foreground group-hover:text-foreground h-[18px] w-[18px] transition-colors" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search for Viral Content</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">Search for Viral Content</h4>
              <p className="text-muted-foreground text-sm">Search the internet for trending content and viral ideas.</p>
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter keywords or phrases to search for viral content..."
                  className="resize-none"
                  rows={2}
                />
                <Button size="sm" className="w-full">
                  Search Content
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* AI Ghostwriter Button */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group hover:bg-background data-[state=open]:bg-background pointer-events-auto relative inline-flex h-[30px] w-[32px] cursor-pointer items-center justify-center rounded-none border-transparent px-1 py-1 text-center text-xs font-normal outline-0 transition-all duration-200 ease-out outline-none focus-visible:outline-4 focus-visible:outline-offset-1"
                >
                  <ScrollText className="text-muted-foreground group-hover:text-foreground h-[18px] w-[18px] transition-colors" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI Ghostwriter</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">AI Ghostwriter</h4>
              <p className="text-muted-foreground text-sm">Let AI write scripts based on your content preferences.</p>
              <div className="space-y-2">
                <Textarea
                  placeholder="Describe your content style and preferences..."
                  className="resize-none"
                  rows={3}
                />
                <div className="space-y-1">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    Generate Script
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    Style Templates
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    Content Preferences
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Record or Type Notes Button */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group hover:bg-background data-[state=open]:bg-background pointer-events-auto relative inline-flex h-[30px] w-[32px] cursor-pointer items-center justify-center rounded-none border-transparent px-1 py-1 text-center text-xs font-normal outline-0 transition-all duration-200 ease-out outline-none focus-visible:outline-4 focus-visible:outline-offset-1"
                >
                  <StickyNote className="text-muted-foreground group-hover:text-foreground h-[18px] w-[18px] transition-colors" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Record or Type Notes</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">Record or Type Notes</h4>
              <p className="text-muted-foreground text-sm">Save notes in your idea inbox for later action.</p>
              <div className="space-y-2">
                <Textarea
                  placeholder="Type your notes here or click record to capture voice notes..."
                  className="resize-none"
                  rows={4}
                />
                <div className="space-y-1">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    Save to Idea Inbox
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    Record Voice Note
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
