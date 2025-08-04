"use client";

import { useState, useEffect, useCallback } from "react";

import { Star, Folder, Video, MoreHorizontal, Edit, Trash2, StarOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import { Collection, CollectionsService } from "@/lib/collections";
import { cn } from "@/lib/utils";

import { useCollections } from "./collections-context";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { EditCollectionDialog } from "./edit-collection-dialog";

interface CollectionsSidebarProps {
  selectedCollectionId: string;
  onSelectCollection: (collectionId: string) => void;
}

export function CollectionsSidebar({ selectedCollectionId, onSelectCollection }: CollectionsSidebarProps) {
  const { state, dispatch } = useCollections();
  const { user } = useAuth();
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  const loadCollections = useCallback(async () => {
    if (!user?.uid) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Check if user is super admin for debugging
      const isSuperAdmin = await RBACClientService.isSuperAdmin(user.uid);
      console.log("🔍 [Collections Sidebar] User is super admin:", isSuperAdmin);

      const result = await RBACClientService.getUserCollections(user.uid);
      console.log("🔍 [Collections Sidebar] Loaded collections:", result.collections.length);

      // Sort: favorites first, then by updatedAt desc
      const sortedCollections = [...result.collections].sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      dispatch({ type: "SET_COLLECTIONS", payload: sortedCollections });
    } catch (error) {
      console.error("Failed to load collections:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [user?.uid, dispatch]);

  useEffect(() => {
    if (user?.uid) {
      loadCollections();
    }
  }, [user?.uid, loadCollections]);

  const handleToggleFavorite = async (collection: Collection) => {
    if (!user?.uid || !collection.id) return;

    try {
      const newFavoriteStatus = !collection.favorite;
      await CollectionsService.setFavorite(user.uid, collection.id, newFavoriteStatus);

      dispatch({
        type: "UPDATE_COLLECTION",
        payload: {
          id: collection.id,
          updates: { favorite: newFavoriteStatus },
        },
      });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleDeleteCollection = async (collection: Collection) => {
    if (!user?.uid || !collection.id) return;

    try {
      await CollectionsService.deleteCollection(user.uid, collection.id);
      dispatch({ type: "DELETE_COLLECTION", payload: collection.id });

      // If we're deleting the selected collection, switch to all-videos
      if (selectedCollectionId === collection.id) {
        onSelectCollection("all-videos");
      }
    } catch (error) {
      console.error("Failed to delete collection:", error);
    }
  };

  if (state.loading) {
    return (
      <div className="flex h-full flex-col overflow-hidden p-4">
        {/* Header */}
        <div className="flex h-[52px] items-center justify-center px-2">
          <div className="border-input flex w-full items-center gap-2 rounded-md border bg-transparent px-3 py-2 text-sm">
            <Folder className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate font-medium">Collections</span>
          </div>
        </div>

        {/* Separator */}
        <div className="bg-border h-[1px] w-full shrink-0"></div>

        {/* Loading Skeletons */}
        <div className="flex flex-col gap-4 py-2">
          <nav className="grid gap-1 px-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={`skeleton-${index}`} className="h-8 w-full" />
            ))}
          </nav>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden p-4">
        {/* Header */}
        <div className="flex h-[52px] items-center justify-center px-2">
          <div className="border-input flex w-full items-center gap-2 rounded-md border bg-transparent px-3 py-2 text-sm">
            <Folder className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate font-medium">Collections</span>
          </div>
        </div>

        {/* Separator */}
        <div className="bg-border h-[1px] w-full shrink-0"></div>

        {/* Main Navigation */}
        <div className="flex flex-col gap-4 py-2">
          <nav className="grid gap-1 px-2">
            {/* All Videos */}
            <button
              onClick={() => onSelectCollection("all-videos")}
              className={cn(
                "focus-visible:ring-ring inline-flex h-8 items-center justify-start gap-2 rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                selectedCollectionId === "all-videos"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow"
                  : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Video className="mr-2 h-4 w-4" />
              All Videos
              <span className="ml-auto">{state.collections.reduce((total, c) => total + c.videoCount, 0)}</span>
            </button>

            {/* Collections List */}
            {state.collections.map((collection) => (
              <div key={collection.id} className="group relative">
                <button
                  onClick={() => onSelectCollection(collection.id!)}
                  className={cn(
                    "focus-visible:ring-ring inline-flex h-8 w-full items-center justify-start gap-2 rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                    selectedCollectionId === collection.id
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow"
                      : "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <div className="mr-2 flex items-center gap-1">
                    {collection.favorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                    <Folder className="h-4 w-4" />
                  </div>
                  <span className="flex-1 truncate text-left">{collection.title}</span>
                  <span className="ml-auto">{collection.videoCount}</span>
                </button>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingCollection(collection)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFavorite(collection)}>
                      {collection.favorite ? (
                        <>
                          <StarOff className="mr-2 h-4 w-4" />
                          Remove from favorites
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" />
                          Add to favorites
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingCollection(collection)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </nav>

          {/* Empty State */}
          {state.collections.length === 0 && (
            <div className="text-muted-foreground px-2 py-8 text-center">
              <Folder className="mx-auto mb-4 h-8 w-8 opacity-50" />
              <p className="text-xs">No collections yet</p>
              <p className="text-xs opacity-75">Create your first collection</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Collection Dialog */}
      <EditCollectionDialog
        collection={editingCollection}
        open={!!editingCollection}
        onOpenChange={(open) => !open && setEditingCollection(null)}
        onSuccess={(updatedCollection) => {
          dispatch({
            type: "UPDATE_COLLECTION",
            payload: {
              id: updatedCollection.id!,
              updates: updatedCollection,
            },
          });
          setEditingCollection(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        title="Delete Collection"
        description={`Are you sure you want to delete "${deletingCollection?.title}"? This will also delete all videos in this collection. This action cannot be undone.`}
        open={!!deletingCollection}
        onOpenChange={(open) => !open && setDeletingCollection(null)}
        onConfirm={async () => {
          if (deletingCollection) {
            await handleDeleteCollection(deletingCollection);
            setDeletingCollection(null);
          }
        }}
      />
    </>
  );
}
