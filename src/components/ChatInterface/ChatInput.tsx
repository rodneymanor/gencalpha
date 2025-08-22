"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, ArrowUp, Zap, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { buildAuthHeaders } from "@/lib/http/auth-headers"
import type { Category, TrendingTopic } from "@/lib/rss-service"

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
  const { user } = useAuth()
  const [timeLimit, setTimeLimit] = useState("20s")
  const [showTrendingDropdown, setShowTrendingDropdown] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [userCategories, setUserCategories] = useState<Category[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load user brand settings to determine their preferred categories
  useEffect(() => {
    if (user) {
      loadUserBrandSettings()
    }
  }, [user])

  const loadUserBrandSettings = async () => {
    try {
      const headers = await buildAuthHeaders()
      const response = await fetch('/api/user/brand-settings', {
        headers
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings?.selectedCategories) {
          setUserCategories(data.settings.selectedCategories)
        }
      }
    } catch (error) {
      console.error('Error loading user brand settings:', error)
      // Fallback to default categories if user settings fail
      setUserCategories(['ai', 'business'])
    }
  }

  // Load trending topics when dropdown opens
  const loadTrendingTopics = async () => {
    if (isLoadingTopics || trendingTopics.length > 0) return
    
    setIsLoadingTopics(true)
    
    try {
      // Use the consolidated user trending endpoint for better performance
      const headers = await buildAuthHeaders()
      const response = await fetch('/api/rss/user-trending?limit=8', {
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.topics) {
          setTrendingTopics(data.topics)
        } else {
          // Fallback to default topics
          setTrendingTopics([])
        }
      } else {
        // Fallback if API fails
        setTrendingTopics([])
      }
    } catch (error) {
      console.error('Error loading trending topics:', error)
      // Fallback to static content if everything fails
      setTrendingTopics([
        {
          id: '1',
          title: 'AI-powered productivity tools',
          description: 'Latest trends in AI productivity',
          source: 'Default',
          pubDate: new Date().toISOString(),
          relevanceScore: 5
        },
        {
          id: '2', 
          title: 'Remote work best practices',
          description: 'Effective remote work strategies',
          source: 'Default',
          pubDate: new Date().toISOString(),
          relevanceScore: 4
        }
      ])
    } finally {
      setIsLoadingTopics(false)
    }
  }

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
      loadTrendingTopics()
    }
  }

  // Select a trending topic and focus input
  const handleTrendingSelect = (topic: string) => {
    onChange(topic)
    setShowTrendingDropdown(false)
    inputRef.current?.focus()
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
            <div className="text-sm font-medium text-neutral-600 mb-2 px-2">
              {userCategories.length > 0 ? 'Personalized Suggestions' : 'Trending Topics'}
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