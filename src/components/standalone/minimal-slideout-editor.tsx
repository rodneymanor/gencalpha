"use client";

import React from "react";

import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";

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

  React.useEffect(() => {
    if (!editorHostRef.current || editorRef.current) return;

    const schema = BlockNoteSchema.create({
      // full default specs to support markdown-like blocks and richer content
      blockSpecs: defaultBlockSpecs,
    });

    const toBlocks = (content: string) => {
      if (!content.trim()) {
        return [
          {
            id: "intro-paragraph",
            type: "paragraph",
            props: {},
            content: [],
            children: [],
          },
        ];
      }
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) && parsed.length > 0
          ? parsed
          : [{ id: "intro-paragraph", type: "paragraph", props: {}, content: [], children: [] }];
      } catch {
        return [
          {
            id: `text-${Date.now()}`,
            type: "paragraph",
            props: {},
            content: [{ type: "text", text: content, styles: {} }],
            children: [],
          },
        ];
      }
    };

    const editor = BlockNoteEditor.create({
      schema,
      initialContent: toBlocks(initialValue),
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

    return () => {
      try {
        editorRef.current?.unmount?.();
        editorRef.current = null;
      } catch {
        /* no-op */
      }
    };
  }, [initialValue, onChange]);

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
