# Data Table Template

A highly configurable and reusable template for creating data-driven table interfaces with support for multiple view modes, filtering, sorting, bulk actions, and more.

## Features

- **Multiple View Modes**: Table, Grid, List, and Kanban layouts
- **Advanced Filtering**: Search, multi-select, date ranges, and custom filters
- **Sorting**: Column-based sorting with visual indicators
- **Bulk Actions**: Select multiple items and perform batch operations
- **Infinite Scroll**: Automatic pagination with scroll-based loading
- **Drag & Drop**: Reorder items (when enabled)
- **Status Management**: Visual status indicators with customizable colors
- **Empty States**: Customizable empty state with actions
- **Responsive Design**: Adapts to different screen sizes
- **TypeScript Support**: Full type safety with generics

## Quick Start

### Basic Usage

```tsx
import { DataTableTemplate } from "@/components/templates/data-table-template";

// Define your data type
interface Task {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  assignee: string;
  dueDate: Date;
}

// Configure the template
const config = {
  title: "Tasks",
  columns: [
    {
      key: "title",
      header: "Title",
      sortable: true,
      searchable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (task) => <StatusBadge status={task.status} />,
    },
    {
      key: "assignee",
      header: "Assignee",
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (task) => formatDate(task.dueDate),
    },
  ],
  enableSearch: true,
  enableSelection: true,
  enableBulkActions: true,
};

// Use the template
export function TasksPage() {
  const { data, isLoading } = useTasksData();
  
  return (
    <DataTableTemplate
      config={config}
      data={{
        items: data?.tasks || [],
        isLoading,
        isError: false,
      }}
    />
  );
}
```

### With API Integration

```tsx
const apiConfig = {
  endpoint: "/api/tasks",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  pageSize: 20,
};

export function TasksWithApi() {
  return (
    <DataTableTemplate
      config={config}
      apiConfig={apiConfig}
    />
  );
}
```

## Configuration Options

### Core Configuration

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | The main title of the table |
| `description` | `string` | Optional subtitle or description |
| `icon` | `ReactNode` | Optional icon to display with title |
| `columns` | `ColumnConfig[]` | Column definitions |
| `filters` | `FilterConfig[]` | Filter configurations |
| `bulkActions` | `BulkActionConfig[]` | Bulk action definitions |

### Column Configuration

```tsx
interface ColumnConfig<T> {
  key: keyof T | string;
  header: string;
  width?: string;           // CSS width (e.g., "200px", "min-w-[300px]")
  sortable?: boolean;        // Enable sorting for this column
  searchable?: boolean;      // Include in search
  render?: (item: T) => ReactNode;  // Custom render function
  className?: string;        // Additional CSS classes
}
```

### Filter Configuration

```tsx
interface FilterConfig<T> {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date" | "daterange" | "search" | "boolean";
  options?: Array<{ value: any; label: string }>;
  icon?: ReactNode;
  placeholder?: string;
  defaultValue?: any;
}
```

### Bulk Action Configuration

```tsx
interface BulkActionConfig<T> {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "destructive" | "warning";
  handler: (items: T[]) => void | Promise<void>;
  confirmRequired?: boolean;
  confirmMessage?: string;
}
```

## Advanced Examples

### With Custom Components

```tsx
const config = {
  title: "Products",
  
  columns: [
    {
      key: "image",
      header: "",
      width: "w-[60px]",
      render: (product) => (
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-10 h-10 rounded object-cover"
        />
      ),
    },
    {
      key: "name",
      header: "Product",
      render: (product) => (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-xs text-neutral-500">{product.sku}</div>
        </div>
      ),
    },
  ],
  
  bulkActions: [
    {
      key: "export",
      label: "Export",
      icon: <Download className="mr-2 h-4 w-4" />,
      handler: async (products) => {
        await exportToCSV(products);
        toast.success("Products exported");
      },
    },
  ],
  
  emptyState: {
    title: "No products yet",
    description: "Add your first product to get started",
    icon: <Package className="h-16 w-16" />,
    action: {
      label: "Add Product",
      handler: () => router.push("/products/new"),
    },
  },
};
```

### With Status Management

