"use client";

import React from "react";

import {
  X,
  Users,
  Copy,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  TrendingUp,
  MoreHorizontal,
  Download
} from "lucide-react";

interface HookIdea {
  text: string;
}

interface ContentIdea {
  title: string;
  description: string;
}

interface MetricData {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface UserProfile {
  username: string;
  followers: string;
  publishDate: string;
  category: string;
}

interface SocialMediaAnalyticsDashboardProps {
  userProfile: UserProfile;
  hookIdeas: HookIdea[];
  contentIdeas: ContentIdea[];
  metrics: MetricData[];
  caption: string;
  transcript: string;
  duration: string;
}

export function SocialMediaAnalyticsDashboard({
  userProfile,
  hookIdeas,
  contentIdeas,
  metrics,
  caption,
  transcript,
  duration,
}: SocialMediaAnalyticsDashboardProps) {
  return (
    <div className="relative flex flex-1 flex-col w-full bg-white text-black text-base leading-6 font-sans">
      {/* Mobile Handle - Hidden */}
      <div className="hidden items-center justify-center">
        <div className="mt-4 h-1 w-10 bg-gray-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="relative flex flex-row items-center py-4 px-6 text-base font-medium border-b border-gray-100">
        <button className="absolute right-5 top-7 flex h-6 w-6 -translate-y-3 cursor-pointer items-center justify-center bg-gray-100 text-gray-500 transition-all duration-300 border border-gray-200 rounded">
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-1">
          <div className="flex flex-row flex-wrap items-center gap-2.5">
            <p className="text-base leading-5 text-gray-900 m-0">
              {userProfile.username}
            </p>
            <hr className="h-3 border border-gray-300" />
            <div className="flex flex-row gap-1 text-blue-500">
              <Users className="h-4 w-4" />
              <p className="text-sm leading-5 m-0">
                {userProfile.followers} Followers
              </p>
            </div>
            <hr className="h-3 border border-gray-300" />
            <div className="flex flex-row items-center gap-2">
              <p className="text-sm leading-6 font-normal text-gray-500 m-0">
                Published on {userProfile.publishDate}
              </p>
              <div className="text-xs leading-4 bg-blue-50 text-blue-500 border border-blue-200 rounded-full px-2.5 py-1">
                {userProfile.category}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex h-[1132px] w-[1069px] flex-row gap-4">
          {/* Left Column */}
          <div className="flex w-[526.5px] flex-col">
            {/* Hook Ideas */}
            <div className="w-full border border-gray-200 rounded-xl">
              <div className="flex flex-row items-center rounded-t-lg bg-gray-50 px-4 py-3">
                <p className="flex-1 text-sm font-semibold leading-5 m-0">
                  Hook Ideas From the Video
                </p>
              </div>
              <div className="flex w-full flex-col gap-4 pt-2">
                <div className="flex w-full flex-col gap-2 rounded-xl px-3 py-2">
                  {hookIdeas.map((idea, index) => (
                    <div key={index} className="flex flex-row items-center justify-between rounded-lg px-2 py-1.5">
                      <ul className="pl-5 m-0">
                        <li className="text-sm leading-5 text-gray-600">
                          {idea.text}
                        </li>
                      </ul>
                      <button className="font-normal text-black bg-transparent h-7 w-7 border-0 rounded p-1.5 m-0 flex items-center justify-center gap-2 transition-all duration-200">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Ideas */}
            <div className="flex w-full flex-1 flex-col mt-4 border border-blue-100 rounded-[10px]">
              <div className="flex flex-row items-center rounded-t-lg bg-gray-50 px-4 py-3">
                <p className="flex-1 text-sm font-semibold leading-5 m-0">
                  Content Ideas From the Video
                </p>
              </div>
              <div className="flex flex-col p-2">
                {contentIdeas.map((idea, index) => (
                  <div key={index} className={`flex cursor-pointer flex-col gap-1 text-gray-500 transition-all duration-300 border border-gray-200 rounded-xl ${index > 0 ? 'mt-2' : ''}`}>
                    <div className="flex flex-col gap-1 p-3">
                      <p className="font-medium text-gray-900 m-0">
                        {idea.title}
                      </p>
                      <p className="text-sm leading-5 text-gray-600 m-0">
                        {idea.description}
                      </p>
                    </div>
                    <hr className="h-px border-t border-gray-200" />
                    <div className="flex flex-row justify-end gap-1 px-2 py-1">
                      <button className="font-normal text-gray-500 bg-transparent h-7 w-7 border-0 rounded p-1.5 m-0 flex items-center justify-center gap-2 transition-all duration-200">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="font-normal text-gray-500 bg-transparent h-7 w-7 border-0 rounded p-1.5 m-0 flex items-center justify-center gap-2 transition-all duration-200">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex w-[526.5px] flex-col m-0">
            {/* Metrics */}
            <div className="flex w-full flex-col border border-blue-100 rounded-[10px]">
              <div className="flex flex-row items-center rounded-t-lg bg-gray-50 px-4 py-3">
                <p className="flex-1 text-sm font-semibold leading-5 m-0">
                  Metrics
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 p-6">
                {metrics.map((metric, index) => {
                  const icons = [Heart, MessageCircle, Share2, Bookmark, Eye, TrendingUp];
                  const IconComponent = icons[index] || Heart;
                  return (
                    <div key={index} className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white border border-blue-100 rounded-lg p-6">
                      <p className="text-2xl leading-8 font-bold text-blue-500 m-0">
                        {metric.value}
                      </p>
                      <div className="flex flex-row items-center justify-center mt-2 text-xs leading-4 font-medium text-blue-500">
                        <IconComponent className="h-3 w-3" />
                        <p className="m-0 ml-1">{metric.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-4 grid grid-cols-2 gap-4 h-[666px] mb-0">
              <div className="col-span-2 flex flex-col">
                <div className="flex flex-1 flex-col gap-4">
                  {/* Caption */}
                  <div className="flex h-[306px] max-h-[350px] w-full flex-col overflow-y-auto border border-blue-100 rounded-[10px]">
                    <div className="flex flex-row items-center rounded-t-lg bg-gray-50 px-4 py-3">
                      <p className="flex-1 text-sm font-semibold leading-5 m-0">
                        Caption
                      </p>
                      <div className="flex flex-row items-center justify-center">
                        <button className="font-normal text-black bg-transparent h-7 w-7 border-0 rounded p-1.5 m-0 flex items-center justify-center gap-2 transition-all duration-200">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-5 p-4">
                      {caption}
                    </div>
                  </div>

                  {/* Transcript */}
                  <div className="flex h-[344px] max-h-[350px] w-full flex-col border border-blue-100 rounded-[10px] m-0">
                    <div className="flex flex-row items-center rounded-t-lg bg-gray-50 px-4 py-3">
                      <p className="flex-1 text-sm font-semibold leading-5 m-0">
                        Transcript
                      </p>
                      <div className="flex flex-row items-center justify-center">
                        <p className="text-xs font-normal leading-5 m-0">
                          Duration: {duration}
                        </p>
                        <button className="font-normal text-black bg-transparent h-7 w-7 border-0 rounded p-1.5 ml-2 m-0 flex items-center justify-center gap-2 transition-all duration-200">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto text-sm font-normal leading-5 p-6">
                      {transcript}
                    </div>
                    <div className="mt-2 px-6 py-2">
                      <button className="font-semibold text-white bg-blue-500/90 h-[42px] w-full border border-blue-500 rounded-lg px-4 py-2.5 m-0 flex items-center justify-center gap-2 transition-all duration-200">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                          Rewrite In My Own Style
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}