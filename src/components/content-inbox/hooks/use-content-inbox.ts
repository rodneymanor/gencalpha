"use client";

// React Query hooks for Content Inbox

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";

import { ContentItem, FilterOptions, SortOptions, BulkAction, Platform } from "../types";

const API_BASE = "/api/content-inbox";

// Helper to get current user's auth token
async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// Helper to detect platform from URL
export const detectPlatform = (url: string): Platform => {
  const urlLower = url.toLowerCase();

  if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) return "youtube";
  if (urlLower.includes("tiktok.com")) return "tiktok";
  if (urlLower.includes("instagram.com")) return "instagram";
  if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) return "twitter";
  if (urlLower.includes("linkedin.com")) return "linkedin";

  return "unknown";
};

// Fetch content items with infinite scroll
export const useContentItems = (filters: FilterOptions, sort: SortOptions) => {
  return useInfiniteQuery({
    queryKey: ["content-items", filters, sort],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: "20",
        filters: JSON.stringify(filters),
        sort: JSON.stringify(sort),
      });

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/items?${params}`, {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch content items");

      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    initialPageParam: 0,
  });
};

// Add content item
export const useAddContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { url: string; category?: string; tags?: string[] }) => {
      const platform = detectPlatform(data.url);

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...data, platform }),
      });

      if (!response.ok) throw new Error("Failed to add content");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch content items
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
    },
    // Optimistic update
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ["content-items"] });

      const previousItems = queryClient.getQueryData(["content-items"]);

      // Optimistically add the new item
      queryClient.setQueryData(["content-items"], (old: any) => {
        if (!old) return old;

        const optimisticItem: ContentItem = {
          id: `temp-${Date.now()}`,
          url: newItem.url,
          platform: detectPlatform(newItem.url),
          savedAt: new Date(),
          transcription: {
            status: "pending",
          },
        };

        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            if (index === 0) {
              return {
                ...page,
                items: [optimisticItem, ...page.items],
              };
            }
            return page;
          }),
        };
      });

      return { previousItems };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(["content-items"], context.previousItems);
      }
    },
  });
};

// Update content item
export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentItem> & { id: string }) => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/items/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
    },
  });
};

// Delete content items
export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/items`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) throw new Error("Failed to delete content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
    },
  });
};

// Bulk actions
export const useBulkAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, action }: { ids: string[]; action: BulkAction }) => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/bulk-action`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ids, action }),
      });

      if (!response.ok) throw new Error("Failed to perform bulk action");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
    },
  });
};

// Update sort order (for drag and drop)
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; order: number }[]) => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/update-order`, {
        method: "POST",
        headers,
        body: JSON.stringify({ items }),
      });

      if (!response.ok) throw new Error("Failed to update order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
    },
    // Optimistic update for instant feedback
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["content-items"] });

      const previousItems = queryClient.getQueryData(["content-items"]);

      // Update order optimistically
      queryClient.setQueryData(["content-items"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items
              .map((item: ContentItem) => {
                const orderUpdate = newOrder.find((o) => o.id === item.id);
                return orderUpdate ? { ...item, order: orderUpdate.order } : item;
              })
              .sort((a: ContentItem, b: ContentItem) => (a.order || 0) - (b.order || 0)),
          })),
        };
      });

      return { previousItems };
    },
    onError: (err, newOrder, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["content-items"], context.previousItems);
      }
    },
  });
};

// Search suggestions
export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/search-suggestions?q=${encodeURIComponent(query)}`, {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch suggestions");

      return response.json();
    },
    enabled: query.length >= 2,
  });
};
