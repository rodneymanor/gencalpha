"use client";

import { useState } from "react";

import { PanelRightClose, Zap, Sparkles, RefreshCw, FileText, Plus } from "lucide-react";
import { ClarityLoader } from "@/components/ui/loading";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSimpleScript } from "@/contexts/simple-script-context";
import { cn } from "@/lib/utils";

interface SimpleScriptPanelProps {
  className?: string;
}

export function SimpleScriptPanel({ className }: SimpleScriptPanelProps) {
  const {
    isPanelOpen,
    closePanel,
    scriptComponents,
    isGenerating,
    generationProgress,
    generateScriptFromIdea,
    insertContentToEditor,
  } = useSimpleScript();

  const [scriptIdea, setScriptIdea] = useState("");
  const [scriptLength, setScriptLength] = useState<"15" | "20" | "30" | "45" | "60" | "90">("60");
  const [scriptType, setScriptType] = useState<"speed" | "educational" | "voice">("speed");

  const handleGenerateScript = async () => {
    if (!scriptIdea.trim()) {
      toast.error("Please enter a script idea to generate content.");
      return;
    }

    await generateScriptFromIdea({
      idea: scriptIdea,
      length: scriptLength,
      type: scriptType,
    });
  };

  const handleAddToEditor = (content: string, title: string) => {
    insertContentToEditor(content);
    toast.success(`${title} added to editor.`);
  };

  if (!isPanelOpen) return null;

  return (
    <div className={cn("bg-background fixed top-0 right-0 z-50 h-full w-96 border-l shadow-lg", className)}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            <h2 className="font-semibold">Script Writing</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={closePanel}>
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="generate" className="flex h-full flex-col">
            <TabsList className="mx-4 mt-4 grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="components">
                Components
                {scriptComponents.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {scriptComponents.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="generate" className="m-0 h-full">
                <ScrollArea className="h-full px-4">
                  <div className="space-y-4 py-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Zap className="h-5 w-5" />
                          Generate Script
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="script-idea">Script Idea</Label>
                          <Textarea
                            id="script-idea"
                            placeholder="Enter your script idea here..."
                            value={scriptIdea}
                            onChange={(e) => setScriptIdea(e.target.value)}
                            rows={3}
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="script-length">Length</Label>
                            <Select
                              value={scriptLength}
                              onValueChange={(value) => setScriptLength(value as typeof scriptLength)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 seconds</SelectItem>
                                <SelectItem value="20">20 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="45">45 seconds</SelectItem>
                                <SelectItem value="60">60 seconds</SelectItem>
                                <SelectItem value="90">90 seconds</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="script-type">Type</Label>
                            <Select
                              value={scriptType}
                              onValueChange={(value) => setScriptType(value as typeof scriptType)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="speed">Speed Write</SelectItem>
                                <SelectItem value="educational">Educational</SelectItem>
                                <SelectItem value="voice">AI Voice</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button
                          onClick={handleGenerateScript}
                          disabled={isGenerating || !scriptIdea.trim()}
                          className="w-full"
                        >
                          {isGenerating ? (
                            <>
                              <ClarityLoader size="inline" />
                              <span className="ml-2">Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Script
                            </>
                          )}
                        </Button>

                        {isGenerating && generationProgress && (
                          <div className="space-y-2">
                            <Progress value={33} className="w-full" />
                            <p className="text-muted-foreground text-center text-sm">{generationProgress}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="components" className="m-0 h-full">
                <div className="flex h-full flex-col">
                  <div className="border-b p-4">
                    <h3 className="font-medium">Script Components</h3>
                    {scriptComponents.length > 0 && (
                      <p className="text-muted-foreground text-sm">
                        {scriptComponents.length} component{scriptComponents.length !== 1 ? "s" : ""} available
                      </p>
                    )}
                  </div>

                  <ScrollArea className="flex-1 px-4">
                    <div className="py-4">
                      {scriptComponents.length === 0 ? (
                        <div className="py-8 text-center">
                          <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                          <h3 className="text-muted-foreground mb-2 font-medium">No Components Yet</h3>
                          <p className="text-muted-foreground text-sm">
                            Generate a script to create reusable components.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {scriptComponents.map((component) => (
                            <Card key={component.id} className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium">{component.title}</h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {component.type.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground line-clamp-2 text-xs">{component.content}</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddToEditor(component.content, component.title)}
                                  className="w-full"
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add to Editor
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
