"use client";

import React from "react";

interface NotionPanelResizeProps {
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function NotionPanelResize({ isDragging, onMouseDown }: NotionPanelResizeProps) {
  return (
    <div
      className={`hover:bg-primary-400 absolute top-0 bottom-0 left-0 z-30 w-1 cursor-col-resize bg-transparent transition-colors duration-150 ${isDragging ? "bg-primary-500" : ""} `}
      onMouseDown={onMouseDown}
    >
      {/* Visual indicator on hover */}
      <div
        className={`absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-300 opacity-0 transition-opacity duration-150 hover:opacity-100 ${isDragging ? "bg-primary-500 opacity-100" : ""} `}
      />
    </div>
  );
}
