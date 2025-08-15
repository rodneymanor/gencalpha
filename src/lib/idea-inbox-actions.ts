/**
 * Helper functions for triggering idea inbox slideout actions
 */

export type IdeaInboxView = "ideas" | "drafts" | "archive";

/**
 * Opens the idea inbox slideout with the specified view
 */
export function openIdeaInbox(view: IdeaInboxView = "ideas") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("idea-inbox:open", {
        detail: { view },
      }),
    );
  }
}

/**
 * Closes the idea inbox slideout
 */
export function closeIdeaInbox() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("idea-inbox:close"));
  }
}

/**
 * Opens idea inbox and focuses on a specific idea by ID
 */
export function openIdeaById(ideaId: string, view: IdeaInboxView = "ideas") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("idea-inbox:open", {
        detail: { view, focusId: ideaId },
      }),
    );
  }
}

/**
 * Creates a new idea and opens the idea inbox
 */
export function createNewIdea(initialData?: { title?: string; content?: string; tags?: string[]; source?: string }) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("idea-inbox:create-new", {
        detail: initialData,
      }),
    );
  }
}

/**
 * Quick action to save current selection as an idea
 */
export function saveSelectionAsIdea(selection: string, title?: string, source?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("idea-inbox:save-selection", {
        detail: {
          content: selection,
          title: title || "Selected Text",
          source: source || "web-selection",
          tags: ["from-selection"],
        },
      }),
    );
  }
}

/**
 * Quick action to save current page as an idea
 */
export function savePageAsIdea(url: string, title?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("idea-inbox:save-page", {
        detail: {
          content: url,
          title: title || "Saved Page",
          source: "web-page",
          tags: ["from-page"],
        },
      }),
    );
  }
}
