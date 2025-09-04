// Custom hook for managing trending topics with optimized caching
import { useState, useEffect, useCallback } from "react";

import { buildAuthHeaders } from "@/lib/http/auth-headers";
import type { TrendingTopic } from "@/lib/rss-service";

// Safe auth hook that returns null if not in auth context
function useSafeAuth() {
  try {
    // Dynamic import to avoid compile-time errors
    const { useAuth } = require("@/contexts/auth-context");
    return useAuth();
  } catch {
    // Not in auth context, return null
    return null;
  }
}

interface UseTrendingTopicsOptions {
  autoLoad?: boolean; // Whether to load topics immediately
  limit?: number;
  refreshInterval?: number; // Optional auto-refresh interval in ms
}

interface UseTrendingTopicsReturn {
  topics: TrendingTopic[];
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
  lastUpdated: string | null;
  nextUpdate: string | null;
  loadTopics: () => Promise<void>;
  refresh: () => Promise<void>;
}

// In-memory cache for session persistence
let sessionCache: {
  topics: TrendingTopic[];
  timestamp: number;
  lastUpdated: string | null;
  nextUpdate: string | null;
} | null = null;

const SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useTrendingTopics(options: UseTrendingTopicsOptions = {}): UseTrendingTopicsReturn {
  const { autoLoad = false, limit = 8, refreshInterval } = options;
  const auth = useSafeAuth();
  const user = auth?.user;

  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [nextUpdate, setNextUpdate] = useState<string | null>(null);

  // Check session cache first
  const checkSessionCache = useCallback(() => {
    if (sessionCache && Date.now() - sessionCache.timestamp < SESSION_CACHE_TTL) {
      setTopics(sessionCache.topics);
      setIsFromCache(true);
      setLastUpdated(sessionCache.lastUpdated);
      setNextUpdate(sessionCache.nextUpdate);
      return true;
    }
    return false;
  }, []);

  // Load trending topics
  const loadTopics = useCallback(async () => {
    // Check session cache first
    if (checkSessionCache()) {
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(`/api/rss/user-trending?limit=${limit}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to load trending topics");
      }

      const data = await response.json();

      if (data.success && data.topics) {
        setTopics(data.topics);
        setIsFromCache(data.cached || false);
        setLastUpdated(data.lastUpdated || null);
        setNextUpdate(data.nextUpdate || null);

        // Update session cache
        sessionCache = {
          topics: data.topics,
          timestamp: Date.now(),
          lastUpdated: data.lastUpdated || null,
          nextUpdate: data.nextUpdate || null,
        };
      } else {
        throw new Error(data.error || "Failed to load topics");
      }
    } catch (err) {
      console.error("Error loading trending topics:", err);
      setError((err as Error).message);

      // Provide fallback topics
      setTopics([
        {
          id: "1",
          title: "AI-powered productivity tools",
          description: "Latest trends in AI productivity",
          source: "Fallback",
          pubDate: new Date().toISOString(),
          relevanceScore: 5,
        },
        {
          id: "2",
          title: "Remote work best practices",
          description: "Effective remote work strategies",
          source: "Fallback",
          pubDate: new Date().toISOString(),
          relevanceScore: 4,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [user, limit, checkSessionCache]);

  // Force refresh (bypasses session cache)
  const refresh = useCallback(async () => {
    sessionCache = null; // Clear session cache
    await loadTopics();
  }, [loadTopics]);

  // Auto-load on mount if requested
  useEffect(() => {
    if (autoLoad && user) {
      loadTopics();
    }
  }, [autoLoad, user, loadTopics]);

  // Optional auto-refresh
  useEffect(() => {
    if (!refreshInterval || !user) return;

    const interval = setInterval(() => {
      loadTopics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, user, loadTopics]);

  return {
    topics,
    isLoading,
    error,
    isFromCache,
    lastUpdated,
    nextUpdate,
    loadTopics,
    refresh,
  };
}
