"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, ExternalLink, Pencil, Tags, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Script } from "@/types/script";

export function libraryColumns(actions: {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Script>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 36,
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ExternalLink className="text-muted-foreground h-4 w-4" />
          <span className="truncate font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
    },
    {
      accessorKey: "platform",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Platform" />,
      cell: ({ row }) =>
        row.original.platform ? (
          <Badge variant="outline">{row.original.platform}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      enableSorting: false,
    },
    {
      accessorKey: "tags",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tags" />,
      cell: ({ row }) => (
        <div className="flex max-w-[280px] flex-wrap gap-2">
          {row.original.tags?.length ? (
            row.original.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="gap-1">
                <Tags className="h-3 w-3" /> {tag}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
          {row.original.tags && row.original.tags.length > 3 ? (
            <Badge variant="secondary">+{row.original.tags.length - 3}</Badge>
          ) : null}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => (
        <div className="text-muted-foreground inline-flex items-center gap-1 tabular-nums">
          <CalendarClock className="h-4 w-4" />
          {new Date(row.original.updatedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => actions.onEdit(row.original.id)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => actions.onDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
