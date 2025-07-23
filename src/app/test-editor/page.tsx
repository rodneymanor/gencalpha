'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const SimpleEditor = dynamic(
  () => import('@/components/editor/simple-editor'),
  { 
    ssr: false,
    loading: () => <div className="border rounded-lg p-4">Loading Simple Editor...</div>
  }
);

const MinimalEditor = dynamic(
  () => import('@/components/editor/minimal-editor'),
  { 
    ssr: false,
    loading: () => <div className="border rounded-lg p-4">Loading Minimal Editor...</div>
  }
);

const StableEditor = dynamic(
  () => import('@/components/editor/stable-editor'),
  { 
    ssr: false,
    loading: () => <div className="border rounded-lg p-4">Loading Stable Editor...</div>
  }
);

const ScriptEditor = dynamic(
  () => import('@/components/editor/script-editor'),
  { 
    ssr: false,
    loading: () => <div className="border rounded-lg p-4">Loading Script Editor...</div>
  }
);

const CustomBlockEditor = dynamic(
  () => import('@/components/editor/custom-block-editor'),
  { 
    ssr: false,
    loading: () => <div className="border rounded-lg p-4">Loading Custom Block Editor...</div>
  }
);

export default function TestEditor() {
  const [content, setContent] = useState('');
  const [activeEditor, setActiveEditor] = useState<'script' | 'custom' | 'stable' | 'minimal' | 'simple'>('script');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Editor Test Laboratory</h1>
      <p className="text-gray-600 mb-6">
        Compare different editor implementations. The <strong>Script Editor</strong> is recommended for production use.
      </p>
      
      <div className="mb-6">
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setActiveEditor('script')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeEditor === 'script' 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            🚀 Script Editor (Production Ready)
          </button>
          <button
            onClick={() => setActiveEditor('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeEditor === 'custom' 
                ? 'bg-purple-500 text-white shadow-lg' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            🎨 Custom Blocks (Phase 5)
          </button>
          <button
            onClick={() => setActiveEditor('stable')}
            className={`px-3 py-2 rounded text-sm ${
              activeEditor === 'stable' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            🏆 Stable BlockNote
          </button>
          <button
            onClick={() => setActiveEditor('minimal')}
            className={`px-3 py-2 rounded text-sm ${
              activeEditor === 'minimal' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            ⚡ Minimal BlockNote
          </button>
          <button
            onClick={() => setActiveEditor('simple')}
            className={`px-3 py-2 rounded text-sm ${
              activeEditor === 'simple' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            🧪 Simple BlockNote
          </button>
        </div>
      </div>

      <div className="mb-6">
        {activeEditor === 'script' && (
          <ScriptEditor 
            value={content} 
            onChange={setContent}
            placeholder="Write your script here... This editor is reliable, fast, and perfect for script writing with AI integration."
          />
        )}

        {activeEditor === 'custom' && (
          <CustomBlockEditor 
            value={content} 
            onChange={setContent}
          />
        )}

        {activeEditor === 'stable' && (
          <StableEditor 
            value={content} 
            onChange={setContent} 
          />
        )}

        {activeEditor === 'minimal' && (
          <MinimalEditor 
            value={content} 
            onChange={setContent} 
          />
        )}

        {activeEditor === 'simple' && (
          <SimpleEditor 
            value={content} 
            onChange={setContent} 
          />
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Content Output:</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap border">
            {content || 'No content yet...'}
          </pre>
          <div className="mt-2 text-xs text-gray-500">
            {activeEditor === 'script' ? 'Plain text format (perfect for AI processing)' : 'JSON format (BlockNote structure)'}
            {activeEditor === 'custom' && ' - Custom blocks with script-specific components'}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Editor Analysis:</h2>
          <div className="text-sm space-y-3">
            <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
              <strong className="text-emerald-700">🚀 Script Editor:</strong>
              <p className="text-emerald-600 mt-1">✅ Zero errors, fast, reliable</p>
              <p className="text-emerald-600">✅ Perfect for script writing & AI</p>
              <p className="text-emerald-600">✅ Built-in formatting shortcuts</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded border border-purple-200">
              <strong className="text-purple-700">🎨 Custom Blocks:</strong>
              <p className="text-purple-600 mt-1">✨ Script-specific block types</p>
              <p className="text-purple-600">🪝 Hook, Bridge, Golden Nugget, CTA</p>
              <p className="text-purple-600">⚠️ May have BlockNote position errors</p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <strong className="text-yellow-700">BlockNote Editors:</strong>
              <p className="text-yellow-600 mt-1">⚠️ Position errors persist</p>
              <p className="text-yellow-600">⚠️ Complex for simple text editing</p>
              <p className="text-yellow-600">⚠️ Overkill for script writing</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Recommendation:</h3>
        <p className="text-blue-700 text-sm">
          Use the <strong>Script Editor</strong> for your script writing and AI features. It's:
        </p>
        <ul className="text-blue-700 text-sm mt-2 space-y-1 ml-4">
          <li>• 🚫 <strong>Error-free</strong> - No ProseMirror position issues</li>
          <li>• ⚡ <strong>Fast & Lightweight</strong> - Instant loading and response</li>
          <li>• 🤖 <strong>AI-Ready</strong> - Plain text perfect for AI processing</li>
          <li>• ⌨️ <strong>Script-Focused</strong> - Built for writing, not complex formatting</li>
          <li>• 🎨 <strong>Customizable</strong> - Easy to extend with AI features</li>
        </ul>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 border rounded text-xs text-gray-600">
        <strong>Testing Notes:</strong> The Script Editor should be completely stable with no console errors. 
        Perfect foundation for adding AI-powered script generation, suggestions, and enhancements.
      </div>
    </div>
  );
}