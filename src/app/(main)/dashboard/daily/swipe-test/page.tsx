"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SwipeTestPage() {
  const [isOpen, setIsOpen] = useState(false);

  // Touch/swipe detection states
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const minSwipeDistance = 50;
  const maxSwipeTime = 300;

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      console.log("👆 TouchStart:", {
        clientY: e.touches[0].clientY,
        timestamp: Date.now(),
        isOpen,
      });

      touchEndY.current = 0;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    },
    [isOpen],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      touchEndY.current = e.touches[0].clientY;

      const distance = touchStartY.current - touchEndY.current;
      const isUpSwipe = distance > 20;

      console.log("👆 TouchMove:", {
        startY: touchStartY.current,
        currentY: touchEndY.current,
        distance,
        isUpSwipe,
        isOpen,
      });

      // Prevent default scroll when swiping up and panel is closed
      if (isUpSwipe && !isOpen) {
        e.preventDefault();
      }
    },
    [isOpen],
  );

  // Helper function to process swipe gesture
  const processSwipeGesture = useCallback(
    (distance: number, timeElapsed: number) => {
      const isUpSwipe = distance > minSwipeDistance && timeElapsed < maxSwipeTime;
      const isDownSwipe = distance < -minSwipeDistance && timeElapsed < maxSwipeTime;

      if (isUpSwipe && !isOpen) {
        console.log("🔄 Opening panel via swipe");
        setIsOpen(true);
      }

      if (isDownSwipe && isOpen) {
        console.log("🔄 Closing panel via swipe");
        setIsOpen(false);
      }

      return { isUpSwipe, isDownSwipe };
    },
    [isOpen, minSwipeDistance, maxSwipeTime],
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStartY.current || !touchEndY.current) return;

    const distance = touchStartY.current - touchEndY.current;
    const timeElapsed = Date.now() - touchStartTime.current;
    const { isUpSwipe, isDownSwipe } = processSwipeGesture(distance, timeElapsed);

    console.log("👆 TouchEnd:", {
      distance,
      timeElapsed,
      isUpSwipe,
      isDownSwipe,
      isOpen,
      willToggle: (isUpSwipe && !isOpen) || (isDownSwipe && isOpen),
    });
  }, [isOpen, processSwipeGesture]);

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
  }, [isOpen]);

  return (
    <div className="bg-background relative min-h-screen">
      {/* Debug State Indicator */}
      <div className="fixed top-4 right-4 z-[9999] rounded-lg bg-black/80 p-3 font-mono text-sm text-white">
        <div className="space-y-1">
          <div>
            Panel Open: <span className={isOpen ? "text-green-400" : "text-red-400"}>{isOpen.toString()}</span>
          </div>
          <div>
            Touch Support:{" "}
            <span className="text-blue-400">
              {typeof window !== "undefined" && "ontouchstart" in window ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-md space-y-6 text-center">
          <h1 className="text-foreground text-3xl font-bold">Swipe Test Page</h1>
          <p className="text-muted-foreground">
            Try swiping up from anywhere on the screen to open the panel, or use the button below.
          </p>

          {/* Manual Toggle Button */}
          <Button onClick={() => setIsOpen(!isOpen)} variant="outline" size="lg" className="gap-2">
            {isOpen ? (
              <>
                Close Panel
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                Open Panel
                <ChevronUp className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-muted-foreground space-y-2 text-xs">
            <p>📱 On mobile: Swipe up/down to toggle</p>
            <p>🖱️ On desktop: Use the button above</p>
            <p>Check browser console for swipe debug logs</p>
          </div>
        </div>
      </div>

      {/* Swipeable Panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{
          y: isOpen ? "20%" : "100%",
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1],
          type: "tween",
        }}
        className="bg-card fixed right-0 bottom-0 left-0 z-20 rounded-t-xl border-t shadow-2xl"
        style={{ height: "80vh" }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="bg-muted h-1 w-12 rounded-full"></div>
        </div>

        {/* Panel Content */}
        <div className="h-full overflow-y-auto px-6 py-4">
          <div className="space-y-4 text-center">
            <h2 className="text-foreground text-xl font-semibold">🎉 Panel is Open!</h2>
            <p className="text-muted-foreground">Swipe down or tap the close button to hide this panel.</p>

            <Button onClick={() => setIsOpen(false)} variant="secondary" className="gap-2">
              <ChevronDown className="h-4 w-4" />
              Close Panel
            </Button>

            {/* Sample content to test scrolling */}
            <div className="mt-8 space-y-4 text-left">
              <h3 className="font-medium">Sample Content</h3>
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">
                    Sample content item {i + 1}. This is here to test scrolling behavior within the panel.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
