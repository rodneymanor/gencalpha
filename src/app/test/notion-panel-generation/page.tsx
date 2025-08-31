'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { X, Menu, FileText, Sparkles, Check, Clock, AlertCircle } from 'lucide-react';
import NotionPanel from '@/components/panels/notion-panel';

// Dynamically import BlockNote to avoid SSR issues
const BlockNoteEditor = dynamic(() => import('@/components/editor/block-note-editor'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-neutral-100 rounded h-20" />
});

// Generation status options
const GENERATION_STATUSES = [
  { label: 'Hooks Ready', color: 'success' },
  { label: 'Script Ready', color: 'success' },
  { label: 'Content Ready', color: 'success' },
  { label: 'Hooks + Script', color: 'warning' },
  { label: 'Script + Content', color: 'warning' },
  { label: 'All Generated', color: 'success' },
  { label: 'Pending', color: 'default' },
  { label: 'Processing', color: 'warning' },
  { label: 'Failed', color: 'error' }
];

export default function NotionPanelGenerationTest() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(600);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('Content Generation Idea');
  const [editorContent, setEditorContent] = useState('');
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  
  // Single status property for generation tracking
  const [properties, setProperties] = useState([
    { 
      id: '1', 
      type: 'status' as const, 
      name: 'Generation', 
      value: GENERATION_STATUSES[0], 
      icon: 'burst' 
    }
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newWidth = window.innerWidth - e.clientX;
        setPanelWidth(Math.min(Math.max(newWidth, 400), 900));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const cycleStatus = () => {
    const nextIndex = (currentStatusIndex + 1) % GENERATION_STATUSES.length;
    setCurrentStatusIndex(nextIndex);
    setProperties([
      { 
        id: '1', 
        type: 'status' as const, 
        name: 'Generation', 
        value: GENERATION_STATUSES[nextIndex], 
        icon: 'burst' 
      }
    ]);
  };

  const handlePropertyChange = (id: string, value: string | { label: string; color: string }) => {
    setProperties(prev => 
      prev.map(prop => 
        prop.id === id ? { ...prop, value } : prop
      )
    );
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('Ready') || status === 'All Generated') return <Check className="w-4 h-4" />;
    if (status === 'Processing') return <Clock className="w-4 h-4" />;
    if (status === 'Failed') return <AlertCircle className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Main Content Area */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Generation Status Panel Test
          </h1>
          <p className="text-neutral-600 mb-8">
            Test different generation status states for content ideas.
          </p>

          {/* Test Controls */}
          <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] p-6 mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Status Controls</h2>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="px-4 py-2 bg-neutral-900 text-neutral-50 rounded-[var(--radius-button)] hover:bg-neutral-800 transition-colors duration-150"
              >
                {isPanelOpen ? 'Close Panel' : 'Open Panel'}
              </button>
              <button
                onClick={cycleStatus}
                className="px-4 py-2 bg-primary-500 text-white rounded-[var(--radius-button)] hover:bg-primary-600 transition-colors duration-150"
              >
                Cycle Status
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-[var(--radius-button)]">
                {getStatusIcon(GENERATION_STATUSES[currentStatusIndex].label)}
                <span className="text-sm font-medium text-neutral-700">
                  Current: {GENERATION_STATUSES[currentStatusIndex].label}
                </span>
              </div>
            </div>
          </div>

          {/* Status Options Preview */}
          <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] p-6 mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Available Statuses</h2>
            <div className="grid grid-cols-3 gap-3">
              {GENERATION_STATUSES.map((status, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentStatusIndex(index);
                    setProperties([
                      { 
                        id: '1', 
                        type: 'status' as const, 
                        name: 'Generation', 
                        value: status, 
                        icon: 'burst' 
                      }
                    ]);
                  }}
                  className={`
                    px-3 py-2 rounded-[var(--radius-button)] text-sm font-medium
                    transition-all duration-150 flex items-center gap-2
                    ${currentStatusIndex === index 
                      ? 'bg-neutral-900 text-neutral-50' 
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }
                  `}
                >
                  {getStatusIcon(status.label)}
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Content Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Hook Ideas', status: 'Hooks Ready' },
              { title: 'Script Draft', status: 'Script Ready' },
              { title: 'Visual Content', status: 'Content Ready' },
              { title: 'Complete Package', status: 'All Generated' }
            ].map((item, i) => (
              <div 
                key={i}
                className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-neutral-400" />
                  <h3 className="font-medium text-neutral-900">{item.title}</h3>
                </div>
                <p className="text-sm text-neutral-600 mb-3">
                  Sample content for {item.title.toLowerCase()}.
                </p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-success-100 text-success-900 border border-success-200">
                  <div className="w-2 h-2 rounded-full bg-success-600" />
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-out Panel */}
      <div 
        className={`
          fixed top-0 right-0 h-full bg-white
          shadow-[var(--shadow-soft-drop)] 
          transform transition-transform duration-300 ease-out
          ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ width: `${panelWidth}px` }}
      >
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-400 transition-colors duration-150"
          onMouseDown={handleMouseDown}
        />

        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPanelOpen(false)}
              className="p-1.5 hover:bg-neutral-100 rounded-[var(--radius-button)] transition-colors duration-150"
            >
              <X className="w-4 h-4 text-neutral-600" />
            </button>
            <button className="p-1.5 hover:bg-neutral-100 rounded-[var(--radius-button)] transition-colors duration-150">
              <Menu className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Width: {panelWidth}px</span>
          </div>
        </div>

        {/* NotionPanel Component */}
        <div className="h-[calc(100%-57px)] overflow-hidden">
          <NotionPanel
            title={title}
            onTitleChange={setTitle}
            properties={properties}
            onPropertyChange={handlePropertyChange}
            showComments={true}
            showPageControls={true}
          >
            {/* BlockNote Editor Integration */}
            <div className="h-full">
              <BlockNoteEditor
                content={editorContent}
                onChange={setEditorContent}
                placeholder="Describe your content idea here..."
              />
            </div>
          </NotionPanel>
        </div>
      </div>
    </div>
  );
}