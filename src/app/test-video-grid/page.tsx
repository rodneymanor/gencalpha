"use client";

import { useState, useRef } from "react";

import { Play, Pause, Volume2, VolumeX, Instagram, Music } from "lucide-react";

interface VideoData {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  videoUrl: string;
  platform: "instagram" | "tiktok";
  duration: number;
}

const sampleVideos: VideoData[] = [
  {
    id: "1",
    title: "Creative Process Behind the Scenes",
    creator: "creative_mind",
    thumbnail: "https://picsum.photos/300/400?random=1",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    platform: "instagram",
    duration: 30,
  },
  {
    id: "2",
    title: "Dance Challenge Trending",
    creator: "dancequeen",
    thumbnail: "https://picsum.photos/300/400?random=2",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    platform: "tiktok",
    duration: 15,
  },
  {
    id: "3",
    title: "Product Showcase Tutorial",
    creator: "tech_reviewer",
    thumbnail: "https://picsum.photos/300/400?random=3",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    platform: "instagram",
    duration: 45,
  },
  {
    id: "4",
    title: "Cooking Tips & Tricks",
    creator: "chef_anna",
    thumbnail: "https://picsum.photos/300/400?random=4",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    platform: "tiktok",
    duration: 20,
  },
  {
    id: "5",
    title: "Travel Vlog Highlights",
    creator: "wanderlust_soul",
    thumbnail: "https://picsum.photos/300/400?random=5",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    platform: "instagram",
    duration: 60,
  },
  {
    id: "6",
    title: "Comedy Sketch Series",
    creator: "funny_creator",
    thumbnail: "https://picsum.photos/300/400?random=6",
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    platform: "tiktok",
    duration: 12,
  },
];

function VideoCard({ video }: { video: VideoData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * duration;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="bg-card overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)]">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-pill bg-muted flex h-10 w-10 items-center justify-center">
            <span className="text-foreground text-sm font-medium">{video.creator.slice(0, 2).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">{video.creator}</p>
            <p className="text-muted-foreground text-xs">{video.title}</p>
          </div>
        </div>
        <div className="text-muted-foreground">
          {video.platform === "instagram" ? <Instagram className="h-5 w-5" /> : <Music className="h-5 w-5" />}
        </div>
      </div>

      {/* Video Container */}
      <div
        className="relative aspect-[9/16] overflow-hidden bg-black"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted={isMuted}
          loop
          playsInline
          poster={video.thumbnail}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
        >
          <source src={video.videoUrl} type="video/mp4" />
        </video>

        {/* Video Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={togglePlay}
            className="rounded-pill bg-black/50 p-3 text-white transition-colors duration-200 hover:bg-black/60"
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="ml-1 h-8 w-8" />}
          </button>
        </div>

        {/* Video Controls */}
        <div
          className={`absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-3 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-white transition-colors duration-200 hover:text-white/80">
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleProgress}
              className="rounded-pill h-2 flex-1 cursor-pointer appearance-none bg-white/30"
            />
            <span className="font-mono text-xs text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="space-y-3 p-4">
        <div className="flex gap-3">
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium transition-colors duration-200">
            View Insights
          </button>
          <button className="border-border text-foreground hover:bg-accent flex-1 rounded-[var(--radius-button)] border px-4 py-2 text-sm font-medium transition-colors duration-200">
            Rescript Video
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TestVideoGridPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-2xl font-semibold">Video Grid Test</h1>
          <p className="text-muted-foreground">Testing video grid component with Clarity Design System</p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}
