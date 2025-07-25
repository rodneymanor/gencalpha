"use client";

import React, { useState, useMemo } from "react";

import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { format, addDays, startOfDay } from "date-fns";
import { RotateCcw, Shuffle, Edit3, Plus, Eye, Trash2, Zap, Clock, Calendar, Upload, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DraggableScript } from "./draggable-script";
import { DroppableTimeSlot } from "./droppable-time-slot";

interface Script {
  id: string;
  content: string;
  scheduledFor?: Date;
  status: "draft" | "scheduled" | "published";
  createdAt: Date;
  updatedAt: Date;
}

interface TimeSlot {
  time: string;
  scriptId: string | null;
}

interface DaySchedule {
  date: Date;
  label: string;
  slots: TimeSlot[];
}

const DEFAULT_TIME_SLOTS = ["02:00 pm", "04:00 pm", "06:00 pm"];

export default function ScriptManager() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: "1",
      content:
        "Vibe coders tend to hang out in just four zones—\n\n🔒 Payment integrations\n🚨 Security\n🔑 Authentication\n🚀 Deployment... Master these, and you're practically unstoppable.",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      content:
        "Most vibe coders stuck to these 4 places - Payment integration, Security, Authentication, Deployment.\n\nOnce you master these core areas, everything else starts to click.",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      content:
        "The best developers I know focus on these fundamentals:\n\n• User authentication flows\n• Secure payment processing\n• Deployment pipelines\n• Security best practices\n\nGet these right first.",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Generate schedule for next 10 days
  const scheduleData = useMemo(() => {
    const schedule: DaySchedule[] = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < 10; i++) {
      const date = addDays(today, i);
      const isToday = i === 0;
      const isTomorrow = i === 1;

      let label: string;
      if (isToday) {
        label = "Today";
      } else if (isTomorrow) {
        label = "Tomorrow";
      } else {
        label = format(date, "EEE d");
      }

      schedule.push({
        date,
        label,
        slots: DEFAULT_TIME_SLOTS.map((time) => ({
          time,
          scriptId: null,
        })),
      });
    }

    return schedule;
  }, []);

  const draftScripts = scripts.filter((script) => script.status === "draft");
  const scheduledScripts = scripts.filter((script) => script.status === "scheduled");
  const publishedScripts = scripts.filter((script) => script.status === "published");

  const handleAddToQueue = (scriptId: string) => {
    // Find next available slot and schedule script
    for (const day of scheduleData) {
      for (const slot of day.slots) {
        if (!slot.scriptId) {
          slot.scriptId = scriptId;
          setScripts((prev) =>
            prev.map((script) =>
              script.id === scriptId ? { ...script, status: "scheduled" as const, scheduledFor: day.date } : script,
            ),
          );
          return;
        }
      }
    }
    alert("No available slots in the next 10 days");
  };

  const handleDeleteScript = (scriptId: string) => {
    setScripts((prev) => prev.filter((script) => script.id !== scriptId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const scriptId = active.id as string;
      const timeSlotId = over.id as string;

      // Parse time slot ID to get day and slot info
      const [dayIndex, slotIndex] = timeSlotId.split("-").map(Number);

      if (!isNaN(dayIndex) && !isNaN(slotIndex)) {
        const targetDay = scheduleData[dayIndex];
        const targetSlot = targetDay.slots[slotIndex];

        // Only allow drop if slot is empty
        if (!targetSlot.scriptId) {
          targetSlot.scriptId = scriptId;
          setScripts((prev) =>
            prev.map((script) =>
              script.id === scriptId
                ? { ...script, status: "scheduled" as const, scheduledFor: targetDay.date }
                : script,
            ),
          );
        }
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="scheduled" className="w-full">
        {/* Tab Header with Actions */}
        <div className="flex items-center justify-between space-y-2">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="scheduled">Scheduled Scripts</TabsTrigger>
            <TabsTrigger value="published">Published Scripts</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
              Re-Queue
            </Button>
            <Button variant="outline" size="sm">
              <Shuffle className="h-4 w-4" />
              Shuffle
            </Button>
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4" />
              Edit Queue
            </Button>
          </div>
        </div>

        {/* Scheduled Scripts Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <div className="grid gap-4">
            {scheduleData.slice(0, 10).map((day, dayIndex) => (
              <Card key={dayIndex} className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{day.label}</h3>
                  <div className="grid gap-3">
                    {day.slots.map((slot, slotIndex) => (
                      <DroppableTimeSlot
                        key={slotIndex}
                        id={`${dayIndex}-${slotIndex}`}
                        time={slot.time}
                        scriptId={slot.scriptId}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex min-w-[100px] items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            {slot.time}
                          </div>
                          <div className="flex-1">
                            {slot.scriptId ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">Scheduled</Badge>
                                <span className="text-muted-foreground text-sm">
                                  {scripts.find((s) => s.id === slot.scriptId)?.content.slice(0, 50) ||
                                    "Script scheduled"}
                                  ...
                                </span>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">
                                Drag a script here or press "Add to queue"
                              </div>
                            )}
                          </div>
                        </div>
                      </DroppableTimeSlot>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Published Scripts Tab */}
        <TabsContent value="published" className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground">No scripts published yet</p>
              <Button>Create a script</Button>
            </div>
          </div>
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Drafts</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4" />
                Upload from CSV
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </div>

          <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={draftScripts.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-4">
                {draftScripts.map((script) => (
                  <DraggableScript key={script.id} id={script.id}>
                    <ScriptCard
                      script={script}
                      onAddToQueue={() => handleAddToQueue(script.id)}
                      onDelete={() => handleDeleteScript(script.id)}
                    />
                  </DraggableScript>
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <ScriptCard
                  script={draftScripts.find((s) => s.id === activeId)!}
                  onAddToQueue={() => {}}
                  onDelete={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>

          {draftScripts.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="space-y-2 text-center">
                <p className="text-muted-foreground">No drafts yet</p>
                <Button>Create your first script</Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Script Card Component
interface ScriptCardProps {
  script: Script;
  onAddToQueue: () => void;
  onDelete: () => void;
}

function ScriptCard({ script, onAddToQueue, onDelete }: ScriptCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm">{format(script.updatedAt, "MMM d, yyyy")}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-start gap-4">
          <div className="bg-secondary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">📱</div>

          <div className="min-w-0 flex-1">
            <div className="text-sm leading-relaxed whitespace-pre-line">{script.content}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Zap className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={onAddToQueue} size="sm">
            <Zap className="mr-2 h-4 w-4" />
            Add To Queue
          </Button>
        </div>
      </div>
    </Card>
  );
}
