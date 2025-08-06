"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Heart, MessageCircle, Share2, Lightbulb, Play, List, FileText } from "lucide-react";
import { AdvancedSlidingSwitch, SwitchOption } from "@/components/ui/advanced-sliding-switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// --- TYPE DEFINITIONS ---
interface VideoInspirationPlayerProps {
  creatorName: string;
  followers: string;
  videoUrl: string;
  views: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  engagementRate: string;
  caption: string;
  transcript: string;
  duration: string;
}

// --- ICON COMPONENTS ---
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.88-1.59-1.94-2.2-4.42-1.8-6.83.39-2.4 1.91-4.45 3.72-5.96 1.95-1.64 4.59-2.5 7.1-2.45v4.03c-1.11.02-2.21.22-3.23.62-.65.25-1.26.6-1.81 1.02-.33.25-.65.52-.96.81-.02-3.2.01-6.39-.01-9.58Z" />
  </svg>
);

// --- UI SUB-COMPONENTS ---

const Metric = ({ icon, value }: { icon: React.ReactNode; value: string }) => (
  <div className="text-muted-foreground flex items-center gap-1.5">
    {icon}
    <span className="text-xs font-medium">{value}</span>
  </div>
);

// --- CONTENT VIEWS ---

const VideoPlayerView: React.FC<
  Pick<VideoInspirationPlayerProps, "videoUrl" | "views" | "likes" | "comments" | "shares">
> = ({ videoUrl, views, likes, comments, shares }) => (
  <div className="flex h-full flex-col">
    <div className="relative aspect-[9/16] w-full flex-shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-black shadow-[var(--shadow-input)]">
      <iframe
        className="absolute top-0 left-0 h-full w-full"
        src={videoUrl}
        title="Video Player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
    <div className="mt-3 grid flex-shrink-0 grid-cols-4 gap-2 px-1">
      <Metric icon={<Eye className="h-4 w-4" />} value={views} />
      <Metric icon={<Heart className="h-4 w-4" />} value={likes} />
      <Metric icon={<MessageCircle className="h-4 w-4" />} value={comments} />
      <Metric icon={<Share2 className="h-4 w-4" />} value={shares} />
    </div>
    <div className="mt-4 flex-shrink-0">
      <Button variant="outline" className="h-10 w-full text-sm font-semibold">
        Remix
      </Button>
    </div>
  </div>
);

