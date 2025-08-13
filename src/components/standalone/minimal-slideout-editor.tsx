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

  const markdownToBlocks = React.useCallback((markdown: string): AnyPartialBlock[] => {
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
        blocks.push({
          id: newId(),
          type: "heading",
          props: { level },
          content: [{ type: "text", text, styles: {} }],
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
          content: [{ type: "text", text, styles: {} }],
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
          content: [{ type: "text", text, styles: {} }],
          children: [],
        } as AnyPartialBlock);
        continue;
      }
      blocks.push({
        id: newId(),
        type: "paragraph",
        props: {},
        content: [{ type: "text", text: line, styles: {} }],
        children: [],
      } as AnyPartialBlock);
    }
    // Ensure at least one paragraph exists
    if (blocks.length === 0) {
      blocks.push({ id: newId(), type: "paragraph", props: {}, content: [], children: [] } as AnyPartialBlock);
    }
    return blocks;
  }, []);

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
          editorProps: {
            handleTripleClick: () => true,
            handleDOMEvents: { tripleclick: () => true },
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
      />
    </div>
  );
}

export default MinimalSlideoutEditor;
