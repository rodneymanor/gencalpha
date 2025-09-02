"use client";

// Library Page - Modern library management using DataTableTemplate  
// Unified library with chat history, captured content, and resources

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { DataTableTemplate } from "@/components/templates/data-table-template";
import { listConversations, type ChatConversation } from "@/components/write-chat/services/chat-service";
import { useContentItems } from "@/components/content-inbox/hooks/use-content-inbox";
import { type ContentItem } from "@/components/content-inbox/types";

import { getLibraryConfig } from "./library-config";
import { generateMockData } from "./types";
import { combineDataSources } from "./chat-adapter";
import { combineAllDataSources } from "./content-adapter";

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add ContentInbox data
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  
  // Parse URL parameters for default filters
  const urlSource = searchParams.get('source');
  const urlType = searchParams.get('type');
  const urlPlatform = searchParams.get('platform');
  
  // Build initial filters from URL parameters
  const initialFilters = useMemo(() => {
    const filters: Record<string, string[]> = {};
    
    if (urlSource) {
      filters.contentSource = [urlSource];
    }
    
    if (urlType) {
      filters.type = [urlType];
    }
    
    if (urlPlatform) {
      filters.platform = [urlPlatform];
    }
    
    return filters;
  }, [urlSource, urlType, urlPlatform]);
  
  // Load ContentInbox data using the existing hook
  const { 
    data: contentData, 
    isLoading: contentLoading,
    isError: contentError,
    refetch: refetchContent 
  } = useContentItems({}, { field: "savedAt", direction: "desc" });
  
  // Load chat conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const chats = await listConversations();
        setConversations(chats);
      } catch (err) {
        setError("Failed to load conversations");
        console.error("Failed to load conversations:", err);
        toast.error("Failed to load chat conversations");
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, []);
  
  // Extract content items from paginated data
  useEffect(() => {
    if (contentData?.pages) {
      const allContent = contentData.pages.flatMap(page => page.items ?? []);
      setContentItems(allContent);
    }
  }, [contentData]);
  
  // Generate mock data for demo (other library items)
  const mockData = useMemo(() => generateMockData(), []);
  
  // Combine all data sources: chats + content + mock data
  const combinedData = useMemo(
    () => combineAllDataSources(conversations, contentItems, mockData),
    [conversations, contentItems, mockData]
  );
  
  // State for active filters
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(initialFilters);
  
  // Apply filters to combined data
  const filteredData = useMemo(() => {
    let filtered = [...combinedData];
    
    // Filter by content source
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeFilters.contentSource?.length > 0) {
      filtered = filtered.filter(item => {
        if (activeFilters.contentSource.includes('chat')) {
          return item.tags.includes('chat');
        }
        if (activeFilters.contentSource.includes('captured')) {
          return item.tags.includes('captured');
        }
        return false;
      });
    }
    
    // Filter by type
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeFilters.type?.length > 0) {
       filtered = filtered.filter(item => {
         // For the new type system, match against tags for platform-specific types
         if (activeFilters.type.includes('chat') && item.tags.includes('chat')) return true;
         if (activeFilters.type.includes('tiktok') && item.tags.includes('tiktok')) return true;
         if (activeFilters.type.includes('instagram') && item.tags.includes('instagram')) return true;
         if (activeFilters.type.includes('note') && item.type === 'note') return true;
         return false;
       });
     }
     
    // Filter by category
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeFilters.category?.length > 0) {
       filtered = filtered.filter(item => activeFilters.category.includes(item.category));
     }
    
    // Filter by platform
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeFilters.platform?.length > 0) {
      filtered = filtered.filter(item => {
        // Check if any of the item's tags match the selected platforms
        return item.tags.some(tag => activeFilters.platform.includes(tag));
      });
    }
    
    return filtered;
  }, [combinedData, activeFilters]);
  
  // Get configuration with custom handlers for chats
  const config = useMemo(() => {
    const baseConfig = getLibraryConfig();
    
    // Override item click handler to navigate to chats
    return {
      ...baseConfig,
      onItemClick: (item) => {
        // If it's a chat (has url starting with /write), navigate to it
        if (item.url?.startsWith('/write')) {
          router.push(item.url);
        } else if (item.url?.startsWith('/idea-inbox')) {
          // If it's a content item, open in idea inbox
          router.push(item.url);
        } else {
          console.log("Item clicked:", item);
          toast.info(`Opening ${item.title}`);
        }
      },
      // Update item actions to handle chats properly
      itemActions: [
        {
          key: "open",
          label: "Open",
          icon: baseConfig.itemActions?.[0]?.icon,
          handler: (item) => {
            if (item.url?.startsWith('/write')) {
              router.push(item.url);
            } else if (item.url?.startsWith('/idea-inbox')) {
              router.push(item.url);
            } else {
              toast.info(`Opening ${item.title}`);
            }
          },
        },
        {
          key: "edit",
          label: "Edit",
          icon: baseConfig.itemActions?.[1]?.icon,
          handler: (item) => {
            if (item.url?.startsWith('/write')) {
              // For chats, open in edit mode
              router.push(item.url);
            } else if (item.tags.includes('captured')) {
              toast.info(`Content items can be viewed but not directly edited`);
            } else {
              toast.info(`Editing ${item.title}`);
            }
          },
        },
        ...(baseConfig.itemActions?.slice(2) ?? []),
      ],
    };
  }, [router]);

  // Data result for the template
  const dataResult = {
    items: filteredData,
    isLoading: loading || contentLoading,
    isError: !!error || contentError,
    hasMore: false,
    totalCount: filteredData.length,
    refetch: async () => {
      setLoading(true);
      try {
        const chats = await listConversations();
        setConversations(chats);
        await refetchContent();
      } catch (err) {
        console.error("Failed to reload data:", err);
        toast.error("Failed to reload data");
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <div className="h-full">
      <DataTableTemplate
        config={config}
        data={dataResult}
        initialFilters={initialFilters}
        events={{
          onFilterChange: (filters) => {
            console.log("Filters changed:", filters);
            // Update active filters state
            setActiveFilters(filters);
            
            // Update URL to reflect current filters
            const params = new URLSearchParams();
            if (filters.contentSource?.length) {
              params.set('source', filters.contentSource[0]);
            }
            if (filters.type?.length) {
              params.set('type', filters.type[0]);
            }
            if (filters.platform?.length) {
              params.set('platform', filters.platform[0]);
            }
            const newUrl = params.toString() ? `/library?${params.toString()}` : '/library';
            window.history.replaceState({}, '', newUrl);
          },
          onSortChange: (sort) => {
            console.log("Sort changed:", sort);
          },
          onSearchChange: (query) => {
            console.log("Search query:", query);
          },
          onViewModeChange: (mode) => {
            console.log("View mode changed:", mode);
          },
          onSelectionChange: (selectedIds) => {
            const selected = filteredData.filter((item) => selectedIds.has(item.id));
            console.log("Selection changed:", selected);
            
            // Track different types of selected content
            const selectedChats = selected.filter(item => item.url?.startsWith('/write'));
            const selectedContent = selected.filter(item => item.tags.includes('captured'));
            
            if (selectedChats.length > 0) {
              console.log(`${selectedChats.length} chat(s) selected`);
            }
            if (selectedContent.length > 0) {
              console.log(`${selectedContent.length} content item(s) selected`);
            }
          },
        }}
      />
    </div>
  );
}