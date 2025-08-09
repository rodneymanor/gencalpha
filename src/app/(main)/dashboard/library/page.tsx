"use client";

import { useEffect } from "react";

import { Plus, Trash2, Pencil } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useScriptsApi } from "@/hooks/use-scripts-api";

import { libraryColumns } from "./table-columns";

export default function LibraryPage() {
  const { scripts, loading, error, fetchScripts, deleteScript } = useScriptsApi();

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const table = useDataTableInstance({
    data: scripts,
    columns: libraryColumns({
      onDelete: (id) => deleteScript(id),
      onEdit: (id) => {
        // Placeholder for routing to an editor page
        console.log("Edit script", id);
      },
    }),
    getRowId: (row) => row.id,
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight">Library</h1>
            <p className="text-muted-foreground">Browse and manage your scripts</p>
          </div>
          <div className="flex gap-3">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Script
            </Button>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-input)]">
          <CardHeader>
            <CardTitle>Scripts</CardTitle>
            <CardDescription>Your saved and generated scripts</CardDescription>
          </CardHeader>
          <CardContent className="flex size-full flex-col gap-4">
            <div className="flex items-center justify-between">
              <DataTableViewOptions table={table} />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Columns
                </Button>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Bulk Delete
                </Button>
              </div>
            </div>

            <div className="border-border overflow-hidden rounded-[var(--radius-card)] border">
              <DataTable table={table} columns={table.getAllColumns().map((c) => c.columnDef)} />
            </div>
            <DataTablePagination table={table} />

            {loading && <div className="text-muted-foreground text-sm">Loading…</div>}
            {error && <div className="text-destructive text-sm">{error}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
