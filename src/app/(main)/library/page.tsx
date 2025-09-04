"use client";

// Library Page - Modern library management using DataTableTemplate  
// Unified library with chat history, captured content, and resources

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import { ChevronsRight, Maximize, Minimize, Copy, Download, PenTool, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { generateTitleFromContent } from "@/lib/transcript-title-generator";

import { DataTableTemplate } from "@/components/templates/data-table-template";
import { listConversations, type ChatConversation } from "@/components/write-chat/services/chat-service";
import { useContentItems } from "@/components/content-inbox/hooks/use-content-inbox";
import { type ContentItem } from "@/components/content-inbox/types";
import { NotionPanel } from '@/components/panels/notion';
import type { PageProperty, TabData } from '@/components/panels/notion';
import { useScriptsApi } from "@/hooks/use-scripts-api";
import { Script } from "@/types/script";
import { Hook } from "@/app/api/hooks/route";
import { ContentIdea } from "@/app/api/content/ideas/route";
import { useAuth } from "@/contexts/auth-context";

import { getLibraryConfig } from "./library-config";
import { generateMockData } from "./types";
import { combineAllDataSources } from "./content-adapter";

// Dynamically import BlockNote to avoid SSR issues
const BlockNoteEditor = dynamic(() => import('@/components/editor/block-note-editor'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-neutral-100 rounded h-20" />
});

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add ContentInbox data
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  
  // Add generated content data
  const { scripts, fetchScripts, loading: scriptsLoading } = useScriptsApi();
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [hooksLoading, setHooksLoading] = useState(false);
  const [ideasLoading, setIdeasLoading] = useState(false);
  
  // NotionPanel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(600);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [panelMode, setPanelMode] = useState<'view' | 'notes'>('view');
  const [notes, setNotes] = useState('');
  
  // Properties for the selected item
  const [properties, setProperties] = useState<PageProperty[]>([
    { 
      id: '1', 
      type: 'status' as const, 
      name: 'Generation', 
      value: { label: 'Pending', color: 'default' }, 
      icon: 'burst' 
    }
  ]);

  // Handler functions for new buttons
  const handleNewScript = () => {
    router.push('/write');
  };

  const handleNewIdea = () => {
    // Reset properties to default without URL field
    setProperties([
      { 
        id: '1', 
        type: 'status' as const, 
        name: 'Generation', 
        value: { label: 'Pending', color: 'default' }, 
        icon: 'burst' 
      }
    ]);
    
    // Clear any existing notes and set to new idea mode
    setNotes('');
    setPanelMode('notes');
    setSelectedItem(null);
    
    // Open the panel
    setIsPanelOpen(true);
  };
  
  // Parse URL parameters for default filters
  const urlSource = searchParams.get('source');
  const urlType = searchParams.get('type');
  const urlPlatform = searchParams.get('platform');
  
  // Build initial filters from URL parameters
  const initialFilters = useMemo(() => {
    const filters: Record<string, string[]> = {};
    
    if (urlSource) {
      filters.contentSource = [urlSource];
    }
    
    if (urlType) {
      filters.type = [urlType];
    }
    
    if (urlPlatform) {
      filters.platform = [urlPlatform];
    }
    
    return filters;
  }, [urlSource, urlType, urlPlatform]);
  
  // Load ContentInbox data using the existing hook
  const { 
    data: contentData, 
    isLoading: contentLoading,
    isError: contentError,
    refetch: refetchContent 
  } = useContentItems({}, { field: "savedAt", direction: "desc" });
  
  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      
      // Load conversations
      try {
        const chats = await listConversations();
        setConversations(chats);
      } catch (err) {
        console.error("Failed to load conversations:", err);
        toast.error("Failed to load chat conversations");
      }
      
      // Load scripts
      try {
        await fetchScripts();
      } catch (err) {
        console.error("Failed to load scripts:", err);
        toast.error("Failed to load scripts");
      }
      
      // Load hooks
      if (user) {
        setHooksLoading(true);
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/hooks", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setHooks(data.hooks);
          }
        } catch (err) {
          console.error("Failed to load hooks:", err);
        } finally {
          setHooksLoading(false);
        }
        
        // Load content ideas
        setIdeasLoading(true);
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/content/ideas", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setContentIdeas(data.ideas);
          }
        } catch (err) {
          console.error("Failed to load content ideas:", err);
        } finally {
          setIdeasLoading(false);
        }
      }
      
      setLoading(false);
    };
    
    loadAllData();
  }, [user, fetchScripts]);
  
  // Extract content items from paginated data
  useEffect(() => {
    if (contentData?.pages) {
      const allContent = contentData.pages.flatMap(page => page.items ?? []);
      setContentItems(allContent);
    }
  }, [contentData]);
  
  // Generate mock data for demo (other library items)
  const mockData = useMemo(() => generateMockData(), []);
  
  // Combine all data sources: chats + content + scripts + hooks + ideas + mock data
  const combinedData = useMemo(
    () => combineAllDataSources(conversations, contentItems, scripts, hooks, contentIdeas, mockData),
    [conversations, contentItems, scripts, hooks, contentIdeas, mockData]
  );
  
  // State for active filters
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(initialFilters);
  
  // Apply filters to combined data
  const filteredData = useMemo(() => {
    let filtered = [...combinedData];
    
    // Filter by content source
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeFilters.contentSource?.length > 0) {
      filtered = filtered.filter(item => {
        if (activeFilters.contentSource.includes('chat')) {
          return item.tags.includes('chat');
        }
        if (activeFilters.contentSource.includes('captured')) {
          return item.tags.includes('captured');
        }
        return false;
      });
    }
    
    // Filter by type
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeFilters.type?.length > 0) {
       filtered = filtered.filter(item => {
         // For the new type system, match against tags for platform-specific types
         if (activeFilters.type.includes('chat') && item.tags.includes('chat')) return true;
         if (activeFilters.type.includes('tiktok') && item.tags.includes('tiktok')) return true;
         if (activeFilters.type.includes('instagram') && item.tags.includes('instagram')) return true;
         if (activeFilters.type.includes('note') && item.type === 'note') return true;
         return false;
       });
     }
     
    // Filter by category
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeFilters.category?.length > 0) {
       filtered = filtered.filter(item => activeFilters.category.includes(item.category));
     }
    
    // Filter by platform
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeFilters.platform?.length > 0) {
      filtered = filtered.filter(item => {
        // Check if any of the item's tags match the selected platforms
        return item.tags.some(tag => activeFilters.platform.includes(tag));
      });
    }
    
    return filtered;
  }, [combinedData, activeFilters]);

  // Helper function to render markdown content
  const renderMarkdownContent = (content: string) => {
    if (!content) return content;
    
    // Simple markdown-like rendering
    return (
      <>
        {content
          .split('\n')
          .map((line, index) => {
        // Handle headers
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-semibold text-neutral-900 mt-4 mb-2">
              {line.replace('### ', '')}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-semibold text-neutral-900 mt-4 mb-2">
              {line.replace('## ', '')}
            </h2>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} className="text-2xl font-bold text-neutral-900 mt-4 mb-2">
              {line.replace('# ', '')}
            </h1>
          );
        }
        
        // Handle bullet lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={index} className="ml-4 text-neutral-700">
              {line.replace(/^[*-] /, '')}
            </li>
          );
        }
        
        // Handle numbered lists
        if (/^\d+\. /.test(line)) {
          return (
            <li key={index} className="ml-4 text-neutral-700">
              {line.replace(/^\d+\. /, '')}
            </li>
          );
        }
        
        // Handle bold text
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Handle italic text
        const italicText = boldText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Handle code spans
        const codeText = italicText.replace(/`(.*?)`/g, '<code class="bg-neutral-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
        
        // Empty lines for spacing
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // Regular paragraphs
        return (
          <p 
            key={index} 
            className="text-neutral-700 mb-2"
            dangerouslySetInnerHTML={{ __html: codeText }}
          />
        );
          })}
      </>
    );
  };
  
  // Handle item selection for the panel
  const handleItemSelect = (item: any) => {
    // Route generated content (scripts, hooks, ideas) to script editor
    if (item.category === 'script' || item.category === 'hooks' || item.category === 'idea') {
      // Store the content in localStorage for the script editor to use
      let content = item.description || '';
      
      // For hooks, check if we have structured hook data in metadata
      if (item.category === 'hooks') {
        // If we have structured hooks data, pass it through metadata
        // The editor will format it properly
        if (item.metadata?.hooks) {
          content = ''; // Will be formatted from metadata.hooks
        } else {
          // Fallback to description if no structured data
          content = item.description || '';
        }
      }
      // For scripts, try to get the actual script content if available
      else if (item.category === 'script') {
        // First try to get actual script content from metadata, then fallback to description
        content = item.metadata?.scriptContent || item.content || item.description || '';
      }
      // For ideas, use the description as-is
      else if (item.category === 'idea') {
        content = item.description || '';
      }
      
      const contentData = {
        title: item.title,
        content: content,
        category: item.category,
        metadata: item.metadata || {}
      };
      
      console.log('📦 [Library] Storing content for editor:', contentData);
      localStorage.setItem('libraryContent', JSON.stringify(contentData));
      
      // Navigate to script editor
      router.push('/write?from=library');
      return;
    }
    
    // For other items (notes, etc.), open in NotionPanel
    setSelectedItem(item);
    
    // Update properties without URL field
    const newProperties: PageProperty[] = [];
    
    // Add generation status for appropriate items
    if (item.tags?.includes('captured') || item.tags?.includes('chat')) {
      newProperties.push({ 
        id: '1', 
        type: 'status' as const, 
        name: 'Generation', 
        value: { label: 'Pending', color: 'default' }, 
        icon: 'burst' 
      });
    }
    
    setProperties(newProperties);
    setPanelMode('view');
    setIsPanelOpen(true);
  };
  
  const handlePropertyChange = async (id: string, value: string | { label: string; color: string }) => {
    setProperties(prev => 
      prev.map(prop => 
        prop.id === id ? { ...prop, value } : prop
      )
    );
  };
  
  // Generate tab data based on selected item
  const generateTabData = (item: any): TabData | undefined => {
    if (!item) return undefined;
    
    const tabData: TabData = {};
    
    // Add video tab if item has video content
    if (item.tags?.includes('tiktok') || item.tags?.includes('instagram') || item.type === 'video') {
      tabData.video = (
        <div className="space-y-4">
          <div className="aspect-video bg-neutral-900 rounded-[var(--radius-card)] flex items-center justify-center">
            <span className="text-neutral-400">Video Player Placeholder</span>
          </div>
          <div className="text-sm text-neutral-600">
            {item.description || 'Video content would be displayed here.'}
          </div>
        </div>
      );
    }
    
    // Add transcript tab if item has transcript content
    if (item.content || item.tags?.includes('chat')) {
      tabData.transcript = (
        <div className="prose prose-neutral max-w-none">
          <h3>Content</h3>
          <div className="text-neutral-600 whitespace-pre-wrap markdown-content">
            {renderMarkdownContent(item.content || item.description || 'Content would appear here...')}
          </div>
        </div>
      );
    }
    
    // Add components tab for structured content
    if (item.tags?.includes('chat') && item.content) {
      tabData.components = (
        <div className="space-y-3">
          <div className="p-3 bg-neutral-100 rounded-[var(--radius-card)]">
            <div className="font-medium text-sm mb-1">Content Structure</div>
            <div className="text-xs text-neutral-600">
              {item.content.length > 100 ? 'Long-form content' : 'Short-form content'}
            </div>
          </div>
          <div className="p-3 bg-neutral-100 rounded-[var(--radius-card)]">
            <div className="font-medium text-sm mb-1">Key Elements</div>
            <div className="text-xs text-neutral-600">Content analysis would appear here</div>
          </div>
        </div>
      );
    }

    // Add suggestions tab for video content
    if (item.tags?.includes('tiktok') || item.tags?.includes('instagram')) {
      tabData.suggestions = (
        <div className="space-y-3">
          <div className="p-3 bg-success-50 border border-success-200 rounded-[var(--radius-card)]">
            <div className="text-sm font-medium text-success-900 mb-1">✓ Engaging content</div>
            <div className="text-xs text-success-700">This content has strong engagement potential</div>
          </div>
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-[var(--radius-card)]">
            <div className="text-sm font-medium text-primary-900 mb-1">💡 Adaptation ideas</div>
            <div className="text-xs text-primary-700">Consider adapting for different platforms</div>
          </div>
        </div>
      );
    }

    // Add analysis tab for content with rich data
    if (item.tags?.includes('captured') || item.content) {
      tabData.analysis = (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Content Metrics</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-neutral-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
                <span className="text-xs text-neutral-600">75% Relevance</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Content Score</h4>
            <div className="text-2xl font-bold text-success-600">7.5/10</div>
            <div className="text-xs text-neutral-600">Based on engagement potential</div>
          </div>
        </div>
      );
    }

    // Add metadata tab
    tabData.metadata = (
      <div className="space-y-2">
        <div className="flex justify-between py-2 border-b border-neutral-200">
          <span className="text-sm text-neutral-600">Type</span>
          <span className="text-sm font-medium">{item.type || 'Unknown'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-neutral-200">
          <span className="text-sm text-neutral-600">Category</span>
          <span className="text-sm font-medium">{item.category || 'General'}</span>
        </div>
        {item.platform && (
          <div className="flex justify-between py-2 border-b border-neutral-200">
            <span className="text-sm text-neutral-600">Platform</span>
            <span className="text-sm font-medium">{item.platform}</span>
          </div>
        )}
        <div className="flex justify-between py-2">
          <span className="text-sm text-neutral-600">Created</span>
          <span className="text-sm font-medium">
            {item.date ? new Date(item.date).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      </div>
    );
    
    return tabData;
  };
  
  // Get configuration with custom handlers for chats
  const config = useMemo(() => {
    const baseConfig = getLibraryConfig();
    
    // Override item click and edit actions for chats
    return {
      ...baseConfig,
      // Remove the default addAction to replace it with custom buttons
      addAction: undefined,
      // Add custom header content that replaces the add button area
      customHeaderActions: (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleNewScript}
            variant="outline"
            size="sm"
            className="border border-neutral-200 bg-neutral-100 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:-translate-y-px hover:border-neutral-300 hover:bg-neutral-200 hover:shadow-[var(--shadow-soft-drop)]"
          >
            <PenTool className="h-4 w-4 mr-2" />
            New Script
          </Button>
          <Button
            onClick={handleNewIdea}
            variant="outline"
            size="sm"
            className="border border-neutral-200 bg-neutral-100 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:-translate-y-px hover:border-neutral-300 hover:bg-neutral-200 hover:shadow-[var(--shadow-soft-drop)]"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            New Idea
          </Button>
        </div>
      ),
      onItemClick: (item) => {
        // Open in panel for detailed view
        handleItemSelect(item);
      },
      itemActions: [
        ...(baseConfig.itemActions ?? []).map(action => {
          if (action.key === "edit") {
            return {
              ...action,
              handler: (item) => {
                if (item.url?.startsWith('/write')) {
                  // For chats, open in edit mode
                  router.push(item.url);
                } else if (item.tags.includes('captured')) {
                  toast.info(`Content items can be viewed but not directly edited`);
                } else {
                  toast.info(`Editing ${item.title}`);
                }
              },
            };
          }
          return action;
        }),
      ],
    };
  }, [router, handleNewScript, handleNewIdea]);

  // Data result for the template
  const dataResult = {
    items: filteredData,
    isLoading: loading || contentLoading || scriptsLoading || hooksLoading || ideasLoading,
    isError: !!error || contentError,
    hasMore: false,
    totalCount: filteredData.length,
    refetch: async () => {
      setLoading(true);
      try {
        // Reload all data sources
        const chats = await listConversations();
        setConversations(chats);
        await refetchContent();
        await fetchScripts();
        
        // Reload hooks
        if (user) {
          const idToken = await user.getIdToken();
          const [hooksRes, ideasRes] = await Promise.all([
            fetch("/api/hooks", { headers: { Authorization: `Bearer ${idToken}` } }),
            fetch("/api/content/ideas", { headers: { Authorization: `Bearer ${idToken}` } })
          ]);
          
          const [hooksData, ideasData] = await Promise.all([
            hooksRes.json(),
            ideasRes.json()
          ]);
          
          if (hooksData.success) setHooks(hooksData.hooks);
          if (ideasData.success) setContentIdeas(ideasData.ideas);
        }
      } catch (err) {
        console.error("Failed to reload data:", err);
        toast.error("Failed to reload data");
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <div className="h-full relative">
      {/* Main Content Area - Responsive to panel */}
      <div 
        className="h-full transition-all duration-300"
        style={{
          marginRight: isPanelOpen && !isFullScreen ? `${panelWidth}px` : '0',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <DataTableTemplate
          config={config}
          data={dataResult}
          initialFilters={initialFilters}
          events={{
          onFilterChange: (filters) => {
            console.log("Filters changed:", filters);
            // Update active filters state
            setActiveFilters(filters);
            
            // Update URL to reflect current filters
            const params = new URLSearchParams();
            if (filters.contentSource?.length) {
              params.set('source', filters.contentSource[0]);
            }
            if (filters.type?.length) {
              params.set('type', filters.type[0]);
            }
            if (filters.platform?.length) {
              params.set('platform', filters.platform[0]);
            }
            const newUrl = params.toString() ? `/library?${params.toString()}` : '/library';
            window.history.replaceState({}, '', newUrl);
          },
          onSortChange: (sort) => {
            console.log("Sort changed:", sort);
          },
          onSearchChange: (query) => {
            console.log("Search query:", query);
          },
          onViewModeChange: (mode) => {
            console.log("View mode changed:", mode);
          },
          onSelectionChange: (selectedIds) => {
            const selected = filteredData.filter((item) => selectedIds.has(item.id));
            console.log("Selection changed:", selected);
            
            // Track different types of selected content
            const selectedChats = selected.filter(item => item.url?.startsWith('/write'));
            const selectedContent = selected.filter(item => item.tags.includes('captured'));
            
            if (selectedChats.length > 0) {
              console.log(`${selectedChats.length} chat(s) selected`);
            }
            if (selectedContent.length > 0) {
              console.log(`${selectedContent.length} content item(s) selected`);
            }
          },
        }}
        />
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
            h-full bg-white shadow-[var(--shadow-soft-drop)]
            transform transition-transform duration-300
            ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
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
                  <Minimize className="w-4 h-4 text-neutral-600" />
                ) : (
                  <Maximize className="w-4 h-4 text-neutral-600" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode Toggle */}
              <div className="flex items-center rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 overflow-hidden">
                <button
                  onClick={() => setPanelMode('view')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                    panelMode === 'view'
                      ? 'bg-neutral-200 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  View
                </button>
                <button
                  onClick={() => setPanelMode('notes')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                    panelMode === 'notes'
                      ? 'bg-neutral-200 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Notes
                </button>
              </div>
              
              {/* Copy and Download buttons */}
              <div className="flex items-center overflow-hidden rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
                <button
                  onClick={() => {
                    // Copy functionality would go here
                    console.log('Copy clicked');
                    toast.info('Copy functionality coming soon');
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
                    toast.info('Download functionality coming soon');
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
              title={selectedItem?.title || 'Untitled'}
              onTitleChange={(title) => {
                if (selectedItem) {
                  setSelectedItem({ ...selectedItem, title });
                }
              }}
              properties={properties}
              onPropertyChange={handlePropertyChange}
              showPageControls={false}
              width={isFullScreen ? undefined : panelWidth}
              onWidthChange={isFullScreen ? undefined : setPanelWidth}
              minWidth={400}
              maxWidth={900}
              isOpen={isPanelOpen}
              isNewIdea={panelMode === 'notes'}
              placeholder="Add your notes here..."
              tabData={panelMode === 'view' ? generateTabData(selectedItem) : undefined}
              defaultTab="video"
            >
              {panelMode === 'notes' && (
                <div className="h-full">
                  <BlockNoteEditor
                    content={notes}
                    onChange={setNotes}
                    placeholder="Add your notes here..."
                  />
                </div>
              )}
            </NotionPanel>
          </div>
        </div>
      </div>
    </div>
  );
}