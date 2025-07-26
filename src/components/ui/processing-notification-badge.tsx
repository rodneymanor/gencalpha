"use client";

import { useState } from "react";

import { Loader2, CheckCircle, XCircle, Clock, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { useVideoProcessing } from "@/contexts/video-processing-context";
import { cn } from "@/lib/utils";

interface ProcessingNotificationBadgeProps {
  className?: string;
}

export function ProcessingNotificationBadge({ className }: ProcessingNotificationBadgeProps) {
  const { jobs, isPolling } = useVideoProcessing();
  const [open, setOpen] = useState(false);

  const activeJobs = jobs.filter(job =>
    job.status === "pending" || job.status === "processing"
  );

  const recentlyCompleted = jobs.filter(job =>
    job.status === "completed" || job.status === "failed"
  );

  const hasActiveJobs = activeJobs.length > 0;
  const hasRecentJobs = recentlyCompleted.length > 0;
  const totalNotifications = activeJobs.length + recentlyCompleted.length;

  if (totalNotifications === 0) {
    return null; // Don't show badge when nothing is happening
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "processing":
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "failed":
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative p-1 h-8 w-8",
            hasActiveJobs && "animate-pulse",
            className
          )}
        >
          {hasActiveJobs ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}

          {totalNotifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
            >
              {totalNotifications}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Video Processing</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          {hasActiveJobs && (
            <p className="text-xs text-muted-foreground mt-1">
              {activeJobs.length} video{activeJobs.length !== 1 ? 's' : ''} processing...
            </p>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* Active Jobs */}
          {activeJobs.map((job) => (
            <div key={job.id} className="p-4 border-b last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getStatusIcon(job.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium truncate">
                      Instagram Video
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {job.progress}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {job.message}
                  </p>
                  {job.status === "processing" && (
                    <Progress value={job.progress} className="mt-2 h-1" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Recently Completed Jobs */}
          {recentlyCompleted.map((job) => (
            <div key={job.id} className="p-4 border-b last:border-b-0 bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getStatusIcon(job.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium truncate">
                      {job.result?.title || "Instagram Video"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {job.status === "completed"
                      ? "Successfully added to collection!"
                      : job.error || "Processing failed"
                    }
                  </p>
                  {job.result?.author && (
                    <p className="text-xs text-muted-foreground">
                      by @{job.result.author}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="p-3 bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">
            {hasActiveJobs
              ? `Processing typically takes 30-60 seconds`
              : "All videos processed successfully!"
            }
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}