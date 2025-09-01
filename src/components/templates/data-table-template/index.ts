// Data Table Template Exports
// Central export point for the template system

export { DataTableTemplate } from "./data-table-template";
export { useDataTable } from "./hooks/use-data-table";

// Export all types
export type {
  BaseItem,
  ColumnConfig,
  FilterConfig,
  SortConfig,
  ViewMode,
  BulkActionConfig,
  StatusConfig,
  DataTableTemplateConfig,
  DataTableTemplateProps,
  DataFetchResult,
  DataTableState,
  DataTableEvents,
  DataTableApiConfig,
} from "./types";

// Export individual components for custom usage
export { DataTableHeader } from "./components/data-table-header";
export { DataTableContent } from "./components/data-table-content";
export { DataTableBulkActions } from "./components/data-table-bulk-actions";
export { DataTableEmptyState } from "./components/data-table-empty-state";
export { DataTableSkeleton } from "./components/data-table-skeleton";
