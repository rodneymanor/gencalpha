"use client";

import { useState, useRef, useEffect } from "react";

import { Settings, ArrowUp, Zap, Loader2, Clock, Database } from "lucide-react";

import { ChatPersonasDropdown } from "@/components/ChatInterface/personas-dropdown";
import { ShineBorder } from "@/components/magicui/shine-border";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TypewriterPlaceholder } from "@/components/ui/typewriter-placeholder";
import { useTrendingTopics } from "@/hooks/use-trending-topics";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string, timeLimit: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showTimeLimit?: boolean;
  showSettings?: boolean;
  showTrending?: boolean;
  showPersonas?: boolean;
  selectedPersona?: string;
  onPersonaSelect?: (persona: string) => void;
  selectedGenerator?: "hook" | "template" | null;
  onGeneratorSelect?: (generator: "hook" | "template") => void;
  className?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  showTimeLimit = true,
  showSettings = true,
  showTrending = true,
  showPersonas = true,
  selectedPersona,
  onPersonaSelect,
  selectedGenerator,
  onGeneratorSelect,
  className = "",
}: ChatInputProps) {
  const [timeLimit, setTimeLimit] = useState("20s");
  const [showTrendingDropdown, setShowTrendingDropdown] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // Typewriter phrases
  const typewriterPhrases = [
    "a compelling script about your next big idea",
    "10 scroll-stopping hooks for your content",
    "a step-by-step software tutorial",
    "5 viral-worthy content ideas",
    "a problem-solving guide that actually works",
    "a captivating short story in minutes",
    "content that matches your favorite creator's style",
  ];

  // Use the optimized trending topics hook
  const {
    topics: trendingTopics,
    isLoading: isLoadingTopics,
    isFromCache,
    nextUpdate,
    loadTopics,
  } = useTrendingTopics({
    autoLoad: false, // Load on demand when dropdown opens
    limit: 8,
  });

  // Preload topics on component mount for better UX
  useEffect(() => {
    if (showTrending) {
      // Preload topics in the background
      loadTopics();
    }
    // Removed auto-focus on mount to prevent unwanted behavior
  }, [showTrending, loadTopics]);

  // Hide typewriter when user starts typing
  useEffect(() => {
    setShowTypewriter(!value);
  }, [value]);

  // Handle clicking outside to close trending dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowTrendingDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle form submission with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value, timeLimit);
      setShowTrendingDropdown(false);
    }
  };

  // Show trending topics when input is focused
  const handleInputFocus = () => {
    setIsFocused(true);
    // Trending dropdown disabled - no longer showing on focus
    // if (showTrending) {
    //   setShowTrendingDropdown(true);
    //   // Topics are already preloaded or will load from cache
    // }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  // Select a trending topic and focus input
  const handleTrendingSelect = (topic: string) => {
    onChange(topic);
    setShowTrendingDropdown(false);
    inputRef.current?.focus();
  };

  // Helper function to format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `in ${minutes}m`;
    } else {
      return "soon";
    }
  };

  // Render trending topics dropdown
  const renderTrendingDropdown = () => {
    if (!showTrending || !showTrendingDropdown) return null;

    return (
      <div
        ref={dropdownRef}
        className="absolute top-full right-0 left-0 z-10 mt-2 max-h-64 overflow-y-auto rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 shadow-[var(--shadow-soft-drop)]"
      >
        <div className="p-2">
          <div className="mb-2 flex items-center justify-between px-2">
            <div className="text-sm font-medium text-neutral-600">Trending Topics</div>
            {isFromCache && (
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Database className="h-3 w-3" />
                <span>Cached</span>
                {nextUpdate && (
                  <>
                    <Clock className="ml-1 h-3 w-3" />
                    <span>Updates {getRelativeTime(nextUpdate)}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {isLoadingTopics && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
              <span className="ml-2 text-sm text-neutral-500">Loading suggestions...</span>
            </div>
          )}

          {!isLoadingTopics &&
            trendingTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTrendingSelect(topic.title)}
                className="flex w-full items-start gap-3 rounded-[var(--radius-button)] px-3 py-2 text-left transition-colors duration-150 hover:bg-neutral-100"
              >
                <Zap className="text-brand-500 mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-neutral-900">{topic.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                    <span className="truncate">{topic.source}</span>
                    {topic.relevanceScore > 5 && (
                      <span className="bg-brand-100 text-brand-700 rounded px-1.5 py-0.5 text-xs font-medium">Hot</span>
                    )}
                  </div>
                </div>
              </button>
            ))}

          {!isLoadingTopics && trendingTopics.length === 0 && (
            <div className="py-4 text-center text-sm text-neutral-500">No trending topics available</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div
        className="relative flex items-center gap-2 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-3 shadow-[var(--shadow-input)] transition-all duration-200 hover:border-neutral-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Shine border - only visible on hover or focus */}
        {(isHovered || isFocused) && (
          <ShineBorder
            borderWidth={2}
            duration={8}
            shineColor={["#3186FF", "#FFF114", "#FF4641", "#3186FF"]}
            className="opacity-70"
          />
        )}

        {/* Personas dropdown on far left */}
        {showPersonas && (
          <ChatPersonasDropdown
            selectedPersona={selectedPersona}
            onPersonaSelect={onPersonaSelect}
            selectedGenerator={selectedGenerator}
            onGeneratorSelect={onGeneratorSelect}
            disabled={disabled}
          />
        )}

        {/* Settings button for chat configuration */}
        {showSettings && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0 rounded-[var(--radius-button)] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}

        {/* Main message input field with typewriter placeholder */}
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder=""
            disabled={disabled}
            className="w-full flex-1 border-0 bg-transparent px-4 text-base text-neutral-900 caret-neutral-900 shadow-none ring-0 outline-none placeholder:text-neutral-500 hover:shadow-none focus:border-0 focus:shadow-none focus:ring-0 focus:outline-none focus-visible:border-0 focus-visible:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            // autoFocus removed to prevent unwanted focus on page load
          />
          {/* Typewriter placeholder overlay - hidden on mobile */}
          {showTypewriter && !value && (
            <div
              ref={placeholderRef}
              className="pointer-events-none absolute inset-0 hidden items-center px-4 sm:flex"
              onClick={() => inputRef.current?.focus()}
            >
              <TypewriterPlaceholder
                prefix="Ask Gen.C to write:"
                phrases={typewriterPhrases}
                typingSpeed={40}
                deletingSpeed={25}
                pauseTime={1500}
              />
            </div>
          )}

          {/* Mobile-only simple placeholder */}
          {showTypewriter && !value && (
            <div className="pointer-events-none absolute inset-0 flex items-center px-4 text-neutral-500 sm:hidden">
              Ask Gen.C to write something...
            </div>
          )}
        </div>

        {/* Time limit selector and submit button */}
        <div className="flex flex-shrink-0 items-center gap-1">
          {showTimeLimit && (
            <Select value={timeLimit} onValueChange={setTimeLimit} disabled={disabled}>
              <SelectTrigger className="h-10 w-16 rounded-[var(--radius-button)] border-0 bg-transparent text-neutral-600 hover:bg-neutral-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-neutral-200 bg-neutral-50">
                <SelectItem value="20s">20s</SelectItem>
                <SelectItem value="30s">30s</SelectItem>
                <SelectItem value="60s">60s</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-[var(--radius-button)] bg-neutral-700 text-neutral-50 transition-all duration-150 hover:bg-neutral-800 disabled:bg-neutral-300"
            disabled={disabled || !value.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Trending topics dropdown */}
      {renderTrendingDropdown()}
    </form>
  );
}
