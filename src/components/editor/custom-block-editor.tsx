"use client";

import React from "react";

import { BlockNoteEditor } from "@blocknote/core";

import { customBlockSchema } from "./custom-schema";

interface CustomBlockEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Create a safe content parser for custom blocks
const createSafeCustomContent = (content: string) => {
  if (!content || content.trim() === "") {
    return [
      {
        id: "welcome-block",
        type: "paragraph",
        props: {},
        content: [
          {
            type: "text",
            text: "Start writing your script with custom blocks! Use / to add hooks, bridges, golden nuggets, and CTAs.",
            styles: {},
          },
        ],
        children: [],
      },
    ];
  }

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate and return existing content
      return parsed.map((block, index) => ({
        id: block.id ?? `custom-block-${index}-${Date.now()}`,
        type: block.type ?? "paragraph",
        props: block.props ?? {},
        content: Array.isArray(block.content) ? block.content : [],
        children: Array.isArray(block.children) ? block.children : [],
      }));
    }
  } catch {
    // Convert plain text to paragraph block
  }

  return [
    {
      id: `text-block-${Date.now()}`,
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
};

export function CustomBlockEditor({ value, onChange }: CustomBlockEditorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<BlockNoteEditor | null>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    if (!containerRef.current || mountedRef.current) return;

    const initializeEditor = async () => {
      try {
        setError(null);
        console.log("🎨 Initializing custom block editor...");

        const initialContent = createSafeCustomContent(value);
        console.log("📝 Custom content prepared:", initialContent);

        const editor = BlockNoteEditor.create({
          schema: customBlockSchema,
          initialContent,
          _tiptapOptions: {
            editorProps: {
              handleTripleClick: () => true,
              handleDOMEvents: { tripleclick: () => true },
            },
          },
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        if (containerRef.current && !mountedRef.current) {
          editor.mount(containerRef.current);
          mountedRef.current = true;
          editorRef.current = editor;

          let updateTimeout: NodeJS.Timeout;
          editor.onChange(() => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
              try {
                const content = JSON.stringify(editor.document);
                onChange(content);
              } catch (err) {
                console.error("❌ Error serializing custom content:", err);
              }
            }, 200);
          });

          setTimeout(() => {
            setIsReady(true);
            console.log("✅ Custom editor ready");
          }, 200);
        }
      } catch (err) {
        console.error("❌ Error initializing custom editor:", err);
        setError(err instanceof Error ? err.message : String(err));
        mountedRef.current = false;
      }
    };

    initializeEditor();

    return () => {
      if (editorRef.current && mountedRef.current) {
        try {
          editorRef.current.unmount();
          editorRef.current = null;
          mountedRef.current = false;
          console.log("🧹 Custom editor unmounted");
        } catch (err) {
          console.error("❌ Error unmounting custom editor:", err);
        }
      }
    };
  }, []);

  React.useEffect(() => {
    const updateContent = async () => {
      if (!editorRef.current || !isReady || !mountedRef.current) return;

      try {
        const currentContent = JSON.stringify(editorRef.current.document);
        if (currentContent !== value && value.trim() !== "") {
          const newContent = createSafeCustomContent(value);
          await editorRef.current.replaceBlocks(editorRef.current.document, newContent);
        }
      } catch (e) {
        console.error("❌ Error updating custom content:", e);
      }
    };

    const updateTimeout = setTimeout(updateContent, 300);
    return () => clearTimeout(updateTimeout);
  }, [value, isReady, onChange]);

  if (error) {
    return (
      <div className="rounded-lg border bg-red-50 p-4">
        <div className="mb-2">
          <strong className="text-red-700">Custom Editor Error</strong>
        </div>
        <p className="mb-3 text-sm text-red-600">{error}</p>
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
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <strong>Custom Block Editor</strong>
          <p className="mt-1 text-xs text-gray-600">
            Script-focused editor with Hook, Bridge, Golden Nugget, and CTA blocks
          </p>
          <div className="mt-1 text-xs">
            {isReady ? (
              <span className="text-green-600">✓ Ready with Custom Blocks</span>
            ) : (
              <span className="text-gray-500">⏳ Loading custom blocks...</span>
            )}
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="min-h-[300px] rounded-md border bg-neutral-50 p-3 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
        style={{
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      />

      <div className="mt-3 space-y-1 text-xs text-gray-500">
        <p>
          💡 <strong>Tips:</strong> Type &quot;/&quot; to access custom blocks
        </p>
        <div className="flex gap-4 text-xs">
          <span>🪝 /hook - Add hooks</span>
          <span>🌉 /bridge - Add bridges</span>
          <span>💡 /golden-nugget - Key insights</span>
          <span>🎯 /cta - Call-to-actions</span>
        </div>
      </div>
    </div>
  );
}

export default CustomBlockEditor;
