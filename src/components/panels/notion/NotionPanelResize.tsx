'use client';

import React from 'react';

interface NotionPanelResizeProps {
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function NotionPanelResize({
  isDragging,
  onMouseDown
}: NotionPanelResizeProps) {
  return (
    <div
      className={`
        absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-30
        bg-transparent hover:bg-primary-400 transition-colors duration-150
        ${isDragging ? 'bg-primary-500' : ''}
      `}
      onMouseDown={onMouseDown}
    >
      {/* Visual indicator on hover */}
      <div className={`
        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-1 h-12 bg-neutral-300 rounded-full opacity-0 hover:opacity-100
        transition-opacity duration-150
        ${isDragging ? 'opacity-100 bg-primary-500' : ''}
      `} />
    </div>
  );
}