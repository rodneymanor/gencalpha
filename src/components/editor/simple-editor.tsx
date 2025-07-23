'use client';

import React from 'react';

// BlockNote imports without CSS for now
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteViewEditor } from '@blocknote/react';

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Helper function to safely parse BlockNote content
const parseBlockNoteContent = (content: string) => {
  if (!content || content.trim() === '') {
    return undefined; // Let BlockNote use default empty content
  }

  try {
    // Try to parse as JSON first (existing BlockNote content)
    return JSON.parse(content);
  } catch {
    // If it's not JSON, treat it as plain text and convert to BlockNote format
    return [
      {
        id: "initial-block",
        type: "paragraph",
        props: {},
        content: [
          {
            type: "text",
            text: content,
            styles: {}
          }
        ],
        children: []
      }
    ];
  }
};

// Separate BlockNote Editor Component to avoid hooks rules violation
function BlockNoteEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useCreateBlockNote({
    initialContent: parseBlockNoteContent(value),
  });

  const handleChange = () => {
    try {
      const content = JSON.stringify(editor.document);
      onChange(content);
    } catch (error) {
      console.error('Error in handleChange:', error);
    }
  };

  return (
    <div className="min-h-[200px] border rounded p-2 prose max-w-none">
      <BlockNoteViewEditor 
        editor={editor} 
        onChange={handleChange}
      />
    </div>
  );
}

export function SimpleEditor({ value, onChange }: SimpleEditorProps) {
  const [useBlockNote, setUseBlockNote] = React.useState(false);
  const [blockNoteError, setBlockNoteError] = React.useState<string | null>(null);

  // Basic textarea fallback
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const testBlockNote = () => {
    setBlockNoteError(null);
    try {
      setUseBlockNote(true);
    } catch (error) {
      setBlockNoteError(String(error));
      setUseBlockNote(false);
    }
  };

  if (useBlockNote) {
    return (
      <div className="border rounded-lg p-4">
        <div className="mb-2 flex items-center justify-between">
          <strong>BlockNote Editor (Active)</strong>
          <button 
            onClick={() => {
              setUseBlockNote(false);
              setBlockNoteError(null);
            }}
            className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Switch to Textarea
          </button>
        </div>
        {blockNoteError ? (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-600 text-sm">BlockNote Error: {blockNoteError}</p>
            <button 
              onClick={() => setUseBlockNote(false)}
              className="mt-2 text-sm px-2 py-1 bg-red-100 rounded hover:bg-red-200"
            >
              Back to Textarea
            </button>
          </div>
        ) : (
          <>
            <BlockNoteEditor value={value} onChange={onChange} />
            <div className="mt-2 text-xs text-gray-500">
              BlockNote editor active. Content will be saved as JSON.
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-2 flex items-center justify-between">
        <strong>Simple Editor (Textarea Mode)</strong>
        <button 
          onClick={testBlockNote}
          className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test BlockNote
        </button>
      </div>
      <textarea
        value={value}
        onChange={handleTextChange}
        className="w-full h-32 p-2 border rounded resize-none"
        placeholder="Type something here to test..."
      />
      {blockNoteError && (
        <div className="mt-2 text-xs text-red-600">
          Last BlockNote error: {blockNoteError}
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500">
        Click "Test BlockNote" to try the BlockNote editor. Your text will be preserved.
      </div>
    </div>
  );
}

export default SimpleEditor;