"use client";

import { Instagram, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreatorFollowFormProps {
  username: string;
  platform: "instagram" | "tiktok" | "auto";
  isFollowing: boolean;
  followError: string | null;
  onUsernameChange: (value: string) => void;
  onPlatformChange: (value: "instagram" | "tiktok" | "auto") => void;
  onSubmit: () => void;
}

export function CreatorFollowForm({
  username,
  platform,
  isFollowing,
  followError,
  onUsernameChange,
  onPlatformChange,
  onSubmit,
}: CreatorFollowFormProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-foreground font-medium">Follow New Creator</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Enter username (e.g., @creator)"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
          className="flex-1"
        />
        <Select value={platform} onValueChange={onPlatformChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">
              <div className="flex items-center gap-2">
                <div className="bg-secondary text-secondary-foreground flex h-4 w-4 items-center justify-center rounded-[var(--radius-button)] text-xs font-medium">
                  AI
                </div>
                <span>Auto</span>
              </div>
            </SelectItem>
            <SelectItem value="instagram">
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <span>IG</span>
              </div>
            </SelectItem>
            <SelectItem value="tiktok">
              <div className="flex items-center gap-2">
                <div className="bg-foreground text-background flex h-4 w-4 items-center justify-center rounded-[var(--radius-button)] text-xs font-bold">
                  T
                </div>
                <span>TT</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onSubmit} disabled={!username.trim() || isFollowing} size="sm" className="w-full gap-2">
        <UserPlus className="h-4 w-4" />
        {isFollowing ? "Following..." : "Follow"}
      </Button>
      {followError && <div className="text-destructive text-sm">{followError}</div>}
    </div>
  );
}
