"use client";

// Data Table Content Component
// Handles different view modes (table, grid, list) for displaying data

import React from "react";

import { MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { BaseItem, ColumnConfig, StatusConfig, SortConfig } from "../types";

interface DataTableContentProps<T extends BaseItem> {
  items: T[];
  columns: ColumnConfig<T>[];
  viewMode: "table" | "grid" | "list" | "kanban";
  selectedIds: Set<string>;
  enableSelection?: boolean;
  enableDragAndDrop?: boolean;
  onToggleSelect?: (id: string) => void;
  onSelectAll?: (checked: boolean) => void;
  onItemClick?: (item: T) => void;
  onSortChange?: (field: string) => void;
  sort?: SortConfig;
  statusConfig?: StatusConfig[];
  statusField?: keyof T;
  itemActions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    handler: (item: T) => void | Promise<void>;
  }>;
  className?: string;
}

export function DataTableContent<T extends BaseItem>({
  items,
  columns,
  viewMode,
  selectedIds,
  enableSelection,
  onToggleSelect,
  onSelectAll,
  onItemClick,
  onSortChange,
  sort,
  statusConfig,
  statusField,
  itemActions,
  className,
}: DataTableContentProps<T>) {
  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const someSelected = items.some((item) => selectedIds.has(item.id));

  // Get status config for an item
  const getStatusConfig = (item: T): StatusConfig | undefined => {
    if (!statusConfig || !statusField) return undefined;
    const statusValue = item[statusField];
    return statusConfig.find((s) => s.key === statusValue);
  };

  // Get status badge color classes
  const getStatusColor = (color: StatusConfig["color"]) => {
    const colors = {
      neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
      primary: "bg-primary-100 text-primary-700 border-primary-200",
      success: "bg-success-100 text-success-700 border-success-200",
      warning: "bg-warning-100 text-warning-700 border-warning-200",
      destructive: "bg-destructive-100 text-destructive-700 border-destructive-200",
      brand: "bg-brand-100 text-brand-700 border-brand-200",
    };
    return colors[color];
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const status = getStatusConfig(item);

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4",
                "cursor-pointer transition-all hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]",
                isSelected && "border-primary-300 bg-primary-50",
              )}
              onClick={() => onItemClick?.(item)}
            >
              {/* Selection checkbox */}
              {enableSelection && (
                <div className="mb-3 flex items-center justify-between">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      onToggleSelect?.(item.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="border-neutral-300"
                  />

                  {/* Item actions */}
                  {itemActions && itemActions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="rounded p-1 transition-colors hover:bg-neutral-200">
                          <MoreVertical className="h-4 w-4 text-neutral-600" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {itemActions.map((action) => (
                          <DropdownMenuItem
                            key={action.key}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.handler(item);
                            }}
                          >
                            {action.icon}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}

              {/* Status badge */}
              {status && (
                <Badge className={cn("mb-2", getStatusColor(status.color))}>
                  {status.icon}
                  {status.label}
                </Badge>
              )}

              {/* Content based on columns */}
              <div className="space-y-2">
                {columns.slice(0, 3).map((column) => {
                  const value = column.render ? column.render(item) : item[column.key as keyof T];

                  return (
                    <div key={column.key}>
                      <div className="text-xs text-neutral-500">{column.header}</div>
                      <div className="text-sm font-medium text-neutral-900">{value as React.ReactNode}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {items.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const status = getStatusConfig(item);

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4",
                "cursor-pointer transition-all hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]",
                isSelected && "border-primary-300 bg-primary-50",
              )}
              onClick={() => onItemClick?.(item)}
            >
              <div className="flex items-center gap-4">
                {/* Selection checkbox */}
                {enableSelection && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      onToggleSelect?.(item.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="border-neutral-300"
                  />
                )}

                {/* Content */}
                <div className="flex flex-1 items-center gap-4">
                  {columns.slice(0, 4).map((column) => {
                    const value = column.render ? column.render(item) : item[column.key as keyof T];

                    return (
                      <div key={column.key} className={cn("flex-1", column.className)}>
                        <div className="text-sm text-neutral-900">{value as React.ReactNode}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Status */}
                {status && (
                  <Badge className={cn(getStatusColor(status.color))}>
                    {status.icon}
                    {status.label}
                  </Badge>
                )}

                {/* Actions */}
                {itemActions && itemActions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="rounded p-1 transition-colors hover:bg-neutral-200">
                        <MoreVertical className="h-4 w-4 text-neutral-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {itemActions.map((action) => (
                        <DropdownMenuItem
                          key={action.key}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.handler(item);
                          }}
                        >
                          {action.icon}
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Default table view
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50", className)}>
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="border-b border-neutral-200 hover:bg-transparent">
              {enableSelection && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onCheckedChange={onSelectAll}
                    className="border-neutral-300"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(column.width, column.className)}
                  onClick={() => column.sortable && onSortChange?.(column.key)}
                  style={{ cursor: column.sortable ? "pointer" : "default" }}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sort?.field === column.key && (
                      <span className="text-xs">{sort.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
              ))}
              {itemActions && itemActions.length > 0 && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const status = getStatusConfig(item);

              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-neutral-100",
                    isSelected && "bg-primary-50 hover:bg-primary-100",
                  )}
                  onClick={() => onItemClick?.(item)}
                >
                  {enableSelection && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect?.(item.id)}
                        className="border-neutral-300"
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = column.render ? column.render(item) : item[column.key as keyof T];

                    return (
                      <TableCell key={column.key} className={column.className}>
                        {column.key === statusField && status ? (
                          <Badge className={cn(getStatusColor(status.color))}>
                            {status.icon}
                            {status.label}
                          </Badge>
                        ) : (
                          (value as React.ReactNode)
                        )}
                      </TableCell>
                    );
                  })}
                  {itemActions && itemActions.length > 0 && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded p-1 transition-colors hover:bg-neutral-200">
                            <MoreVertical className="h-4 w-4 text-neutral-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {itemActions.map((action) => (
                            <DropdownMenuItem key={action.key} onClick={() => action.handler(item)}>
                              {action.icon}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
