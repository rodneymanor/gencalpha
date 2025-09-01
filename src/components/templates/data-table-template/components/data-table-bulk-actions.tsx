"use client";

// Data Table Bulk Actions Component
// Provides bulk action toolbar when items are selected

import React from "react";

import { motion } from "framer-motion";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BulkActionConfig, BaseItem } from "../types";

interface DataTableBulkActionsProps<T extends BaseItem> {
  selectedCount: number;
  bulkActions: BulkActionConfig<T>[];
  onAction: (actionKey: string) => void;
  onClearSelection: () => void;
}

export function DataTableBulkActions<T extends BaseItem>({
  selectedCount,
  bulkActions,
  onAction,
  onClearSelection,
}: DataTableBulkActionsProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-primary-50 border-primary-200 sticky top-0 z-10 border-b px-6 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Selection count */}
          <Badge className="bg-primary-600 text-white">{selectedCount} selected</Badge>

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => {
              const variantClasses = {
                default: "hover:bg-neutral-100",
                destructive: "text-destructive-600 hover:text-destructive-700 hover:bg-destructive-50",
                warning: "text-warning-600 hover:text-warning-700 hover:bg-warning-50",
              };

              return (
                <Button
                  key={action.key}
                  onClick={() => {
                    if (action.confirmRequired) {
                      const confirmed = window.confirm(
                        action.confirmMessage ||
                          `Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} items?`,
                      );
                      if (confirmed) {
                        onAction(action.key);
                      }
                    } else {
                      onAction(action.key);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className={cn(variantClasses[action.variant || "default"])}
                >
                  {action.icon}
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Clear selection */}
        <Button onClick={onClearSelection} variant="ghost" size="sm" className="text-neutral-600">
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      </div>
    </motion.div>
  );
}
