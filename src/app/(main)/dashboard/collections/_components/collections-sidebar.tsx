"use client";

import { useState, useEffect, useCallback } from "react";

import { Star, Folder, Video, MoreHorizontal, Edit, Trash2, StarOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Collections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={`skeleton-${index}`} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Collections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {/* All Videos */}
          <button
            onClick={() => onSelectCollection("all-videos")}
            className={cn(
              "hover:bg-accent flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors",
              selectedCollectionId === "all-videos" && "bg-accent",
            )}
          >
            <div className="flex items-center gap-3">
              <Video className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">All Videos</span>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {state.collections.reduce((total, c) => total + c.videoCount, 0)}
            </Badge>
          </button>

          {/* Collections List */}
          {state.collections.map((collection) => (
            <div
              key={collection.id}
              className={cn(
                "group hover:bg-accent flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors",
                selectedCollectionId === collection.id && "bg-accent",
              )}
            >
              <button
                onClick={() => onSelectCollection(collection.id!)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <div className="flex items-center gap-2">
                  {collection.favorite && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
                  <Folder className="text-muted-foreground h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{collection.title}</p>
                  {collection.description && (
                    <p className="text-muted-foreground truncate text-sm">{collection.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="ml-2">
                  {collection.videoCount}
                </Badge>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
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

          {state.collections.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              <Folder className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No collections yet</p>
              <p className="text-sm">Create your first collection to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

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
