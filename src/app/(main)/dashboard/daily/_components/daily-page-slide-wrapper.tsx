"use client";

import { useState, useEffect, useRef } from "react";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

import { ManusPrompt } from "@/components/manus-prompt";
import { Button } from "@/components/ui/button";

import { DailyInspirationSection } from "./daily-inspiration-section";

export default function DailyPageSlideWrapper() {
  const [showContent, setShowContent] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Determine scroll direction
      const scrollDirection = currentScrollY > lastScrollY.current ? "down" : "up";
      lastScrollY.current = currentScrollY;

      // Show content when scrolling up
      if (scrollDirection === "up" && currentScrollY > 50 && !showContent) {
        setShowContent(true);
      }

      // Hide content when scrolling down and we're back near the top
      if (scrollDirection === "down" && currentScrollY < 100 && showContent) {
        // Add a small delay to prevent flickering
        scrollTimeout.current = setTimeout(() => {
          setShowContent(false);
        }, 300);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [showContent]);

  // Handle manual button clicks
  const handleShowContent = () => {
    setShowContent(true);
    // Scroll down a bit to trigger the scroll detection
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const handleHideContent = () => {
    setShowContent(false);
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen">
      {/* Initial view - only Manus Prompt visible */}
      <div className="flex min-h-screen flex-col justify-center">
        <ManusPrompt
          greeting="Hello"
          subtitle="What will you script today?"
          placeholder="Give Gen.C a topic to script..."
        />

        {/* Explore button positioned 20px from bottom of screen */}
        <div className="fixed bottom-5 left-1/2 z-10 -translate-x-1/2">
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
        {/* Return button at the top */}
        <div className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur-sm">
          <div className="flex justify-center py-4">
            <Button
              variant="ghost"
              size="lg"
              className="text-muted-foreground hover:text-foreground gap-2 transition-colors"
              onClick={() => setShowContent(false)}
            >
              <ChevronUp className="h-4 w-4" />
              Back to Script Input
            </Button>
          </div>
        </div>

        <div className="min-h-screen space-y-8 p-6">
          <div className="mx-auto max-w-7xl space-y-4">
            <DailyInspirationSection />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
