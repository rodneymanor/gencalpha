"use client";

import { Button } from "@/components/ui/button";
import { useNotificationHelpers } from "@/hooks/use-notification-helpers";

export function TestNotificationButton() {
  const { notifyVideoAdded, notifyCollectionCreated, notifyCreatorAdded, notifyIdeaAdded } = useNotificationHelpers();

  const testVideoAdded = () => {
    notifyVideoAdded({
      videoTitle: "Amazing Dance Tutorial",
      videoAuthor: "coolcreator123",
      collectionName: "My Favorites",
      videoId: "test-video-123",
      collectionId: "test-collection-456",
    });
  };

  const testCollectionCreated = () => {
    notifyCollectionCreated({
      collectionName: "New Dance Videos",
      collectionId: "collection-789",
      videoCount: 3,
    });
  };

  const testCreatorAdded = () => {
    notifyCreatorAdded({
      creatorName: "Amazing Creator",
      creatorHandle: "amazingcreator",
      platform: "TikTok",
      creatorId: "creator-456",
    });
  };

  const testIdeaAdded = () => {
    notifyIdeaAdded({
      ideaTitle: "Video Idea: Summer Dance Challenge",
      source: "TikTok trending",
    });
  };

  return (
    <div className="flex flex-wrap gap-2 p-4">
      <Button onClick={testVideoAdded} variant="outline" size="sm">
        Test Video Added
      </Button>
      <Button onClick={testCollectionCreated} variant="outline" size="sm">
        Test Collection Created
      </Button>
      <Button onClick={testCreatorAdded} variant="outline" size="sm">
        Test Creator Added
      </Button>
      <Button onClick={testIdeaAdded} variant="outline" size="sm">
        Test Idea Added
      </Button>
    </div>
  );
}
