'use client';

import React, { useState } from 'react';
import { 
  Smile, 
  Image, 
  Layout, 
  Link, 
  Zap,
  MoreHorizontal,
  GripVertical 
} from 'lucide-react';

interface PageProperty {
  id: string;
  type: 'url' | 'status' | 'text' | 'select' | 'date';
  name: string;
  value?: string | { label: string; color: string };
  icon?: string;
}

interface NotionPanelProps {
  title?: string;
  onTitleChange?: (title: string) => void;
  properties?: PageProperty[];
  onPropertyChange?: (id: string, value: string | { label: string; color: string }) => void;
  showComments?: boolean;
  showPageControls?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  editorContent?: React.ReactNode;
}

export default function NotionPanel({
  title = 'New page',
  onTitleChange,
  properties = [
    { id: '1', type: 'status', name: 'Generation Status', value: { label: 'Script Ready', color: 'success' }, icon: 'burst' }
  ],
  onPropertyChange,
  showComments = true,
  showPageControls = true,
  children,
  editorContent
}: NotionPanelProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [comment, setComment] = useState('');
  const [showControls, setShowControls] = useState(false);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (onTitleChange && localTitle !== title) {
      onTitleChange(localTitle);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: 'bg-success-100 text-success-900 border-success-200',
      warning: 'bg-warning-100 text-warning-900 border-warning-200',
      error: 'bg-destructive-100 text-destructive-900 border-destructive-200',
      default: 'bg-neutral-100 text-neutral-700 border-neutral-200'
    };
    return colors[status] || colors.default;
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Page Controls */}
      {showPageControls && (
        <div 
          className="px-2 py-1"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div className={`
            flex flex-wrap gap-1 text-neutral-400 text-sm
            transition-opacity duration-200
            ${showControls ? 'opacity-100' : 'opacity-0'}
          `}>
            <button className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-button)] hover:bg-neutral-100 hover:text-neutral-600 transition-all duration-150">
              <Smile className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs">Add icon</span>
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-button)] hover:bg-neutral-100 hover:text-neutral-600 transition-all duration-150">
              <Image className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs">Add cover</span>
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-button)] hover:bg-neutral-100 hover:text-neutral-600 transition-all duration-150">
              <Layout className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs">Customize layout</span>
            </button>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="px-4 pb-3">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onFocus={() => setIsEditingTitle(true)}
          placeholder="New page"
          className={`
            w-full bg-transparent text-3xl font-bold text-neutral-900
            placeholder-neutral-300 outline-none border-none
            transition-all duration-150
            ${isEditingTitle ? 'opacity-100' : 'opacity-90'}
          `}
        />
      </div>

      {/* Properties */}
      {properties.length > 0 && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {properties.map((property) => (
              <div key={property.id} className="flex items-center gap-2 group">
                <div className="flex items-center gap-1 w-40 text-neutral-500">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <GripVertical className="w-3 h-3 cursor-grab" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-button)] hover:bg-neutral-100 cursor-pointer">
                    {property.icon === 'link' && <Link className="w-3.5 h-3.5" />}
                    {property.icon === 'burst' && <Zap className="w-3.5 h-3.5" />}
                    <span className="text-sm">{property.name}</span>
                  </div>
                </div>
                <div className="flex-1">
                  {property.type === 'status' && property.value && (
                    <div className={`
                      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs
                      ${getStatusColor(property.value.color)}
                    `}>
                      <div className={`w-2 h-2 rounded-full ${
                        property.value.color === 'success' ? 'bg-success-600' :
                        property.value.color === 'warning' ? 'bg-warning-600' :
                        property.value.color === 'error' ? 'bg-destructive-600' :
                        'bg-neutral-600'
                      }`} />
                      {property.value.label}
                    </div>
                  )}
                  {property.type === 'url' && (
                    <input
                      type="text"
                      placeholder="Empty"
                      className="w-full px-2 py-1 text-sm bg-transparent border border-transparent rounded-[var(--radius-button)] hover:bg-neutral-100 focus:bg-white focus:border-neutral-200 outline-none transition-all duration-150 placeholder-neutral-300"
                      onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                    />
                  )}
                  {property.type === 'text' && (
                    <input
                      type="text"
                      placeholder="Empty"
                      className="w-full px-2 py-1 text-sm bg-transparent border border-transparent rounded-[var(--radius-button)] hover:bg-neutral-100 focus:bg-white focus:border-neutral-200 outline-none transition-all duration-150 placeholder-neutral-300"
                      onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-b border-neutral-200">
          <div className="text-xs font-medium text-neutral-500 mb-2">Comments</div>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-200 flex-shrink-0" />
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm bg-transparent placeholder-neutral-300 outline-none"
            />
          </div>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {editorContent ?? children ?? (
          <div className="text-neutral-400 text-sm">
            Press Enter to continue with an empty page, or{' '}
            <button className="underline hover:text-neutral-600 transition-colors duration-150">
              create a template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}