import { useNotifications } from "@/contexts/notification-context";
import { createNotificationHelpers } from "@/lib/notification-helpers";

/**
 * Hook that provides easy access to notification helper functions
 * Usage:
 *
 * const { notifyVideoAdded, notifyCollectionCreated } = useNotificationHelpers();
 *
 * // When a video is added to a collection
 * notifyVideoAdded({
 *   videoTitle: "Amazing TikTok Video",
 *   videoAuthor: "creator123",
 *   collectionName: "My Favorites",
 *   videoId: "video-123",
 *   collectionId: "collection-456"
 * });
 */
export function useNotificationHelpers() {
  const { addNotification } = useNotifications();
  return createNotificationHelpers(addNotification);
}