```tsx
const statusConfig = [
  {
    key: "pending",
    label: "Pending",
    color: "warning",
    icon: <Clock className="mr-1 h-3 w-3" />,
  },
  {
    key: "approved",
    label: "Approved",
    color: "success",
    icon: <Check className="mr-1 h-3 w-3" />,
  },
  {
    key: "rejected",
    label: "Rejected",
    color: "destructive",
    icon: <X className="mr-1 h-3 w-3" />,
  },
];

const config = {
  title: "Approvals",
  statusConfig,
  statusField: "status",
  // ... other config
};
```

### With Multiple View Modes

```tsx
const config = {
  title: "Content Library",
  viewModes: ["table", "grid", "list"],
  defaultViewMode: "grid",
  
  columns: [
    // Columns for table view
  ],
  
  // Grid view will automatically use first 3 columns
  // List view will use first 4 columns
};
```

## Using with Custom Data Hook

```tsx
import { useDataTable } from "@/components/templates/data-table-template";

export function CustomDataTable() {
  const { state, data, actions } = useDataTable({
    queryKey: "custom-data",
    apiConfig: {
      endpoint: "/api/custom",
    },
    defaultSort: { field: "createdAt", direction: "desc" },
    onDataFetch: (items) => {
      // Transform data if needed
      return items.map(item => ({
        ...item,
        displayName: `${item.firstName} ${item.lastName}`,
      }));
    },
  });

  return (
    <DataTableTemplate
      config={config}
      data={data}
      events={{
        onFilterChange: actions.setFilters,
        onSortChange: actions.setSort,
        onSearchChange: actions.setSearchQuery,
      }}
    />
  );
}
```

## Event Handlers

```tsx
const events = {
  onFilterChange: (filters) => console.log("Filters:", filters),
  onSortChange: (sort) => console.log("Sort:", sort),
  onSearchChange: (query) => console.log("Search:", query),
  onViewModeChange: (mode) => console.log("View mode:", mode),
  onSelectionChange: (selectedIds) => console.log("Selected:", selectedIds),
  onItemsChange: (items) => console.log("Items changed:", items),
  onPageChange: (page) => console.log("Page:", page),
};

<DataTableTemplate config={config} data={data} events={events} />
```

## Styling

The template follows the application's design system with support for:

- Soft UI principles with subtle shadows and smooth transitions
- Numbered color variants (neutral-200, primary-500, etc.)
- Consistent spacing on 4px grid
- Responsive breakpoints

### Custom Styling

```tsx
const config = {
  className: "custom-table",
  containerClassName: "custom-container",
  tableClassName: "custom-table-content",
  // ... other config
};
```

## TypeScript

The template is fully typed with generics for maximum type safety:

```tsx
import { DataTableTemplateConfig, BaseItem } from "@/components/templates/data-table-template";

interface MyItem extends BaseItem {
  name: string;
  value: number;
  // ... your fields
}

const config: DataTableTemplateConfig<MyItem> = {
  // Full intellisense and type checking
};
```

## Migration Guide

### From Content Inbox

1. Define your data type extending `BaseItem`
2. Map your columns to `ColumnConfig`
3. Convert filters to `FilterConfig`
4. Map bulk actions to `BulkActionConfig`
5. Replace the component with `DataTableTemplate`

Example migration:

```tsx
// Before
<ContentInbox className="my-class" />

// After
<DataTableTemplate
  config={contentInboxConfig}
  data={contentData}
  className="my-class"
/>
```

## Best Practices

1. **Performance**: Use `useMemo` for column and filter configurations
2. **Search**: Only mark searchable columns that contain text
3. **Sorting**: Only enable on columns with comparable values
4. **Bulk Actions**: Always provide confirmation for destructive actions
5. **Empty States**: Provide clear actions for users to get started
6. **Loading**: Show skeletons while data is loading
7. **Error States**: Provide retry mechanisms for failed requests

## API Reference

For complete API documentation, see the TypeScript definitions in:
- `/types/index.ts` - All type definitions
- `/hooks/use-data-table.ts` - Data fetching hook
- `/DataTableTemplate.tsx` - Main component