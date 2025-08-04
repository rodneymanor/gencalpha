"use client";

import React from 'react';

import { Heart, Bookmark, BarChart3, Edit3, Play, Share2 } from 'lucide-react';

// Type definitions
interface VideoData {
  id: string;
  videoUrl?: string;
  thumbnailUrl: string;
  poster?: string;
  visibility: 'visible' | 'hidden';
  badge: {
    text: string;
    emoji: string;
  };
  author: {
    username: string;
    avatarUrl: string;
  };
  description: string;
  isExpanded?: boolean;
}

interface TikTokVideoPlayerProps {
  videos: VideoData[];
  likeCount?: number;
  onLike?: () => void;
  onSave?: () => void;
  onAnalyze?: () => void;
  onRewrite?: () => void;
  onShare?: () => void;
  onPlay?: () => void;
  className?: string;
}

// Individual video card component
const VideoCard: React.FC<{ video: VideoData; onToggleExpanded?: (id: string) => void }> = ({
  video,
  onToggleExpanded
}) => {
  return (
    <div className="snap-start snap-always transition-all duration-500 ease-out overflow-hidden h-[373px] relative mb-4 w-[209.812px] border-4 border-white rounded-xl">
      <div className="relative h-[365px] w-[201.812px]">
        <div className="relative h-[365px] w-[201.812px] overflow-hidden rounded-lg">
          <div className="relative h-[365px] w-[201.812px]">
            {/* Video element */}
            <video
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              loop
              poster={video.poster}
              className={`block align-middle max-w-full h-[365px] w-[201.812px] object-cover font-poppins border-0 ${
                video.visibility === 'hidden' ? 'invisible' : 'visible'
              }`}
            >
              {video.videoUrl && (
                <source src={video.videoUrl} type="video/mp4" />
              )}
            </video>

            {/* Thumbnail overlay for videos without src */}
            {!video.videoUrl && (
              <div className="absolute inset-0">
                <img
                  src={video.thumbnailUrl}
                  alt="Video thumbnail"
                  className="h-[365px] w-[201.812px] object-cover"
                />
              </div>
            )}

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[rgba(3,0,30,0.8)] to-transparent text-white p-4">
              {/* Badge */}
              <div className="pb-4">
                <span className="flex w-fit items-center justify-start gap-2 bg-gray-400/35 text-xs text-white backdrop-blur-xl border border-white rounded-full px-4 py-2">
                  <p className="text-[14.6667px]">
                    {video.badge.emoji} {video.badge.text}
                  </p>
                </span>
              </div>

              {/* Author info */}
              <div className="mb-2 flex items-center gap-2">
                <img
                  src={video.author.avatarUrl}
                  className="h-10 w-10 border border-gray-400 rounded-full"
                  alt={`${video.author.username} avatar`}
                />
                <span className="font-bold">
                  {video.author.username}
                </span>
              </div>

              {/* Description */}
              <div className="z-50 max-w-[80%]">
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  video.isExpanded ? 'h-auto' : 'h-10'
                }`}>
                  <p className="text-sm leading-5">
                    {video.description}
                  </p>
                </div>
                <button
                  onClick={() => onToggleExpanded?.(video.id)}
                  className="text-sm font-medium text-gray-300 mt-1"
                >
                  more
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Action button component
const ActionButton: React.FC<{
  icon: React.ReactNode;
  label?: string;
  count?: number;
  onClick?: () => void;
  className?: string;
}> = ({ icon, label, count, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-transform duration-150 ease-in-out hover:scale-105 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center bg-white/90 text-gray-600 shadow-lg rounded-full">
        {icon}
      </div>
      {(label ?? count) && (
        <span className="mt-1 text-xs text-gray-600">
          {count ? count.toLocaleString() : (label ?? "")}
        </span>
      )}
    </button>
  );
};

// Main component
export const TikTokVideoPlayer: React.FC<TikTokVideoPlayerProps> = ({
  videos,
  likeCount = 11700,
  onLike,
  onSave,
  onAnalyze,
  onRewrite,
  onShare,
  onPlay,
  className = ""
}) => {
  const [expandedVideos, setExpandedVideos] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (videoId: string) => {
    setExpandedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const videosWithExpanded = videos.map(video => ({
    ...video,
    isExpanded: expandedVideos.has(video.id)
  }));

  return (
    <div className={`flex flex-1 items-center justify-center overflow-hidden w-[379.688px] bg-[rgb(247,249,252)] text-black text-base leading-6 font-poppins ${className}`}>
      <div className="flex items-center justify-center">
        <div className="relative h-[373px]">
          <div className="h-[373px] w-[209.812px] aspect-[9/16]">
            {/* Video scroll container */}
            <div className="scrollbar-none h-[373px] snap-y snap-mandatory overflow-y-auto">
              {videosWithExpanded.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onToggleExpanded={toggleExpanded}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Left side action buttons */}
      <div className="flex h-[373px] flex-col justify-end pb-1 pl-6">
        <div className="mt-20 flex flex-col items-center">
          {/* Like button with count */}
          <div className="flex flex-col items-center justify-center">
            <ActionButton
              icon={<Heart className="h-6 w-6" />}
              count={likeCount}
              onClick={onLike}
            />
          </div>

          {/* Save button */}
          <ActionButton
            icon={<Bookmark className="h-6 w-6" />}
            label="Save"
            onClick={onSave}
            className="mt-6"
          />

          {/* Analyze button */}
          <ActionButton
            icon={<BarChart3 className="h-6 w-6" />}
            label="Analyse"
            onClick={onAnalyze}
            className="mt-6"
          />

          {/* Rewrite button */}
          <ActionButton
            icon={<Edit3 className="h-6 w-6" />}
            label="Rewrite"
            onClick={onRewrite}
            className="mt-6"
          />
        </div>
      </div>

      {/* Fixed position right side controls */}
      <div className="fixed right-4 top-[266.5px] z-10 transform -translate-y-14">
        <div className="flex flex-col gap-4">
          <ActionButton
            icon={<Play className="h-6 w-6" />}
            onClick={onPlay}
          />
          <ActionButton
            icon={<Share2 className="h-6 w-6" />}
            onClick={onShare}
          />
        </div>
      </div>
    </div>
  );
};

// Sample data generator for testing
export const generateSampleVideoData = (): VideoData[] => [
  {
    id: '1',
    thumbnailUrl: 'https://cdn.lazylines.ai/v3-tiktok-videos/prod/tiktok/thumbnail/8294d2eb-5fb3-4651-b853-9e1d90857dc4.jpg',
    visibility: 'hidden',
    badge: { emoji: '💎', text: 'Untapped Potential' },
    author: { username: 'simonbeard_official', avatarUrl: '/assets/avatar-38Ppqw7p.png' },
    description: 'Having a reputable brand has never been more important than right now. . #entrepreneur #ecommerce'
  },
  {
    id: '2',
    videoUrl: 'https://cdn.lazylines.ai/viral-library-4/c1136467bdc5ab779fbea83180371734_1732442005.mp4',
    thumbnailUrl: '',
    visibility: 'visible',
    badge: { emoji: '💎', text: 'Untapped Potential' },
    author: { username: 'maxklymenko', avatarUrl: '/assets/avatar-38Ppqw7p.png' },
    description: 'This marketing technique is either genuis or silly What do you think? #learnontiktok #marketing #business #brands #advertising #psychology'
  },
  {
    id: '3',
    videoUrl: 'https://cdn.lazylines.ai/v3-tiktok-videos/prod/tiktok/7518087706438552837.mp4',
    thumbnailUrl: '',
    visibility: 'visible',
    badge: { emoji: '📈', text: 'Trending Topic' },
    author: { username: 'Top Gee', avatarUrl: 'https://cdn.lazylines.ai/v3-tiktok-videos/prod/tiktok/author/7450026414794228741.jpeg' },
    description: '#facelesschannels #facelessyoutuber #socialmediaautomation #fyp #foryoupage '
  }
];

export default TikTokVideoPlayer;