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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollections } from "./collections-context";
import { useAuth } from "@/contexts/auth-context";

const formSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .refine(
      (url) => {
        const lowerUrl = url.toLowerCase();
        return (
          lowerUrl.includes("tiktok.com") ||
          (lowerUrl.includes("instagram.com") && 
           (lowerUrl.includes("/reel/") || lowerUrl.includes("/p/")))
        );
      },
      "Please enter a valid TikTok or Instagram Reel URL"
    ),
  collectionId: z.string().min(1, "Please select a collection"),
});

type FormData = z.infer<typeof formSchema>;

interface AddVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCollectionId?: string;
}

export function AddVideoDialog({ 
  open, 
  onOpenChange, 
  selectedCollectionId = "all-videos" 
}: AddVideoDialogProps) {
  const { state, dispatch } = useCollections();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      collectionId: selectedCollectionId,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      // Call the video processing API endpoint
      const response = await fetch("/api/video/process-and-add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl: data.url,
          collectionId: data.collectionId === "all-videos" ? undefined : data.collectionId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add video");
      }

      const result = await response.json();
      
      // Add the video to local state if successful
      if (result.success && result.video) {
        dispatch({ type: "ADD_VIDEO", payload: result.video });
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add video:", error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Video</DialogTitle>
          <DialogDescription>
            Add a video from TikTok or Instagram to your collection.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.tiktok.com/@username/video/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all-videos">All Videos</SelectItem>
                      {state.collections.map((collection) => (
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
                {isLoading ? "Processing..." : "Add Video"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}