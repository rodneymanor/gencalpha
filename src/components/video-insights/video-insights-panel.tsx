"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Heart, MessageCircle, Bookmark, ChevronDown, ChevronUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { VideoPlayer } from "@/components/video-player";
import { Video } from "@/lib/collections";
import { cn } from "@/lib/utils";

interface VideoInsightsPanelProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemixScript?: (video: Video) => void;
}

export function VideoInsightsPanel({
  video,
  open,
  onOpenChange,
  onRemixScript,
}: VideoInsightsPanelProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!video) return null;

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getDescription = () => {
    const description = video.caption || video.metadata?.description || '';
    if (!description) return null;
    
    if (description.length <= 120) {
      return description;
    }
    
    return isDescriptionExpanded 
      ? description 
      : `${description.substring(0, 120)}...`;
  };

  const shouldShowReadMore = () => {
    const description = video.caption || video.metadata?.description || '';
    return description.length > 120;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-none p-0 sm:max-w-none lg:max-w-[50vw]"
      >
    
        <div className="flex h-full">
          {/* Left Side - Video Player */}
          <div className="flex w-1/2 items-center justify-center bg-black">
            <div className="aspect-[9/16] h-full max-h-[600px] w-full max-w-[337px]">
              <VideoPlayer
                video={video}
                className="h-full w-full"
                autoPlay={false}
                showControls={true}
              />
            </div>
          </div>

          {/* Right Side - Insights Panel */}
          <div className="flex w-1/2 flex-col bg-background">
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Header Section */}
            <div className="flex-shrink-0 space-y-4 px-6">
              <div className="flex items-start gap-4">
                {/* Profile Picture */}
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                  {video.thumbnailUrl ? (
                    <Image
                      src={video.thumbnailUrl}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      👤
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">
                    @{video.metadata?.author || 'unknown'}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {video.metadata?.author || 'Unknown User'}
                  </div>
                  {video.hashtags && video.hashtags.length > 0 && (
                    <div className="mt-1 text-xs text-primary">
                      #{video.hashtags[0]}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="flex flex-shrink-0 items-center gap-1 text-muted-foreground text-xs">
                  <Calendar className="h-3 w-3" />
                  {formatDate(video.addedAt)}
                </div>
              </div>

              {/* Video Description */}
              <div className="space-y-2">
                <div className="text-sm leading-relaxed">
                  {getDescription()}
                </div>
                {shouldShowReadMore() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="h-auto p-0 text-primary text-xs hover:bg-transparent"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        <ChevronUp className="mr-1 h-3 w-3" />
                        Read less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-3 w-3" />
                        Read more
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Social Stats */}
              {video.metrics && (
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{formatNumber(video.metrics.likes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span>{formatNumber(video.metrics.comments)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4 text-green-500" />
                    <span>{formatNumber(video.metrics.saves)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs Section */}
            <div className="mt-6 flex min-h-0 flex-1 flex-col">
              <Tabs defaultValue="transcript" className="flex h-full flex-col">
                <div className="flex-shrink-0 px-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="components">Components</TabsTrigger>
                  </TabsList>
                </div>

                <div className="min-h-0 flex-1 px-6 py-4">
                  <TabsContent value="transcript" className="mt-0 h-full">
                    <Card className="h-full">
                      <CardContent className="h-full p-0">
                        <ScrollArea className="h-full p-4">
                          <div className="space-y-3 text-sm leading-relaxed">
                            {video.transcript ? (
                              video.transcript.split('\n').map((line, index) => (
                                <p key={index} className="text-sm">
                                  {line.trim()}
                                </p>
                              ))
                            ) : (
                              <div className="flex h-32 items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                  <p>No transcript available</p>
                                  <p className="text-xs">Transcript will appear here once processed</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="components" className="mt-0 h-full">
                    <Card className="h-full">
                      <CardContent className="h-full p-0">
                        <ScrollArea className="h-full p-4">
                          <div className="space-y-4">
                            {video.components ? (
                              <>
                                {video.components.hook && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-primary">Hook</h4>
                                    <p className="text-sm leading-relaxed">
                                      {video.components.hook}
                                    </p>
                                  </div>
                                )}
                                
                                {video.components.bridge && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-primary">Bridge</h4>
                                    <p className="text-sm leading-relaxed">
                                      {video.components.bridge}
                                    </p>
                                  </div>
                                )}
                                
                                {video.components.nugget && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-primary">Golden Nugget</h4>
                                    <p className="text-sm leading-relaxed">
                                      {video.components.nugget}
                                    </p>
                                  </div>
                                )}
                                
                                {video.components.wta && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-primary">WTA (What's The Ask)</h4>
                                    <p className="text-sm leading-relaxed">
                                      {video.components.wta}
                                    </p>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex h-32 items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                  <p>No components available</p>
                                  <p className="text-xs">Script components will appear here once analyzed</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Sticky Footer */}
            <div className="flex-shrink-0 border-t bg-background p-6">
              <Button
                onClick={() => onRemixScript?.(video)}
                className="w-full"
                size="lg"
              >
                Remix Script
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}