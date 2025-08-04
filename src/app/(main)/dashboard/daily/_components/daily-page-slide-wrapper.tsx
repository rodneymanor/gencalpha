"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ManusPrompt } from "@/components/manus-prompt";
import { Button } from "@/components/ui/button";
import { DailyInspirationSection } from "./daily-inspiration-section";
import { DebugGridTest } from "./debug-grid-test";

export default function DailyPageSlideWrapper() {
  console.log("🔄 DailyPageSlideWrapper: Component initialized");
  
  const [showContent, setShowContent] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // Debug state changes
  useEffect(() => {
    console.log("📊 State Change - showContent:", showContent);
  }, [showContent]);

  useEffect(() => {
    console.log("📊 State Change - showFullContent:", showFullContent);
  }, [showFullContent]);

  // Touch/swipe detection states
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const minSwipeDistance = 50;
  const maxSwipeTime = 300; // Maximum time for a swipe gesture

  // Touch event handlers for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    console.log("👆 TouchStart:", {
      clientY: e.targetTouches[0].clientY,
      timestamp: Date.now(),
      showContent,
      showFullContent
    });
    
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
    
    console.log("👆 TouchMove:", {
      startY: touchStartY.current,
      currentY: touchEndY.current,
      distance,
      isUpSwipe,
      showContent,
      willPreventDefault: isUpSwipe && !showContent
    });
    
    // Prevent default scrolling only if we detect an upward swipe intent
    if (isUpSwipe && !showContent) {
      console.log("🚫 TouchMove: Preventing default scroll");
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) {
      console.log("⚠️ TouchEnd: Missing touch coordinates", {
        startY: touchStartY.current,
        endY: touchEndY.current
      });
      return;
    }
    
    const distance = touchStartY.current - touchEndY.current;
    const timeElapsed = Date.now() - touchStartTime.current;
    const isUpSwipe = distance > minSwipeDistance && timeElapsed < maxSwipeTime;
    const isDownSwipe = distance < -minSwipeDistance && timeElapsed < maxSwipeTime;

    console.log('👆 TouchEnd:', {
      distance,
      timeElapsed,
      isUpSwipe,
      isDownSwipe,
      minSwipeDistance,
      maxSwipeTime,
      showContent,
      showFullContent,
      willShowContent: isUpSwipe && !showContent,
      willHideContent: isDownSwipe && showContent && !showFullContent
    });

    // Trigger show content on upward swipe
    if (isUpSwipe && !showContent) {
      console.log("✅ TouchEnd: Showing content due to upward swipe");
      setShowContent(true);
    }
    
    // Hide peek content on downward swipe (but not when full content is shown)
    if (isDownSwipe && showContent && !showFullContent) {
      console.log("✅ TouchEnd: Hiding content due to downward swipe");
      setShowContent(false);
    }
  };

  // eslint-disable-next-line complexity
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
      if (scrollDirection === "down" && currentScrollY < 100 && showContent && !showFullContent) {
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
    console.log("🔘 handleShowContent: Button clicked");
    setShowContent(true);
  };

  const handleHideContent = () => {
    console.log("🔘 handleHideContent: Back button clicked");
    setShowContent(false);
    setShowFullContent(false);
  };

  const handleShowFullContent = () => {
    console.log("🔘 handleShowFullContent: Peek content clicked");
    setShowFullContent(true);
  };

  console.log("🎨 DailyPageSlideWrapper: Rendering with state", {
    showContent,
    showFullContent,
    touchAction: 'pan-x pan-y'
  });

  return (
    <>
      {/* Debug State Indicator */}
      <div className="fixed top-4 right-4 z-[9999] bg-black/80 text-white p-2 rounded text-xs font-mono">
        <div>showContent: {showContent.toString()}</div>
        <div>showFullContent: {showFullContent.toString()}</div>
        <div>Touch Events: {typeof window !== 'undefined' && 'ontouchstart' in window ? 'Supported' : 'Not Supported'}</div>
      </div>
      
      <div
        className="relative min-h-screen"
        style={{ touchAction: 'pan-x pan-y' }} // Allow normal scrolling but enable custom touch handling
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
            style={{ touchAction: 'manipulation' }} // Remove tap delay
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
          y: showContent && !showFullContent ? "calc(100% - 120px)" : "100%",
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
          type: "tween",
        }}
        className="fixed bottom-0 left-0 right-0 z-20 bg-background rounded-t-xl shadow-2xl border-t pointer-events-auto"
        style={{ 
          height: "120px",
          touchAction: 'pan-y' // Allow vertical scrolling
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Peek content header */}
        <div className="px-6 py-2 flex items-center justify-between">
          <div 
            onClick={handleShowFullContent} 
            className="cursor-pointer flex-1"
            style={{ touchAction: 'manipulation' }}
          >
            <h3 className="font-semibold text-foreground">
              Hey guys, I&apos;m here! 👋
            </h3>
            <p className="text-sm text-muted-foreground">
              Swipe up or tap to explore viral content and daily inspiration...
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHideContent}
            className="ml-2"
            style={{ touchAction: 'manipulation' }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
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
        style={{ touchAction: 'auto' }} // Allow all touch interactions in full view
      >
        {/* Return button at the top */}
        <div className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
          <div className="flex justify-center py-4">
            <Button
              variant="ghost"
              size="lg"
              className="text-muted-foreground hover:text-foreground gap-2 transition-colors"
              onClick={handleHideContent}
              style={{ touchAction: 'manipulation' }}
            >
              <ChevronUp className="h-4 w-4" />
              Back to Script Input
            </Button>
          </div>
        </div>

        {/* IMPORTANT: This is where your grid content goes */}
        <div className="min-h-screen space-y-8 p-6">
          <div className="mx-auto max-w-7xl space-y-4">
            {/* Debug Test Component */}
            <DebugGridTest />
            
            {/* Actual Content */}
            <DailyInspirationSection />
          </div>
        </div>
      </motion.div>
      </div>
    </>
  );
}
