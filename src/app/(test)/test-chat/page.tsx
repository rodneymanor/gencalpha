"use client"

import ChatInterface from "@/components/ChatInterface"

export default function TestChatPage() {
  const handleSubmit = (message: string, timeLimit: string) => {
    console.log("Message submitted:", message)
    console.log("Time limit:", timeLimit)
  }

  return (
    <ChatInterface 
      userName="Test User"
      heroText="Ready to test the new chat interface?"
      onSubmit={handleSubmit}
    />
  )
}