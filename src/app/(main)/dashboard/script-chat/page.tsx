"use client"

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Sparkles, Clock, Target, Zap, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScriboHook {
  id: number;
  text: string;
  template: string;
  strength: string;
}

interface ScriptSection {
  hook: string;
  bridge: string;
  goldenNugget: string;
  wta: string;
  microHooks?: string[];
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: "text" | "hooks" | "script" | "lengths" | "cta-options";
  data?: any;
}

type ScriptLength = "20s" | "30s" | "45s" | "60s" | "90s";
type CtaOptimization = "comments" | "follow" | "none";

const SCRIPT_LENGTHS: { value: ScriptLength; label: string; words: string }[] = [
  { value: "20s", label: "20 seconds", words: "90-110 words" },
  { value: "30s", label: "30 seconds", words: "140-160 words" },
  { value: "45s", label: "45 seconds", words: "210-240 words" },
  { value: "60s", label: "60 seconds", words: "290-310 words" },
  { value: "90s", label: "90 seconds", words: "440-460 words" },
];

export default function ScriptChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");
  const [selectedHook, setSelectedHook] = useState<ScriboHook | null>(null);
  const [, setSelectedLength] = useState<ScriptLength | null>(null);
  const [currentScript, setCurrentScript] = useState<ScriptSection | null>(null);
  const [ctaOptimization, setCtaOptimization] = useState<CtaOptimization>("comments");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hi! I'm Scribo, your script writing assistant. I'll help you create high-converting short video scripts using the proven SCRIBO formula.\n\nTo get started, just tell me your video topic or idea, and I'll generate 20 powerful hooks for you to choose from!",
      type: "text"
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = (message: Omit<Message, "id">) => {
    const newMessage: Message = { ...message, id: crypto.randomUUID() };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const generateHooks = async (topic: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/scribo/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      
      if (data.success && data.hooks) {
        setCurrentTopic(topic);
        addMessage({
          role: "assistant",
          content: `Great! Here are 20 hooks for "${topic}". Click on the number of the hook you want to use:`,
          type: "hooks",
          data: data.hooks
        });
      } else {
        addMessage({
          role: "assistant",
          content: "Sorry, I couldn't generate hooks. Please try again with a different topic.",
          type: "text"
        });
      }
    } catch {
      addMessage({
        role: "assistant",
        content: "Failed to generate hooks. Please try again.",
        type: "text"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHookSelection = (hook: ScriboHook) => {
    setSelectedHook(hook);
    addMessage({
      role: "user",
      content: `Selected Hook #${hook.id}: "${hook.text}"`,
      type: "text"
    });
    
    addMessage({
      role: "assistant",
      content: "Perfect choice! Now select your desired script length:",
      type: "lengths"
    });
  };

  const handleLengthSelection = async (length: ScriptLength) => {
    if (!selectedHook || !currentTopic) return;
    
    setSelectedLength(length);
    addMessage({
      role: "user",
      content: `Selected Length: ${SCRIPT_LENGTHS.find(l => l.value === length)?.label}`,
      type: "text"
    });

    setIsLoading(true);
    try {
      const response = await fetch("/api/scribo/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: currentTopic,
          selectedHook: selectedHook.text,
          length,
          ctaOptimization
        }),
      });

      const data = await response.json();
      
      if (data.success && data.script) {
        setCurrentScript(data.script);
        addMessage({
          role: "assistant",
          content: `Here's your ${length} script (${data.wordCount} words):`,
          type: "script",
          data: { script: data.script, wordCount: data.wordCount }
        });
        
        // Show CTA optimization options
        setTimeout(() => {
          addMessage({
            role: "assistant",
            content: "Would you like to optimize the call-to-action for a different engagement type?",
            type: "cta-options"
          });
        }, 500);
      } else {
        addMessage({
          role: "assistant",
          content: "Sorry, I couldn't generate the script. Please try again.",
          type: "text"
        });
      }
    } catch {
      addMessage({
        role: "assistant",
        content: "Failed to generate script. Please try again.",
        type: "text"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCtaOptimization = async (newOptimization: CtaOptimization) => {
    if (!currentScript || !currentTopic) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/scribo/optimize-cta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: currentScript,
          newOptimization,
          topic: currentTopic
        }),
      });

      const data = await response.json();
      
      if (data.success && data.optimizedWta) {
        const updatedScript = { ...currentScript, wta: data.optimizedWta };
        setCurrentScript(updatedScript);
        setCtaOptimization(newOptimization);
        
        addMessage({
          role: "assistant",
          content: `Updated script with ${newOptimization} optimization:`,
          type: "script",
          data: { script: updatedScript, wordCount: 0 }
        });
      } else {
        addMessage({
          role: "assistant",
          content: "Sorry, I couldn't optimize the CTA. Please try again.",
          type: "text"
        });
      }
    } catch {
      addMessage({
        role: "assistant",
        content: "Failed to optimize CTA. Please try again.",
        type: "text"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    
    addMessage({
      role: "user",
      content: input,
      type: "text"
    });
    
    generateHooks(input.trim());
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold">Scribo Script Assistant</h1>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center">
                <p className="text-muted-foreground">Start by entering your video topic below</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-3xl p-4 rounded-lg",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-12"
                      : "bg-muted mr-12"
                  )}>
                    {message.type === "text" && (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    {message.type === "hooks" && (
                      <div>
                        <p className="mb-4">{message.content}</p>
                        <div className="grid grid-cols-4 gap-2">
                          {message.data?.map((hook: ScriboHook) => (
                            <Button
                              key={hook.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleHookSelection(hook)}
                              className="justify-start text-left h-auto p-3"
                              disabled={isLoading}
                            >
                              <div>
                                <div className="font-medium text-xs text-primary mb-1">#{hook.id}</div>
                                <div className="text-xs line-clamp-3">{hook.text}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {message.type === "lengths" && (
                      <div>
                        <p className="mb-4">{message.content}</p>
                        <div className="grid grid-cols-5 gap-2">
                          {SCRIPT_LENGTHS.map((length) => (
                            <Button
                              key={length.value}
                              variant="outline"
                              onClick={() => handleLengthSelection(length.value)}
                              className="flex flex-col h-auto p-3"
                              disabled={isLoading}
                            >
                              <Clock className="w-4 h-4 mb-1" />
                              <div className="text-sm font-medium">{length.label}</div>
                              <div className="text-xs text-muted-foreground">{length.words}</div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {message.type === "script" && (
                      <div>
                        <p className="mb-4">{message.content}</p>
                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <div>
                              <Badge variant="secondary" className="mb-2">
                                <Target className="w-3 h-3 mr-1" />
                                Hook
                              </Badge>
                              <p className="text-sm">{message.data.script.hook}</p>
                            </div>
                            <div>
                              <Badge variant="secondary" className="mb-2">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Bridge
                              </Badge>
                              <p className="text-sm">{message.data.script.bridge}</p>
                            </div>
                            <div>
                              <Badge variant="secondary" className="mb-2">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Golden Nugget
                              </Badge>
                              <p className="text-sm">{message.data.script.goldenNugget}</p>
                              {message.data.script.microHooks && message.data.script.microHooks.length > 0 && (
                                <div className="mt-2 pl-4 border-l-2 border-muted">
                                  <p className="text-xs text-muted-foreground mb-1">Micro Hooks:</p>
                                  {message.data.script.microHooks.map((microHook: string, hookIndex: number) => (
                                    <p key={`micro-hook-${hookIndex}`} className="text-xs mb-1">• {microHook}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div>
                              <Badge variant="secondary" className="mb-2">
                                <Zap className="w-3 h-3 mr-1" />
                                Call to Action
                              </Badge>
                              <p className="text-sm">{message.data.script.wta}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    
                    {message.type === "cta-options" && (
                      <div>
                        <p className="mb-4">{message.content}</p>
                        <div className="flex gap-2">
                          <Button
                            variant={ctaOptimization === "comments" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCtaOptimization("comments")}
                            disabled={isLoading}
                          >
                            💬 Comments
                          </Button>
                          <Button
                            variant={ctaOptimization === "follow" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCtaOptimization("follow")}
                            disabled={isLoading}
                          >
                            👥 Follow
                          </Button>
                          <Button
                            variant={ctaOptimization === "none" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCtaOptimization("none")}
                            disabled={isLoading}
                          >
                            🎯 None
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              placeholder="Enter your video topic or idea..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}