"use client";

import React from "react";

import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";

interface StableEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Create a very safe content parser that ensures proper block structure
const createSafeContent = (content: string) => {
  if (!content || content.trim() === "") {
    return [
      {
        id: "empty-block-1",
        type: "paragraph",
        props: {
          textColor: "default",
          backgroundColor: "default",
          textAlignment: "left",
        },
        content: [],
        children: [],
      },
    ];
  }

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate and fix existing BlockNote content
      return parsed.map((block, index) => ({
        id: block.id || `safe-block-${index}-${Date.now()}`,
        type: block.type || "paragraph",
        props: {
          textColor: "default",
          backgroundColor: "default",
          textAlignment: "left",
          ...block.props,
        },
        content: Array.isArray(block.content) ? block.content : [],
        children: Array.isArray(block.children) ? block.children : [],
      }));
    }
  } catch {
    // Not JSON, treat as plain text
  }

  // Convert plain text to safe BlockNote format
  return [
    {
      id: `text-block-${Date.now()}`,
      type: "paragraph",
      props: {
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left",
      },
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
};

export function StableEditor({ value, onChange }: StableEditorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<BlockNoteEditor | null>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const mountedRef = React.useRef(false);

  // Initialize editor only once
  React.useEffect(() => {
    if (!containerRef.current || mountedRef.current) return;

    const initializeEditor = async () => {
      try {
        setError(null);
        console.log("🔧 Initializing stable editor...");

        // Create schema with minimal blocks to reduce complexity
        const schema = BlockNoteSchema.create({
          blockSpecs: {
            paragraph: defaultBlockSpecs.paragraph,
            heading: defaultBlockSpecs.heading,
          },
        });

        // Prepare safe initial content
        const initialContent = createSafeContent(value);
        console.log("📝 Initial content prepared:", initialContent);

        // Create editor with careful configuration
        const editor = BlockNoteEditor.create({
          schema,
          initialContent,
          // Add some safety options
          _tiptapOptions: {
            enableInputRules: false, // Disable input rules that might cause position issues
            enablePasteRules: false, // Disable paste rules
          },
        });

        // Wait a bit before mounting to ensure DOM is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (containerRef.current && !mountedRef.current) {
          editor.mount(containerRef.current);
          mountedRef.current = true;
          editorRef.current = editor;

          // Set up change handler with proper debouncing
          let updateTimeout: NodeJS.Timeout;
          editor.onChange(() => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
              try {
                const content = JSON.stringify(editor.document);
                onChange(content);
              } catch (err) {
                console.error("❌ Error serializing content:", err);
              }
            }, 200); // Longer debounce to prevent rapid updates
          });

          // Wait another moment before marking as ready
          setTimeout(() => {
            setIsReady(true);
            console.log("✅ Editor ready and stable");
          }, 200);
        }
      } catch (err) {
        console.error("❌ Error initializing editor:", err);
        setError(err instanceof Error ? err.message : String(err));
        mountedRef.current = false;
      }
    };

    initializeEditor();

    // Cleanup function
    return () => {
      if (editorRef.current && mountedRef.current) {
        try {
          editorRef.current.unmount();
          editorRef.current = null;
          mountedRef.current = false;
          console.log("🧹 Editor unmounted");
        } catch (err) {
          console.error("❌ Error unmounting editor:", err);
        }
      }
    };
  }, []); // Only run once

  // Handle external content updates carefully
  React.useEffect(() => {
    const updateContent = async () => {
      if (!editorRef.current || !isReady || !mountedRef.current) return;

      try {
        const currentContent = JSON.stringify(editorRef.current.document);
        if (currentContent !== value && value.trim() !== "") {
          const newContent = createSafeContent(value);

          // Use a safer method to update content
          await editorRef.current.replaceBlocks(editorRef.current.document, newContent);
        }
      } catch (err) {
        console.error("❌ Error updating content:", err);
      }
    };

    // Debounce external updates
    const updateTimeout = setTimeout(updateContent, 300);
    return () => clearTimeout(updateTimeout);
  }, [value, isReady]);

  if (error) {
    return (
      <div className="rounded-lg border bg-red-50 p-4">
        <div className="mb-2">
          <strong className="text-red-700">Editor Error</strong>
        </div>
        <p className="mb-3 text-sm text-red-600">{error}</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setError(null);
              setIsReady(false);
              mountedRef.current = false;
              if (containerRef.current) {
                containerRef.current.innerHTML = "";
              }
            }}
            className="rounded bg-red-100 px-3 py-1 text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <strong>Stable BlockNote Editor</strong>
          <div className="mt-1 text-xs">
            {isReady ? (
              <span className="text-green-600">✓ Ready & Stable</span>
            ) : (
              <span className="text-gray-500">⏳ Initializing...</span>
            )}
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="min-h-[200px] rounded-md border bg-white p-3 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
        style={{
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      />

      <div className="mt-3 text-xs text-gray-500">
        <p>Enhanced stability with proper initialization timing and error prevention.</p>
      </div>
    </div>
  );
}

export default StableEditor;
