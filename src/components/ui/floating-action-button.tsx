"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SlideOutPanel } from "@/components/ui/slide-out-panel";

export function FloatingActionButton() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-30"
        onClick={() => setIsPanelOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <SlideOutPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </>
  );
}