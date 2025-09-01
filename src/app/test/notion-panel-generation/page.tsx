'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { X, Menu, FileText, Sparkles, Check, Clock, AlertCircle } from 'lucide-react';
import { NotionPanel } from '@/components/panels/notion';

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
  const [title, setTitle] = useState('Content Generation Idea');
  const [editorContent, setEditorContent] = useState('');
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  
  // Properties including URL and generation status
  const [properties, setProperties] = useState([
    { 
      id: '1', 
      type: 'url' as const, 
      name: 'URL', 
      value: '',
      icon: 'link' 
    },
    { 
      id: '2', 
      type: 'status' as const, 
      name: 'Generation', 
      value: GENERATION_STATUSES[0], 
      icon: 'burst' 
    }
  ]);

  const cycleStatus = () => {
    const nextIndex = (currentStatusIndex + 1) % GENERATION_STATUSES.length;
    setCurrentStatusIndex(nextIndex);
    setProperties(prev => prev.map(prop => 
      prop.id === '2' ? { ...prop, value: GENERATION_STATUSES[nextIndex] } : prop
    ));
  };

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
        } else {
          // Fallback: extract domain name as title
          try {
            const url = new URL(value);
            const domain = url.hostname.replace('www.', '');
            setTitle(domain.charAt(0).toUpperCase() + domain.slice(1));
          } catch {
            // If URL is invalid, keep the current title
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
                    setProperties(prev => prev.map(prop => 
                      prop.id === '2' ? { ...prop, value: status } : prop
                    ));
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
            showPageControls={true}
            width={panelWidth}
            onWidthChange={setPanelWidth}
            minWidth={400}
            maxWidth={900}
            onClose={() => setIsPanelOpen(false)}
            tabData={{
              video: (
                <div className="space-y-4">
                  <div className="aspect-video bg-neutral-900 rounded-[var(--radius-card)] flex items-center justify-center">
                    <span className="text-neutral-400">Video Player Placeholder</span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    Video content would be displayed here with playback controls.
                  </div>
                </div>
              ),
              transcript: (
                <div className="prose prose-neutral max-w-none">
                  <h3>Video Transcript</h3>
                  <p className="text-neutral-600">
                    [00:00] Introduction to the topic...
                  </p>
                  <p className="text-neutral-600">
                    [00:15] Main points discussed...
                  </p>
                  <p className="text-neutral-600">
                    [00:45] Key insights and takeaways...
                  </p>
                </div>
              ),
              components: (
                <div className="space-y-3">
                  <div className="p-3 bg-neutral-100 rounded-[var(--radius-card)]">
                    <div className="font-medium text-sm mb-1">Hook Component</div>
                    <div className="text-xs text-neutral-600">Opening hook to grab attention</div>
                  </div>
                  <div className="p-3 bg-neutral-100 rounded-[var(--radius-card)]">
                    <div className="font-medium text-sm mb-1">Main Content</div>
                    <div className="text-xs text-neutral-600">Core message and value proposition</div>
                  </div>
                  <div className="p-3 bg-neutral-100 rounded-[var(--radius-card)]">
                    <div className="font-medium text-sm mb-1">Call to Action</div>
                    <div className="text-xs text-neutral-600">Engagement prompt for viewers</div>
                  </div>
                </div>
              ),
              metadata: (
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-neutral-200">
                    <span className="text-sm text-neutral-600">Duration</span>
                    <span className="text-sm font-medium">2:45</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-200">
                    <span className="text-sm text-neutral-600">Format</span>
                    <span className="text-sm font-medium">16:9 Vertical</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-200">
                    <span className="text-sm text-neutral-600">Platform</span>
                    <span className="text-sm font-medium">TikTok, Instagram Reels</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-neutral-600">Created</span>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                </div>
              ),
              suggestions: (
                <div className="space-y-3">
                  <div className="p-3 bg-success-50 border border-success-200 rounded-[var(--radius-card)]">
                    <div className="text-sm font-medium text-success-900 mb-1">✓ Strong opening hook</div>
                    <div className="text-xs text-success-700">The first 3 seconds effectively capture attention</div>
                  </div>
                  <div className="p-3 bg-warning-50 border border-warning-200 rounded-[var(--radius-card)]">
                    <div className="text-sm font-medium text-warning-900 mb-1">⚠ Consider adding captions</div>
                    <div className="text-xs text-warning-700">85% of viewers watch with sound off</div>
                  </div>
                  <div className="p-3 bg-primary-50 border border-primary-200 rounded-[var(--radius-card)]">
                    <div className="text-sm font-medium text-primary-900 mb-1">💡 Try a pattern interrupt</div>
                    <div className="text-xs text-primary-700">Add a visual change at 0:30 to maintain engagement</div>
                  </div>
                </div>
              ),
              analysis: (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Engagement Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-200 rounded-full h-2">
                          <div className="bg-success-500 h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                        <span className="text-xs text-neutral-600">85% Hook Rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-200 rounded-full h-2">
                          <div className="bg-primary-500 h-2 rounded-full" style={{ width: '72%' }} />
                        </div>
                        <span className="text-xs text-neutral-600">72% Retention</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Content Score</h4>
                    <div className="text-2xl font-bold text-success-600">8.5/10</div>
                    <div className="text-xs text-neutral-600">Based on platform best practices</div>
                  </div>
                </div>
              )
            }}
            defaultTab="video"
          />
        </div>
      </div>
    </div>
  );
}