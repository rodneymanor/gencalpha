"use client";

import { useState } from "react";

import dynamic from "next/dynamic";

const SimpleEditor = dynamic(() => import("@/components/editor/simple-editor"), {
  ssr: false,
  loading: () => <div className="rounded-lg border p-4">Loading Simple Editor...</div>,
});

const MinimalEditor = dynamic(() => import("@/components/editor/minimal-editor"), {
  ssr: false,
  loading: () => <div className="rounded-lg border p-4">Loading Minimal Editor...</div>,
});

const StableEditor = dynamic(() => import("@/components/editor/stable-editor"), {
  ssr: false,
  loading: () => <div className="rounded-lg border p-4">Loading Stable Editor...</div>,
});

const ScriptEditor = dynamic(() => import("@/components/editor/script-editor"), {
  ssr: false,
  loading: () => <div className="rounded-lg border p-4">Loading Script Editor...</div>,
});

const CustomBlockEditor = dynamic(() => import("@/components/editor/custom-block-editor"), {
  ssr: false,
  loading: () => <div className="rounded-lg border p-4">Loading Custom Block Editor...</div>,
});

export default function TestEditor() {
  const [content, setContent] = useState("");
  const [activeEditor, setActiveEditor] = useState<"script" | "custom" | "stable" | "minimal" | "simple">("script");

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-2 text-2xl font-bold">Editor Test Laboratory</h1>
      <p className="mb-6 text-gray-600">
        Compare different editor implementations. The <strong>Script Editor</strong> is recommended for production use.
      </p>

      <div className="mb-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveEditor("script")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeEditor === "script"
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🚀 Script Editor (Production Ready)
          </button>
          <button
            onClick={() => setActiveEditor("custom")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeEditor === "custom"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🎨 Custom Blocks (Phase 5)
          </button>
          <button
            onClick={() => setActiveEditor("stable")}
            className={`rounded px-3 py-2 text-sm ${
              activeEditor === "stable" ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            🏆 Stable BlockNote
          </button>
          <button
            onClick={() => setActiveEditor("minimal")}
            className={`rounded px-3 py-2 text-sm ${
              activeEditor === "minimal" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            ⚡ Minimal BlockNote
          </button>
          <button
            onClick={() => setActiveEditor("simple")}
            className={`rounded px-3 py-2 text-sm ${
              activeEditor === "simple" ? "bg-purple-500 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            🧪 Simple BlockNote
          </button>
        </div>
      </div>

      <div className="mb-6">
        {activeEditor === "script" && (
          <ScriptEditor
            value={content}
            onChange={setContent}
            placeholder="Write your script here... This editor is reliable, fast, and perfect for script writing with AI integration."
          />
        )}

        {activeEditor === "custom" && <CustomBlockEditor value={content} onChange={setContent} />}

        {activeEditor === "stable" && <StableEditor value={content} onChange={setContent} />}

        {activeEditor === "minimal" && <MinimalEditor value={content} onChange={setContent} />}

        {activeEditor === "simple" && <SimpleEditor value={content} onChange={setContent} />}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Content Output:</h2>
          <pre className="max-h-60 overflow-auto rounded border bg-gray-100 p-3 text-xs whitespace-pre-wrap">
            {content || "No content yet..."}
          </pre>
          <div className="mt-2 text-xs text-gray-500">
            {activeEditor === "script"
              ? "Plain text format (perfect for AI processing)"
              : "JSON format (BlockNote structure)"}
            {activeEditor === "custom" && " - Custom blocks with script-specific components"}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">Editor Analysis:</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
              <strong className="text-emerald-700">🚀 Script Editor:</strong>
              <p className="mt-1 text-emerald-600">✅ Zero errors, fast, reliable</p>
              <p className="text-emerald-600">✅ Perfect for script writing & AI</p>
              <p className="text-emerald-600">✅ Built-in formatting shortcuts</p>
            </div>

            <div className="rounded border border-purple-200 bg-purple-50 p-3">
              <strong className="text-purple-700">🎨 Custom Blocks:</strong>
              <p className="mt-1 text-purple-600">✨ Script-specific block types</p>
              <p className="text-purple-600">🪝 Hook, Bridge, Golden Nugget, CTA</p>
              <p className="text-purple-600">⚠️ May have BlockNote position errors</p>
            </div>

            <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
              <strong className="text-yellow-700">BlockNote Editors:</strong>
              <p className="mt-1 text-yellow-600">⚠️ Position errors persist</p>
              <p className="text-yellow-600">⚠️ Complex for simple text editing</p>
              <p className="text-yellow-600">⚠️ Overkill for script writing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-800">💡 Recommendation:</h3>
        <p className="text-sm text-blue-700">
          Use the <strong>Script Editor</strong> for your script writing and AI features. It's:
        </p>
        <ul className="mt-2 ml-4 space-y-1 text-sm text-blue-700">
          <li>
            • 🚫 <strong>Error-free</strong> - No ProseMirror position issues
          </li>
          <li>
            • ⚡ <strong>Fast & Lightweight</strong> - Instant loading and response
          </li>
          <li>
            • 🤖 <strong>AI-Ready</strong> - Plain text perfect for AI processing
          </li>
          <li>
            • ⌨️ <strong>Script-Focused</strong> - Built for writing, not complex formatting
          </li>
          <li>
            • 🎨 <strong>Customizable</strong> - Easy to extend with AI features
          </li>
        </ul>
      </div>

      <div className="mt-4 rounded border bg-gray-50 p-3 text-xs text-gray-600">
        <strong>Testing Notes:</strong> The Script Editor should be completely stable with no console errors. Perfect
        foundation for adding AI-powered script generation, suggestions, and enhancements.
      </div>
    </div>
  );
}
