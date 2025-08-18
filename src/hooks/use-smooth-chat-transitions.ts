"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ChatTransitionOptions {
  /** Duration for hero-to-chat transition in ms */
  heroTransitionDuration?: number;
  /** Delay before showing messages area */
  messagesDelay?: number;
  /** Auto-scroll threshold - how many pixels from bottom to consider "at bottom" */
  autoScrollThreshold?: number;
}

interface ScrollState {
  isUserScrolling: boolean;
  isAtBottom: boolean;
  lastScrollTop: number;
}

export function useSmoothChatTransitions(options: ChatTransitionOptions = {}) {
  const {
    heroTransitionDuration = 500,
    messagesDelay = 200,
    autoScrollThreshold = 50,
  } = options;

  const [isHeroState, setIsHeroState] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollState, setScrollState] = useState<ScrollState>({
    isUserScrolling: false,
    isAtBottom: true,
    lastScrollTop: 0,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const transitionTimeout = useRef<NodeJS.Timeout>();
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  // Setup intersection observer for message visibility detection
  useEffect(() => {
    if (typeof window === "undefined" || !messagesRef.current) return;

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        root: messagesRef.current,
        threshold: 0.1,
        rootMargin: "10px",
      }
    );

    return () => {
      intersectionObserver.current?.disconnect();
    };
  }, [isHeroState]);

  // Setup scroll detection for auto-scroll management
  useEffect(() => {
    const messagesEl = messagesRef.current;
    if (!messagesEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesEl;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < autoScrollThreshold;
      const isScrollingUp = scrollTop < scrollState.lastScrollTop && !isAtBottom;

      setScrollState((prev) => ({
        ...prev,
        isAtBottom,
        isUserScrolling: isScrollingUp,
        lastScrollTop: scrollTop,
      }));

      // Reset user scrolling flag after scroll ends
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        if (isAtBottom) {
          setScrollState((prev) => ({ ...prev, isUserScrolling: false }));
        }
      }, 150);
    };

    messagesEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => messagesEl.removeEventListener("scroll", handleScroll);
  }, [autoScrollThreshold, scrollState.lastScrollTop]);

  // FLIP technique for hero-to-chat transition
  const expandFromHero = useCallback(() => {
    if (!containerRef.current || isTransitioning) return;

    setIsTransitioning(true);
    
    // Record initial position (FLIP - First)
    const firstRect = containerRef.current.getBoundingClientRect();
    
    // Apply final state classes (FLIP - Last)
    setIsHeroState(false);
    
    // Force reflow to get final position
    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      
      const lastRect = containerRef.current.getBoundingClientRect();
      
      // Calculate delta (FLIP - Invert)
      const deltaY = firstRect.top - lastRect.top;
      const deltaScale = 0.95; // Slight scale effect during transition
      
      // Apply transform to invert to starting position
      containerRef.current.style.transform = `translateY(${deltaY}px) scale(${deltaScale})`;
      containerRef.current.style.transformOrigin = "center bottom";
      
      // Animate to final position (FLIP - Play)
      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        
        containerRef.current.classList.add("transitioning");
        containerRef.current.style.transform = "";
        
        // Clean up transition state after animation
        transitionTimeout.current = setTimeout(() => {
          setIsTransitioning(false);
          containerRef.current?.classList.remove("transitioning");
        }, heroTransitionDuration);
      });
    });
  }, [isTransitioning, heroTransitionDuration]);

  // Smooth auto-scroll with easing
  const scrollToBottom = useCallback(() => {
    if (!messagesRef.current || scrollState.isUserScrolling) return;
    
    const messagesEl = messagesRef.current;
    const targetScroll = messagesEl.scrollHeight - messagesEl.clientHeight;
    const currentScroll = messagesEl.scrollTop;
    const scrollDistance = targetScroll - currentScroll;
    
    if (scrollDistance < 10) return; // Already close enough
    
    // Use smooth scrolling with custom easing
    messagesEl.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  }, [scrollState.isUserScrolling]);

  // Add message with staggered animation
  const addMessageWithAnimation = useCallback((messageElement: HTMLElement, index: number) => {
    // Add stagger delay based on message index
    const delay = Math.min(index * 80, 400); // Cap at 400ms for performance
    messageElement.style.animationDelay = `${delay}ms`;
    messageElement.classList.add("message-item");
    
    // Observe for intersection
    intersectionObserver.current?.observe(messageElement);
    
    // Auto-scroll after a brief delay
    setTimeout(() => {
      scrollToBottom();
    }, delay + 100);
  }, [scrollToBottom]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      clearTimeout(scrollTimeout.current);
      clearTimeout(transitionTimeout.current);
    };
  }, []);

  return {
    // State
    isHeroState,
    isTransitioning,
    scrollState,
    
    // Refs
    containerRef,
    messagesRef,
    
    // Actions
    expandFromHero,
    scrollToBottom,
    addMessageWithAnimation,
    
    // Direct state setters for external control
    setIsHeroState,
    
    // Helper methods
    resetScrollState: () => setScrollState({
      isUserScrolling: false,
      isAtBottom: true,
      lastScrollTop: 0,
    }),
  };
}

export type SmoothChatTransitions = ReturnType<typeof useSmoothChatTransitions>;
