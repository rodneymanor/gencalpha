"use client";

import { useState } from "react";
import { X, MessageSquare, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/lib/script-generation/conversation-store";
import { InteractiveScriptChat } from "./interactive-script-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EnhancedScriptPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onScriptUpdate?: (content: string) => void;
  sessionId?: string;
}

export function EnhancedScriptPanel({ 
  isOpen, 
  onClose, 
  onScriptUpdate,
  sessionId 
}: EnhancedScriptPanelProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "script" | "history">("chat");
  const { activeConversation, sessions } = useConversationStore();
  
  const currentSessionId = sessionId || activeConversation?.sessionId;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed right-0 top-0 z-50 h-screen w-[600px] border-l border-neutral-200 bg-neutral-50 shadow-[var(--shadow-soft-drop)]">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary-600" />
          <h2 className="font-semibold text-neutral-900">Interactive Script Assistant</h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex h-[calc(100%-64px)] flex-col">
        <TabsList className="mx-4 mt-4 grid w-[calc(100%-32px)] grid-cols-3">
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="script" className="gap-2">
            <FileText className="h-4 w-4" />
            Script
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>
        
        {/* Chat Tab - Interactive conversation */}
        <TabsContent value="chat" className="flex-1 p-4">
          {currentSessionId ? (
            <InteractiveScriptChat 
              sessionId={currentSessionId}
              onScriptUpdate={onScriptUpdate}
            />
          ) : (
            <Card className="flex h-full items-center justify-center p-6">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                <p className="text-neutral-600">No active session</p>
                <p className="mt-2 text-sm text-neutral-500">
                  Generate a script to start an interactive conversation
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
        
        {/* Script Tab - Current script view */}
        <TabsContent value="script" className="flex-1 p-4">
          {activeConversation ? (
            <Card className="h-full p-6">
              <ScrollArea className="h-full">
                <div className="space-y-6">
                  {/* Script metadata */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {activeConversation.currentScript.metadata.tone}
                    </Badge>
                    <Badge variant="outline">
                      {activeConversation.currentScript.metadata.wordCount} words
                    </Badge>
                    <Badge variant="outline">
                      {activeConversation.currentScript.metadata.duration}
                    </Badge>
                    <Badge variant="outline">
                      v{activeConversation.currentScript.version}
                    </Badge>
                  </div>
                  
                  {/* Script elements */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-neutral-700">Hook</h4>
                      <p className="rounded-[var(--radius-card)] bg-neutral-100 p-3 text-sm">
                        {activeConversation.currentScript.elements.hook || "Not yet generated"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-neutral-700">Bridge</h4>
                      <p className="rounded-[var(--radius-card)] bg-neutral-100 p-3 text-sm">
                        {activeConversation.currentScript.elements.bridge || "Not yet generated"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-neutral-700">Golden Nugget</h4>
                      <p className="rounded-[var(--radius-card)] bg-neutral-100 p-3 text-sm">
                        {activeConversation.currentScript.elements.goldenNugget || "Not yet generated"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-neutral-700">What To Avoid</h4>
                      <p className="rounded-[var(--radius-card)] bg-neutral-100 p-3 text-sm">
                        {activeConversation.currentScript.elements.wta || "Not yet generated"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Full script */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-neutral-700">Full Script</h4>
                    <div className="whitespace-pre-wrap rounded-[var(--radius-card)] bg-neutral-100 p-4 text-sm">
                      {activeConversation.currentScript.content || "Generate a script to begin..."}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          ) : (
            <Card className="flex h-full items-center justify-center p-6">
              <p className="text-neutral-600">No script generated yet</p>
            </Card>
          )}
        </TabsContent>
        
        {/* History Tab - Version history */}
        <TabsContent value="history" className="flex-1 p-4">
          <Card className="h-full p-6">
            <ScrollArea className="h-full">
              {activeConversation ? (
                <div className="space-y-3">
                  <h4 className="mb-4 text-sm font-medium text-neutral-700">Change History</h4>
                  {activeConversation.currentScript.metadata.changeLog.map((change, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 rounded-[var(--radius-card)] bg-neutral-100 p-3"
                    >
                      <Badge variant="outline" className="text-xs">
                        v{index + 1}
                      </Badge>
                      <p className="flex-1 text-sm text-neutral-700">{change}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-neutral-600">No history available</p>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}