const InsightsPanelView: React.FC<Omit<VideoInspirationPlayerProps, "videoUrl" | "creatorName" | "followers">> = (
  props,
) => (
  <div className="h-full overflow-y-auto pr-2 text-sm">
    <h2 className="text-foreground mb-3 text-lg font-bold">Social Media Insights</h2>

    <div className="space-y-5">
      <div>
        <h3 className="text-foreground mb-2 flex items-center gap-2 font-semibold">
          <Lightbulb className="text-secondary h-4 w-4" />
          Hook Ideas
        </h3>
        <ul className="text-muted-foreground list-inside list-disc space-y-1">
          <li>&quot;You won&apos;t believe this one simple trick for...&quot;</li>
          <li>&quot;Are you making this common mistake when...?&quot;</li>
          <li>&quot;Stop wasting time on [problem], do this instead.&quot;</li>
        </ul>
      </div>

      <div>
        <h3 className="text-foreground mb-2 flex items-center gap-2 font-semibold">
          <List className="text-secondary h-4 w-4" />
          Metrics
        </h3>
        <div className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex justify-between">
            <span>Likes:</span> <span className="text-foreground font-medium">{props.likes}</span>
          </div>
          <div className="flex justify-between">
            <span>Comments:</span> <span className="text-foreground font-medium">{props.comments}</span>
          </div>
          <div className="flex justify-between">
            <span>Shares:</span> <span className="text-foreground font-medium">{props.shares}</span>
          </div>
          <div className="flex justify-between">
            <span>Saves:</span> <span className="text-foreground font-medium">{props.saves}</span>
          </div>
          <div className="flex justify-between">
            <span>Views:</span> <span className="text-foreground font-medium">{props.views}</span>
          </div>
          <div className="flex justify-between">
            <span>Engagement Rate:</span> <span className="text-foreground font-medium">{props.engagementRate}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-2 flex items-center gap-2 font-semibold">
          <FileText className="text-secondary h-4 w-4" />
          Content Ideas
        </h3>
        <div className="text-muted-foreground space-y-2">
          <p>
            <strong>Expand on the Core Concept:</strong> A deep-dive tutorial on the main technique shown in the video.
          </p>
          <p>
            <strong>Behind-the-Scenes:</strong> Show the process of creating the original video, including mistakes.
          </p>
          <p>
            <strong>Tool Spotlight:</strong> Create a dedicated review or tutorial for a specific tool mentioned.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-2 font-semibold">Caption</h3>
        <p className="bg-muted rounded-[var(--radius-card)] border p-3 text-xs">{props.caption}</p>
      </div>

      <div>
        <h3 className="text-foreground mb-2 font-semibold">Transcript</h3>
        <p className="bg-muted rounded-[var(--radius-card)] border p-3 text-xs">
          <strong>Duration:</strong> {props.duration}s
        </p>
        <p className="bg-muted mt-1 rounded-[var(--radius-card)] border p-3 text-xs whitespace-pre-wrap">
          {props.transcript}
        </p>
      </div>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
const VideoInspirationPlayer: React.FC<VideoInspirationPlayerProps> = (props) => {
  const { creatorName, followers } = props;
  const [showInsights, setShowInsights] = useState(false);

  const switchOptions: SwitchOption[] = [
    { value: "ghost-write", icon: <Play className="h-4 w-4" />, tooltip: "Video" },
    { value: "web-search", icon: <Lightbulb className="h-4 w-4" />, tooltip: "Insights" },
  ];

  return (
    <div className="w-full h-full flex items-start justify-center font-sans text-foreground">
      <motion.div
        className="w-full max-w-full"
        animate={{ width: showInsights ? "100%" : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="h-full rounded-[var(--radius-xl)] shadow-[var(--shadow-soft-drop)]">
          <CardContent className="p-3 h-full flex flex-col">
            <div className="flex items-center gap-2 border-b pb-3 flex-shrink-0">
              <TikTokIcon className="text-foreground h-8 w-8 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{creatorName}</div>
                <div className="text-muted-foreground text-xs">{followers} Followers</div>
              </div>
              <AdvancedSlidingSwitch 
                options={switchOptions} 
                onChange={() => setShowInsights((prev) => !prev)} 
              />
            </div>

            <div className="mt-3 flex-1 overflow-hidden">
              {showInsights ? <InsightsPanelView {...props} /> : <VideoPlayerView {...props} />}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// --- DEFAULT EXPORT AND PROPS ---
export default function VideoInspirationPlayerWrapper() {
  const videoData: VideoInspirationPlayerProps = {
    creatorName: "The Art of Code",
    followers: "1.2M",
    videoUrl: "https://www.youtube.com/embed/wA_24AIXqgM",
    views: "2.1M",
    likes: "180K",
    comments: "1,245",
    shares: "24.3K",
    saves: "95K",
    engagementRate: "8.5%",
    duration: "58",
    caption:
      "Here's a quick look at how to build animated UIs with React and Tailwind CSS. It's easier than you think! #react #tailwindcss #uidev #webdev #coding",
    transcript: `(Upbeat music starts)
Hey everyone! Today I'm going to show you how to create a slick, animated sliding panel using just React and Tailwind CSS.
First, we'll set up our state with useState to track whether the panel is open or closed.
Next, we'll apply conditional classes based on that state. This is where the magic happens. We'll change the width and add transition properties...
(Music fades)
...and just like that, you have a beautiful, animated UI. Let me know what you want to see next!`,
  };

  return <VideoInspirationPlayer {...videoData} />;
}