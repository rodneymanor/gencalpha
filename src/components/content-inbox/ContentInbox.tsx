"use client";

// Main Content Inbox Component with Table View and Slideout Panels

import React, { useState, useCallback, useEffect } from "react";

import { AnimatePresence } from "framer-motion";
import { Plus, Loader2, AlertCircle, Inbox } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkeletonTable } from "@/components/ui/skeleton";
import { UnifiedSlideout, ClaudeArtifactConfig } from "@/components/ui/unified-slideout";
import { cn } from "@/lib/utils";

// Import components
import { AddContentForm } from "./components/AddContentForm";
import { BulkActionsToolbar } from "./components/BulkActionsToolbar";
import { ContentTable } from "./components/ContentTable";
import { ContentViewer } from "./components/ContentViewer";
import { SearchFilterBar } from "./components/SearchFilterBar";

// Import types and hooks
import { 
  useContentItems, 
  useDeleteContent, 
  useBulkAction, 
  useAddContent 
} from "./hooks/use-content-inbox";
import { ContentItem, FilterOptions, SortOptions, BulkAction } from "./types";

interface ContentInboxProps {
  className?: string;
}

export const ContentInbox: React.FC<ContentInboxProps> = ({ className }) => {
  // State
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOptions>({
    field: "savedAt",
    direction: "desc",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddSlideoutOpen, setIsAddSlideoutOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);

  // Queries and mutations
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useContentItems(
    filters,
    sort,
  );

  const deleteContentMutation = useDeleteContent();
  const bulkActionMutation = useBulkAction();
  const addContentMutation = useAddContent();

  // Infinite scroll observer
  const { ref: loadMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  // Update local items when data changes
  useEffect(() => {
    if (data?.pages) {
      const allItems = data.pages.flatMap((page) => page.items ?? []);
      setItems(allItems);
    }
  }, [data]);

  // Check for onboarding content on first load
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Import auth to get the current user
        const { auth } = await import("@/lib/firebase");
        const user = auth.currentUser;
        
        if (!user) {
          console.log("No authenticated user, skipping onboarding check");
          return;
        }
        
        const token = await user.getIdToken();
        const response = await fetch("/api/content-inbox/check-onboarding", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.gettingStartedAdded && !result.hasContent) {
            // Refresh the content list to show the new getting started note
            refetch();
          }
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
      }
    };

    checkOnboarding();
  }, []); // Only run once on mount

  // Select/deselect all
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allIds = new Set(items.map((item) => item.id));
        setSelectedIds(allIds);
      } else {
        setSelectedIds(new Set());
      }
    },
    [items],
  );

  // Toggle item selection
  const handleToggleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  // Handle item click to open viewer
  const handleItemClick = useCallback((item: ContentItem) => {
    setSelectedItem(item);
  }, []);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      await deleteContentMutation.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success(`Deleted ${selectedIds.size} items`);
    } catch (error) {
      toast.error("Failed to delete items");
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action: BulkAction) => {
    if (selectedIds.size === 0) return;

    try {
      await bulkActionMutation.mutateAsync({
        ids: Array.from(selectedIds),
        action,
      });
      setSelectedIds(new Set());
      toast.success("Action completed successfully");
    } catch (error) {
      toast.error("Failed to perform action");
    }
  };

  // Handle content deletion from viewer
  const handleDelete = async (id: string) => {
    try {
      await deleteContentMutation.mutateAsync([id]);
      setSelectedItem(null);
      toast.success("Content deleted");
    } catch (error) {
      toast.error("Failed to delete content");
    }
  };

  // Handle add content
  const handleAddContent = async (data: Parameters<typeof addContentMutation.mutateAsync>[0]) => {
    await addContentMutation.mutateAsync(data);
    toast.success("Content added successfully");
  };

  // Handle edit from viewer
  const handleEdit = (item: ContentItem) => {
    // For now, just close the viewer
    // In future, could open an edit form
    setSelectedItem(null);
    toast.info("Edit functionality coming soon");
  };

  // Handle copy transcript
  const handleCopyTranscript = (text: string) => {
    toast.success("Transcript copied to clipboard");
  };

  // Calculate stats
  const totalItems = items.length;
  const selectedCount = selectedIds.size;

  // Empty state
  if (!isLoading && items.length === 0 && !isError) {
    return (
      <div className={cn("flex h-full flex-col", className)}>
        <div className="border-b border-neutral-200 p-6">
          <h1 className="mb-4 text-2xl font-semibold text-neutral-900">Content Inbox</h1>
          <SearchFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            viewMode="list"
            onViewModeChange={() => {}}
            totalItems={0}
            selectedCount={0}
          />
        </div>

        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <Inbox className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
            <h3 className="mb-2 text-lg font-medium text-neutral-900">No content saved yet</h3>
            <p className="mb-6 text-neutral-600">
              Start building your content library by adding videos and links you want to reference later.
            </p>
            <Button
              onClick={() => setIsAddSlideoutOpen(true)}
              className="gap-2"
              variant="soft"
            >
              <Plus className="h-4 w-4" />
              Add First Content
            </Button>
          </div>
        </div>

        {/* Add Content Slideout */}
        <UnifiedSlideout
          isOpen={isAddSlideoutOpen}
          onClose={() => setIsAddSlideoutOpen(false)}
          config={{
            ...ClaudeArtifactConfig,
            width: "md",
            showHeader: false,
            showCloseButton: false,
          }}
        >
          <AddContentForm
            onClose={() => setIsAddSlideoutOpen(false)}
            onSubmit={handleAddContent}
            isSubmitting={addContentMutation.isPending}
          />
        </UnifiedSlideout>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="border-b border-neutral-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Content Inbox</h1>
          <Button
            onClick={() => setIsAddSlideoutOpen(true)}
            className="gap-2"
            variant="soft"
          >
            <Plus className="h-4 w-4" />
            Add Content
          </Button>
        </div>

        <SearchFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          viewMode="list"
          onViewModeChange={() => {}}
          totalItems={totalItems}
          selectedCount={selectedCount}
        />
      </div>

      {/* Bulk actions toolbar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <BulkActionsToolbar
            selectedCount={selectedCount}
            onDelete={handleBulkDelete}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        )}
      </AnimatePresence>

      {/* Content area */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Loading state */}
          {isLoading && <SkeletonTable rows={5} columns={9} />}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="mb-4 h-12 w-12 text-destructive-500" />
              <p className="mb-2 font-medium text-neutral-900">Failed to load content</p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          )}

          {/* Content Table */}
          {!isLoading && !isError && items.length > 0 && (
            <>
              <ContentTable
                items={items}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onItemClick={handleItemClick}
                isLoading={isLoading}
              />

              {/* Load more trigger */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {isFetchingNextPage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                  ) : (
                    <span className="text-sm text-neutral-500">Load more</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Content Viewer Slideout */}
      <UnifiedSlideout
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        config={{
          ...ClaudeArtifactConfig,
          width: "lg",
          showHeader: false,
          showCloseButton: false,
        }}
      >
        <ContentViewer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCopyTranscript={handleCopyTranscript}
        />
      </UnifiedSlideout>

      {/* Add Content Slideout */}
      <UnifiedSlideout
        isOpen={isAddSlideoutOpen}
        onClose={() => setIsAddSlideoutOpen(false)}
        config={{
          ...ClaudeArtifactConfig,
          width: "md",
          showHeader: false,
          showCloseButton: false,
        }}
      >
        <AddContentForm
          onClose={() => setIsAddSlideoutOpen(false)}
          onSubmit={handleAddContent}
          isSubmitting={addContentMutation.isPending}
        />
      </UnifiedSlideout>
    </div>
  );
};