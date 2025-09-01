"use client";

// Main Data Table Template Component
// A highly configurable and reusable template for data-driven interfaces

import React, { useMemo } from "react";

import { AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { DataTableBulkActions } from "./components/data-table-bulk-actions";
import { DataTableContent } from "./components/data-table-content";
import { DataTableEmptyState } from "./components/data-table-empty-state";
import { DataTableHeader } from "./components/data-table-header";
import { DataTableSkeleton } from "./components/data-table-skeleton";
import { useDataTable } from "./hooks/use-data-table";
import { BaseItem, DataTableTemplateProps, DataTableState } from "./types";

export function DataTableTemplate<T extends BaseItem>({
  config,
  data: externalData,
  apiConfig,
  events,
  className,
}: DataTableTemplateProps<T>) {
  // Use either external data or internal data fetching
  const internalDataHook = useDataTable<T>({
    apiConfig,
    defaultFilters: {},
    defaultSort: config.defaultSort,
    defaultViewMode: config.defaultViewMode,
    queryKey: config.title.toLowerCase().replace(/\s+/g, "-"),
  });

  // Determine which data source to use
  const data = externalData || internalDataHook.data;
  const state = externalData
    ? ({
        items: data.items,
        selectedIds: new Set<string>(),
        filters: {},
        sort: config.defaultSort || { field: "id", direction: "asc" },
        viewMode: config.defaultViewMode || "table",
        searchQuery: "",
        page: 0,
      } as DataTableState<T>)
    : internalDataHook.state;

  // Actions from internal hook or custom handlers
  const actions = externalData ? null : internalDataHook.actions;

  // Infinite scroll observer
  const { ref: loadMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && data.hasMore && !data.isFetchingNextPage && data.fetchNextPage) {
        data.fetchNextPage();
      }
    },
  });

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!state.searchQuery || !config.enableSearch) {
      return data.items;
    }

    const query = state.searchQuery.toLowerCase();
    const searchFields = config.searchFields || ["id"];

    return data.items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(query);
      }),
    );
  }, [data.items, state.searchQuery, config.enableSearch, config.searchFields]);

  // Selected items
  const selectedItems = useMemo(
    () => filteredItems.filter((item) => state.selectedIds.has(item.id)),
    [filteredItems, state.selectedIds],
  );

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    if (actions) {
      actions.setFilters({ ...state.filters, [key]: value });
    }
    events?.onFilterChange?.({ ...state.filters, [key]: value });
  };

  // Handle search change
  const handleSearchChange = (query: string) => {
    if (actions) {
      actions.setSearchQuery(query);
    }
    events?.onSearchChange?.(query);
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    const newDirection = state.sort.field === field && state.sort.direction === "asc" ? "desc" : "asc";

    const newSort = { field, direction: newDirection };

    if (actions) {
      actions.setSort(newSort);
    }
    events?.onSortChange?.(newSort);
  };

  // Handle selection
  const handleToggleSelect = (id: string) => {
    if (actions) {
      actions.toggleSelection(id);
    }

    const newIds = new Set(state.selectedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    events?.onSelectionChange?.(newIds);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (actions) {
        actions.selectAll();
      }
      const allIds = new Set(filteredItems.map((item) => item.id));
      events?.onSelectionChange?.(allIds);
    } else {
      if (actions) {
        actions.clearSelection();
      }
      events?.onSelectionChange?.(new Set());
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (actionKey: string) => {
    const action = config.bulkActions?.find((a) => a.key === actionKey);
    if (action && selectedItems.length > 0) {
      await action.handler(selectedItems);
      if (actions) {
        actions.clearSelection();
      }
      events?.onSelectionChange?.(new Set());
    }
  };

  // Empty state check
  const isEmpty = !data.isLoading && filteredItems.length === 0;

  return (
    <div className={cn("slideout-layout-container", config.containerClassName)}>
      <main className={cn("main-content flex h-full flex-col", className)}>
        {/* Header */}
        <DataTableHeader
          config={config}
          itemCount={filteredItems.length}
          totalCount={data.totalCount}
          searchQuery={state.searchQuery}
          filters={state.filters}
          viewMode={state.viewMode}
          onAddClick={config.addAction?.handler}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onViewModeChange={(mode) => {
            if (actions) {
              actions.setViewMode(mode);
            }
            events?.onViewModeChange?.(mode);
          }}
        />

        {/* Custom header */}
        {config.customHeader}

        {/* Bulk actions toolbar */}
        {config.enableBulkActions && (
          <AnimatePresence>
            {state.selectedIds.size > 0 && (
              <DataTableBulkActions
                selectedCount={state.selectedIds.size}
                bulkActions={config.bulkActions || []}
                onAction={handleBulkAction}
                onClearSelection={() => {
                  if (actions) {
                    actions.clearSelection();
                  }
                  events?.onSelectionChange?.(new Set());
                }}
              />
            )}
          </AnimatePresence>
        )}

        {/* Content area */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Loading state */}
            {data.isLoading && <DataTableSkeleton columns={config.columns.length} rows={5} viewMode={state.viewMode} />}

            {/* Error state */}
            {data.isError && (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="text-destructive-500 mb-4 h-12 w-12" />
                <p className="mb-2 font-medium text-neutral-900">Failed to load {config.title.toLowerCase()}</p>
                {data.refetch && (
                  <button
                    onClick={() => data.refetch()}
                    className="rounded-[var(--radius-button)] bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            {/* Empty state */}
            {isEmpty && config.emptyState && <DataTableEmptyState config={config.emptyState} />}

            {/* Content */}
            {!data.isLoading && !data.isError && !isEmpty && (
              <>
                <DataTableContent
                  items={filteredItems}
                  columns={config.columns}
                  viewMode={state.viewMode}
                  selectedIds={state.selectedIds}
                  enableSelection={config.enableSelection}
                  enableDragAndDrop={config.enableDragAndDrop}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onItemClick={config.onItemClick}
                  onSortChange={handleSortChange}
                  sort={state.sort}
                  statusConfig={config.statusConfig}
                  statusField={config.statusField}
                  itemActions={config.itemActions}
                  className={config.tableClassName}
                />

                {/* Load more trigger for infinite scroll */}
                {config.enableInfiniteScroll && data.hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    {data.isFetchingNextPage ? (
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

        {/* Custom footer */}
        {config.customFooter}
      </main>
    </div>
  );
}

// Export types for consumers
export type { DataTableTemplateConfig, BaseItem } from "./types";
