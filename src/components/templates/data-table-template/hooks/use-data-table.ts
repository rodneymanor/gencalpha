"use client";

// Generic Data Table Hook
// Provides data fetching, state management, and actions for the template

import { useState, useCallback, useEffect } from "react";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { BaseItem, DataTableApiConfig, DataFetchResult, DataTableState, SortConfig, ViewMode } from "../types";

interface UseDataTableOptions<T extends BaseItem> {
  apiConfig?: DataTableApiConfig;
  defaultFilters?: Record<string, any>;
  defaultSort?: SortConfig;
  defaultViewMode?: ViewMode;
  queryKey: string;
  onDataFetch?: (data: T[]) => T[];
}

export function useDataTable<T extends BaseItem>(
  options: UseDataTableOptions<T>,
): {
  state: DataTableState<T>;
  data: DataFetchResult<T>;
  actions: {
    setFilters: (filters: Record<string, any>) => void;
    setSort: (sort: SortConfig) => void;
    setSearchQuery: (query: string) => void;
    setViewMode: (mode: ViewMode) => void;
    toggleSelection: (id: string) => void;
    selectAll: () => void;
    clearSelection: () => void;
    deleteItems: (ids: string[]) => Promise<void>;
    updateItem: (id: string, updates: Partial<T>) => Promise<void>;
    addItem: (item: Omit<T, "id">) => Promise<void>;
    refetch: () => void;
  };
} {
  const queryClient = useQueryClient();

  // State management
  const [state, setState] = useState<DataTableState<T>>({
    items: [],
    selectedIds: new Set(),
    filters: options.defaultFilters || {},
    sort: options.defaultSort || { field: "id", direction: "asc" },
    viewMode: options.defaultViewMode || "table",
    searchQuery: "",
    page: 0,
  });

  // Data fetching with infinite scroll support
  const dataQuery = useInfiniteQuery({
    queryKey: [options.queryKey, state.filters, state.sort, state.searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      if (!options.apiConfig) {
        // Return mock data if no API config
        return {
          items: [] as T[],
          hasMore: false,
          totalCount: 0,
        };
      }

      const { endpoint, headers, method = "GET", pageSize = 20, queryParams } = options.apiConfig;

      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: pageSize.toString(),
        ...queryParams,
        filters: JSON.stringify(state.filters),
        sort: JSON.stringify(state.sort),
        search: state.searchQuery,
      });

      const url = method === "GET" ? `${endpoint}?${params}` : endpoint;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body:
          method === "POST"
            ? JSON.stringify({
                page: pageParam,
                limit: pageSize,
                filters: state.filters,
                sort: state.sort,
                search: state.searchQuery,
                ...queryParams,
              })
            : undefined,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      // Apply custom data transformation if provided
      if (options.onDataFetch) {
        data.items = options.onDataFetch(data.items);
      }

      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!options.apiConfig,
  });

  // Update local items when data changes
  useEffect(() => {
    if (dataQuery.data?.pages) {
      const allItems = dataQuery.data.pages.flatMap((page) => page.items || []);
      setState((prev) => ({ ...prev, items: allItems }));
    }
  }, [dataQuery.data]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!options.apiConfig) return;

      const response = await fetch(`${options.apiConfig.endpoint}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...options.apiConfig.headers,
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete items");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [options.queryKey] });
      setState((prev) => ({ ...prev, selectedIds: new Set() }));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<T> }) => {
      if (!options.apiConfig) return;

      const response = await fetch(`${options.apiConfig.endpoint}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...options.apiConfig.headers,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [options.queryKey] });
    },
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (item: Omit<T, "id">) => {
      if (!options.apiConfig) return;

      const response = await fetch(options.apiConfig.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.apiConfig.headers,
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [options.queryKey] });
    },
  });

  // Actions
  const setFilters = useCallback((filters: Record<string, any>) => {
    setState((prev) => ({ ...prev, filters, page: 0 }));
  }, []);

  const setSort = useCallback((sort: SortConfig) => {
    setState((prev) => ({ ...prev, sort, page: 0 }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setState((prev) => ({ ...prev, searchQuery, page: 0 }));
  }, []);

  const setViewMode = useCallback((viewMode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode }));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setState((prev) => {
      const newIds = new Set(prev.selectedIds);
      if (newIds.has(id)) {
        newIds.delete(id);
      } else {
        newIds.add(id);
      }
      return { ...prev, selectedIds: newIds };
    });
  }, []);

  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIds: new Set(prev.items.map((item) => item.id)),
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedIds: new Set() }));
  }, []);

  const deleteItems = useCallback(
    async (ids: string[]) => {
      await deleteMutation.mutateAsync(ids);
    },
    [deleteMutation],
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<T>) => {
      await updateMutation.mutateAsync({ id, updates });
    },
    [updateMutation],
  );

  const addItem = useCallback(
    async (item: Omit<T, "id">) => {
      await addMutation.mutateAsync(item);
    },
    [addMutation],
  );

  const refetch = useCallback(() => {
    dataQuery.refetch();
  }, [dataQuery]);

  // Prepare data result
  const data: DataFetchResult<T> = {
    items: state.items,
    isLoading: dataQuery.isLoading,
    isError: dataQuery.isError,
    error: dataQuery.error as Error | undefined,
    hasMore: dataQuery.hasNextPage,
    fetchNextPage: dataQuery.fetchNextPage,
    isFetchingNextPage: dataQuery.isFetchingNextPage,
    refetch: dataQuery.refetch,
    totalCount: dataQuery.data?.pages[0]?.totalCount,
  };

  return {
    state,
    data,
    actions: {
      setFilters,
      setSort,
      setSearchQuery,
      setViewMode,
      toggleSelection,
      selectAll,
      clearSelection,
      deleteItems,
      updateItem,
      addItem,
      refetch,
    },
  };
}
