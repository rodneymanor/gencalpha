'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronsRight, Maximize2, Minimize2, FileText, Hash, Calendar, Users, Tag, Copy, Download } from 'lucide-react';
import { NotionPanel } from '@/components/panels/notion';

// Dynamically import BlockNote to avoid SSR issues
const BlockNoteEditor = dynamic(() => import('@/components/editor/block-note-editor'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-neutral-100 rounded h-20" />
});

export default function NotionPanelTest() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(600);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('Project Planning Document');
  const [editorContent, setEditorContent] = useState('');
  
  // Sample properties for testing
  const [properties, setProperties] = useState([
    { id: '1', type: 'url' as const, name: 'URL', value: '', icon: 'link' },
    { id: '2', type: 'status' as const, name: 'Generation Status', value: { label: 'Hooks Generated', color: 'success' }, icon: 'burst' }
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

  const handlePropertyChange = async (id: string, value: string | { label: string; color: string }) => {
    setProperties(prev => 
      prev.map(prop => 
        prop.id === id ? { ...prop, value } : prop
      )
    );

    // If URL field is updated, fetch the page title
    if (id === '1' && typeof value === 'string' && value) {
      try {
        // Try to fetch the title from the URL
        const response = await fetch('/api/fetch-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: value })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setTitle(data.title);
          }
        }
      } catch (error) {
        console.error('Error fetching title:', error);
        // Fallback: use URL hostname as title
        try {
          const url = new URL(value);
          const domain = url.hostname.replace('www.', '');
          setTitle(domain.charAt(0).toUpperCase() + domain.slice(1));
        } catch {
          // If URL is invalid, keep the current title
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Main Content Area - Responsive to panel */}
      <div 
        className="p-8 transition-all duration-300"
        style={{
          marginRight: isPanelOpen && !isFullScreen ? `${panelWidth}px` : '0',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Notion Panel Test Page
          </h1>
          <p className="text-neutral-600 mb-8">
            Test the Notion-like panel interface with BlockNote editor integration.
          </p>

          {/* Test Controls */}
          <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] p-6 mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Panel Controls</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="px-4 py-2 bg-neutral-900 text-neutral-50 rounded-[var(--radius-button)] hover:bg-neutral-800 transition-colors duration-150"
              >
                {isPanelOpen ? 'Close Panel' : 'Open Panel'}
              </button>
              <button
                onClick={() => setPanelWidth(600)}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-[var(--radius-button)] hover:bg-neutral-200 transition-colors duration-150"
              >
                Reset Width
              </button>
            </div>
          </div>

          {/* Sample Content Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i}
                className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)] p-6 transition-all duration-300"
                style={{
                  transform: isPanelOpen ? 'scale(0.98)' : 'scale(1)',
                  transitionDelay: `${(i - 1) * 50}ms`
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-neutral-400" />
                  <h3 className="font-medium text-neutral-900">Document {i}</h3>
                </div>
                <p className="text-sm text-neutral-600">
                  Sample document content. Click the panel button to see the Notion-like interface.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-out Panel Container */}
      <div 
        className={`
          fixed top-0 right-0 h-full
          transition-all duration-300
          ${isPanelOpen ? 'visible' : 'invisible delay-300'}
        `}
        style={{ 
          width: isFullScreen ? '100vw' : `${panelWidth}px`,
          zIndex: 1000,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Panel Content with slide animation */}
        <div 
          className={`
            h-full bg-white shadow-[var(--shadow-soft-drop)] relative
            transform transition-transform duration-300
            ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
        {/* Resize Handle - hidden in full-screen */}
        {!isFullScreen && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-400 transition-colors duration-150"
            onMouseDown={handleMouseDown}
          />
        )}

        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPanelOpen(false)}
              className="p-1.5 hover:bg-neutral-100 rounded-[var(--radius-button)] transition-colors duration-150"
            >
              <ChevronsRight className="w-4 h-4 text-neutral-600" />
            </button>
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 hover:bg-neutral-100 rounded-[var(--radius-button)] transition-colors duration-150"
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4 text-neutral-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-neutral-600" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Copy and Download buttons */}
            <div className="flex items-center overflow-hidden rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
              <button
                onClick={() => {
                  // Copy functionality would go here
                  console.log('Copy clicked');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
              <div className="w-px h-5 bg-neutral-200" />
              <button
                onClick={() => {
                  // Download functionality would go here
                  console.log('Download clicked');
                }}
                className="px-2 py-1.5 text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* NotionPanel Component */}
        <div className="h-[calc(100%-57px)] overflow-hidden">
          <NotionPanel
            title={title}
            onTitleChange={setTitle}
            properties={properties}
            onPropertyChange={handlePropertyChange}
            showPageControls={true}
            width={isFullScreen ? undefined : panelWidth}
            onWidthChange={isFullScreen ? undefined : setPanelWidth}
            minWidth={400}
            maxWidth={900}
            isOpen={isPanelOpen}
          >
            {/* BlockNote Editor Integration */}
            <div className="h-full">
              <BlockNoteEditor
                content={editorContent}
                onChange={setEditorContent}
              />
            </div>
          </NotionPanel>
        </div>
        </div>
      </div>
    </div>
  );
}