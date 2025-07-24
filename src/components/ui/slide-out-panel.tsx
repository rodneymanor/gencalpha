"use client";

import React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TweetStyleComposer } from "@/components/writing-panel/tweet-style-composer";

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SlideOutPanel({ isOpen, onClose }: SlideOutPanelProps) {

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l-2 border-red-500 shadow-lg transform transition-transform duration-300 ease-in-out z-40",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ backgroundColor: 'white' }}
      >
        {/* Connection notch for the button - only show when open */}
        {isOpen && (
          <>
            <div className="absolute -left-[2px] bottom-6 h-14 w-4 bg-background border-l border-t border-b rounded-l-xl" />
            <div 
              className="absolute -left-1 bottom-6 h-14 w-2" 
              style={{ backgroundColor: '#526af9' }}
            />
          </>
        )}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Quick Composer</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto">
              <TweetStyleComposer className="max-w-none" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}