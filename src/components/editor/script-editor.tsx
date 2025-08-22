"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Simple, reliable editor focused on script writing
export function ScriptEditor({
  value,
  onChange,
  placeholder = "Start writing your script...",
  className,
}: ScriptEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  // Auto-resize textarea based on content
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.max(textarea.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Add some helpful keyboard shortcuts for script writing
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          insertFormatting("**", "**", "bold text");
          break;
        case "i":
          e.preventDefault();
          insertFormatting("*", "*", "italic text");
          break;
        case "Enter":
          e.preventDefault();
          insertLineBreak();
          break;
      }
    }
  };

  const insertFormatting = (prefix: string, suffix: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = value.substring(0, start) + prefix + textToInsert + suffix + value.substring(end);

    onChange(newText);

    // Set cursor position after formatting
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
      }
      textarea.focus();
    }, 0);
  };

  const insertLineBreak = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + "\n\n" + value.substring(start);
    onChange(newText);

    setTimeout(() => {
      textarea.setSelectionRange(start + 2, start + 2);
      textarea.focus();
    }, 0);
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b bg-neutral-100 px-3 py-2 text-sm">
        <span className="font-medium text-gray-700">Script Editor</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting("**", "**", "bold text")}
            className="rounded border bg-neutral-50 px-2 py-1 text-xs transition-colors hover:bg-neutral-200"
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("*", "*", "italic text")}
            className="rounded border bg-neutral-50 px-2 py-1 text-xs italic transition-colors hover:bg-neutral-200"
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={insertLineBreak}
            className="rounded border bg-neutral-50 px-2 py-1 text-xs transition-colors hover:bg-neutral-200"
            title="Line Break (Ctrl+Enter)"
          >
            ¶
          </button>
        </div>
        <div className="text-xs text-gray-500">{value.length} chars</div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full resize-none border-0 bg-neutral-50 p-4 font-mono text-sm leading-relaxed outline-none",
            "placeholder:font-sans placeholder:text-gray-400",
            isFocused && "ring-2 ring-blue-500 ring-inset",
          )}
          style={{
            minHeight: "120px",
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            lineHeight: "1.6",
          }}
        />

        {/* Focus indicator */}
        {isFocused && (
          <div className="absolute top-2 right-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
          </div>
        )}
      </div>

      {/* Footer with tips */}
      <div className="border-t bg-gray-50 px-3 py-2 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>💡 Tips: Ctrl+B (bold), Ctrl+I (italic), Ctrl+Enter (line break)</span>
          <span className={cn("transition-colors", isFocused ? "text-blue-600" : "text-gray-400")}>
            {isFocused ? "✏️ Editing" : "📝 Ready"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Export for production use
export default ScriptEditor;
