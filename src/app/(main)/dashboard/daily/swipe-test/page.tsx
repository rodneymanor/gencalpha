"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { motion, useMotionValue, PanInfo, animate } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SwipeTestPage() {
  const [isRevealed, setIsRevealed] = useState(false);

  // Motion value for controlling page Y position
  const pageY = useMotionValue(0);

  // Touch/swipe detection states
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const minSwipeDistance = 50;
  const wheelThreshold = 20; // Much lower threshold for trackpad sensitivity

  // Improved touch support detection
  const [hasTouchSupport, setHasTouchSupport] = useState(false);

  useEffect(() => {
    // More comprehensive touch detection
    const checkTouchSupport = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as unknown as { msMaxTouchPoints: number }).msMaxTouchPoints > 0
      );
    };

    setHasTouchSupport(checkTouchSupport());
  }, []);

  // Touch event handlers for swipe detection
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchEndY.current = 0;

      console.log("👆 TouchStart:", {
        clientY: e.touches[0].clientY,
        isRevealed,
        currentPageY: pageY.get(),
      });
    },
    [isRevealed, pageY],
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;

    const distance = touchStartY.current - touchEndY.current;
    const isUpSwipe = distance > 20;

    console.log("👆 TouchMove:", {
      startY: touchStartY.current,
      currentY: touchEndY.current,
      distance,
      isUpSwipe,
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartY.current || !touchEndY.current) return;

    const distance = touchStartY.current - touchEndY.current;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    console.log("👆 TouchEnd:", {
      distance,
      isUpSwipe,
      isDownSwipe,
      currentState: isRevealed,
    });

    if (isUpSwipe && !isRevealed) {
      console.log("🔄 Revealing content via swipe");
      setIsRevealed(true);
    } else if (isDownSwipe && isRevealed) {
      console.log("🔄 Hiding content via swipe");
      setIsRevealed(false);
    }
  }, [isRevealed, minSwipeDistance]);

  // Add touch event listeners for mobile
  useEffect(() => {
    const element = document.body;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    console.log("📱 Touch event listeners added to body");

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      console.log("📱 Touch event listeners removed");
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Add wheel event listeners for trackpad/mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only handle vertical wheel events (trackpad swipes)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const isUpSwipe = e.deltaY < -wheelThreshold; // Swipe up (negative deltaY)
        const isDownSwipe = e.deltaY > wheelThreshold; // Swipe down (positive deltaY)

        console.log("🖱️ Wheel event:", {
          deltaY: e.deltaY,
          deltaX: e.deltaX,
          isUpSwipe,
          isDownSwipe,
          currentState: isRevealed,
          threshold: wheelThreshold,
        });

        if (isUpSwipe && !isRevealed) {
          console.log("🔄 Revealing content via wheel");
          setIsRevealed(true);
          e.preventDefault(); // Prevent default scroll
        } else if (isDownSwipe && isRevealed) {
          console.log("🔄 Hiding content via wheel");
          setIsRevealed(false);
          e.preventDefault(); // Prevent default scroll
        }
      }
    };

    // Add wheel event listener (passive: false allows preventDefault)
    document.addEventListener("wheel", handleWheel, { passive: false });

    console.log("🖱️ Wheel event listener added");

    return () => {
      document.removeEventListener("wheel", handleWheel);
      console.log("🖱️ Wheel event listener removed");
    };
  }, [isRevealed, pageY]);

  // Handle drag end for mouse/drag interactions
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDistance = Math.abs(info.offset.y);
    const dragVelocity = info.velocity.y;

    console.log("🖱️ Drag end:", {
      dragDistance,
      dragVelocity,
      offset: info.offset.y,
    });

    if (info.offset.y < -50 || dragVelocity < -500) {
      setIsRevealed(true);
    } else if (info.offset.y > 50 || dragVelocity > 500) {
      setIsRevealed(false);
    }
    // Let the useEffect handle the smooth animation
  }, []);

  // Sync motion value with state changes - smooth animation
  useEffect(() => {
    const targetY = isRevealed ? -150 : 0;

    // Use animate for smooth transitions
    animate(pageY, targetY, {
      duration: 0.6,
      ease: [0.4, 0.0, 0.2, 1],
    });
  }, [isRevealed, pageY]);

  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
    // Animation will be handled by the useEffect above
  };

  return (
    // This is the key change: the entire page is now a motion.div that can translate
    <motion.div
      className="bg-background relative min-h-screen overflow-hidden"
      style={{ y: pageY }}
      drag="y"
      dragConstraints={{ top: -200, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      {/* Debug State Indicator */}
      <div className="fixed top-4 right-4 z-[9999] rounded-lg bg-black/80 p-3 font-mono text-sm text-white">
        <div className="space-y-1">
          <div>
            Content Revealed:{" "}
            <span className={isRevealed ? "text-green-400" : "text-red-400"}>{isRevealed.toString()}</span>
          </div>
          <div>
            Page Y: <span className="text-blue-400">{Math.round(pageY.get())}px</span>
          </div>
          <div>
            Touch Support: <span className="text-blue-400">{hasTouchSupport ? "Yes" : "No"}</span>
          </div>
          <div className="mt-2 border-t border-gray-600 pt-1 text-xs">
            <div>📱 Touch events: Mobile swipes</div>
            <div>🖱️ Wheel events: Trackpad swipes</div>
            <div>🖱️ Drag events: Mouse/trackpad drag</div>
          </div>
        </div>
      </div>

      {/* Drag/Swipe Indicator */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
        <div className="rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-white">
          {isRevealed ? (
            <>
              <ChevronDown className="mr-1 inline h-4 w-4" />
              Swipe down to hide
            </>
          ) : (
            <>
              <ChevronUp className="mr-1 inline h-4 w-4" />
              Swipe up to reveal
            </>
          )}
        </div>
      </div>

      {/* Main Content Area - this is the original viewport */}
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-md space-y-6 text-center">
          <h1 className="text-foreground text-3xl font-bold">Page Swipe Test</h1>
          <p className="text-muted-foreground">
            Swipe up anywhere on the page to reveal the hidden content below. The entire page moves up instead of
            showing an overlay!
          </p>

          {/* Manual Toggle Button */}
          <Button onClick={toggleReveal} variant="outline" size="lg" className="gap-2">
            {isRevealed ? (
              <>
                Hide Content
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                Reveal Content
                <ChevronUp className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-muted-foreground space-y-2 text-xs">
            <p>📱 Touch devices: Swipe up/down anywhere</p>
            <p>🖱️ Trackpad: Swipe up/down (wheel events)</p>
            <p>🖱️ Mouse: Drag the page or use the button</p>
            <p>✨ The entire page translates vertically</p>
            <p>Check browser console for all interaction logs</p>
          </div>
        </div>
      </div>

      {/* Hidden Content Section - positioned below the main content in document flow */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8 dark:from-purple-950 dark:to-blue-900">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6 text-center">
            <h2 className="text-foreground text-4xl font-bold">🎉 Hidden Content Revealed!</h2>
            <p className="text-muted-foreground text-lg">
              This content was hidden below the viewport. When you swiped up, the entire page container moved upward to
              reveal this section.
            </p>

            <div className="bg-card/50 rounded-lg border p-6 backdrop-blur-sm">
              <h3 className="mb-3 font-semibold">How This Works</h3>
              <ul className="text-muted-foreground space-y-2 text-left text-sm">
                <li>• The entire page is wrapped in a motion.div</li>
                <li>• Touch/drag events move the page container vertically</li>
                <li>• Hidden content is part of the document flow below</li>
                <li>• No overlay or fixed positioning - just page translation</li>
                <li>• Smooth spring animations provide natural feel</li>
              </ul>
            </div>

            {/* Sample content to show scrolling within revealed section */}
            <div className="mt-12 space-y-4">
              <h3 className="text-xl font-semibold">Sample Content</h3>
              <div className="grid max-h-64 gap-4 overflow-y-auto">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="bg-card rounded-lg border p-4 text-left">
                    <h4 className="mb-2 font-medium">Content Item {i + 1}</h4>
                    <p className="text-muted-foreground text-sm">
                      This is sample content in the revealed section. You can scroll within this area or swipe down to
                      hide the section again.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={toggleReveal} variant="secondary" size="lg" className="mt-8 gap-2">
              <ChevronDown className="h-4 w-4" />
              Hide This Section
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
