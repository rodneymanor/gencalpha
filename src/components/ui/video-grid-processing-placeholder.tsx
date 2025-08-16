"use client";

import { useState, useEffect } from "react";

import { Clock, CheckCircle, XCircle, RefreshCw, ExternalLink, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClarityLoader } from "@/components/ui/loading";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useVideoProcessing } from "@/contexts/video-processing-context";
import type { VideoProcessingJob } from "@/lib/simple-video-queue";
import { cn } from "@/lib/utils";

interface VideoGridProcessingPlaceholderProps {
  job: VideoProcessingJob;
  className?: string;
  onRetry?: () => void;
  onRemove?: () => void;
}

const ProcessingPlaceholderActions = ({
  job,
  onRetry,
  onRemove
}: {
  job: VideoProcessingJob;
  onRetry?: () => void;
  onRemove?: () => void;
}) => (
  <div className="flex flex-col gap-1 w-full">
    {/* View original button */}
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-xs bg-background/90 backdrop-blur-sm border-border/50"
      onClick={() => window.open(job.url, '_blank')}
    >
      <ExternalLink className="w-3 h-3 mr-1" />
      View Original
    </Button>

    {/* Retry button for failed jobs */}
    {job.status === "failed" && onRetry && (
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs bg-background/90 backdrop-blur-sm border-border/50"
        onClick={onRetry}
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Retry
      </Button>
    )}

    {/* Remove button for completed/failed jobs */}
    {(job.status === "completed" || job.status === "failed") && onRemove && (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground hover:text-foreground bg-background/90 backdrop-blur-sm"
        onClick={onRemove}
      >
        Remove
      </Button>
    )}
  </div>
);

const getPlatformName = (url: string) => {
  if (url.includes('tiktok')) return 'TikTok';
  if (url.includes('instagram')) return 'Instagram';
  return 'Video';
};

// eslint-disable-next-line complexity
export function VideoGridProcessingPlaceholder({
  job,
  className,
  onRetry,
  onRemove
}: VideoGridProcessingPlaceholderProps) {
  const { jobs } = useVideoProcessing();
  const [currentJob, setCurrentJob] = useState(job);

  // Update current job when jobs from context change
  useEffect(() => {
    const updatedJob = jobs.find(j => j.id === currentJob.id);
    if (updatedJob) {
      setCurrentJob(updatedJob);
    }
  }, [jobs, currentJob.id]);

  // Status helpers extracted to reduce complexity
  const statusConfig = {
    pending: {
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      color: "border-blue-500/30 bg-blue-500/10",
      text: "Queued",
      progressColor: "bg-blue-500"
    },
    processing: {
      icon: <ClarityLoader size="md" />,
      color: "border-yellow-500/30 bg-yellow-500/10",
      text: "Processing",
      progressColor: "bg-yellow-500"
    },
    completed: {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      color: "border-green-500/30 bg-green-500/10",
      text: "Completed",
      progressColor: "bg-green-500"
    },
    failed: {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      color: "border-red-500/30 bg-red-500/10",
      text: "Failed",
      progressColor: "bg-red-500"
    }
  };

  const currentStatusConfig = statusConfig[currentJob.status] || {
    icon: null,
    color: "border-border bg-muted",
    text: "Unknown",
    progressColor: "bg-blue-500"
  };

  const shouldShowThumbnail = Boolean(currentJob.result?.thumbnailUrl) && currentJob.status === "completed";

  return (
    <div
      className={cn(
        "group relative aspect-[9/16] cursor-default overflow-hidden rounded-[var(--radius-card)] border-2 transition-all duration-200",
        currentStatusConfig.color,
        className
      )}
    >
      {/* Thumbnail background (when available and completed) */}
      {shouldShowThumbnail && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentJob.result.thumbnailUrl}
            alt="Video thumbnail"
            className="h-full w-full object-cover opacity-50"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Main content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        {/* Status icon */}
        <div className="mb-3">
          {currentStatusConfig.icon}
        </div>

        {/* Platform badge */}
        <div className="mb-2">
          <Badge
            className="text-xs font-medium border bg-background/90 backdrop-blur-sm"
            variant="secondary"
          >
            {getPlatformName(currentJob.url)}
          </Badge>
        </div>

        {/* Status text */}
        <div className="mb-2">
          <span className={cn(
            "text-sm font-medium",
            shouldShowThumbnail ? "text-white" : "text-foreground"
          )}>
            {currentStatusConfig.text}
          </span>
        </div>

        {/* Progress bar (for processing) */}
        {currentJob.status === "processing" && (
          <div className="w-full mb-2">
            <Progress
              value={currentJob.progress}
              className="h-2 bg-background/20"
              indicatorClassName={currentStatusConfig.progressColor}
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {currentJob.progress}%
            </div>
          </div>
        )}

        {/* Error message for failed jobs */}
        {currentJob.status === "failed" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2 h-6 px-2 text-xs text-red-600 hover:text-red-700"
                >
                  <Info className="w-3 h-3 mr-1" />
                  Error Details
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{currentJob.error ?? "Processing failed"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Action buttons */}
        <ProcessingPlaceholderActions
          job={currentJob}
          onRetry={onRetry}
          onRemove={onRemove}
        />
      </div>

      {/* Processing animation overlay */}
      {currentJob.status === "processing" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 animate-pulse" />
      )}

      {/* Top-right info indicator */}
      <div className="absolute top-2 right-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-6 h-6 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center">
                <Info className="w-3 h-3 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p className="font-medium">{getStatusText()}</p>
                <p className="text-muted-foreground">{currentJob.message}</p>
                {currentJob.result?.title && (
                  <p className="font-medium mt-1">{currentJob.result.title}</p>
                )}
                {currentJob.result?.author && (
                  <p className="text-muted-foreground">by @{currentJob.result.author}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}