"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
  const [wheelThreshold, setWheelThreshold] = useState(5); // Wheel event threshold for trackpad sensitivity

  // Ref for the container to attach manual event listeners
  const containerRef = useRef<HTMLDivElement>(null);

  // Utility function to disable/enable page scroll
  const disablePageScroll = (disable: boolean) => {
    if (disable) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.height = "";
    }
  };

  // Touch event handlers for swipe detection - using native events
  const handleTouchStart = (e: TouchEvent) => {
    console.log("👆 TouchStart:", {
      clientY: e.touches[0].clientY,
      timestamp: Date.now(),
      showContent,
      showFullContent,
    });

    touchEndY.current = 0;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;

    const distance = touchStartY.current - touchEndY.current;
    const isUpSwipe = distance > 20;

    console.log("👆 TouchMove:", {
      startY: touchStartY.current,
      currentY: touchEndY.current,
      distance,
      isUpSwipe,
      showContent,
      willPreventDefault: isUpSwipe && !showContent,
    });

    if (isUpSwipe && !showContent) {
      console.log("🚫 TouchMove: Preventing default scroll");
      e.preventDefault();
    }
  };

  // Simplified touch end handler to reduce complexity
  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;

    const distance = touchStartY.current - touchEndY.current;
    const timeElapsed = Date.now() - touchStartTime.current;
    const isUpSwipe = distance > minSwipeDistance && timeElapsed < maxSwipeTime;
    const isDownSwipe = distance < -minSwipeDistance && timeElapsed < maxSwipeTime;

    console.log("👆 TouchEnd:", { distance, timeElapsed, isUpSwipe, isDownSwipe });

    if (isUpSwipe && !showContent) {
      setShowContent(true);
    }

    if (isDownSwipe && showContent && !showFullContent) {
      setShowContent(false);
    }
  };

  // Manual wheel event handler for desktop trackpad/mouse (non-passive)
  const handleWheelEvent = useCallback(
    (e: WheelEvent) => {
      // Only handle vertical wheel events
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const isUpSwipe = e.deltaY < -wheelThreshold;
        const isDownSwipe = e.deltaY > wheelThreshold;

        console.log("🖱️ Wheel event:", {
          deltaY: e.deltaY,
          deltaX: e.deltaX,
          isUpSwipe,
          isDownSwipe,
          currentState: { showContent, showFullContent },
          threshold: wheelThreshold,
        });

        // INVERTED: Down swipe reveals content, up swipe hides content
        if (isDownSwipe && !showContent) {
          console.log("🔄 Revealing content via wheel (swipe down)");
          e.preventDefault(); // Prevent default scroll
          setShowContent(true);
        } else if (isUpSwipe && showContent && !showFullContent) {
          console.log("🔄 Hiding content via wheel (swipe up)");
          e.preventDefault(); // Prevent default scroll
          setShowContent(false);
        }
      }
    },
    [showContent, showFullContent, wheelThreshold],
  );

  // Disable page scroll when component mounts to prevent conflicts
  useEffect(() => {
    console.log("🚫 Disabling page scroll to prevent conflicts");
    disablePageScroll(true);

    return () => {
      console.log("✅ Re-enabling page scroll");
      disablePageScroll(false);
    };
  }, []);

  // Add manual wheel event listeners with passive: false
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // CRITICAL: Use passive: false to allow preventDefault()
    element.addEventListener("wheel", handleWheelEvent, { passive: false });

    console.log("🖱️ Manual wheel event listener added with passive: false");

    return () => {
      element.removeEventListener("wheel", handleWheelEvent);
      console.log("🖱️ Manual wheel event listener removed");
    };
  }, [handleWheelEvent]);

  // Add native touch event listeners
  useEffect(() => {
    const element = document.body;

    element.addEventListener("touchstart", handleTouchStart, { passive: false });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: false });

    console.log("📱 Touch event listeners added to body");

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      console.log("📱 Touch event listeners removed from body");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showContent, showFullContent]);
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

  return (
    <>
      {/* Main container - remove restrictive touchAction */}
      <div ref={containerRef} className="relative">
        {/* Main page content that shifts up when content is shown */}
        <motion.div
          animate={{
            y: showContent && !showFullContent ? -120 : 0,
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
            type: "tween",
          }}
          className="min-h-screen"
        >
          {/* Initial view - only Manus Prompt visible */}
          <div className="flex min-h-screen flex-col justify-center">
            <ManusPrompt
              greeting="Hello"
              subtitle="What will you script today?"
              placeholder="Give Gen.C a topic to script..."
            />

            {/* Explore button - only show when content is hidden */}
            {!showContent && (
              <div className="fixed bottom-5 left-1/2 z-10 -translate-x-1/2">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-muted-foreground hover:text-foreground gap-2 transition-colors"
                  onClick={handleShowContent}
                >
                  Explore Viral Content
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Content that slides up - now part of page flow */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{
            y: showContent && !showFullContent ? "calc(100vh - 120px)" : "100%",
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
            type: "tween",
          }}
          className="bg-background fixed right-0 bottom-0 left-0 z-20 rounded-t-xl border-t shadow-2xl"
          style={{ height: "120px" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-12 rounded-full bg-gray-300"></div>
          </div>

          {/* Peek content header */}
          <div className="flex items-center justify-between px-6 py-2">
            <div
              onClick={handleShowFullContent}
              className="flex-1 cursor-pointer"
              style={{ touchAction: "manipulation" }}
            >
              <h3 className="text-foreground font-semibold">Hey guys, I&apos;m here! 👋</h3>
              <p className="text-muted-foreground text-sm">
                Swipe down or tap to explore viral content and daily inspiration...
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHideContent}
              className="ml-2"
              style={{ touchAction: "manipulation" }}
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
          style={{ touchAction: "auto" }} // Allow all touch interactions in full view
        >
          {/* Return button at the top */}
          <div className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
            <div className="flex justify-center py-4">
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground hover:text-foreground gap-2 transition-colors"
                onClick={handleHideContent}
                style={{ touchAction: "manipulation" }}
              >
                <ChevronUp className="h-4 w-4" />
                Back to Script Input
              </Button>
            </div>
          </div>

          {/* Daily Inspiration Content */}
          <div className="min-h-screen space-y-8 p-6">
            <div className="mx-auto max-w-7xl">
              <DailyInspirationSection />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
