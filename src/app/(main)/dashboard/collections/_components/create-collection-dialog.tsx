"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCollections } from "./collections-context";
import { CollectionsService, COLLECTION_LIMITS } from "@/lib/collections";
import { useAuth } from "@/contexts/auth-context";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(COLLECTION_LIMITS.MAX_TITLE_LENGTH, `Title must be ${COLLECTION_LIMITS.MAX_TITLE_LENGTH} characters or less`),
  description: z
    .string()
    .max(COLLECTION_LIMITS.MAX_DESCRIPTION_LENGTH, `Description must be ${COLLECTION_LIMITS.MAX_DESCRIPTION_LENGTH} characters or less`)
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCollectionDialog({ open, onOpenChange }: CreateCollectionDialogProps) {
  const { dispatch } = useCollections();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const collectionId = await CollectionsService.createCollection(
        user.uid,
        data.title,
        data.description ?? ""
      );

      const newCollection = {
        id: collectionId,
        title: data.title,
        description: data.description ?? "",
        userId: user.uid,
        videoCount: 0,
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: "ADD_COLLECTION", payload: newCollection });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create collection:", error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Create a new collection to organize your videos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter collection title"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/{COLLECTION_LIMITS.MAX_TITLE_LENGTH} characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter collection description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {(field.value ?? "").length}/{COLLECTION_LIMITS.MAX_DESCRIPTION_LENGTH} characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Collection"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}