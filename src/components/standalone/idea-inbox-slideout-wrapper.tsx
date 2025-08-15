"use client";

import React, { useState, useEffect, type ReactNode } from "react";

import { CreateNoteDialog } from "@/components/standalone/create-note-dialog";
import { IdeaInboxContent } from "@/components/standalone/idea-inbox-content";
import { IdeaInboxHeaderActions } from "@/components/standalone/idea-inbox-header-actions";
import { SlideoutWrapper, type SlideoutOption } from "@/components/standalone/slideout-wrapper";
import { clientNotesService, type CreateNoteData } from "@/lib/services/client-notes-service";

export interface IdeaInboxSlideoutWrapperProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function IdeaInboxSlideoutWrapper({ children, className, contentClassName }: IdeaInboxSlideoutWrapperProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createNoteData, setCreateNoteData] = useState<Partial<CreateNoteData> | null>(null);

  const handleNoteCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Listen for external events
  useEffect(() => {
    const handleCreateNew = (event: CustomEvent) => {
      const initialData = event.detail;
      setCreateNoteData(initialData || null);
      setIsCreateDialogOpen(true);
    };

    const handleSaveSelection = async (event: CustomEvent) => {
      const { content, title, source, tags } = event.detail;
      try {
        await clientNotesService.createNote({
          title,
          content,
          tags: tags || [],
          source: source || "manual",
          type: "idea_inbox",
          starred: false,
        });
        handleNoteCreated();
      } catch (error) {
        console.error("Failed to save selection as idea:", error);
      }
    };

    const handleSavePage = async (event: CustomEvent) => {
      const { content, title, source, tags } = event.detail;
      try {
        await clientNotesService.createNote({
          title,
          content,
          tags: tags || [],
          source: source || "manual",
          type: "idea_inbox",
          starred: false,
        });
        handleNoteCreated();
      } catch (error) {
        console.error("Failed to save page as idea:", error);
      }
    };

    window.addEventListener("idea-inbox:create-new", handleCreateNew as unknown as EventListener);
    window.addEventListener("idea-inbox:save-selection", handleSaveSelection as unknown as EventListener);
    window.addEventListener("idea-inbox:save-page", handleSavePage as unknown as EventListener);

    return () => {
      window.removeEventListener("idea-inbox:create-new", handleCreateNew as unknown as EventListener);
      window.removeEventListener("idea-inbox:save-selection", handleSaveSelection as unknown as EventListener);
      window.removeEventListener("idea-inbox:save-page", handleSavePage as unknown as EventListener);
    };
  }, []);

  // Define the idea inbox options
  const ideaOptions: SlideoutOption[] = [
    {
      key: "ideas",
      label: "Ideas",
      component: <IdeaInboxContent view="ideas" refreshTrigger={refreshTrigger} />,
    },
    {
      key: "drafts",
      label: "Drafts",
      component: <IdeaInboxContent view="drafts" refreshTrigger={refreshTrigger} />,
    },
    {
      key: "archive",
      label: "Archive",
      component: <IdeaInboxContent view="archive" refreshTrigger={refreshTrigger} />,
    },
  ];

  return (
    <SlideoutWrapper
      slideout={null}
      className={className}
      contentClassName={contentClassName}
      customOptions={ideaOptions}
      customHeaderActions={<IdeaInboxHeaderActions onNoteCreated={handleNoteCreated} />}
      defaultSelectedOption="ideas"
      openEvents={["idea-inbox:open"]}
      closeEvents={["idea-inbox:close"]}
    >
      {children}

      {/* External Create Note Dialog */}
      <CreateNoteDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onNoteCreated={handleNoteCreated}
        initialData={createNoteData || undefined}
      />
    </SlideoutWrapper>
  );
}

export default IdeaInboxSlideoutWrapper;
