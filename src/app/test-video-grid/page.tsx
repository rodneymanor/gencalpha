"use client";

import { useState } from "react";

interface VideoData {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
}

const sampleVideos: VideoData[] = [
  {
    id: "1",
    title: "Creative Process Behind the Scenes",
    creator: "creative_mind",
    thumbnail: "https://picsum.photos/300/400?random=1",
  },
  {
    id: "2",
    title: "Dance Challenge Trending",
    creator: "dancequeen",
    thumbnail: "https://picsum.photos/300/400?random=2",
  },
  {
    id: "3",
    title: "Product Showcase Tutorial",
    creator: "tech_reviewer",
    thumbnail: "https://picsum.photos/300/400?random=3",
  },
  {
    id: "4",
    title: "Cooking Tips & Tricks",
    creator: "chef_anna",
    thumbnail: "https://picsum.photos/300/400?random=4",
  },
  {
    id: "5",
    title: "Travel Vlog Highlights",
    creator: "wanderlust_soul",
    thumbnail: "https://picsum.photos/300/400?random=5",
  },
  {
    id: "6",
    title: "Comedy Sketch Series",
    creator: "funny_creator",
    thumbnail: "https://picsum.photos/300/400?random=6",
  },
  {
    id: "7",
    title: "Morning Routine Vlog",
    creator: "lifestyle_guru",
    thumbnail: "https://picsum.photos/300/400?random=7",
  },
  {
    id: "8",
    title: "Tech Review Unboxing",
    creator: "gadget_pro",
    thumbnail: "https://picsum.photos/300/400?random=8",
  },
  {
    id: "9",
    title: "Art Tutorial Series",
    creator: "creative_artist",
    thumbnail: "https://picsum.photos/300/400?random=9",
  },
  {
    id: "10",
    title: "Fitness Challenge",
    creator: "fit_trainer",
    thumbnail: "https://picsum.photos/300/400?random=10",
  },
  {
    id: "11",
    title: "Food Recipe Demo",
    creator: "home_chef",
    thumbnail: "https://picsum.photos/300/400?random=11",
  },
  {
    id: "12",
    title: "Travel Adventure",
    creator: "explorer_life",
    thumbnail: "https://picsum.photos/300/400?random=12",
  },
];

function VideoCard({ video }: { video: VideoData }) {
  return (
    <div className="bg-card overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)]">
      <div className="relative aspect-[9/16] overflow-hidden bg-black">
        <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
      </div>
      <div className="flex items-center gap-3 p-3">
        <div className="rounded-pill bg-muted flex h-8 w-8 flex-shrink-0 items-center justify-center">
          <span className="text-foreground text-xs font-medium">{video.creator.slice(0, 2).toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">{video.creator}</p>
          <p className="text-muted-foreground truncate text-xs">@{video.creator.toLowerCase()}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestVideoGridPage() {
  const [columnsPerRow, setColumnsPerRow] = useState(3);
  const [slideoutOpen, setSlideoutOpen] = useState(false);

  const getGridClass = () => {
    switch (columnsPerRow) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case 5:
        return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
      case 6:
        return "grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <div className="layout-container bg-background flex min-h-screen w-full transition-all duration-300">
      {/* Main Content Area */}
      <div className="content-area flex flex-1 justify-center overflow-x-hidden overflow-y-scroll">
        <div className="relative mx-auto flex h-full w-full max-w-3xl flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 py-8 md:px-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-foreground mb-2 text-2xl font-semibold">Video Grid Test</h1>
              <p className="text-muted-foreground">Testing video grid component with responsive layout constraints</p>
            </div>

            {/* Controls */}
            <div className="bg-card mb-6 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-soft-drop)]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-foreground text-sm font-medium">Videos per row (desktop):</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6].map((cols) => (
                      <button
                        key={cols}
                        onClick={() => setColumnsPerRow(cols)}
                        className={`rounded-[var(--radius-button)] border px-3 py-2 text-sm transition-colors duration-200 ${
                          columnsPerRow === cols
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:bg-accent"
                        }`}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSlideoutOpen(!slideoutOpen)}
                    className={`rounded-[var(--radius-button)] border px-4 py-2 text-sm transition-colors duration-200 ${
                      slideoutOpen
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {slideoutOpen ? "Close" : "Open"} Slideout Panel
                  </button>
                  <span className="text-muted-foreground text-sm">Test responsive behavior</span>
                </div>
              </div>
            </div>

            {/* Video Grid */}
            <div className={`grid gap-4 ${getGridClass()}`}>
              {sampleVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Panel */}
      <div
        className={`slide-panel bg-card border-border overflow-hidden border-l transition-all duration-300 ${
          slideoutOpen ? "w-80" : "w-0"
        }`}
      >
        <div className="h-full p-6">
          <h3 className="text-foreground mb-4 font-medium">Slideout Panel</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            This panel demonstrates how the main content reflows when a slideout opens.
          </p>
          <div className="space-y-3">
            <div className="bg-accent rounded-[var(--radius-button)] p-3">
              <p className="text-accent-foreground text-sm">Current layout: {columnsPerRow} columns</p>
            </div>
            <div className="bg-muted rounded-[var(--radius-button)] p-3">
              <p className="text-muted-foreground text-sm">Max width maintained at 768px</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
