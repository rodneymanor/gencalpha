"use client";

import React, { useState } from "react";
import { X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SlideOutPanel({ isOpen, onClose }: SlideOutPanelProps) {
  const [activeTab, setActiveTab] = useState("composed");
  const [content, setContent] = useState("");

  const handleAddToPlanned = () => {
    // TODO: Implement add to planned functionality
    console.log("Adding to planned:", content);
  };

  const handleSaveHook = () => {
    // TODO: Implement save hook functionality
    console.log("Saving hook:", content);
  };

  const handleRecord = () => {
    // TODO: Implement record functionality
    console.log("Recording:", content);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l shadow-lg transform transition-transform duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Content Panel</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex-1 flex flex-col">
              <div className="flex w-full px-4 pt-4">
                <div className="flex w-full relative">
                  <button
                    onClick={() => setActiveTab("composed")}
                    className={cn(
                      "flex-1 py-2 px-1 text-sm font-medium text-center transition-colors relative",
                      activeTab === "composed"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Composed
                    {activeTab === "composed" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("hooks")}
                    className={cn(
                      "flex-1 py-2 px-1 text-sm font-medium text-center transition-colors relative",
                      activeTab === "hooks"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Hooks
                    {activeTab === "hooks" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("planned")}
                    className={cn(
                      "flex-1 py-2 px-1 text-sm font-medium text-center transition-colors relative",
                      activeTab === "planned"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Planned
                    {activeTab === "planned" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("track")}
                    className={cn(
                      "flex-1 py-2 px-1 text-sm font-medium text-center transition-colors relative",
                      activeTab === "track"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Track
                    {activeTab === "track" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                    )}
                  </button>
                </div>
              </div>

            <div className="flex-1 flex flex-col p-4">
              {activeTab === "composed" && (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Your Content</label>
                    <Textarea
                      placeholder="Write your content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="h-40 resize-none"
                    />
                  </div>
                  <Button onClick={handleAddToPlanned} className="w-full">
                    Add to Planned
                  </Button>
                </div>
              )}

              {activeTab === "hooks" && (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Your Content</label>
                    <Textarea
                      placeholder="Write your hooks content here..."
                      className="h-40 resize-none"
                    />
                  </div>
                  <Button onClick={handleSaveHook} className="w-full">
                    Save Hook
                  </Button>
                </div>
              )}

              {activeTab === "planned" && (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Your Content</label>
                    <Textarea
                      placeholder="Write your planned content here..."
                      className="h-40 resize-none"
                    />
                  </div>
                  <Button onClick={handleRecord} className="w-full">
                    Record
                  </Button>
                </div>
              )}

              {activeTab === "track" && (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Your Content</label>
                    <Textarea
                      placeholder="Write your tracking content here..."
                      className="h-40 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}