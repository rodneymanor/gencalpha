// Generic Data Table Template Types
// Provides a flexible type system for creating data-driven table interfaces

import { ReactNode } from "react";

// Generic item type that can be extended
export interface BaseItem {
  id: string;
  [key: string]: any;
}

// Column configuration for table display
export interface ColumnConfig<T extends BaseItem> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

// Filter configuration
export interface FilterConfig<T extends BaseItem> {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date" | "daterange" | "search" | "boolean";
  options?: Array<{ value: any; label: string }>;
  icon?: ReactNode;
  placeholder?: string;
  defaultValue?: any;
}

// Sort configuration
export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

// View modes for different layouts
export type ViewMode = "table" | "grid" | "list" | "kanban";

// Bulk action configuration
export interface BulkActionConfig<T extends BaseItem> {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "destructive" | "warning";
  handler: (items: T[]) => void | Promise<void>;
  confirmRequired?: boolean;
  confirmMessage?: string;
}

// Status configuration for items
export interface StatusConfig {
  key: string;
  label: string;
  color: "neutral" | "primary" | "success" | "warning" | "destructive" | "brand";
  icon?: ReactNode;
}

// Template configuration
export interface DataTableTemplateConfig<T extends BaseItem> {
  // Display configuration
  title: string;
  description?: string;
  icon?: ReactNode;

  // Column configuration
  columns: ColumnConfig<T>[];

  // Filter configuration
  filters?: FilterConfig<T>[];
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];

  // Sort configuration
  defaultSort?: SortConfig;
  sortOptions?: Array<{ field: string; label: string }>;

  // View configuration
  viewModes?: ViewMode[];
  defaultViewMode?: ViewMode;

  // Actions configuration
  bulkActions?: BulkActionConfig<T>[];
  itemActions?: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    handler: (item: T) => void | Promise<void>;
  }>;

  // Status configuration
  statusConfig?: StatusConfig[];
  statusField?: keyof T;

  // Features
  enableSelection?: boolean;
  enableBulkActions?: boolean;
  enableInfiniteScroll?: boolean;
  enableDragAndDrop?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;

  // Empty state
  emptyState?: {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: {
      label: string;
      handler: () => void;
    };
  };

  // Add action
  addAction?: {
    label: string;
    icon?: ReactNode;
    handler: () => void;
  };

  // Item click behavior
  onItemClick?: (item: T) => void;

  // Custom components
  customHeader?: ReactNode;
  customFooter?: ReactNode;

  // Styling
  className?: string;
  containerClassName?: string;
  tableClassName?: string;
}

// Hook return type for data fetching
export interface DataFetchResult<T extends BaseItem> {
  items: T[];
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  hasMore?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  refetch?: () => void;
  totalCount?: number;
}

// State management for the template
export interface DataTableState<T extends BaseItem> {
  items: T[];
  selectedIds: Set<string>;
  filters: Record<string, any>;
  sort: SortConfig;
  viewMode: ViewMode;
  searchQuery: string;
  page: number;
}

// Event handlers
export interface DataTableEvents<T extends BaseItem> {
  onFilterChange?: (filters: Record<string, any>) => void;
  onSortChange?: (sort: SortConfig) => void;
  onSearchChange?: (query: string) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onItemsChange?: (items: T[]) => void;
  onPageChange?: (page: number) => void;
}

// API configuration for data fetching
export interface DataTableApiConfig {
  endpoint: string;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  pageSize?: number;
  queryParams?: Record<string, any>;
}

// Complete template props
export interface DataTableTemplateProps<T extends BaseItem> {
  config: DataTableTemplateConfig<T>;
  data?: DataFetchResult<T>;
  apiConfig?: DataTableApiConfig;
  events?: DataTableEvents<T>;
  className?: string;
}
