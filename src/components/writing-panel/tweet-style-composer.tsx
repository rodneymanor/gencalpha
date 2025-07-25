"use client";

import { useState, useRef, useEffect } from "react";

import { Clock, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useScriptsApi } from "@/hooks/use-scripts-api";
import { cn } from "@/lib/utils";

interface TweetStyleComposerProps {
  className?: string;
}

export function TweetStyleComposer({ className }: TweetStyleComposerProps) {
  const [activeTab, setActiveTab] = useState("compose");
  const [content, setContent] = useState("");
  const [isThread, setIsThread] = useState(false);
  const [threadParts, setThreadParts] = useState<string[]>([""]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("14:00");
  const [selectedPlatform, setSelectedPlatform] = useState<"tiktok" | "instagram" | "youtube">("tiktok");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const { scripts, loading, error, fetchScripts, createScript, updateScript, deleteScript } = useScriptsApi();

  // Load scripts on component mount
  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = content.length;
  const characterLimit = 280;
  const isOverLimit = characterCount > characterLimit;

  const getCurrentDate = () => {
    const today = new Date();
    return `${today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}, ${today.getFullYear()}, ${scheduleTime}`;
  };

  const handleContentChange = (value: string) => {
    setContent(value);

    // Auto-detect if this should be a thread (check for line breaks suggesting multiple parts)
    const lines = value.split("\n").filter((line) => line.trim());
    if (lines.length > 3 && !isThread) {
      setIsThread(true);
      setThreadParts([value]);
    }
  };

  const addToQueue = async () => {
    if (!content.trim()) return;

    const scheduledDateTime =
      scheduleDate && scheduleTime
        ? new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
        : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now

    const scriptData = {
      title: content.split("\n")[0].substring(0, 50) + (content.length > 50 ? "..." : ""),
      content,
      status: "scheduled" as const,
      scheduledDate: scheduledDateTime,
      platform: selectedPlatform,
      approach: "speed-write" as const,
      isThread,
      threadParts: isThread ? threadParts.filter((part) => part.trim()) : undefined,
    };

    const result = await createScript(scriptData);
    if (result) {
      toast.success("Script added to queue!");
      setContent("");
      setIsThread(false);
      setThreadParts([""]);
    } else {
      toast.error("Failed to add script to queue");
    }
  };

  const saveDraft = async () => {
    if (!content.trim()) return;

    const scriptData = {
      title: content.split("\n")[0].substring(0, 50) + (content.length > 50 ? "..." : ""),
      content,
      status: "draft" as const,
      platform: selectedPlatform,
      approach: "speed-write" as const,
      isThread,
      threadParts: isThread ? threadParts.filter((part) => part.trim()) : undefined,
    };

    const result = await createScript(scriptData);
    if (result) {
      toast.success("Draft saved!");
      setContent("");
      setIsThread(false);
      setThreadParts([""]);
    } else {
      toast.error("Failed to save draft");
    }
  };

  const postNow = async () => {
    if (!content.trim()) return;

    const scriptData = {
      title: content.split("\n")[0].substring(0, 50) + (content.length > 50 ? "..." : ""),
      content,
      status: "sent" as const,
      platform: selectedPlatform,
      approach: "speed-write" as const,
      isThread,
      threadParts: isThread ? threadParts.filter((part) => part.trim()) : undefined,
    };

    const result = await createScript(scriptData);
    if (result) {
      toast.success("Script posted!");
      setContent("");
      setIsThread(false);
      setThreadParts([""]);
    } else {
      toast.error("Failed to post script");
    }
  };

  const draftScripts = scripts.filter((s) => s.status === "draft");
  const scheduledScripts = scripts.filter((s) => s.status === "scheduled");
  const sentScripts = scripts.filter((s) => s.status === "sent");

  const handleDeleteScript = async (scriptId: string) => {
    const success = await deleteScript(scriptId);
    if (success) {
      toast.success("Script deleted!");
    } else {
      toast.error("Failed to delete script");
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-4">
          <TabsTrigger
            value="compose"
            className="px-1 py-2 text-xs data-[state=active]:border-[#555864] data-[state=active]:bg-transparent"
          >
            Compose
          </TabsTrigger>
          <TabsTrigger
            value="drafts"
            className="px-1 py-2 text-xs data-[state=active]:border-[#555864] data-[state=active]:bg-transparent"
          >
            Drafts
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="px-1 py-2 text-xs data-[state=active]:border-[#555864] data-[state=active]:bg-transparent"
          >
            Queue
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="px-1 py-2 text-xs data-[state=active]:border-[#555864] data-[state=active]:bg-transparent"
          >
            Sent
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-3">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Write here.&#10;&#10;Skip 3 lines to start a thread."
                  className="min-h-[100px] resize-none border-0 p-0 text-sm focus-visible:ring-0"
                  rows={5}
                />

                {isThread && (
                  <div className="text-muted-foreground border-muted border-l-2 pl-2 text-xs">
                    Thread detected - Skip 3 lines to continue thread
                  </div>
                )}
              </div>

              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className={cn("font-medium", isOverLimit ? "text-destructive" : "")}>
                    {characterCount}/{characterLimit}
                  </span>
                  <span>saved</span>
                  <span>✓</span>
                  {isThread && (
                    <Badge variant="secondary" className="text-xs">
                      T
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addToQueue}
                    disabled={!content.trim() || isOverLimit}
                    className="flex-1"
                  >
                    Queue
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={postNow}
                    disabled={!content.trim() || isOverLimit}
                    className="flex-1 bg-[#555864] hover:bg-[#555864]/90"
                  >
                    Post now
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveDraft}
                  disabled={!content.trim() || isOverLimit}
                  className="w-full text-xs"
                >
                  Save Draft
                </Button>
              </div>

              <div className="text-muted-foreground text-xs">
                <div className="flex items-center justify-between">
                  <span>{getCurrentDate()}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground h-auto p-0 text-xs">
                        Advanced Options &gt;
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Advanced Options</DialogTitle>
                        <DialogDescription>Configure additional settings for your post</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Schedule for later</Label>
                          <div className="mt-2 flex gap-2">
                            <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                            <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <Label>Platform</Label>
                          <Select
                            value={selectedPlatform}
                            onValueChange={(value: "tiktok" | "instagram" | "youtube") => setSelectedPlatform(value)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="instagram">Instagram Reels</SelectItem>
                              <SelectItem value="youtube">YouTube Shorts</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                        <Button size="sm" className="bg-[#555864] hover:bg-[#555864]/90">
                          Save Settings
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground mt-1 h-auto p-0 text-xs">
                  Edit queue
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="mt-4">
          <div className="space-y-3">
            {draftScripts.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                <p className="text-sm">No drafts yet</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setActiveTab("compose")}>
                  Create your first draft
                </Button>
              </div>
            ) : (
              draftScripts.map((script) => (
                <Card key={script.id} className="hover:bg-muted/50 cursor-pointer">
                  <CardContent className="p-2">
                    <p className="text-foreground mb-2 line-clamp-2 text-xs">{script.content}</p>
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">
                          {script.characterCount || script.content.length}/{characterLimit}
                        </span>
                        {script.isThread && (
                          <Badge variant="secondary" className="h-4 px-1 text-xs">
                            T
                          </Badge>
                        )}
                        {script.platform && (
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            {script.platform}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => handleDeleteScript(script.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="mt-4">
          <div className="space-y-3">
            {scheduledScripts.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                <p className="text-sm">No scheduled posts</p>
              </div>
            ) : (
              scheduledScripts.map((script) => (
                <Card key={script.id} className="hover:bg-muted/50 cursor-pointer">
                  <CardContent className="p-2">
                    <p className="text-foreground mb-2 line-clamp-2 text-xs">{script.content}</p>
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          {script.scheduledDate
                            ? new Date(script.scheduledDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Not scheduled"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {script.isThread && (
                          <Badge variant="secondary" className="h-4 px-1 text-xs">
                            T
                          </Badge>
                        )}
                        {script.platform && (
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            {script.platform}
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent" className="mt-4">
          <div className="space-y-3">
            {sentScripts.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                <p className="text-sm">No sent posts yet</p>
              </div>
            ) : (
              sentScripts.map((script) => (
                <Card key={script.id} className="hover:bg-muted/50 cursor-pointer">
                  <CardContent className="p-2">
                    <p className="text-foreground mb-2 line-clamp-2 text-xs">{script.content}</p>
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span className="text-xs">Posted {new Date(script.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        {script.isThread && (
                          <Badge variant="secondary" className="h-4 px-1 text-xs">
                            T
                          </Badge>
                        )}
                        {script.platform && (
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            {script.platform}
                          </Badge>
                        )}
                        <Badge variant="outline" className="h-4 bg-green-50 px-1 text-xs">
                          Sent
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
