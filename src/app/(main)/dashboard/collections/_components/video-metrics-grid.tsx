"use client";

import { Eye, Heart, MessageCircle, Share, Bookmark, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface VideoMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

interface VideoMetricsGridProps {
  metrics: VideoMetrics;
}

export function VideoMetricsGrid({ metrics }: VideoMetricsGridProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatEngagementRate = (metricsData: VideoMetrics): string => {
    if (!metricsData || !metricsData.views || metricsData.views === 0) return "0%";
    const total = (metricsData.likes ?? 0) + (metricsData.comments ?? 0) + (metricsData.shares ?? 0);
    const rate = (total / metricsData.views) * 100;
    return rate.toFixed(1) + "%";
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="mb-2 flex items-center justify-center">
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{formatNumber(metrics.views)}</div>
          <div className="text-muted-foreground text-sm">Views</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="mb-2 flex items-center justify-center">
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-2xl font-bold">{formatNumber(metrics.likes)}</div>
          <div className="text-muted-foreground text-sm">Likes</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="mb-2 flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{formatNumber(metrics.comments)}</div>
          <div className="text-muted-foreground text-sm">Comments</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="mb-2 flex items-center justify-center">
            <Share className="h-8 w-8 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">{formatNumber(metrics.shares)}</div>
          <div className="text-muted-foreground text-sm">Shares</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="mb-2 flex items-center justify-center">
            <Bookmark className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{formatNumber(metrics.saves)}</div>
          <div className="text-muted-foreground text-sm">Saves</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="mb-2 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold">{formatEngagementRate(metrics)}</div>
          <div className="text-muted-foreground text-sm">Engagement Rate</div>
        </CardContent>
      </Card>
    </div>
  );
}
