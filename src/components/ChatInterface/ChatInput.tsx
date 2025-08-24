"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, ArrowUp, Zap, Loader2, Clock, Database } from "lucide-react"
import { useTrendingTopics } from "@/hooks/use-trending-topics"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (message: string, timeLimit: string) => void
  placeholder?: string
  disabled?: boolean
  showTimeLimit?: boolean
  showSettings?: boolean
  showTrending?: boolean
  className?: string
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "How can I help you today?",
  disabled = false,
  showTimeLimit = true,
  showSettings = true,
  showTrending = true,
  className = ""
}: ChatInputProps) {
  const [timeLimit, setTimeLimit] = useState("20s")
  const [showTrendingDropdown, setShowTrendingDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Use the optimized trending topics hook
  const { 
    topics: trendingTopics, 
    isLoading: isLoadingTopics,
    isFromCache,
    lastUpdated,
    nextUpdate,
    loadTopics
  } = useTrendingTopics({ 
    autoLoad: false, // Load on demand when dropdown opens
    limit: 8 
  })

  // Preload topics on component mount for better UX
  useEffect(() => {
    if (showTrending) {
      // Preload topics in the background
      loadTopics()
    }
  }, [showTrending])

  // Handle clicking outside to close trending dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowTrendingDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle form submission with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      onSubmit(value, timeLimit)
      setShowTrendingDropdown(false)
    }
  }

  // Show trending topics when input is focused
  const handleInputFocus = () => {
    if (showTrending) {
      setShowTrendingDropdown(true)
      // Topics are already preloaded or will load from cache
    }
  }

  // Select a trending topic and focus input
  const handleTrendingSelect = (topic: string) => {
    onChange(topic)
    setShowTrendingDropdown(false)
    inputRef.current?.focus()
  }

  // Helper function to format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `in ${minutes}m`
    } else {
      return 'soon'
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="flex items-center gap-2 p-2 border border-neutral-200 rounded-[var(--radius-card)] bg-neutral-50 shadow-[var(--shadow-input)] hover:border-neutral-300 transition-all duration-200">
        {/* Settings button for chat configuration */}
        {showSettings && (
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-[var(--radius-button)] flex-shrink-0 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}

        {/* Main message input field */}
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-4 text-neutral-900 placeholder:text-neutral-500"
        />

        {/* Time limit selector and submit button */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {showTimeLimit && (
            <Select value={timeLimit} onValueChange={setTimeLimit} disabled={disabled}>
              <SelectTrigger className="h-10 w-16 rounded-[var(--radius-button)] border-0 bg-transparent hover:bg-neutral-100 text-neutral-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-50 border-neutral-200">
                <SelectItem value="20s">20s</SelectItem>
                <SelectItem value="30s">30s</SelectItem>
                <SelectItem value="60s">60s</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button 
            type="submit" 
            size="icon" 
            className="h-10 w-10 rounded-[var(--radius-button)] bg-neutral-700 text-neutral-50 hover:bg-neutral-800 disabled:bg-neutral-300 transition-all duration-150" 
            disabled={disabled || !value.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Trending topics dropdown */}
      {showTrending && showTrendingDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] z-10 max-h-64 overflow-y-auto"
        >
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="text-sm font-medium text-neutral-600">
                Trending Topics
              </div>
              {isFromCache && (
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Database className="h-3 w-3" />
                  <span>Cached</span>
                  {nextUpdate && (
                    <>
                      <Clock className="h-3 w-3 ml-1" />
                      <span>Updates {getRelativeTime(nextUpdate)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Loading state */}
            {isLoadingTopics && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                <span className="text-sm text-neutral-500 ml-2">Loading suggestions...</span>
              </div>
            )}
            
            {/* Trending topics from RSS feeds */}
            {!isLoadingTopics && trendingTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTrendingSelect(topic.title)}
                className="w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-neutral-100 rounded-[var(--radius-button)] transition-colors duration-150"
              >
                <Zap className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {topic.title}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
                    <span className="truncate">{topic.source}</span>
                    {topic.relevanceScore > 5 && (
                      <span className="bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded text-xs font-medium">
                        Hot
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            
            {/* Empty state */}
            {!isLoadingTopics && trendingTopics.length === 0 && (
              <div className="text-sm text-neutral-500 text-center py-4">
                No trending topics available
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  )
}