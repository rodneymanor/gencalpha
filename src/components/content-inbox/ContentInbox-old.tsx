"use client";

// Main Content Inbox Component with Infinite Scroll, Virtualization, and Drag-and-Drop

import React, { useState, useCallback, useEffect, useMemo } from "react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { Plus, Loader2, AlertCircle, Inbox } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkeletonContentList } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Import components
import { AddContentModal } from "./components/AddContentModal";
import { BulkActionsToolbar } from "./components/BulkActionsToolbar";
import { ContentCard } from "./components/ContentCard";
import { FloatingActionButton } from "./components/FloatingActionButton";
import { SearchFilterBar } from "./components/SearchFilterBar";

// Import types and hooks
import { useContentItems, useDeleteContent, useBulkAction, useUpdateOrder } from "./hooks/use-content-inbox";
import { ContentItem, FilterOptions, SortOptions, ViewMode, BulkAction } from "./types";

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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);

  // Queries and mutations
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useContentItems(
    filters,
    sort,
  );

  const deleteContentMutation = useDeleteContent();
  const bulkActionMutation = useBulkAction();
  const updateOrderMutation = useUpdateOrder();

  // Infinite scroll observer
  const { ref: loadMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update order in database
      const orderUpdates = newItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      try {
        await updateOrderMutation.mutateAsync(orderUpdates);
        toast.success("Order updated");
      } catch (error) {
        toast.error("Failed to update order");
        // Revert on error
        setItems(items);
      }
    }
  };

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

  // Get active item for drag overlay
  const activeItem = useMemo(() => items.find((item) => item.id === activeId), [activeId, items]);

  // Calculate stats
  const totalItems = items.length;
  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount > 0 && selectedCount === totalItems;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalItems;

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <div className={cn("flex h-full flex-col", className)}>
        <div className="border-b border-neutral-200 p-6">
          <h1 className="mb-4 text-2xl font-semibold text-neutral-900">Content Inbox</h1>
          <SearchFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
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
              onClick={() => setIsAddModalOpen(true)}
              className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Content
            </Button>
          </div>
        </div>

        <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />
        <AddContentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => refetch()} />
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
            onClick={() => setIsAddModalOpen(true)}
            className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Content
          </Button>
        </div>

        <SearchFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
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
          {/* Select all checkbox */}
          {items.length > 0 && (
            <div className="mb-4 flex items-center gap-3">
              <Checkbox checked={isAllSelected} indeterminate={isIndeterminate ? true : undefined} onCheckedChange={handleSelectAll} />
              <span className="text-sm text-neutral-600">Select all {totalItems} items</span>
            </div>
          )}

          {/* Loading state */}
          {isLoading && <SkeletonContentList count={viewMode === "grid" ? 8 : 5} />}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="text-destructive-500 mb-4 h-12 w-12" />
              <p className="mb-2 font-medium text-neutral-900">Failed to load content</p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          )}

          {/* Content grid/list with DnD */}
          {!isLoading && !isError && items.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={viewMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
              >
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "space-y-2",
                  )}
                >
                  {items.map((item) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.has(item.id)}
                      onSelect={(checked) => handleToggleSelect(item.id, checked)}
                      onClick={() => {
                        // Handle item click - open detail view
                        console.log("Open item:", item.id);
                      }}
                      onEdit={() => {
                        // Handle edit
                        console.log("Edit item:", item.id);
                      }}
                      onDelete={async () => {
                        try {
                          await deleteContentMutation.mutateAsync([item.id]);
                          toast.success("Item deleted");
                        } catch (error) {
                          toast.error("Failed to delete item");
                        }
                      }}
                      isDraggable={sort.field === "custom"}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </SortableContext>

              {/* Drag overlay */}
              <DragOverlay>
                {activeItem ? (
                  <div className="opacity-80">
                    <ContentCard
                      item={activeItem}
                      isSelected={false}
                      onSelect={() => {}}
                      onClick={() => {}}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      isDraggable={false}
                      viewMode={viewMode}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

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
        </div>
      </ScrollArea>

      {/* Floating action button */}
      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />

      {/* Add content modal */}
      <AddContentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => refetch()} />
    </div>
  );
};
