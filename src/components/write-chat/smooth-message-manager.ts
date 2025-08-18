/* Smooth Message Manager - Claude-style chat message handling */

import React from "react";
import { type ChatMessage } from "./types";

export interface MessageAnimationOptions {
  staggerDelay: number;
  animationDuration: number;
  scrollBehavior: 'smooth' | 'auto';
  enableIntersectionObserver: boolean;
}

export class SmoothMessageManager {
  private messagesContainer: HTMLElement | null = null;
  private isUserScrolling = false;
  private lastScrollTop = 0;
  private scrollTimeout: NodeJS.Timeout | null = null;
  private observer: IntersectionObserver | null = null;
  private mountedRef: React.MutableRefObject<boolean>;

  private options: MessageAnimationOptions = {
    staggerDelay: 50,
    animationDuration: 300,
    scrollBehavior: 'smooth',
    enableIntersectionObserver: true,
  };

  constructor(mountedRef: React.MutableRefObject<boolean>, options?: Partial<MessageAnimationOptions>) {
    this.mountedRef = mountedRef;
    this.options = { ...this.options, ...options };
    
    if (typeof window !== 'undefined' && this.options.enableIntersectionObserver) {
      this.setupIntersectionObserver();
    }
  }

  /**
   * Initialize the message container and set up scroll detection
   */
  public setContainer(container: HTMLElement | null) {
    if (this.messagesContainer && this.messagesContainer !== container) {
      this.cleanup();
    }

    this.messagesContainer = container;

    if (container) {
      this.setupScrollDetection();
    }
  }

  /**
   * Set up intersection observer for visibility-based animations
   */
  private setupIntersectionObserver() {
    if (!this.messagesContainer) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Add staggered animation class
            const index = Array.from(entry.target.parentNode?.children || []).indexOf(entry.target);
            entry.target.setAttribute('style', `animation-delay: ${index * this.options.staggerDelay}ms`);
          }
        });
      },
      {
        root: this.messagesContainer,
        threshold: 0.1,
        rootMargin: '20px 0px',
      }
    );
  }

  /**
   * Set up intelligent scroll detection to track user behavior
   */
  private setupScrollDetection() {
    if (!this.messagesContainer) return;

    const handleScroll = () => {
      if (!this.messagesContainer) return;

      const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

      // Detect if user is scrolling up (manual scrolling)
      if (scrollTop < this.lastScrollTop && !isAtBottom) {
        this.isUserScrolling = true;
      }

      // Reset flag when user scrolls to bottom
      if (isAtBottom) {
        this.isUserScrolling = false;
      }

      this.lastScrollTop = scrollTop;

      // Reset flag after scroll ends
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      this.scrollTimeout = setTimeout(() => {
        if (isAtBottom) {
          this.isUserScrolling = false;
        }
      }, 150);
    };

    this.messagesContainer.addEventListener('scroll', handleScroll, { passive: true });

    // Store cleanup function
    const cleanup = () => {
      this.messagesContainer?.removeEventListener('scroll', handleScroll);
    };

    // Return cleanup for external use
    return cleanup;
  }

  /**
   * Add a message with smooth animation
   */
  public addMessage(message: ChatMessage, shouldScroll = true): HTMLElement | null {
    if (!this.messagesContainer || !this.mountedRef.current) return null;

    const messageElement = this.createMessageElement(message);
    
    // Add to container
    this.messagesContainer.appendChild(messageElement);

    // Set up intersection observer if enabled
    if (this.observer) {
      this.observer.observe(messageElement);
    }

    // Auto-scroll only if user isn't manually scrolling
    if (shouldScroll && !this.isUserScrolling) {
      this.scrollToBottom();
    }

    return messageElement;
  }

  /**
   * Create a message DOM element with animation classes
   */
  private createMessageElement(message: ChatMessage): HTMLElement {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${message.role} fade-in`;
    messageEl.setAttribute('data-message-id', message.id || '');
    
    // Add animation timing
    messageEl.style.cssText = `
      animation-duration: ${this.options.animationDuration}ms;
      animation-fill-mode: forwards;
      opacity: 0;
      transform: translateY(20px);
    `;

    return messageEl;
  }

  /**
   * Smooth scroll to bottom with physics-based easing
   */
  public scrollToBottom(force = false) {
    if (!this.messagesContainer) return;

    // Skip if user is scrolling and not forced
    if (this.isUserScrolling && !force) return;

    // Use requestAnimationFrame for smooth performance
    requestAnimationFrame(() => {
      if (!this.messagesContainer) return;

      this.messagesContainer.scrollTo({
        top: this.messagesContainer.scrollHeight,
        behavior: this.options.scrollBehavior,
      });
    });
  }

  /**
   * Update multiple messages with staggered animations
   */
  public updateMessages(messages: ChatMessage[], container?: HTMLElement) {
    if (container && container !== this.messagesContainer) {
      this.setContainer(container);
    }

    if (!this.messagesContainer) return;

    // Clear existing messages
    this.messagesContainer.innerHTML = '';

    // Add messages with staggered timing
    messages.forEach((message, index) => {
      setTimeout(() => {
        this.addMessage(message, index === messages.length - 1); // Only scroll for last message
      }, index * this.options.staggerDelay);
    });
  }

  /**
   * Check if user is manually scrolling
   */
  public getIsUserScrolling(): boolean {
    return this.isUserScrolling;
  }

  /**
   * Force scroll to bottom regardless of user state
   */
  public forceScrollToBottom() {
    this.scrollToBottom(true);
  }

  /**
   * Add typing indicator with animation
   */
  public showTypingIndicator(): HTMLElement | null {
    if (!this.messagesContainer) return null;

    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator message message-assistant';
    typingEl.innerHTML = `
      <div class="flex items-center gap-2 text-muted-foreground">
        <div class="flex gap-1">
          <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
          <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
          <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
        </div>
        <span class="text-sm">AI is typing...</span>
      </div>
    `;

    this.messagesContainer.appendChild(typingEl);
    this.scrollToBottom();

    return typingEl;
  }

  /**
   * Remove typing indicator
   */
  public hideTypingIndicator() {
    if (!this.messagesContainer) return;

    const typingIndicator = this.messagesContainer.querySelector('.typing-indicator');
    if (typingIndicator) {
      // Fade out animation
      typingIndicator.style.cssText = `
        opacity: 0;
        transform: translateY(-10px);
        transition: all 200ms var(--ease-in-out-soft);
      `;

      setTimeout(() => {
        typingIndicator.remove();
      }, 200);
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.messagesContainer = null;
  }

  /**
   * Get current scroll state for debugging
   */
  public getScrollState() {
    if (!this.messagesContainer) return null;

    const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    return {
      scrollTop,
      scrollHeight,
      clientHeight,
      isAtBottom,
      isUserScrolling: this.isUserScrolling,
    };
  }
}

/**
 * React hook for using the smooth message manager
 */
export function useSmoothMessageManager(
  mountedRef: React.MutableRefObject<boolean>,
  options?: Partial<MessageAnimationOptions>
) {
  const [manager] = React.useState(() => new SmoothMessageManager(mountedRef, options));

  React.useEffect(() => {
    return () => {
      manager.cleanup();
    };
  }, [manager]);

  return manager;
}
