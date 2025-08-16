/**
 * Helper functions for creating notifications throughout the app
 */

import { type NotificationItem } from "@/contexts/notification-context";

export const notificationHelpers = {
  /**
   * Create a notification for when a new video is manually added to a collection
   */
  videoAdded: (data: {
    videoTitle?: string;
    videoAuthor?: string;
    collectionName?: string;
    videoId?: string;
    collectionId?: string;
    thumbnailUrl?: string;
  }): Omit<NotificationItem, "id" | "timestamp" | "read"> => ({
    type: "video_added",
    title: "Video Added to Collection",
    message: data.videoTitle
      ? `"${data.videoTitle}"${data.videoAuthor ? ` by @${data.videoAuthor}` : ""} was added${data.collectionName ? ` to ${data.collectionName}` : ""}`
      : `Video was added${data.collectionName ? ` to ${data.collectionName}` : " to collection"}`,
    data: {
      videoId: data.videoId,
      collectionId: data.collectionId,
      thumbnailUrl: data.thumbnailUrl,
    },
  }),

  /**
   * Create a notification for when a new collection is created
   */
  collectionCreated: (data: {
    collectionName: string;
    collectionId?: string;
    videoCount?: number;
  }): Omit<NotificationItem, "id" | "timestamp" | "read"> => ({
    type: "collection_created",
    title: "New Collection Created",
    message: `"${data.collectionName}" collection has been created${data.videoCount ? ` with ${data.videoCount} video${data.videoCount !== 1 ? "s" : ""}` : ""}`,
    data: {
      collectionId: data.collectionId,
    },
  }),

  /**
   * Create a notification for when a new creator is added/followed
   */
  creatorAdded: (data: {
    creatorName: string;
    creatorHandle?: string;
    platform?: string;
    creatorId?: string;
  }): Omit<NotificationItem, "id" | "timestamp" | "read"> => ({
    type: "creator_added",
    title: "New Creator Added",
    message: `Started following ${data.creatorName}${data.creatorHandle ? ` (@${data.creatorHandle})` : ""}${data.platform ? ` on ${data.platform}` : ""}`,
    data: {
      creatorId: data.creatorId,
    },
  }),

  /**
   * Create a notification for when a new idea is added to the idea inbox
   */
  ideaAdded: (data: {
    ideaTitle?: string;
    ideaContent?: string;
    source?: string;
  }): Omit<NotificationItem, "id" | "timestamp" | "read"> => ({
    type: "idea_added",
    title: "New Idea Added",
    message: data.ideaTitle
      ? `"${data.ideaTitle}" was added to your idea inbox${data.source ? ` from ${data.source}` : ""}`
      : `New idea was added to your inbox${data.source ? ` from ${data.source}` : ""}`,
    data: {},
  }),

  /**
   * Create a notification for successful processing completion
   */
  processingComplete: (data: {
    videoTitle?: string;
    videoAuthor?: string;
    collectionName?: string;
    videoId?: string;
    collectionId?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    jobId?: string;
  }): Omit<NotificationItem, "id" | "timestamp" | "read"> => ({
    type: "processing_complete",
    title: "Video Processing Complete",
    message: data.videoTitle
      ? `"${data.videoTitle}" by @${data.videoAuthor} has been added to your collection`
      : "Video has been processed and added to your collection",
    data: {
      videoId: data.videoId,
      collectionId: data.collectionId,
      thumbnailUrl: data.thumbnailUrl,
      videoUrl: data.videoUrl,
      jobId: data.jobId,
    },
  }),

  /**
   * Create a notification for processing failures
   */
  processingFailed: (data: {
    errorMessage?: string;
    videoUrl?: string;
    jobId?: string;
  }): Omit<NotificationItem, "id" | "timestamp" | "read"> => ({
    type: "processing_failed",
    title: "Video Processing Failed",
    message: data.errorMessage ?? "Failed to process video. Please try again.",
    data: {
      jobId: data.jobId,
    },
  }),
};

/**
 * Hook to get notification helpers with context
 * Usage: const { notifyVideoAdded, notifyCollectionCreated } = useNotificationHelpers();
 */
export function createNotificationHelpers(
  addNotification: (notification: Omit<NotificationItem, "id" | "timestamp" | "read">) => void,
) {
  return {
    notifyVideoAdded: (data: Parameters<typeof notificationHelpers.videoAdded>[0]) =>
      addNotification(notificationHelpers.videoAdded(data)),

    notifyCollectionCreated: (data: Parameters<typeof notificationHelpers.collectionCreated>[0]) =>
      addNotification(notificationHelpers.collectionCreated(data)),

    notifyCreatorAdded: (data: Parameters<typeof notificationHelpers.creatorAdded>[0]) =>
      addNotification(notificationHelpers.creatorAdded(data)),

    notifyIdeaAdded: (data: Parameters<typeof notificationHelpers.ideaAdded>[0]) =>
      addNotification(notificationHelpers.ideaAdded(data)),

    notifyProcessingComplete: (data: Parameters<typeof notificationHelpers.processingComplete>[0]) =>
      addNotification(notificationHelpers.processingComplete(data)),

    notifyProcessingFailed: (data: Parameters<typeof notificationHelpers.processingFailed>[0]) =>
      addNotification(notificationHelpers.processingFailed(data)),
  };
}
