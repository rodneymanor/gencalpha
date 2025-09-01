"use client";

// Example: Personas Table using DataTableTemplate
// Demonstrates how to use the template for a different data type

import React from "react";

import { formatDistanceToNow } from "date-fns";
import { User, Edit, Trash2, Copy, Archive, Star } from "lucide-react";

import { DataTableTemplate, DataTableTemplateConfig, BaseItem } from "@/components/templates/data-table-template";

// Define the Persona type
interface Persona extends BaseItem {
  id: string;
  name: string;
  description: string;
  traits: string[];
  goals: string[];
  painPoints: string[];
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "active" | "archived";
  usageCount: number;
}

// Mock data for demonstration
const mockPersonas: Persona[] = [
  {
    id: "1",
    name: "Tech-Savvy Millennial",
    description: "Early adopter who loves trying new technologies",
    traits: ["Digital native", "Social media active", "Values convenience"],
    goals: ["Stay updated with trends", "Optimize productivity", "Connect with like-minded people"],
    painPoints: ["Information overload", "Privacy concerns", "Subscription fatigue"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    status: "active",
    usageCount: 45,
  },
  {
    id: "2",
    name: "Busy Professional",
    description: "Time-conscious individual balancing work and personal life",
    traits: ["Results-oriented", "Efficiency-focused", "Mobile-first"],
    goals: ["Save time", "Increase productivity", "Maintain work-life balance"],
    painPoints: ["Too many tools", "Complex workflows", "Lack of integration"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    status: "active",
    usageCount: 62,
  },
  {
    id: "3",
    name: "Content Creator",
    description: "Creative individual producing content across multiple platforms",
    traits: ["Creative", "Trend-aware", "Multi-platform user"],
    goals: ["Grow audience", "Monetize content", "Streamline workflow"],
    painPoints: ["Platform limitations", "Algorithm changes", "Content burnout"],
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-12"),
    status: "draft",
    usageCount: 12,
  },
];

export function PersonasTableExample() {
  // Configuration for the personas table
  const config: DataTableTemplateConfig<Persona> = {
    title: "Personas",
    description: "Manage your user personas and audience segments",
    icon: <User className="h-6 w-6" />,

    columns: [
      {
        key: "name",
        header: "Persona",
        width: "min-w-[250px]",
        sortable: true,
        searchable: true,
        render: (persona) => (
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 text-primary-700 flex h-10 w-10 items-center justify-center rounded-full">
              {persona.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-neutral-900">{persona.name}</div>
              <div className="line-clamp-1 text-xs text-neutral-600">{persona.description}</div>
            </div>
          </div>
        ),
      },
      {
        key: "traits",
        header: "Key Traits",
        width: "min-w-[200px]",
        render: (persona) => (
          <div className="flex flex-wrap gap-1">
            {persona.traits.slice(0, 2).map((trait, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700"
              >
                {trait}
              </span>
            ))}
            {persona.traits.length > 2 && (
              <span className="text-xs text-neutral-500">+{persona.traits.length - 2} more</span>
            )}
          </div>
        ),
      },
      {
        key: "usageCount",
        header: "Usage",
        width: "w-[100px]",
        sortable: true,
        render: (persona) => (
          <div className="flex items-center gap-1">
            <span className="font-medium text-neutral-900">{persona.usageCount}</span>
            <span className="text-xs text-neutral-500">times</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "w-[120px]",
      },
      {
        key: "updatedAt",
        header: "Last Updated",
        width: "w-[150px]",
        sortable: true,
        render: (persona) => formatDistanceToNow(persona.updatedAt, { addSuffix: true }),
      },
    ],

    filters: [
      {
        key: "status",
        label: "Status",
        type: "multiselect",
        options: [
          { value: "draft", label: "Draft" },
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ],
      },
      {
        key: "usage",
        label: "Usage",
        type: "select",
        options: [
          { value: "high", label: "High (50+)" },
          { value: "medium", label: "Medium (20-49)" },
          { value: "low", label: "Low (<20)" },
        ],
      },
    ],

    statusConfig: [
      {
        key: "draft",
        label: "Draft",
        color: "neutral",
      },
      {
        key: "active",
        label: "Active",
        color: "success",
      },
      {
        key: "archived",
        label: "Archived",
        color: "warning",
      },
    ],
    statusField: "status",

    bulkActions: [
      {
        key: "delete",
        label: "Delete",
        icon: <Trash2 className="mr-2 h-4 w-4" />,
        variant: "destructive",
        confirmRequired: true,
        handler: async (personas) => {
          console.log("Deleting personas:", personas);
          // Implement delete logic
        },
      },
      {
        key: "duplicate",
        label: "Duplicate",
        icon: <Copy className="mr-2 h-4 w-4" />,
        handler: async (personas) => {
          console.log("Duplicating personas:", personas);
          // Implement duplicate logic
        },
      },
      {
        key: "archive",
        label: "Archive",
        icon: <Archive className="mr-2 h-4 w-4" />,
        handler: async (personas) => {
          console.log("Archiving personas:", personas);
          // Implement archive logic
        },
      },
    ],

    itemActions: [
      {
        key: "edit",
        label: "Edit",
        icon: <Edit className="mr-2 h-4 w-4" />,
        handler: (persona) => {
          console.log("Editing persona:", persona);
          // Navigate to edit page or open modal
        },
      },
      {
        key: "duplicate",
        label: "Duplicate",
        icon: <Copy className="mr-2 h-4 w-4" />,
        handler: (persona) => {
          console.log("Duplicating persona:", persona);
        },
      },
      {
        key: "favorite",
        label: "Add to Favorites",
        icon: <Star className="mr-2 h-4 w-4" />,
        handler: (persona) => {
          console.log("Adding to favorites:", persona);
        },
      },
    ],

    enableSearch: true,
    searchPlaceholder: "Search personas by name or description...",
    searchFields: ["name", "description"],

    defaultSort: { field: "updatedAt", direction: "desc" },

    viewModes: ["table", "grid"],
    defaultViewMode: "table",

    enableSelection: true,
    enableBulkActions: true,

    emptyState: {
      title: "No personas created yet",
      description: "Create your first persona to better understand your target audience",
      icon: <User className="h-16 w-16" />,
      action: {
        label: "Create Persona",
        handler: () => {
          console.log("Opening create persona dialog");
          // Open create dialog or navigate to create page
        },
      },
    },

    addAction: {
      label: "New Persona",
      handler: () => {
        console.log("Creating new persona");
        // Open create dialog or navigate to create page
      },
    },

    onItemClick: (persona) => {
      console.log("Viewing persona:", persona);
      // Open detail view or navigate to detail page
    },
  };

  // Mock data result
  const dataResult = {
    items: mockPersonas,
    isLoading: false,
    isError: false,
    hasMore: false,
    totalCount: mockPersonas.length,
  };

  return (
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
      }}
    />
  );
}
