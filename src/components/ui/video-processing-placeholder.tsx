"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoProcessingJob } from "@/lib/simple-video-queue";

interface VideoProcessingPlaceholderProps {
  job: VideoProcessingJob;
  className?: string;
  onRetry?: () => void;
  onRemove?: () => void;
}

export function VideoProcessingPlaceholder({ 
  job, 
  className,
  onRetry,
  onRemove 
}: VideoProcessingPlaceholderProps) {
  const [currentJob, setCurrentJob] = useState(job);

  // Poll for job updates if it's still processing
  useEffect(() => {
    if (currentJob.status === "pending" || currentJob.status === "processing") {
      const interval = setInterval(async () => {
        try {
          const response = await fetch("/api/video/processing-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId: currentJob.id }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.job) {
              setCurrentJob(data.job);
            }
          }
        } catch (error) {
          console.error("Failed to update job status:", error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentJob.id, currentJob.status]);

  const getStatusIcon = () => {
    switch (currentJob.status) {
      case "pending":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "processing":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (currentJob.status) {
      case "pending":
        return "border-blue-200 bg-blue-50";
      case "processing":
        return "border-yellow-200 bg-yellow-50";
      case "completed":
        return "border-green-200 bg-green-50";
      case "failed":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getStatusText = () => {
    switch (currentJob.status) {
      case "pending":
        return "Queued";
      case "processing":
        return "Processing";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = Date.now();
    const time = date.getTime();
    const diff = now - time;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <Card className={cn("overflow-hidden transition-all duration-200", getStatusColor(), className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className="mt-1">{getStatusIcon()}</div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">
                  {currentJob.result?.title || "Instagram Video"}
                </h3>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    currentJob.status === "processing" && "bg-blue-100 text-blue-700",
                    currentJob.status === "completed" && "bg-green-100 text-green-700",
                    currentJob.status === "failed" && "bg-red-100 text-red-700"
                  )}
                >
                  {getStatusText()}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTimeAgo(currentJob.startedAt)}
              </span>
            </div>

            {/* Author */}
            {currentJob.result?.author && (
              <p className="text-xs text-muted-foreground mb-2">
                by @{currentJob.result.author}
              </p>
            )}

            {/* Progress Bar (for processing) */}
            {currentJob.status === "processing" && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    {currentJob.message}
                  </span>
                  <span className="text-xs font-medium">
                    {currentJob.progress}%
                  </span>
                </div>
                <Progress value={currentJob.progress} className="h-1.5" />
              </div>
            )}

            {/* Status Message */}
            <p className="text-xs text-muted-foreground mb-3">
              {currentJob.status === "completed" && "Successfully added to collection!"}
              {currentJob.status === "failed" && (currentJob.error || "Processing failed")}
              {currentJob.status === "pending" && "Waiting to start processing..."}
              {currentJob.status === "processing" && currentJob.message}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Original URL */}
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => window.open(currentJob.url, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Original
              </Button>

              {/* Retry (for failed jobs) */}
              {currentJob.status === "failed" && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={onRetry}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              )}

              {/* Remove (for completed/failed jobs) */}
              {(currentJob.status === "completed" || currentJob.status === "failed") && onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={onRemove}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Thumbnail (when available) */}
          {currentJob.result?.thumbnailUrl && (
            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
              <img
                src={currentJob.result.thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide thumbnail if it fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}