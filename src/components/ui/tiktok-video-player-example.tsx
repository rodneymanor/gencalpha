"use client";

import React from 'react';

import { TikTokVideoPlayer, generateSampleVideoData } from './tiktok-video-player';

// Example usage component
export const TikTokVideoPlayerExample: React.FC = () => {
  const sampleVideos = generateSampleVideoData();

  const handleLike = () => {
    console.log('Like clicked');
  };

  const handleSave = () => {
    console.log('Save clicked');
  };

  const handleAnalyze = () => {
    console.log('Analyze clicked');
  };

  const handleRewrite = () => {
    console.log('Rewrite clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  const handlePlay = () => {
    console.log('Play clicked');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <TikTokVideoPlayer
        videos={sampleVideos}
        likeCount={11700}
        onLike={handleLike}
        onSave={handleSave}
        onAnalyze={handleAnalyze}
        onRewrite={handleRewrite}
        onShare={handleShare}
        onPlay={handlePlay}
        className="border rounded-lg shadow-lg"
      />
    </div>
  );
};

export default TikTokVideoPlayerExample;