"use client";

import React from "react";

import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs, type PartialBlock } from "@blocknote/core";

// Minimal BlockNote wrapper used inside the slideout. It supports two input modes:
// 1) JSON blocks (serialized BlockNote document)
// 2) Simple markdown-like text mapped to basic blocks (headings, paragraphs, bullets)
//
// It also listens for a global CustomEvent("write:editor-set-content", { detail: { markdown?, blocks? } })
// to replace the entire editor content and is the integration point for chat → editor routing.
export function MinimalSlideoutEditor({
  initialValue = "",
  onChange,
}: {
  initialValue?: string;
  onChange?: (value: string) => void;
}) {
  const editorHostRef = React.useRef<HTMLDivElement | null>(null);
  type MinimalBlockNote = {
    mount: (el: HTMLElement) => void;
    unmount?: () => void;
    onChange: (cb: () => void) => void;
    document: unknown;
    replaceBlocks?: (from: unknown, to: unknown) => Promise<void> | void;
  };
  const editorRef = React.useRef<MinimalBlockNote | null>(null);
  const schemaRef = React.useRef(
    BlockNoteSchema.create({
      blockSpecs: defaultBlockSpecs,
    }),
  );

  // Very small markdown → BlockNote blocks mapper for headings, paragraphs and simple list-like lines.
  // Intentionally minimal to keep payloads small and rendering predictable for script/analysis/hooks.
  type AnyPartialBlock = PartialBlock<any>;

  // Parse inline markdown formatting (bold, italic, code) into styled text content
  const parseInlineMarkdown = React.useCallback((text: string) => {
    const content: Array<{ type: "text"; text: string; styles: Record<string, boolean> }> = [];
    let currentIndex = 0;

    // Pattern to match **bold**, *italic*, and `code`
    const inlinePattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    let match;

    while ((match = inlinePattern.exec(text)) !== null) {
      // Add plain text before the match
      if (match.index > currentIndex) {
        const plainText = text.slice(currentIndex, match.index);
        if (plainText) {
          content.push({ type: "text", text: plainText, styles: {} });
        }
      }

      // Add styled text
      if (match[2]) {
        // Bold text **text**
        content.push({ type: "text", text: match[2], styles: { bold: true } });
      } else if (match[3]) {
        // Italic text *text*
        content.push({ type: "text", text: match[3], styles: { italic: true } });
      } else if (match[4]) {
        // Code text `code`
        content.push({ type: "text", text: match[4], styles: { code: true } });
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining plain text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      if (remainingText) {
        content.push({ type: "text", text: remainingText, styles: {} });
      }
    }

    // If no formatting was found, return simple text content
    if (content.length === 0) {
      content.push({ type: "text", text, styles: {} });
    }

    return content;
  }, []);

  const markdownToBlocks = React.useCallback(
    (markdown: string): AnyPartialBlock[] => {
      const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
      const blocks: AnyPartialBlock[] = [];
      const newId = () => `bn-${Math.random().toString(36).slice(2)}`;

      for (const raw of lines) {
        const line = raw.trimEnd();
        if (!line.trim()) {
          // Add an empty paragraph to create visual spacing between sections
          blocks.push({ id: newId(), type: "paragraph", props: {}, content: [], children: [] } as AnyPartialBlock);
          continue;
        }
        const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
        if (headingMatch) {
          const level = Math.min(3, headingMatch[1].length);
          const text = headingMatch[2];
          // Check if this is a script component heading
          const isScriptComponent = /^(Hook|Bridge|Golden Nugget|Call to Action|Generated Script)$/i.test(text);
          blocks.push({
            id: newId(),
            type: "heading",
            props: {
              level,
              ...(isScriptComponent && { className: "script-component", "data-script-component": "true" }),
            },
            content: parseInlineMarkdown(text),
            children: [],
          } as AnyPartialBlock);
          continue;
        }
        const bulletMatch = /^[-*]\s+(.*)$/.exec(line);
        if (bulletMatch) {
          const text = `• ${bulletMatch[1]}`;
          blocks.push({
            id: newId(),
            type: "paragraph",
            props: {},
            content: parseInlineMarkdown(text),
            children: [],
          } as AnyPartialBlock);
          continue;
        }
        const orderedMatch = /^\d+\.\s+(.*)$/.exec(line);
        if (orderedMatch) {
          const text = orderedMatch[0];
          blocks.push({
            id: newId(),
            type: "paragraph",
            props: {},
            content: parseInlineMarkdown(text),
            children: [],
          } as AnyPartialBlock);
          continue;
        }
        blocks.push({
          id: newId(),
          type: "paragraph",
          props: {},
          content: parseInlineMarkdown(line),
          children: [],
        } as AnyPartialBlock);
      }
      // Ensure at least one paragraph exists
      if (blocks.length === 0) {
        blocks.push({ id: newId(), type: "paragraph", props: {}, content: [], children: [] } as AnyPartialBlock);
      }
      return blocks;
    },
    [parseInlineMarkdown],
  );

  // (Re)mounts a new BlockNote instance with provided content and wires change propagation.
  const mountEditor = React.useCallback(
    (contentAsBlocks: AnyPartialBlock[]) => {
      if (!editorHostRef.current) return;
      // Clean up previous editor if present
      try {
        editorRef.current?.unmount?.();
      } catch {
        /* no-op */
      }
      const editor = BlockNoteEditor.create({
        schema: schemaRef.current,
        initialContent: contentAsBlocks,
        _tiptapOptions: {
          // Make editor read-only to prevent accidental edits and position errors
          editable: false,
          editorProps: {
            // Fully suppress internal click handlers to avoid position resolution
            handleTripleClick: () => true,
            handleDoubleClick: () => true,
            handleClick: (_view, _pos, event) => {
              // Intercept all clicks so ProseMirror doesn't process them
              try {
                event.preventDefault();
                // If this is a script component, emit a global event for external handlers
                const target = event.target as Element;
                const scriptEl = target.closest("[data-script-component]");
                if (scriptEl) {
                  const text = scriptEl.textContent ?? "";
                  window.dispatchEvent(
                    new CustomEvent("write:script-component-click", {
                      detail: { element: scriptEl, text },
                    }),
                  );
                }
              } catch {
                /* no-op */
              }
              return true;
            },
            handleDOMEvents: {
              // Suppress events that can trigger ProseMirror position resolution
              tripleclick: (_view, event) => {
                event.preventDefault();
                return true;
              },
              dblclick: (_view, event) => {
                event.preventDefault();
                return true;
              },
              mousedown: (_view, event) => {
                // Always suppress; we will emit our own event for script components elsewhere
                try {
                  event.preventDefault();
                  const target = event.target as Element;
                  const scriptEl = target.closest("[data-script-component]");
                  if (scriptEl) {
                    // Stop propagation so ProseMirror never sees it
                    event.stopPropagation();
                  }
                } catch {
                  /* no-op */
                }
                return true;
              },
              touchstart: (_view, event) => {
                event.preventDefault();
                return true;
              },
              pointerdown: (_view, event) => {
                event.preventDefault();
                return true;
              },
            },
          },
        },
      });
      editor.mount(editorHostRef.current);
      editor.onChange(() => {
        try {
          const next = JSON.stringify(editor.document);
          onChange?.(next);
        } catch {
          /* no-op */
        }
      });
      editorRef.current = editor as unknown as MinimalBlockNote;
    },
    [onChange],
  );

  // Initial mount: prefer JSON blocks, fallback to markdown mapping.
  React.useEffect(() => {
    if (!editorHostRef.current || editorRef.current) return;
    // Initialize with provided value (JSON blocks preferred, fallback to markdown-ish mapping)
    const toBlocks = (content: string): AnyPartialBlock[] => {
      if (!content.trim()) {
        return [{ id: "intro-paragraph", type: "paragraph", props: {}, content: [], children: [] } as AnyPartialBlock];
      }
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) && parsed.length > 0
          ? (parsed as AnyPartialBlock[])
          : [{ id: "intro-paragraph", type: "paragraph", props: {}, content: [], children: [] } as AnyPartialBlock];
      } catch {
        return markdownToBlocks(content);
      }
    };

    mountEditor(toBlocks(initialValue));

    return () => {
      try {
        editorRef.current?.unmount?.();
        editorRef.current = null;
      } catch {
        /* no-op */
      }
    };
  }, [initialValue, markdownToBlocks, mountEditor]);

  // Listen for global content update events from the chat system.
  // This is the single integration surface for routing structured answers into the editor.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const anyEvent = e as CustomEvent<{
        markdown?: string;
        blocks?: AnyPartialBlock[];
        title?: string;
      }>;
      const detail = anyEvent.detail || {};
      const blocks =
        Array.isArray(detail.blocks) && detail.blocks.length > 0
          ? detail.blocks
          : markdownToBlocks(String(detail.markdown ?? ""));
      mountEditor(blocks);
    };
    window.addEventListener("write:editor-set-content", handler as EventListener);
    return () => {
      window.removeEventListener("write:editor-set-content", handler as EventListener);
    };
  }, [markdownToBlocks, mountEditor]);

  return (
    <div className="px-11 py-6">
      <div
        ref={editorHostRef}
        className="text-foreground min-h-[60vh] font-sans text-sm leading-relaxed outline-none"
        data-slideout-editor-root
      />
    </div>
  );
}

export default MinimalSlideoutEditor;
