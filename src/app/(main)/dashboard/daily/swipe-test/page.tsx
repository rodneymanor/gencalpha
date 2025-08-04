"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { motion, useMotionValue, PanInfo, animate } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SwipeTestPage() {
  const [isRevealed, setIsRevealed] = useState(false);
  const pageY = useMotionValue(0);

  // Ref for the container to attach manual event listeners
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch/swipe detection states
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const minSwipeDistance = 50;
  const wheelThreshold = 20;

  const [hasTouchSupport, setHasTouchSupport] = useState(false);

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

  useEffect(() => {
    const checkTouchSupport = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as unknown as { msMaxTouchPoints: number }).msMaxTouchPoints > 0
      );
    };
    setHasTouchSupport(checkTouchSupport());
  }, []);

  // Disable page scroll when component mounts to prevent conflicts
  useEffect(() => {
    console.log("🚫 Disabling page scroll to prevent conflicts");
    disablePageScroll(true);

    return () => {
      console.log("✅ Re-enabling page scroll");
      disablePageScroll(false);
    };
  }, []);

  // Manual wheel event handler for desktop (non-passive)
  const handleWheelEvent = useCallback(
    (e: WheelEvent) => {
      // Only handle vertical wheel events
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const isUpSwipe = e.deltaY < -wheelThreshold;
        const isDownSwipe = e.deltaY > wheelThreshold;

        console.log("🖱️ Manual Wheel event:", {
          deltaY: e.deltaY,
          deltaX: e.deltaX,
          isUpSwipe,
          isDownSwipe,
          currentState: isRevealed,
          threshold: wheelThreshold,
        });

        if (isUpSwipe && !isRevealed) {
          console.log("🔄 Revealing content via manual wheel");
          e.preventDefault(); // This will work now!
          setIsRevealed(true);
        } else if (isDownSwipe && isRevealed) {
          console.log("🔄 Hiding content via manual wheel");
          e.preventDefault(); // This will work now!
          setIsRevealed(false);
        }
      }
    },
    [isRevealed, wheelThreshold],
  );

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

  // Touch event handlers (keep existing)
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchEndY.current = 0;
      console.log("👆 TouchStart:", { clientY: e.touches[0].clientY, isRevealed });
    },
    [isRevealed],
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
    const distance = touchStartY.current - touchEndY.current;
    const isUpSwipe = distance > 20;
    console.log("👆 TouchMove:", { distance, isUpSwipe });
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartY.current || !touchEndY.current) return;
    const distance = touchStartY.current - touchEndY.current;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    console.log("👆 TouchEnd:", { distance, isUpSwipe, isDownSwipe });

    if (isUpSwipe && !isRevealed) {
      setIsRevealed(true);
    } else if (isDownSwipe && isRevealed) {
      setIsRevealed(false);
    }
  }, [isRevealed, minSwipeDistance]);

  // Touch event listeners (keep existing)
  useEffect(() => {
    document.body.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.body.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.body.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.body.removeEventListener("touchstart", handleTouchStart);
      document.body.removeEventListener("touchmove", handleTouchMove);
      document.body.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Handle drag end for mouse/drag interactions
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDistance = Math.abs(info.offset.y);
    const dragVelocity = info.velocity.y;

    console.log("🖱️ Drag end:", { dragDistance, dragVelocity, offset: info.offset.y });

    if (info.offset.y < -50 || dragVelocity < -500) {
      setIsRevealed(true);
    } else if (info.offset.y > 50 || dragVelocity > 500) {
      setIsRevealed(false);
    }
  }, []);

  // Sync motion value with state changes
  useEffect(() => {
    const targetY = isRevealed ? -150 : 0;
    animate(pageY, targetY, {
      duration: 0.6,
      ease: [0.4, 0.0, 0.2, 1],
    });
  }, [isRevealed, pageY]);

  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  return (
    <motion.div
      ref={containerRef} // IMPORTANT: Add ref here
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
      {/* Rest of your component remains the same */}
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
          <div>
            Page Scroll: <span className="text-orange-400">Disabled</span>
          </div>
          <div className="mt-2 border-t border-gray-600 pt-1 text-xs">
            <div>📱 Touch events: Mobile swipes</div>
            <div>🖱️ Manual wheel: Desktop trackpad/mouse</div>
            <div>🖱️ Drag events: Mouse/trackpad drag</div>
            <div>🚫 Page scroll disabled to prevent conflicts</div>
          </div>
        </div>
      </div>

      {/* Rest of your existing JSX */}
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

      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-md space-y-6 text-center">
          <h1 className="text-foreground text-3xl font-bold">Page Swipe Test</h1>
          <p className="text-muted-foreground">Swipe up anywhere on the page to reveal the hidden content below.</p>

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
            <p>🖱️ Trackpad/Mouse: Scroll up/down (manual listeners)</p>
            <p>🖱️ Mouse: Drag the page or use the button</p>
            <p>✨ The entire page translates vertically</p>
            <p>🚫 Page scroll disabled to prevent conflicts</p>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8 dark:from-purple-950 dark:to-blue-900">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6 text-center">
            <h2 className="text-foreground text-4xl font-bold">🎉 Hidden Content Revealed!</h2>
            <p className="text-muted-foreground text-lg">This content was hidden below the viewport.</p>

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
