"use client";

import React from "react";

// Let's try the most minimal BlockNote approach
import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";

interface MinimalEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Helper function to safely parse and validate BlockNote content
const parseAndValidateContent = (content: string) => {
  if (!content || content.trim() === "") {
    // Return a safe default empty paragraph
    return [
      {
        id: "empty-paragraph",
        type: "paragraph",
        props: {},
        content: [],
        children: [],
      },
    ];
  }

  try {
    const parsed = JSON.parse(content);

    // Validate that it's an array
    if (!Array.isArray(parsed)) {
      throw new Error("Content must be an array of blocks");
    }

    // If empty array, return default paragraph
    if (parsed.length === 0) {
      return [
        {
          id: "default-paragraph",
          type: "paragraph",
          props: {},
          content: [],
          children: [],
        },
      ];
    }

    // Validate each block has required properties
    const validatedContent = parsed.map((block, index) => ({
      id: block.id || `block-${index}`,
      type: block.type || "paragraph",
      props: block.props || {},
      content: block.content || [],
      children: block.children || [],
    }));

    return validatedContent;
  } catch (error) {
    console.log("Converting plain text to BlockNote format:", content);
    // Convert plain text to valid BlockNote format
    return [
      {
        id: "text-conversion",
        type: "paragraph",
        props: {},
        content: [
          {
            type: "text",
            text: content,
            styles: {},
          },
        ],
        children: [],
      },
    ];
  }
};

export function MinimalEditor({ value, onChange }: MinimalEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [editor, setEditor] = React.useState<BlockNoteEditor | null>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!editorRef.current) return;

    try {
      setError(null);

      // Create a minimal schema with just basic blocks
      const schema = BlockNoteSchema.create({
        blockSpecs: {
          paragraph: defaultBlockSpecs.paragraph,
          heading: defaultBlockSpecs.heading,
        },
      });

      // Parse and validate initial content
      const initialContent = parseAndValidateContent(value);

      console.log("Creating editor with content:", initialContent);

      const newEditor = BlockNoteEditor.create({
        schema,
        initialContent,
      });

      // Mount the editor safely
      if (editorRef.current) {
        newEditor.mount(editorRef.current);

        // Set up change listener with debouncing to prevent rapid updates
        let changeTimeout: NodeJS.Timeout;
        newEditor.onChange(() => {
          clearTimeout(changeTimeout);
          changeTimeout = setTimeout(() => {
            try {
              const content = JSON.stringify(newEditor.document);
              onChange(content);
            } catch (error) {
              console.error("Error serializing content:", error);
            }
          }, 100);
        });

        setEditor(newEditor);
        setIsReady(true);
        console.log("Editor created and mounted successfully");
      }
    } catch (error) {
      console.error("Error creating minimal editor:", error);
      setError(error instanceof Error ? error.message : String(error));
    }

    return () => {
      if (editor) {
        try {
          editor.unmount();
        } catch (error) {
          console.error("Error unmounting editor:", error);
        }
      }
    };
  }, []); // Only run once on mount

  // Handle content updates from outside
  React.useEffect(() => {
    if (editor && isReady && value !== JSON.stringify(editor.document)) {
      try {
        const newContent = parseAndValidateContent(value);
        editor.replaceBlocks(editor.document, newContent);
      } catch (error) {
        console.error("Error updating editor content:", error);
      }
    }
  }, [value, editor, isReady]);

  if (error) {
    return (
      <div className="rounded-lg border bg-red-50 p-4">
        <div className="mb-2">
          <strong className="text-red-700">Editor Error</strong>
        </div>
        <p className="mb-3 text-sm text-red-600">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsReady(false);
            if (editorRef.current) {
              editorRef.current.innerHTML = "";
            }
          }}
          className="rounded bg-red-100 px-2 py-1 text-sm hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2">
        <strong>Minimal BlockNote Editor</strong>
        {isReady ? (
          <span className="ml-2 text-xs text-green-600">✓ Ready</span>
        ) : (
          <span className="ml-2 text-xs text-gray-500">Loading...</span>
        )}
      </div>
      <div
        ref={editorRef}
        className="min-h-[200px] rounded border p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "14px",
          lineHeight: "1.6",
          outline: "none",
        }}
      />
      <div className="mt-2 text-xs text-gray-500">Minimal BlockNote implementation with improved error handling.</div>
    </div>
  );
}

export default MinimalEditor;
