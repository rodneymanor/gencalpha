"use client";

import React from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SlideOutPanel } from "@/components/ui/slide-out-panel";
import { cn } from "@/lib/utils";
import { useScriptPanel } from "@/contexts/script-panel-context";

export function FloatingActionButton() {
  const { isPanelOpen, openPanel, closePanel } = useScriptPanel();

  return (
    <>
      {/* Backdrop glow effect */}
      <div 
        className={cn(
          "fixed bottom-6 h-16 w-16 rounded-lg blur-sm transition-all duration-300 ease-in-out",
          isPanelOpen 
            ? "right-[21rem] sm:right-[22rem] z-[60]" 
            : "right-6 z-[60]"
        )}
        style={{ backgroundColor: '#000000', opacity: 0.2 }}
      />
      
      {/* Main button */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 h-14 w-14 rounded-lg transition-all duration-300 ease-in-out",
          "text-white border-0 shadow-lg hover:shadow-xl backdrop-blur-sm",
          "hover:scale-105 active:scale-95",
          isPanelOpen 
            ? "right-[21rem] sm:right-[22rem] z-[70]" 
            : "right-6 z-[70]"
        )}
        style={{ 
          backgroundColor: '#000000',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1a1a1a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#000000';
        }}
        onClick={() => openPanel()}
      >
        <Pencil className="h-5 w-5" />
      </Button>

      <SlideOutPanel 
        isOpen={isPanelOpen} 
        onClose={() => closePanel()} 
      />
    </>
  );
}