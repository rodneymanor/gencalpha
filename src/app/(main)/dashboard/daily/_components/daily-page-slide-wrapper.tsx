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
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // Touch/swipe detection states
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const minSwipeDistance = 50;
  const maxSwipeTime = 300; // Maximum time for a swipe gesture

  // Touch event handlers for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't prevent default here to allow scrolling
    touchEndY.current = 0;
    touchStartY.current = e.targetTouches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;

    // Calculate distance to determine if we should prevent scrolling
    const distance = touchStartY.current - touchEndY.current;
    const isUpSwipe = distance > 20; // Small threshold for initial detection

    // Prevent default scrolling only if we detect an upward swipe intent
    if (isUpSwipe && !showContent) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;

    const distance = touchStartY.current - touchEndY.current;
    const timeElapsed = Date.now() - touchStartTime.current;
    const isUpSwipe = distance > minSwipeDistance && timeElapsed < maxSwipeTime;
    const isDownSwipe = distance < -minSwipeDistance && timeElapsed < maxSwipeTime;

    console.log("Touch end:", { distance, timeElapsed, isUpSwipe, isDownSwipe });

    // Trigger show content on upward swipe
    if (isUpSwipe && !showContent) {
      setShowContent(true);
    }

    // Hide peek content on downward swipe (but not when full content is shown)
    if (isDownSwipe && showContent && !showFullContent) {
      setShowContent(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

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
      if (scrollDirection === "down" && currentScrollY < 20 && showContent && !showFullContent) {
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
  }, [showContent, showFullContent]);

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
      style={{ touchAction: "pan-x pan-y" }}
    >
      {/* Initial view - only Manus Prompt visible */}
      <div className="flex min-h-screen flex-col justify-center">
        <ManusPrompt />

        {/* Explore button positioned 20px from bottom of screen */}
        <motion.div
          className="fixed bottom-5 left-1/2 z-10 -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 shadow-lg"
            onClick={handleShowContent}
            disabled={showContent}
            style={{ touchAction: "manipulation" }}
          >
            Explore Viral Content
            <ChevronDown className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Content that peeks up from bottom */}
      <motion.div
        className="bg-background pointer-events-auto fixed right-0 bottom-0 left-0 z-50 overflow-hidden rounded-t-3xl shadow-2xl"
        initial={{ y: "100%" }}
        animate={{ y: showContent && !showFullContent ? "calc(100% - 120px)" : "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={handleShowFullContent}
        style={{ touchAction: "pan-y" }}
      >
        {/* Drag handle */}
        <div className="bg-border absolute top-3 left-1/2 h-1 w-12 -translate-x-1/2 transform rounded-full" />

        {/* Peek content header */}
        <div className="cursor-pointer p-6 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-lg font-semibold">Hey guys, I&apos;m here! 👋</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Swipe up or tap to explore viral content and daily inspiration...
              </p>
            </div>
            <ChevronUp className="text-muted-foreground h-5 w-5" />
          </div>
        </div>
      </motion.div>

      {/* Full content overlay (triggered on tap of peek content) */}
      <motion.div
        className="bg-background fixed inset-0 z-50 overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: showFullContent ? 0 : "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Return button at the top */}
        <div className="bg-background/80 sticky top-0 z-10 border-b p-4 backdrop-blur-sm">
          <Button
            onClick={handleHideContent}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            style={{ touchAction: "manipulation" }}
          >
            <ChevronDown className="h-4 w-4" />
            Back to Script Input
          </Button>
        </div>

        {/* IMPORTANT: This is where your grid content goes */}
        <div className="min-h-screen space-y-8 p-6">
          <div className="mx-auto max-w-7xl space-y-4">
            <DailyInspirationSection />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
