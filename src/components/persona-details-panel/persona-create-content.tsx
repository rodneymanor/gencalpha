"use client";

import React, { useState } from "react";
import { Sparkles, User, Link, Video, AlertCircle, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PersonaCreateContentProps {
  activeTab: string;
  onAnalyze: (input: string | string[], mode: 'profile' | 'videos') => void;
  isAnalyzing: boolean;
  analysisProgress: {
    step: string;
    current: number;
    total: number;
  } | null;
  analysisError: string;
}

export function PersonaCreateContent({ 
  activeTab, 
  onAnalyze, 
  isAnalyzing, 
  analysisProgress, 
  analysisError 
}: PersonaCreateContentProps) {
  const [profileUrl, setProfileUrl] = useState("");
  const [videoUrls, setVideoUrls] = useState<string[]>([""]);

  const handleAddVideoUrl = () => {
    if (videoUrls.length < 10) {
      setVideoUrls([...videoUrls, ""]);
    }
  };

  const handleRemoveVideoUrl = (index: number) => {
    const newUrls = videoUrls.filter((_, i) => i !== index);
    setVideoUrls(newUrls.length === 0 ? [""] : newUrls);
  };

  const handleVideoUrlChange = (index: number, value: string) => {
    const newUrls = [...videoUrls];
    newUrls[index] = value;
    setVideoUrls(newUrls);
  };

  const handleAnalyzeProfile = () => {
    if (profileUrl.trim()) {
      onAnalyze(profileUrl.trim(), 'profile');
    }
  };

  const handleAnalyzeVideos = () => {
    const validUrls = videoUrls.filter(url => url.trim());
    if (validUrls.length > 0) {
      onAnalyze(validUrls, 'videos');
    }
  };

  // Profile-based creation tab
  if (activeTab === "profile") {
    return (
      <div className="px-6 py-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Create from Creator Profile</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Analyze a creator's entire profile to capture their unique voice patterns and style
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="profile-url" className="block text-sm font-medium text-neutral-700 mb-2">
              TikTok Username or Profile URL
            </label>
            <input
              id="profile-url"
              type="text"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="Enter @username or TikTok profile URL"
              className="w-full px-3 py-2 border border-neutral-200 rounded-[var(--radius-button)] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400 transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed"
              disabled={isAnalyzing}
            />
            <p className="mt-1.5 text-xs text-neutral-500">
              We'll analyze their recent videos to capture their unique voice and style
            </p>
          </div>

          {/* Progress indicator */}
          {isAnalyzing && analysisProgress && (
            <div className="rounded-[var(--radius-button)] border border-primary-200 bg-primary-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                <span className="text-sm font-medium text-primary-700">{analysisProgress.step}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-primary-200">
                <div
                  className="h-2 rounded-full bg-primary-600 transition-all duration-500"
                  style={{ width: `${(analysisProgress.current / analysisProgress.total) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-primary-600">
                Step {analysisProgress.current} of {analysisProgress.total} • This may take about a minute
              </p>
            </div>
          )}

          {/* Error display */}
          {analysisError && (
            <div className="rounded-[var(--radius-button)] border border-destructive-200 bg-destructive-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-destructive-600" />
                <p className="text-sm text-destructive-700">{analysisError}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleAnalyzeProfile}
            disabled={isAnalyzing || !profileUrl.trim()}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:bg-neutral-300"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Creator...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze & Create Persona
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Video-based creation tab
  if (activeTab === "videos") {
    return (
      <div className="px-6 py-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Create from Specific Videos</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Provide up to 10 video URLs to define a custom voice persona based on specific content
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Video URLs (Max 10)
            </label>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {videoUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                      placeholder={`Video URL ${index + 1}`}
                      className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-[var(--radius-button)] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400 transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      disabled={isAnalyzing}
                    />
                  </div>
                  {videoUrls.length > 1 && (
                    <button
                      onClick={() => handleRemoveVideoUrl(index)}
                      className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-[var(--radius-button)] transition-colors"
                      disabled={isAnalyzing}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {videoUrls.length < 10 && (
              <button
                onClick={handleAddVideoUrl}
                className="mt-3 flex items-center gap-2 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-[var(--radius-button)] transition-colors"
                disabled={isAnalyzing}
              >
                <Plus className="h-4 w-4" />
                Add another video
              </button>
            )}
            
            <p className="mt-2 text-xs text-neutral-500">
              Provide TikTok, YouTube, or other social media video URLs to analyze
            </p>
          </div>

          {/* Progress indicator */}
          {isAnalyzing && analysisProgress && (
            <div className="rounded-[var(--radius-button)] border border-primary-200 bg-primary-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                <span className="text-sm font-medium text-primary-700">{analysisProgress.step}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-primary-200">
                <div
                  className="h-2 rounded-full bg-primary-600 transition-all duration-500"
                  style={{ width: `${(analysisProgress.current / analysisProgress.total) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-primary-600">
                Step {analysisProgress.current} of {analysisProgress.total} • Processing {videoUrls.filter(url => url.trim()).length} video{videoUrls.filter(url => url.trim()).length !== 1 ? 's' : ''}...
              </p>
            </div>
          )}

          {/* Error display */}
          {analysisError && (
            <div className="rounded-[var(--radius-button)] border border-destructive-200 bg-destructive-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-destructive-600" />
                <p className="text-sm text-destructive-700">{analysisError}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleAnalyzeVideos}
            disabled={isAnalyzing || !videoUrls.some(url => url.trim())}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:bg-neutral-300"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Videos...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Persona from Videos
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}