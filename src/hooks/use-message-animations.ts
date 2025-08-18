"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface MessageAnimationOptions {
  /** Stagger delay between messages in ms */
  staggerDelay?: number;
  /** Maximum stagger delay in ms */
  maxStaggerDelay?: number;
  /** Intersection observer threshold */
  intersectionThreshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
}

interface MessageMetadata {
  id: string;
  index: number;
  timestamp: number;
  hasAnimated: boolean;
}

export function useMessageAnimations(options: MessageAnimationOptions = {}) {
  const {
    staggerDelay = 80,
    maxStaggerDelay = 400,
    intersectionThreshold = 0.1,
    rootMargin = "10px",
  } = options;

  const [messageMetadata, setMessageMetadata] = useState<Map<string, MessageMetadata>>(new Map());
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const animationQueue = useRef<Array<() => void>>([]);
  const isProcessingQueue = useRef(false);

  // Setup intersection observer for performance optimization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-message-id");
            if (messageId) {
              entry.target.classList.add("is-visible");
              // Optional: trigger additional effects when message becomes visible
              const event = new CustomEvent("message:visible", { 
                detail: { messageId, element: entry.target } 
              });
              window.dispatchEvent(event);
            }
          }
        });
      },
      {
        root: messagesContainerRef.current,
        threshold: intersectionThreshold,
        rootMargin,
      }
    );

    intersectionObserver.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [intersectionThreshold, rootMargin]);

  // Process animation queue sequentially
  const processAnimationQueue = useCallback(async () => {
    if (isProcessingQueue.current || animationQueue.current.length === 0) return;
    
    isProcessingQueue.current = true;
    
    while (animationQueue.current.length > 0) {
      const animation = animationQueue.current.shift();
      if (animation) {
        animation();
        // Small delay between queue items for smooth processing
        await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
      }
    }
    
    isProcessingQueue.current = false;
  }, []);

  // Add animation to queue
  const queueAnimation = useCallback((animation: () => void) => {
    animationQueue.current.push(animation);
    processAnimationQueue();
  }, [processAnimationQueue]);

  // Register a message for animation
  const registerMessage = useCallback((messageId: string, element: HTMLElement) => {
    const currentIndex = messageMetadata.size;
    const metadata: MessageMetadata = {
      id: messageId,
      index: currentIndex,
      timestamp: Date.now(),
      hasAnimated: false,
    };

    setMessageMetadata(prev => new Map(prev).set(messageId, metadata));

    // Calculate stagger delay, capping at maxStaggerDelay
    const delay = Math.min(currentIndex * staggerDelay, maxStaggerDelay);
    
    // Set up the element for animation
    element.setAttribute("data-message-id", messageId);
    element.style.setProperty("--message-index", currentIndex.toString());
    element.style.setProperty("--stagger-delay", `${delay}ms`);
    
    // Queue the animation
    queueAnimation(() => {
      // Apply base animation classes
      element.classList.add("message-item");
      
      // Apply staggered animation with delay
      setTimeout(() => {
        element.classList.add("animate-in");
        
        // Mark as animated after animation completes
        setTimeout(() => {
          setMessageMetadata(prev => {
            const updated = new Map(prev);
            const meta = updated.get(messageId);
            if (meta) {
              updated.set(messageId, { ...meta, hasAnimated: true });
            }
            return updated;
          });
        }, 400); // Animation duration
        
      }, delay);
    });

    // Observe for intersection
    if (intersectionObserver.current) {
      intersectionObserver.current.observe(element);
    }

    return () => {
      // Cleanup function
      if (intersectionObserver.current) {
        intersectionObserver.current.unobserve(element);
      }
      setMessageMetadata(prev => {
        const updated = new Map(prev);
        updated.delete(messageId);
        return updated;
      });
    };
  }, [messageMetadata.size, staggerDelay, maxStaggerDelay, queueAnimation]);

  // Animate batch of messages (for initial load or bulk operations)
  const animateMessageBatch = useCallback((elements: HTMLElement[], startIndex = 0) => {
    elements.forEach((element, index) => {
      const messageId = element.getAttribute("data-message-id") || crypto.randomUUID();
      const adjustedIndex = startIndex + index;
      const delay = Math.min(adjustedIndex * staggerDelay, maxStaggerDelay);
      
      element.style.setProperty("--message-index", adjustedIndex.toString());
      element.style.setProperty("--stagger-delay", `${delay}ms`);
      
      queueAnimation(() => {
        setTimeout(() => {
          element.classList.add("message-item", "animate-in");
        }, delay);
      });
    });
  }, [staggerDelay, maxStaggerDelay, queueAnimation]);

  // Reset all animations (useful for re-renders)
  const resetAnimations = useCallback(() => {
    setMessageMetadata(new Map());
    animationQueue.current = [];
    isProcessingQueue.current = false;
    
    // Clear animation classes from all message elements
    const messageElements = messagesContainerRef.current?.querySelectorAll("[data-message-id]");
    messageElements?.forEach(element => {
      element.classList.remove("message-item", "animate-in", "is-visible");
    });
  }, []);

  // Get animation state for debugging/monitoring
  const getAnimationState = useCallback(() => {
    return {
      totalMessages: messageMetadata.size,
      animatedMessages: Array.from(messageMetadata.values()).filter(m => m.hasAnimated).length,
      queueLength: animationQueue.current.length,
      isProcessing: isProcessingQueue.current,
    };
  }, [messageMetadata]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intersectionObserver.current?.disconnect();
      animationQueue.current = [];
    };
  }, []);

  return {
    // Refs
    messagesContainerRef,
    
    // Core functions
    registerMessage,
    animateMessageBatch,
    resetAnimations,
    
    // State
    messageMetadata,
    
    // Utilities
    getAnimationState,
    
    // Configuration
    staggerDelay,
    maxStaggerDelay,
  };
}

export type MessageAnimations = ReturnType<typeof useMessageAnimations>;
