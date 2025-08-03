"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { ManusPrompt } from "@/components/manus-prompt";
import { Button } from "@/components/ui/button";

import { DailyInspirationSection } from "./daily-inspiration-section";

export default function DailyPageSlideWrapper() {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Initial view - only Manus Prompt visible */}
      <div className="flex min-h-screen flex-col justify-center">
        <ManusPrompt
          greeting="Hello"
          subtitle="What will you script today?"
          placeholder="Give Gen.C a topic to script..."
        />

        {/* Explore button positioned below the prompt */}
        <div className="flex justify-center pb-12">
          <Button
            variant="ghost"
            size="lg"
            className="text-muted-foreground hover:text-foreground gap-2 transition-colors"
            onClick={() => setShowContent(true)}
            disabled={showContent}
          >
            Explore Viral Content
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content that slides up from below */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{
          y: showContent ? 0 : "100%",
        }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
          type: "tween",
        }}
        className="bg-background fixed inset-0 z-20 overflow-y-auto"
      >
        <div className="min-h-screen space-y-8 p-6">
          <div className="mx-auto max-w-7xl space-y-4">
            <DailyInspirationSection />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
