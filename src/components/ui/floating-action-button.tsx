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
          "fixed bottom-6 h-16 w-16 rounded-xl blur-sm transition-all duration-300 ease-in-out",
          isPanelOpen 
            ? "right-[23rem] sm:right-[24rem] z-20" 
            : "right-6 z-20"
        )}
        style={{ backgroundColor: '#8e24cb', opacity: 0.2 }}
      />
      
      {/* Main button */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 h-14 w-14 rounded-xl transition-all duration-300 ease-in-out",
          "text-white border-2 border-white/20 hover:border-white/30",
          "shadow-lg hover:shadow-xl backdrop-blur-sm",
          "hover:scale-105 active:scale-95",
          isPanelOpen 
            ? "right-[23rem] sm:right-[24rem] rounded-r-none border-r-0 z-30" 
            : "right-6 z-50"
        )}
        style={{ 
          backgroundColor: '#8e24cb',
          boxShadow: '0 10px 15px -3px rgba(142, 36, 203, 0.25), 0 4px 6px -2px rgba(142, 36, 203, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#7a1fb5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#8e24cb';
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