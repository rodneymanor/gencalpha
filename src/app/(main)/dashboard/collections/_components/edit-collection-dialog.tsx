"use client";

import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { Collection, CollectionsService, COLLECTION_LIMITS } from "@/lib/collections";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(COLLECTION_LIMITS.MAX_TITLE_LENGTH, `Title must be ${COLLECTION_LIMITS.MAX_TITLE_LENGTH} characters or less`),
  description: z
    .string()
    .max(
      COLLECTION_LIMITS.MAX_DESCRIPTION_LENGTH,
      `Description must be ${COLLECTION_LIMITS.MAX_DESCRIPTION_LENGTH} characters or less`,
    )
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditCollectionDialogProps {
  collection: Collection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedCollection: Collection) => void;
}

export function EditCollectionDialog({ collection, open, onOpenChange, onSuccess }: EditCollectionDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Update form when collection changes
  useEffect(() => {
    if (collection) {
      form.reset({
        title: collection.title,
        description: collection.description ?? "",
      });
    }
  }, [collection, form]);

  const onSubmit = async (data: FormData) => {
    if (!user?.uid || !collection?.id) return;

    setIsLoading(true);
    try {
      await CollectionsService.updateCollection(user.uid, collection.id, {
        title: data.title,
        description: data.description ?? "",
        updatedAt: new Date().toISOString(),
      });

      const updatedCollection = {
        ...collection,
        title: data.title,
        description: data.description ?? "",
        updatedAt: new Date().toISOString(),
      };

      onSuccess(updatedCollection);
    } catch (error) {
      console.error("Failed to update collection:", error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>Update your collection details.</DialogDescription>
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
                    <Input placeholder="Enter collection title" {...field} />
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
                    <Textarea placeholder="Enter collection description" rows={3} {...field} />
                  </FormControl>
                  <FormDescription>
                    {(field.value ?? "").length}/{COLLECTION_LIMITS.MAX_DESCRIPTION_LENGTH} characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
