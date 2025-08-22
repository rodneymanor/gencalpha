"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import ChatInput from "@/components/ChatInterface/ChatInput"

interface ChatInterfaceProps {
  userName?: string
  heroText?: string
  onSubmit?: (message: string, timeLimit: string) => void
  className?: string
}

export default function ChatInterface({ 
  userName = "Rodney Manor",
  heroText = "What will you script today?",
  onSubmit,
  className = ""
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("")

  // Handle chat input submission
  const handleChatSubmit = (message: string, timeLimit: string) => {
    onSubmit?.(message, timeLimit)
    setMessage("")
  }

  const tools = ["Scribo", "MiniBuddy", "StoryBuddy", "HookBuddy", "Value Bomb"]

  return (
    <div className={`min-h-screen bg-neutral-50 flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-3xl">
        {/* Header section with personalized greeting */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Hello, {userName}
          </h1>
          <h1 className="text-4xl font-bold text-lg text-neutral-600">{heroText}</h1>
        </div>

        {/* Main chat input with trending dropdown */}
        <ChatInput
          value={message}
          onChange={setMessage}
          onSubmit={handleChatSubmit}
          placeholder="How can I help you today?"
          showTimeLimit={true}
          showSettings={true}
          showTrending={true}
        />

        {/* Quick action tool buttons */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {tools.map((tool) => (
            <Button 
              key={tool} 
              variant="outline" 
              size="sm" 
              className="rounded-[var(--radius-button)] px-4 py-2 text-sm bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 hover:border-neutral-300 transition-all duration-150"
            >
              {tool}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}