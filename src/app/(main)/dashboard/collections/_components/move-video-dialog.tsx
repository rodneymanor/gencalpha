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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollections } from "./collections-context";
import { Video, CollectionsService } from "@/lib/collections";
import { useAuth } from "@/contexts/auth-context";

const formSchema = z.object({
  collectionId: z.string().min(1, "Please select a collection"),
});

type FormData = z.infer<typeof formSchema>;

interface MoveVideoDialogProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MoveVideoDialog({ 
  video, 
  open, 
  onOpenChange, 
  onSuccess 
}: MoveVideoDialogProps) {
  const { state } = useCollections();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionId: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.uid || !video?.id) return;

    setIsLoading(true);
    try {
      await CollectionsService.moveVideo(user.uid, video.id, data.collectionId);
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Failed to move video:", error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out the current collection from the options
  const availableCollections = state.collections.filter(
    (collection) => collection.id !== video?.collectionId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Video</DialogTitle>
          <DialogDescription>
            Move &quot;{video?.title}&quot; to a different collection.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="collectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Collection</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all-videos">All Videos</SelectItem>
                      {availableCollections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id!}>
                          {collection.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                {isLoading ? "Moving..." : "Move Video"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}