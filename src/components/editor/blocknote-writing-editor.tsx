"use client";

import React, { useMemo } from "react";

// BlockNote imports
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import "@blocknote/core/style.css";

interface BlockNoteWritingEditorProps {
  initialContent?: any[];
  onContentChange?: (content: any) => void;
  className?: string;
}

export function BlockNoteWritingEditor({
  initialContent,
  onContentChange,
  className = "",
}: BlockNoteWritingEditorProps) {
  // Sample highlights configuration
  const highlights = [
    { id: "hook", color: "#FEF3C7", text: "Hook", icon: "#F59E0B" },
    { id: "bridge", color: "#DBEAFE", text: "Bridge", icon: "#3B82F6" },
    { id: "golden-nugget", color: "#EDE9FE", text: "Golden Nugget", icon: "#8B5CF6" },
    { id: "cta", color: "#FEE2E2", text: "Call to Action", icon: "#EF4444" },
  ];

  // Default initial content if not provided
  const defaultContent = [
    {
      type: "heading",
      props: { level: 2 },
      content: "Hook:",
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Is life sciences research progressing too slowly? We can do better.",
          styles: { backgroundColor: "#FEF3C7" },
        },
      ],
    },
    {
      type: "heading",
      props: { level: 2 },
      content: "Bridge:",
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "The key lies in leveraging technology and collaboration to accelerate discovery and development.",
          styles: { backgroundColor: "#DBEAFE" },
        },
      ],
    },
    {
      type: "heading",
      props: { level: 2 },
      content: "Golden Nugget:",
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Imagine AI-powered drug design, high-throughput screening, and global data sharing initiatives dramatically reducing research timelines. This translates to faster cures for diseases like cancer and Alzheimer's. For example, AI algorithms are already analyzing vast genomic datasets to identify potential drug targets far more efficiently than traditional methods. Simultaneously, collaborative platforms allow researchers across the globe to share data and insights in real-time, eliminating redundancies and accelerating breakthroughs.",
          styles: { backgroundColor: "#EDE9FE" },
        },
      ],
    },
    {
      type: "heading",
      props: { level: 2 },
      content: "Call to Action:",
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Learn more about the future of accelerated life sciences research and how you can contribute. Visit our website today!",
          styles: { backgroundColor: "#FEE2E2" },
        },
      ],
    },
  ];

  // Create the BlockNote editor with initial content
  const editor = useCreateBlockNote({
    initialContent: initialContent || defaultContent,
  });

  // Function to count words in the editor content
  const getContentWordCount = useMemo(() => {
    const blocks = editor.document;
    let wordCount = 0;

    blocks.forEach((block: any) => {
      if (block.type === "paragraph" && block.content) {
        const text = block.content.map((item: any) => (item.type === "text" ? item.text : "")).join(" ");
        wordCount += text.split(/\s+/).filter((word: string) => word.length > 0).length;
      }
    });

    return wordCount;
  }, [editor.document]);

  // Apply highlight to selected text
  const applyHighlight = (color: string) => {
    editor.focus();
    const selection = editor.getTextCursorPosition();
    if (selection.prevBlock) {
      // Apply background color to selected text
      editor.addStyles({ backgroundColor: color });
    }
  };

  // Handle content changes
  React.useEffect(() => {
    if (onContentChange) {
      const handleChange = () => {
        onContentChange(editor.document);
      };
      // Set up a listener for changes
      editor.onEditorContentChange(handleChange);
    }
  }, [editor, onContentChange]);

  return (
    <div className={className}>
      {/* BlockNote Editor */}
      <div className="prose max-w-none">
        <BlockNoteView editor={editor} theme="light" className="min-h-[400px]" />
      </div>

      {/* Word count */}
      <div className="mt-4 text-sm text-neutral-500">Word count: {getContentWordCount}</div>
    </div>
  );
}

export default BlockNoteWritingEditor;
