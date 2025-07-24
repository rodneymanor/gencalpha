"use client";

import { useState, useEffect } from "react";

import { Calendar, Clock, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScriptsApi } from "@/hooks/use-scripts-api";
import { Script } from "@/types/script";


export default function QPage() {
  const { scripts, loading, error, fetchScripts, updateScript } = useScriptsApi();
  
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [publishUrl, setPublishUrl] = useState("");

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const draftScripts = scripts.filter((s) => s.status === "draft");
  const scheduledScripts = scripts.filter((s) => s.status === "scheduled");
  const publishedScripts = scripts.filter((s) => s.status === "published" || s.status === "sent");

  const handleScheduleScript = (scriptId: string) => {
    const script = scripts.find((s) => s.id === scriptId);
    if (script) {
      setSelectedScript(script);
      setIsScheduleDialogOpen(true);
    }
  };

  const confirmSchedule = async () => {
    if (selectedScript && scheduleDate) {
      const result = await updateScript(selectedScript.id, {
        status: "scheduled",
        scheduledDate: new Date(scheduleDate).toISOString(),
      });
      
      if (result) {
        toast.success("Script scheduled successfully!");
        setIsScheduleDialogOpen(false);
        setScheduleDate("");
        setSelectedScript(null);
      } else {
        toast.error("Failed to schedule script");
      }
    }
  };

  const updatePublishedUrl = async (scriptId: string, url: string) => {
    const result = await updateScript(scriptId, { publishedUrl: url });
    if (result) {
      toast.success("Published URL updated!");
    } else {
      toast.error("Failed to update URL");
    }
  };

  const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getScriptsForDate = (date: Date) => {
    return scheduledScripts.filter((script) => {
      if (!script.scheduledDate) return false;
      return new Date(script.scheduledDate).toDateString() === date.toDateString();
    });
  };

  const nextSevenDays = getNextSevenDays();

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Queue</h1>
          <p className="text-muted-foreground">Manage your content pipeline with 7-day actionable view</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Script
        </Button>
      </div>

      {/* Seven Day Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Next 7 Days
          </CardTitle>
          <CardDescription>Your actionable content schedule for the upcoming week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {nextSevenDays.map((date, index) => {
              const scriptsForDate = getScriptsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[120px] rounded-lg border p-3 ${
                    isToday ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="mb-2 text-center">
                    <div className="text-muted-foreground text-xs">
                      {date.toLocaleDateString("en", { weekday: "short" })}
                    </div>
                    <div className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{date.getDate()}</div>
                  </div>
                  <div className="space-y-1">
                    {scriptsForDate.map((script) => (
                      <div key={script.id} className="bg-accent/50 truncate rounded px-2 py-1 text-xs">
                        {script.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="drafts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="drafts">Drafts ({draftScripts.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledScripts.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedScripts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {draftScripts.map((script) => (
              <Card key={script.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{script.title}</CardTitle>
                    <Badge variant="secondary">{script.platform}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">{script.content}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleScheduleScript(script.id)}>
                      <Clock className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scheduledScripts.map((script) => (
              <Card key={script.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{script.title}</CardTitle>
                    <Badge variant="default">{script.platform}</Badge>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Scheduled: {script.scheduledDate ? new Date(script.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">{script.content}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Reschedule
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publishedScripts.map((script) => (
              <Card key={script.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{script.title}</CardTitle>
                    <Badge variant="success">{script.platform}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">{script.content}</p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`url-${script.id}`} className="text-xs">
                        Published URL
                      </Label>
                      <div className="mt-1 flex gap-2">
                        <Input
                          id={`url-${script.id}`}
                          placeholder="https://..."
                          value={script.publishedUrl || ""}
                          onChange={(e) => updatePublishedUrl(script.id, e.target.value)}
                          className="text-xs"
                        />
                        {script.publishedUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(script.publishedUrl, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Script</DialogTitle>
            <DialogDescription>Choose when to publish "{selectedScript?.title}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="schedule-date">Schedule Date</Label>
              <Input
                id="schedule-date"
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSchedule} disabled={!scheduleDate}>
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
