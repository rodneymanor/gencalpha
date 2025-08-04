"use client";

import * as React from "react";

import Image from "next/image";

import {
  MoreHorizontal,
  ChevronDown,
  X,
  Globe,
  MousePointer2,
  Rewind,
  FastForward,
  Sparkles,
  ChevronsUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface BrowserPreviewProps {
  deviceName?: string;
  userName?: string;
  currentApp?: string;
  url?: string;
  imageUrl?: string;
  mainActionText?: string;
  currentTask?: string;
  currentTaskStatus?: string;
  taskProgress?: string;
}

export function BrowserPreview({
  deviceName = "Manus's Computer",
  userName = "Manus",
  currentApp = "Browser",
  url = "http://localhost:5000",
  imageUrl = "https://private-us-east-1.manuscdn.com/sessionFile/hiNyV78W6hA57ZbeB6neSq/browserScreenshots/7DD6A3KFg14FVvNJD6rO3m_1754103050806_na1fn_Y2xlYW4.webp?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaGlOeVY3OFc2aEE1N1piZUI2bmVTcS9icm93c2VyU2NyZWVuc2hvdHMvN0RENkEzS0ZnMTRGVnZOSkQ2ck8zbV8xNzU0MTAzMDUwODA2X25hMWZuX1kyeGxZVzQud2VicCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=VKISttTCqN0F7VY6Rk9EqDXi0QHfydGvQdxovpLRM5lymViWBU7udgj2nuY-HGyujv5hvNnjlp5OhTMHj2O6DIcAW858e~o3zGBCkQ-g7mKhZ5bWs2goS0nCrMbEXWRyl9gHG8ayKg7tFQeCGcE8e7Vr1ulcJ4vcd4O2MOZsz-7IlAWoQTfFZgnhy0ahfVfeqjEpjE5ZUhZncEf0unQM8A1J01rndzkv~j4iZNCeg8idz09bnYdfcga6OXl8I~SKSPq1X4gtw41-faqfgA3JWhbrlV3i~mHyRWvr87-oG1flAbqh61xKrDQklBiqzRdkAiky~WYeKSesuUxy8m8nng__",
  mainActionText = "Take control",
  currentTask = "Deploy the application to public URL",
  currentTaskStatus = "Waiting for user...",
  taskProgress = "6 / 6",
}: BrowserPreviewProps) {
  return (
    <div className="border-border bg-card text-card-foreground flex h-[673px] w-[576px] flex-col rounded-2xl border p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex-grow text-lg font-semibold">{deviceName}</div>
        <Button variant="ghost" size="sm" className="flex items-center gap-px">
          <MoreHorizontal className="h-5 w-5" />
          <ChevronDown className="h-4 w-4" />
        </Button>
        <span className="bg-muted-foreground/20 h-4 w-px"></span>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <X className="text-muted-foreground h-5 w-5" />
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
          <Globe className="text-foreground h-8 w-8" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="text-muted-foreground text-xs">
            {userName} is using <span className="text-foreground/80">{currentApp}</span>
          </div>
          <div
            title={`Browsing ${url}`}
            className="bg-muted text-foreground/80 flex max-w-full items-center overflow-hidden rounded-full border border-black/5 py-1 pr-1 pl-2.5 text-sm text-ellipsis whitespace-nowrap"
          >
            Browsing
            <code className="text-muted-foreground ml-1 max-w-full flex-1 overflow-hidden px-1 font-mono text-xs text-ellipsis whitespace-nowrap">
              {url}
            </code>
          </div>
        </div>
      </div>

      <div className="bg-muted mt-4 flex flex-1 flex-col overflow-hidden rounded-lg border border-black/10 shadow-inner">
        <div className="bg-muted flex h-9 w-full items-center justify-center border-b border-black/5 px-3 shadow-sm">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground max-w-[250px] overflow-hidden text-center text-sm font-medium text-ellipsis whitespace-nowrap no-underline hover:underline"
          >
            {url}
          </a>
        </div>
        <div className="relative flex-1">
          <div className="relative h-full w-full">
            <Image alt="Browser Preview" src={imageUrl} layout="fill" objectFit="cover" className="cursor-pointer" />
          </div>
          <Button
            variant="secondary"
            className="group absolute right-2.5 bottom-2.5 z-10 h-10 min-w-10 gap-2 overflow-hidden rounded-full border-black/5 px-3 shadow-lg backdrop-blur-xl transition-all duration-300 hover:w-36"
          >
            <MousePointer2 className="h-5 w-5" />
            <span className="max-w-0 opacity-0 transition-all duration-300 group-hover:max-w-full group-hover:opacity-100">
              {mainActionText}
            </span>
          </Button>
        </div>
        <div className="bg-card flex h-11 w-full items-center gap-2 border-t border-black/5 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Rewind className="text-muted-foreground h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <FastForward className="text-muted-foreground h-5 w-5" />
            </Button>
          </div>
          <Progress value={100} className="h-1 flex-1" />
          <div className="ml-2 flex cursor-default items-center gap-1 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>live</span>
          </div>
        </div>
      </div>

      <div className="relative mt-5 h-14 min-h-[3.5rem]">
        <div className="border-border bg-card absolute inset-x-0 bottom-0 flex cursor-pointer items-start justify-between rounded-xl border pr-3 shadow-sm select-none">
          <div className="flex-1 overflow-hidden p-2">
            <div className="flex items-start gap-2.5 overflow-hidden px-2 py-0 text-ellipsis whitespace-nowrap">
              <Sparkles className="relative top-0.5 h-5 w-5 flex-shrink-0" />
              <div className="flex w-full flex-col overflow-hidden text-ellipsis whitespace-nowrap">
                <div
                  title={currentTask}
                  className="animate-shimmer bg-[linear-gradient(to_right,theme(colors.foreground),theme(colors.muted-foreground),theme(colors.foreground))] overflow-hidden bg-[length:250%_100%] bg-clip-text text-sm text-ellipsis whitespace-nowrap text-transparent"
                >
                  {currentTask}
                </div>
                <div className="animate-shimmer bg-[linear-gradient(to_right,theme(colors.foreground),theme(colors.muted-foreground),theme(colors.foreground))] overflow-hidden bg-[length:250%_100%] bg-clip-text text-xs text-ellipsis whitespace-nowrap text-transparent">
                  {currentTaskStatus}
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" className="h-9 flex-shrink-0 gap-2 self-center px-0">
            <span className="text-muted-foreground text-xs">{taskProgress}</span>
            <ChevronsUpDown className="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
