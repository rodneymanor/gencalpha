"use client";

import React from "react";

import { Play } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface VideoData {
  id: number;
  href: string;
  thumbnail: string;
  thumbnailAvif: string;
  videoSrc?: string;
  altText: string;
  views: string;
  isPinned?: boolean;
}

interface CreatorVideosGridProps {
  videos: VideoData[];
  onVideoClick?: (video: VideoData) => void;
  columns?: number;
}

// --- MOCK DATA ---
const mockVideoData: VideoData[] = [
  {
    id: 1,
    href: "https://www.tiktok.com/@adamstewartmarketing/video/7228550733853969671",
    thumbnail:
      "https://p19-common-sign-sg.tiktokcdn-us.com/tos-alisg-p-0037/853479528e4a4ebc98f904122d16dd7d_1683028129~tplv-tiktokx-dmt-logom:tos-alisg-i-0068/00c1e09c6a1946cabd07625ccfda684e.image?dr=9634&x-expires=1754733600&x-signature=nSLBArQ2ktS62mVoRv9w1PMmx4Y%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5",
    thumbnailAvif:
      "https://p16-common-sign-sg.tiktokcdn-us.com/tos-alisg-p-0037/853479528e4a4ebc98f904122d16dd7d_1683028129~tplv-photomode-zoomcover:720:720.avif?dr=9616&x-expires=1754733600&x-signature=YGgmyiwBpzZ6lCh6dVuIqqKPC%2Fc%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5&ftpl=1",
    altText: "AutoGPT saving money",
    views: "5.1M",
    isPinned: true,
  },
  {
    id: 2,
    href: "https://www.tiktok.com/@adamstewartmarketing/video/7399563772538457351",
    thumbnail:
      "https://p16-common-sign-sg.tiktokcdn-us.com/tos-alisg-p-0037/81b08648f3e24aa2a8f2ce64e3524e78_1722845203~tplv-tiktokx-origin.image?dr=9636&x-expires=1754733600&x-signature=dK9aWjtk0ADODzJs0UTtCFbz9h8%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5",
    thumbnailAvif:
      "https://p19-common-sign-sg.tiktokcdn-us.com/tos-alisg-p-0037/81b08648f3e24aa2a8f2ce64e3524e78_1722845203~tplv-photomode-zoomcover:720:720.avif?dr=9616&x-expires=1754733600&x-signature=VlCO%2FHpKxS3x3ruVPTRbQI%2Fzc2E%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5&ftpl=1",
    videoSrc: "blob:https://www.tiktok.com/7ff73d20-f143-4f61-a5d7-14677f0801af",
    altText: "ChatGPT advanced voice acting as a pilot",
    views: "3.1M",
    isPinned: true,
  },
  {
    id: 3,
    href: "https://www.tiktok.com/@adamstewartmarketing/video/7276440256579226898",
    thumbnail:
      "https://p16-common-sign-sg.tiktokcdn-us.com/tos-alisg-p-0037/3ebf4f233d884186b724739345d990cb_1694178276~tplv-tiktokx-dmt-logom:tos-alisg-i-0068/oMv7vpgftAE8d3DsAzRkl9CTGhBQfEAC8YAIXD.image?dr=9634&x-expires=1754733600&x-signature=TNPZ0iRElh7gcGu8GUR8dCatk9E%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5",
    thumbnailAvif:
      "https://p16-common-sign-sg.tiktokcdn-us.com/tos-alisg-p-0037/3ebf4f233d884186b724739345d990cb_1694178276~tplv-photomode-zoomcover:720:720.avif?dr=9616&x-expires=1754733600&x-signature=Gs41S5pvzO1K9TiSAvhH5w2Lp9A%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5&ftpl=1",
    altText: "Creating videos from simple prompts",
    views: "1.7M",
    isPinned: true,
  },
];

// --- REUSABLE COMPONENTS ---

const PinnedBadge: React.FC = () => (
  <div className="absolute top-2 left-2 z-10">
    <div className="bg-destructive text-destructive-foreground flex items-center gap-2 rounded-[var(--radius-button)] px-2 py-1 text-xs font-medium">
      Pinned
    </div>
  </div>
);

interface VideoThumbnailProps {
  thumbnail: string;
  thumbnailAvif: string;
  altText: string;
  videoSrc?: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ thumbnail, thumbnailAvif, altText, videoSrc }) => (
  <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-card)]">
    <div className="bg-muted relative h-full w-full overflow-hidden bg-cover bg-center">
      <div className="relative h-full w-full">
        <picture>
          <source type="image/avif" srcSet={`${thumbnailAvif} 1x, ${thumbnailAvif} 2x`} />
          <img
            alt={altText}
            fetchPriority="auto"
            decoding="async"
            src={thumbnail}
            srcSet={`${thumbnail} 1x, ${thumbnail} 2x`}
            className="absolute inset-0 h-full w-full max-w-full min-w-full object-cover"
          />
        </picture>
        {videoSrc && (
          <video
            autoPlay
            playsInline
            muted
            loop
            poster={thumbnail}
            src={videoSrc}
            className="absolute inset-0 block h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  </div>
);

interface VideoViewsProps {
  views: string;
}

const VideoViews: React.FC<VideoViewsProps> = ({ views }) => (
  <div className="absolute bottom-0 flex h-24 w-full items-end bg-gradient-to-t from-black/50 to-transparent p-4">
    <div className="flex items-center gap-1 text-white">
      <Play className="h-4 w-4" />
      <strong className="text-base font-semibold">{views}</strong>
    </div>
  </div>
);

interface VideoCardProps {
  video: VideoData;
  onVideoClick?: (video: VideoData) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onVideoClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onVideoClick) {
      onVideoClick(video);
    }
  };

  return (
    <div className="rounded-[var(--radius-card)]">
      <div
        tabIndex={0}
        role="button"
        aria-label={`Watch ${video.altText}`}
        className="focus:ring-ring relative w-full cursor-pointer overflow-hidden rounded-[var(--radius-card)] transition-transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const syntheticEvent = {
              preventDefault: () => {},
            } as React.MouseEvent<HTMLDivElement>;
            handleClick(syntheticEvent);
          }
        }}
      >
        {/* Aspect ratio container using Tailwind aspect ratio */}
        <div className="aspect-[3/4]">
          <div className="absolute inset-0">
            {video.isPinned && <PinnedBadge />}
            <VideoThumbnail
              thumbnail={video.thumbnail}
              thumbnailAvif={video.thumbnailAvif}
              altText={video.altText}
              videoSrc={video.videoSrc}
            />
            <VideoViews views={video.views} />
          </div>
        </div>
      </div>
    </div>
  );
};

const CreatorVideosGrid: React.FC<CreatorVideosGridProps> = ({ videos, onVideoClick, columns = 5 }) => {
  const getGridCols = () => {
    switch (columns) {
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      case 6:
        return "grid-cols-6";
      default:
        return "grid-cols-5";
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-6">
        <h2 className="text-foreground text-2xl font-semibold">Creator Inspiration</h2>
      </div>
      <div className={`grid w-full ${getGridCols()} gap-4 px-6`}>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onVideoClick={onVideoClick} />
        ))}
      </div>
    </div>
  );
};

// Export both the main component and mock data for flexibility
export { CreatorVideosGrid, mockVideoData };
export type { VideoData, CreatorVideosGridProps };
export default CreatorVideosGrid;
