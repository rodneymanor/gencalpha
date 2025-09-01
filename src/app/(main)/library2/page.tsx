"use client";

// Library2 Page - Modern library management using DataTableTemplate
// Now connected to real chat history data from the chat service

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DataTableTemplate } from "@/components/templates/data-table-template";
import { listConversations, type ChatConversation } from "@/components/write-chat/services/chat-service";

import { getLibraryConfig } from "./library-config";
import { generateMockData } from "./types";
import { combineDataSources } from "./chat-adapter";

export default function Library2Page() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Generate mock data for demo (other library items)
  const mockData = useMemo(() => generateMockData(), []);
  
  // Combine chat data with mock library data
  const combinedData = useMemo(
    () => combineDataSources(conversations, mockData),
    [conversations, mockData]
  );
  
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
            } else {
              toast.info(`Editing ${item.title}`);
            }
          },
        },
        ...(baseConfig.itemActions?.slice(2) || []),
      ],
    };
  }, [router]);

  // Data result for the template
  const dataResult = {
    items: combinedData,
    isLoading: loading,
    isError: !!error,
    hasMore: false,
    totalCount: combinedData.length,
    refetch: async () => {
      setLoading(true);
      try {
        const chats = await listConversations();
        setConversations(chats);
      } catch (err) {
        console.error("Failed to reload conversations:", err);
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
        events={{
          onFilterChange: (filters) => {
            console.log("Filters changed:", filters);
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
            const selected = combinedData.filter((item) => selectedIds.has(item.id));
            console.log("Selection changed:", selected);
            
            // Track if any chats are selected for special handling
            const selectedChats = selected.filter(item => item.url?.startsWith('/write'));
            if (selectedChats.length > 0) {
              console.log(`${selectedChats.length} chat(s) selected`);
            }
          },
        }}
      />
    </div>
  );
}