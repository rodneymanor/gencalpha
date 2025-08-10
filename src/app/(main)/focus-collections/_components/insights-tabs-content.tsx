"use client";

import { Copy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface HookIdea {
  id: string;
  text: string;
  type: "question" | "statement" | "statistic" | "story";
  confidence: number;
}

interface ContentSuggestion {
  id: string;
  title: string;
  description: string;
  category: "improvement" | "variation" | "trend";
}

interface Video {
  id: string;
  title: string;
  platform: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  favorite: boolean;
  duration?: string;
  uploadDate?: string;
  description?: string;
  tags?: string[];
  insights?: {
    hooks?: { text?: string; rating?: number }[];
    contentIdeas?: { title?: string; format?: string; hook?: string; keyPoints?: string[] }[];
  };
}

interface InsightsTabsContentProps {
  video: Video;
  mockHookIdeas: HookIdea[];
  mockContentSuggestions: ContentSuggestion[];
  formatDate: (dateString?: string) => string;
  getConfidenceColor: (confidence: number) => string;
  getCategoryIcon: (category: string) => JSX.Element;
}

export function InsightsTabsContent({
  video,
  mockHookIdeas,
  mockContentSuggestions,
  formatDate,
  getConfidenceColor,
  getCategoryIcon,
}: InsightsTabsContentProps) {
  const realHooks = Array.isArray(video?.insights?.hooks) ? video.insights!.hooks! : [];
  const realIdeas = Array.isArray(video?.insights?.contentIdeas) ? video.insights!.contentIdeas! : [];

  return (
    <>
      <TabsContent value="hooks" className="space-y-4">
        <div className="space-y-3">
          {realHooks.length > 0
            ? realHooks.slice(0, 3).map((h, idx) => (
                <Card key={`real-hook-${idx}`}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        generated
                      </Badge>
                      {typeof h.rating === "number" && (
                        <span className={cn("text-xs font-medium", getConfidenceColor(Math.min(0.99, Math.max(0, h.rating / 100))))}>
                          {Math.round(h.rating)}%
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-sm font-medium">{h.text}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Copy className="mr-2 h-3 w-3" />
                      Copy Hook
                    </Button>
                  </CardContent>
                </Card>
              ))
            : mockHookIdeas.map((hook) => (
                <Card key={hook.id}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        {hook.type}
                      </Badge>
                      <span className={cn("text-xs font-medium", getConfidenceColor(hook.confidence))}>
                        {Math.round(hook.confidence * 100)}%
                      </span>
                    </div>
                    <p className="mb-2 text-sm font-medium">{hook.text}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Copy className="mr-2 h-3 w-3" />
                      Copy Hook
                    </Button>
                  </CardContent>
                </Card>
              ))}
        </div>
      </TabsContent>

      <TabsContent value="suggestions" className="space-y-4">
        <div className="space-y-3">
          {realIdeas.length > 0
            ? realIdeas.slice(0, 3).map((idea, idx) => (
                <Card key={`idea-${idx}`}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start gap-2">
                      {getCategoryIcon("variation")}
                      <div className="flex-1">
                        <h4 className="mb-1 text-sm font-medium">{idea.title ?? "Idea"}</h4>
                        <p className="text-muted-foreground text-xs">Format: {idea.format ?? "Video"}</p>
                        <p className="text-xs">Hook: {idea.hook ?? ""}</p>
                        {Array.isArray(idea.keyPoints) && idea.keyPoints.length > 0 && (
                          <ul className="mt-2 list-inside list-disc text-xs">
                            {idea.keyPoints.slice(0, 3).map((kp) => (
                              <li key={kp}>{kp}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : mockContentSuggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start gap-2">
                      {getCategoryIcon(suggestion.category)}
                      <div className="flex-1">
                        <h4 className="mb-1 text-sm font-medium">{suggestion.title}</h4>
                        <p className="text-muted-foreground text-xs">{suggestion.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </TabsContent>

      <TabsContent value="content" className="space-y-4">
        {video.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{video.description}</p>
            </CardContent>
          </Card>
        )}

        {video.tags && video.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="data" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Platform Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform:</span>
                <span>{video.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upload Date:</span>
                <span>{formatDate(video.uploadDate)}</span>
              </div>
              {video.duration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{video.duration}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}
