"use client";

import { useState, useEffect } from "react";
import { Star, Folder, Video, MoreHorizontal, Edit, Trash2, StarOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollections } from "./collections-context";
import { EditCollectionDialog } from "./edit-collection-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Collection, CollectionsService } from "@/lib/collections";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface CollectionsSidebarProps {
  selectedCollectionId: string;
  onSelectCollection: (collectionId: string) => void;
}

export function CollectionsSidebar({
  selectedCollectionId,
  onSelectCollection,
}: CollectionsSidebarProps) {
  const { state, dispatch } = useCollections();
  const { user } = useAuth();
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadCollections();
    }
  }, [user?.uid, loadCollections]);

  const loadCollections = async () => {
    if (!user?.uid) return;
    
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const collections = await CollectionsService.getUserCollections(user.uid);
      // Sort: favorites first, then by updatedAt desc
      const sortedCollections = [...collections].sort((a, b) => {
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
  };

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
          {[...Array(5)].map((_, index) => (
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
        <CardContent className="p-3 space-y-2">
          {/* All Videos */}
          <button
            onClick={() => onSelectCollection("all-videos")}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors hover:bg-accent",
              selectedCollectionId === "all-videos" && "bg-accent"
            )}
          >
            <div className="flex items-center gap-3">
              <Video className="h-4 w-4 text-muted-foreground" />
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
                "group flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-accent cursor-pointer",
                selectedCollectionId === collection.id && "bg-accent"
              )}
            >
              <button
                onClick={() => onSelectCollection(collection.id!)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  {collection.favorite && (
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  )}
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{collection.title}</p>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {collection.description}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="ml-2">
                  {collection.videoCount}
                </Badge>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingCollection(collection)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleToggleFavorite(collection)}
                  >
                    {collection.favorite ? (
                      <>
                        <StarOff className="h-4 w-4 mr-2" />
                        Remove from favorites
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Add to favorites
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeletingCollection(collection)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {state.collections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
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