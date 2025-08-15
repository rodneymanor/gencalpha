"use client";

import { ExternalLink, FileText, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Video } from "@/lib/collections";

interface StickyActionButtonsProps {
  video: Video;
  onRewriteScript?: (video: Video) => void;
}

export function StickyActionButtons({ video, onRewriteScript }: StickyActionButtonsProps) {
  const caption: string | undefined = (video as any).caption;
  const hashtags: string[] | undefined = (video as any).hashtags;

  const hashtagsText = (hashtags ?? []).map((t) => `#${t}`).join(" ");
  const fullText = `${caption ?? ""}${caption && hashtags && hashtags.length ? " " : ""}${hashtagsText}`;

  const handleCopyFullText = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
  };

  const handleRewriteScript = () => {
    if (onRewriteScript) {
      onRewriteScript(video);
    } else {
      // Placeholder – will hook into service from parent
      console.log("✏️ Rewrite Script for video:", video.title);
    }
  };

  const profileImageSrc = video.metadata?.author ? `https://unavatar.io/instagram/${video.metadata.author}` : undefined;

  return (
    <div className="bg-background sticky bottom-0 space-y-0 border-t p-6">
      <div className="flex items-start justify-between">
        {/* Post header */}
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profileImageSrc} alt={video.metadata?.author ?? "Creator"} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex max-w-xs flex-col">
            <span className="text-sm font-semibold">{video.metadata?.author ?? "Unknown Creator"}</span>
            {fullText && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <p onClick={handleCopyFullText} className="line-clamp-2 cursor-pointer text-sm hover:underline">
                    {caption ?? ""}
                    {hashtags && hashtags.length > 0 && <> {hashtags.map((tag) => `#${tag} `)}</>}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4} className="max-w-sm text-sm whitespace-pre-wrap">
                  {fullText}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.open(video.originalUrl, "_blank")}>
            <ExternalLink className="h-4 w-4" />
            View Original
          </Button>
          <Button onClick={handleRewriteScript} className="gap-2" disabled={!video.transcript}>
            <FileText className="h-4 w-4" />
            Rewrite Script
          </Button>
        </div>
      </div>
      {!video.transcript && (
        <p className="text-muted-foreground mt-2 text-right text-xs">Transcript required for AI actions.</p>
      )}
    </div>
  );
}
