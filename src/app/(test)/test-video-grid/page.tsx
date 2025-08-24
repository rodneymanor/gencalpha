"use client";

import { useState } from "react";

import {
  VideoGrid,
  CollectionGrid,
  CreatorGrid,
  type VideoData,
  type CollectionData,
  type CreatorData,
} from "@/components/video/video-grid";
import { VideoGridControls, type GridType } from "@/components/video/video-grid-controls";
import { VideoGridSlideout } from "@/components/video/video-grid-slideout";
import { sampleCollections } from "@/lib/data/sample-collections";
import { sampleCreators } from "@/lib/data/sample-creators";
import { sampleVideos } from "@/lib/data/sample-videos";

export default function TestVideoGridPage() {
  const [columnsPerRow, setColumnsPerRow] = useState<1 | 2 | 3 | 4 | 5 | 6>(3);
  const [slideoutOpen, setSlideoutOpen] = useState(false);
  const [gridType, setGridType] = useState<GridType>("videos");

  const handleVideoClick = (video: VideoData) => {
    console.log("Video clicked:", video);
  };

  const handleCollectionClick = (collection: CollectionData) => {
    console.log("Collection clicked:", collection);
  };

  const handleCreatorClick = (creator: CreatorData) => {
    console.log("Creator clicked:", creator);
  };

  const renderGrid = () => {
    switch (gridType) {
      case "videos":
        return <VideoGrid videos={sampleVideos} columns={columnsPerRow} onVideoClick={handleVideoClick} />;
      case "collections":
        return (
          <CollectionGrid
            collections={sampleCollections}
            columns={columnsPerRow}
            onCollectionClick={handleCollectionClick}
          />
        );
      case "creators":
        return <CreatorGrid creators={sampleCreators} columns={columnsPerRow} onCreatorClick={handleCreatorClick} />;
      default:
        return null;
    }
  };

  const getGridTitle = () => {
    switch (gridType) {
      case "videos":
        return "Video Grid Test";
      case "collections":
        return "Collection Grid Test";
      case "creators":
        return "Creator Grid Test";
      default:
        return "Grid Test";
    }
  };

  const getGridDescription = () => {
    switch (gridType) {
      case "videos":
        return "Testing video grid component with responsive layout constraints";
      case "collections":
        return "Testing collection grid component with landscape thumbnails and metadata";
      case "creators":
        return "Testing creator grid component with avatars and follower counts";
      default:
        return "Testing grid components with responsive layout";
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
              <h1 className="text-foreground mb-2 text-2xl font-semibold">{getGridTitle()}</h1>
              <p className="text-muted-foreground">{getGridDescription()}</p>
            </div>

            {/* Controls */}
            <VideoGridControls
              columns={columnsPerRow}
              onColumnsChange={setColumnsPerRow}
              slideoutOpen={slideoutOpen}
              onSlideoutToggle={() => setSlideoutOpen(!slideoutOpen)}
              gridType={gridType}
              onGridTypeChange={setGridType}
              className="mb-6"
            />

            {/* Dynamic Grid */}
            {renderGrid()}
          </div>
        </div>
      </div>

      {/* Slide-out Panel */}
      <VideoGridSlideout isOpen={slideoutOpen} columns={columnsPerRow} />
    </div>
  );
}
