"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Undo, Copy, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversationStore } from "@/lib/script-generation/conversation-store";
import type { ActionType, ConversationMessage } from "@/lib/script-generation/conversation-types";
import { cn } from "@/lib/utils";

interface InteractiveScriptChatProps {
  sessionId: string;
  onScriptUpdate?: (script: string) => void;
}

export function InteractiveScriptChat({ sessionId, onScriptUpdate }: InteractiveScriptChatProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    activeConversation, 
    addMessage, 
    updateScript, 
    suggestNextActions,
    undoLastChange 
  } = useConversationStore();
  
  // Quick action buttons based on context
  const quickActions: { action: ActionType; label: string; icon: React.ReactNode }[] = [
    { action: 'refine_hook', label: 'Refine Hook', icon: <Sparkles className="h-3 w-3" /> },
    { action: 'change_tone', label: 'Change Tone', icon: <Wand2 className="h-3 w-3" /> },
    { action: 'add_cta', label: 'Add CTA', icon: <Send className="h-3 w-3" /> },
    { action: 'shorten_content', label: 'Make Shorter', icon: <RefreshCw className="h-3 w-3" /> },
    { action: 'generate_variations', label: 'Variations', icon: <Copy className="h-3 w-3" /> },
  ];
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.history]);
  
  const handleSendMessage = async (message?: string, action?: ActionType) => {
    const userInput = message || input;
    if (!userInput.trim() && !action) return;
    
    setIsProcessing(true);
    setInput("");
    
    // Add user message to conversation
    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
      metadata: { action }
    };
    
    addMessage(sessionId, userMessage);
    
    try {
      // Call the iteration API
      const response = await fetch('/api/script/iterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: activeConversation,
          userMessage: userInput,
          requestedAction: action || 'generate_initial',
          actionDetails: {}
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update script in store
        updateScript(sessionId, result.updatedScript);
        
        // Add assistant response
        const assistantMessage: ConversationMessage = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: result.assistantMessage,
          timestamp: new Date(),
          scriptSnapshot: JSON.stringify(result.updatedScript),
          metadata: {
            action,
            changes: result.updatedScript.metadata.changeLog
          }
        };
        
        addMessage(sessionId, assistantMessage);
        
        // Notify parent component
        if (onScriptUpdate) {
          onScriptUpdate(result.updatedScript.content);
        }
      }
    } catch (error) {
      console.error('Failed to process message:', error);
      
      // Add error message
      const errorMessage: ConversationMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      
      addMessage(sessionId, errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleQuickAction = (action: ActionType) => {
    const actionPrompts: Record<ActionType, string> = {
      refine_hook: "Make the hook more attention-grabbing",
      change_tone: "Make the tone more conversational and engaging",
      add_cta: "Add a strong call-to-action",
      shorten_content: "Shorten this script while keeping the key points",
      generate_variations: "Generate 3 different variations of the hook",
      expand_section: "Expand this section with more detail",
      apply_voice_persona: "Apply a specific voice persona",
      adjust_pacing: "Improve the pacing and flow",
      add_emotional_beat: "Add an emotional connection point",
      generate_initial: "Generate the initial script"
    };
    
    handleSendMessage(actionPrompts[action], action);
  };
  
  if (!activeConversation) {
    return (
      <Card className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <p className="text-neutral-600">No active conversation</p>
          <p className="mt-2 text-sm text-neutral-500">Start by generating a script to begin the conversation</p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="flex h-full flex-col">
      {/* Chat header with script stats */}
      <div className="border-b border-neutral-200 bg-neutral-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              v{activeConversation.currentScript.version}
            </Badge>
            <span className="text-sm text-neutral-600">
              {activeConversation.currentScript.metadata.wordCount} words
            </span>
            <span className="text-sm text-neutral-500">•</span>
            <span className="text-sm text-neutral-600">
              {activeConversation.currentScript.metadata.duration}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => undoLastChange(sessionId)}
            disabled={activeConversation.currentScript.version <= 1}
          >
            <Undo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Conversation history */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {activeConversation.history.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-[var(--radius-card)] px-4 py-2",
                  message.role === "user"
                    ? "bg-primary-100 text-primary-900"
                    : message.role === "assistant"
                    ? "bg-neutral-100 text-neutral-900"
                    : "bg-neutral-50 text-neutral-600 italic"
                )}
              >
                <p className="text-sm">{message.content}</p>
                {message.metadata?.action && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {message.metadata.action.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 rounded-[var(--radius-card)] px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
                  <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-400 animation-delay-200" />
                  <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-400 animation-delay-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Quick actions */}
      <div className="border-t border-neutral-200 bg-neutral-50 p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickActions.map(({ action, label, icon }) => (
            <Button
              key={action}
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction(action)}
              disabled={isProcessing}
              className="h-7 text-xs"
            >
              {icon}
              {label}
            </Button>
          ))}
        </div>
        
        {/* Message input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask for changes, refinements, or new ideas..."
            className="min-h-[60px] resize-none"
            disabled={isProcessing}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isProcessing}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}