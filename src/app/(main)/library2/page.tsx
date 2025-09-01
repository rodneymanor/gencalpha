"use client";

// Library2 Page - Modern library management using DataTableTemplate
// Demonstrates the power and flexibility of the reusable template system

import React, { useMemo } from "react";

import { DataTableTemplate } from "@/components/templates/data-table-template";

import { getLibraryConfig } from "./library-config";
import { generateMockData } from "./types";

export default function Library2Page() {
  // Generate mock data
  const mockData = useMemo(() => generateMockData(), []);
  
  // Get configuration
  const config = useMemo(() => getLibraryConfig(), []);

  // Data result for the template
  const dataResult = {
    items: mockData,
    isLoading: false,
    isError: false,
    hasMore: false,
    totalCount: mockData.length,
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
            const selected = mockData.filter((item) => selectedIds.has(item.id));
            console.log("Selection changed:", selected);
          },
        }}
      />
    </div>
  );
}