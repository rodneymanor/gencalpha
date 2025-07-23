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
      <div
        className={cn(
          "bg-card border rounded-lg shadow-sm p-4 md:p-6",
          "bg-gradient-to-r from-primary/5 to-accent/5"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Greeting and Progress */}
            <div className="flex items-center gap-3">
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
            
            {/* Progress Bar */}
            <div className="flex-1 max-w-md">
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 ml-4">
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

        {/* Task List */}
        {!isCollapsed && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors cursor-pointer",
                  task.completed && "bg-primary/10 border-primary/30"
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
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      task.completed && "text-primary"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{task.points} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}