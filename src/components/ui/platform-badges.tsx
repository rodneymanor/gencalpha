"use client";

import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4 text-xs",
  md: "h-5 w-5 text-sm",
  lg: "h-6 w-6 text-base"
};

export function InstagramBadge({ className, size = "sm" }: PlatformBadgeProps) {
  return (
    <div className={cn(
      "flex items-center justify-center rounded-[var(--radius-button)] font-bold",
      "bg-[var(--pill-bg)] text-muted-foreground",
      // eslint-disable-next-line security/detect-object-injection
      sizeClasses[size],
      className
    )}>
      IG
    </div>
  );
}

export function TikTokBadge({ className, size = "sm" }: PlatformBadgeProps) {
  return (
    <div className={cn(
      "flex items-center justify-center rounded-[var(--radius-button)] bg-foreground text-background font-bold",
      // eslint-disable-next-line security/detect-object-injection
      sizeClasses[size],
      className
    )}>
      T
    </div>
  );
}

interface PlatformBadgeComponentProps extends PlatformBadgeProps {
  platform: string;
}

export function PlatformBadge({ platform, className, size = "sm" }: PlatformBadgeComponentProps) {
  const platformLower = platform.toLowerCase();

  if (platformLower === "instagram") {
    return <InstagramBadge className={className} size={size} />;
  }

  if (platformLower === "tiktok") {
    return <TikTokBadge className={className} size={size} />;
  }

  // Default badge for other platforms
  return (
    <div className={cn(
      "flex items-center justify-center rounded-[var(--radius-button)] bg-muted text-muted-foreground font-bold",
      // eslint-disable-next-line security/detect-object-injection
      sizeClasses[size],
      className
    )}>
      {platform.charAt(0).toUpperCase()}
    </div>
  );
}