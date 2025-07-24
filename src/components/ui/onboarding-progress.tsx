"use client";

import React, { useState } from "react";
import { X, ChevronDown, ChevronUp, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface OnboardingTask {
  id: string;
  title: string;
  points: number;
  completed: boolean;
}

interface OnboardingProgressProps {
  className?: string;
}

export function OnboardingProgress({ className }: OnboardingProgressProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: "profile",
      title: "Personalize your profile",
      points: 10,
      completed: true,
    },
    {
      id: "inspiration",
      title: "Get AI-selected inspiration",
      points: 10,
      completed: true,
    },
    {
      id: "search",
      title: "Search for inspirations",
      points: 20,
      completed: true,
    },
    {
      id: "ai-assistant",
      title: "Try the AI-writing assistant",
      points: 20,
      completed: false,
    },
  ]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;
  const totalPoints = tasks.reduce((sum, task) => sum + (task.completed ? task.points : 0), 0);
  const maxPoints = tasks.reduce((sum, task) => sum + task.points, 0);

  const toggleTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  if (!isVisible) return null;

  return (
    <div className={cn("p-4 md:p-6", className)}>
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Greeting */}
            <span className="text-lg">👋</span>
            <div>
              <h3 className="font-medium text-foreground">
                Hello! Let's take your Short Form game to the next level!
              </h3>
              <p className="text-sm text-muted-foreground">
                Follow these key steps ({completedTasks}/{totalTasks}) • {totalPoints}/{maxPoints} pts
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar - Full Width */}
        {!isCollapsed && (
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2 w-full" />
          </div>
        )}

        {/* Task List - Now as a vertical list */}
        {!isCollapsed && (
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
                  task.completed && "bg-accent/30"
                )}
                onClick={() => toggleTask(task.id)}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors",
                    task.completed
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  )}
                >
                  {task.completed && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {task.title}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  +{task.points} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}