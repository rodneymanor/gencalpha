"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ManusPrompt } from "@/components/manus-prompt";
import { Button } from "@/components/ui/button";
import { DailyInspirationSection } from "./daily-inspiration-section";

export default function DailyPageSlideWrapper() {
  const [showContent, setShowContent] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  
  // Touch/swipe detection states
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const minSwipeDistance = 50;

  // Touch event handlers for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndY.current = 0;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;
    
    const distance = touchStartY.current - touchEndY.current;
    const isUpSwipe = distance > minSwipeDistance;
    
    // Trigger show content on upward swipe
    if (isUpSwipe && !showContent) {
      setShowContent(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      const scrollDirection = currentScrollY > lastScrollY.current ? "down" : "up";
      lastScrollY.current = currentScrollY;

      // Show content when scrolling up
      if (scrollDirection === "up" && currentScrollY > 50 && !showContent) {
        setShowContent(true);
      }

      // Hide content when scrolling down and we're back near the top
      if (scrollDirection === "down" && currentScrollY < 100 && showContent) {
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

  const handleShowContent = () => {
    setShowContent(true);
  };

  const handleHideContent = () => {
    setShowContent(false);
    setShowFullContent(false);
  };

  const handleShowFullContent = () => {
    setShowFullContent(true);
  };

  return (
    <div
      className="relative min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
            onClick={handleShowContent}
            disabled={showContent}
          >
            Explore Viral Content
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content that peeks up from bottom */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{
          y: showContent ? "calc(100vh - 120px)" : "100%",
        }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
          type: "tween",
        }}
        className="bg-background fixed bottom-0 left-0 right-0 z-20 h-screen overflow-hidden rounded-t-xl shadow-lg"
        style={{
          maxHeight: showContent ? "120px" : "0px",
        }}
      >
        {/* Peek content header */}
        <div className="bg-background border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleHideContent}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview content */}
        <div className="px-6 py-3" onClick={handleShowFullContent}>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Hey guys, I'm here! 👋
          </h3>
          <p className="text-sm text-muted-foreground">
            Swipe up or tap to explore viral content and daily inspiration...
          </p>
        </div>
      </motion.div>

      {/* Full content overlay (triggered on tap of peek content) */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{
          y: showFullContent ? 0 : "100%",
        }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
          type: "tween",
        }}
        className="bg-background fixed inset-0 z-30 overflow-y-auto"
        style={{
          display: showFullContent ? "block" : "none",
        }}
      >
        <div className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
          <div className="flex justify-center py-4">
            <Button
              variant="ghost"
              size="lg"
              className="text-muted-foreground hover:text-foreground gap-2 transition-colors"
              onClick={handleHideContent}
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
