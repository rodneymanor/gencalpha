"use client";

import { useMemo } from "react";

import { Clock, CheckCircle, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { InlineLoader } from "@/components/ui/loading";
import type { VideoProcessingJob } from "@/lib/simple-video-queue";
import { cn } from "@/lib/utils";

interface ProcessingBadgeProps {
  jobs: VideoProcessingJob[];
  className?: string;
}

export function ProcessingBadge({ jobs, className }: ProcessingBadgeProps) {
  const stats = useMemo(() => {
    const processing = jobs.filter(job => job.status === "pending" || job.status === "processing").length;
    const completed = jobs.filter(job => job.status === "completed").length;
    const failed = jobs.filter(job => job.status === "failed").length;
    const recentFailed = jobs.filter(job =>
      job.status === "failed" &&
      job.completedAt &&
      new Date().getTime() - new Date(job.completedAt).getTime() < 10 * 60 * 1000 // Recent failures within 10 minutes
    ).length;

    return { processing, completed, failed, recentFailed, total: jobs.length };
  }, [jobs]);

  // Don't show badge if no jobs
  if (stats.total === 0) {
    return null;
  }

  // Determine badge variant and icon based on job statuses
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let icon = <Clock className="h-3 w-3" />;
  let text = "";

  if (stats.processing > 0) {
    variant = "default";
    icon = <InlineLoader size="sm" />;
    text = `${stats.processing} processing`;
  } else if (stats.recentFailed > 0) {
    variant = "destructive";
    icon = <AlertCircle className="h-3 w-3" />;
    text = `${stats.recentFailed} failed`;
  } else if (stats.completed > 0) {
    variant = "secondary";
    icon = <CheckCircle className="h-3 w-3" />;
    text = `${stats.completed} completed`;
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        "gap-1 text-xs font-medium animate-pulse",
        variant === "default" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-green-500 text-white animate-none",
        variant === "destructive" && "animate-none",
        className
      )}
    >
      {icon}
      {text}
    </Badge>
  );
}

interface ProcessingTooltipProps {
  jobs: VideoProcessingJob[];
  children: React.ReactNode;
}

export function ProcessingTooltip({ jobs, children }: ProcessingTooltipProps) {
  const activeJobs = jobs.filter(job => {
    const fiveMinutesAgo = 5 * 60 * 1000;
    const tenMinutesAgo = 10 * 60 * 1000;
    const now = new Date().getTime();

    if (job.status === "pending" || job.status === "processing") {
      return true;
    }

    if (job.status === "completed" && job.completedAt) {
      return now - new Date(job.completedAt).getTime() < fiveMinutesAgo;
    }

    if (job.status === "failed" && job.completedAt) {
      return now - new Date(job.completedAt).getTime() < tenMinutesAgo;
    }

    return false;
  });

  if (activeJobs.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}

      {/* Tooltip */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      bg-popover border rounded-md shadow-md p-3 min-w-64 z-50
                      pointer-events-none">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Video Processing</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {activeJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center gap-2 text-xs">
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  job.status === "processing" && "bg-blue-500 animate-pulse",
                  job.status === "pending" && "bg-yellow-500",
                  job.status === "completed" && "bg-green-500",
                  job.status === "failed" && "bg-red-500"
                )} />
                <div className="flex-1 truncate">
                  <div className="font-medium">
                    {job.url.includes('tiktok') ? 'TikTok' : 'Instagram'} Video
                  </div>
                  <div className="text-muted-foreground">
                    {job.status === "failed" ? (
                      <span className="text-red-600 font-medium">
                        {job.error?.includes("Instagram post") ?
                          "Instagram post URLs not supported yet" :
                          job.error ?? job.message}
                      </span>
                    ) : (
                      `${job.message} (${job.progress}%)`
                    )}
                  </div>
                </div>
              </div>
            ))}
            {activeJobs.length > 5 && (
              <div className="text-xs text-muted-foreground text-center pt-1">
                +{activeJobs.length - 5} more videos processing...
              </div>
            )}
          </div>
        </div>

        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2
                        w-0 h-0 border-l-4 border-r-4 border-t-4
                        border-l-transparent border-r-transparent border-t-border" />
      </div>
    </div>
  );
}