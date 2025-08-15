"use client";

import { Lightbulb, BookOpen, Archive, Plus } from "lucide-react";

import { IdeaInboxSlideoutWrapper } from "@/components/standalone/idea-inbox-slideout-wrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { openIdeaInbox, createNewIdea, saveSelectionAsIdea, savePageAsIdea } from "@/lib/idea-inbox-actions";

export function IdeaInboxDemo() {
  return (
    <IdeaInboxSlideoutWrapper>
      <div className="bg-background min-h-screen p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Idea Inbox Slideout Demo</h1>
            <p className="text-muted-foreground text-lg">
              Test the new idea inbox slideout functionality with the buttons below.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Open Ideas View */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold">Ideas View</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Browse and manage your collected ideas with search and filtering.
                </p>
                <Button onClick={() => openIdeaInbox("ideas")} className="w-full">
                  Open Ideas
                </Button>
              </div>
            </Card>

            {/* Open Drafts View */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
                    <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold">Drafts View</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Access your work-in-progress scripts and content drafts.
                </p>
                <Button onClick={() => openIdeaInbox("drafts")} variant="outline" className="w-full">
                  Open Drafts
                </Button>
              </div>
            </Card>

            {/* Open Archive View */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-900/20">
                    <Archive className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="font-semibold">Archive View</h3>
                </div>
                <p className="text-muted-foreground text-sm">Browse archived ideas and completed projects.</p>
                <Button onClick={() => openIdeaInbox("archive")} variant="outline" className="w-full">
                  Open Archive
                </Button>
              </div>
            </Card>

            {/* Create New Idea */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                    <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold">Create New Idea</h3>
                </div>
                <p className="text-muted-foreground text-sm">Quickly create a new idea with pre-filled content.</p>
                <Button
                  onClick={() =>
                    createNewIdea({
                      title: "Demo Idea",
                      content: "This is a demo idea created from the demo page.",
                      tags: ["demo", "test"],
                      source: "demo-page",
                    })
                  }
                  variant="default"
                  className="w-full"
                >
                  Create Idea
                </Button>
              </div>
            </Card>

            {/* Save Selection Demo */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                    <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold">Save Selection</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Simulate saving selected text as an idea (like from Chrome extension).
                </p>
                <Button
                  onClick={() =>
                    saveSelectionAsIdea(
                      "This is some selected text that would be saved as an idea.",
                      "Selected Text Demo",
                      "demo-page",
                    )
                  }
                  variant="outline"
                  className="w-full"
                >
                  Save Selection
                </Button>
              </div>
            </Card>

            {/* Save Page Demo */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/20">
                    <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold">Save Page</h3>
                </div>
                <p className="text-muted-foreground text-sm">Simulate saving the current page as an idea reference.</p>
                <Button
                  onClick={() => savePageAsIdea(window.location.href, "Demo Page - Idea Inbox")}
                  variant="outline"
                  className="w-full"
                >
                  Save Page
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm">
              The slideout will appear from the right side of the screen when triggered.
            </p>
            <p className="text-muted-foreground text-xs">
              Use the Actions dropdown in the slideout to test idea-specific functionality.
            </p>
          </div>
        </div>
      </div>
    </IdeaInboxSlideoutWrapper>
  );
}
