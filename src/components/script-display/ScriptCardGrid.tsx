'use client'

import React from 'react'

import type { ScriptSection, VideoScript } from './types'

// Component props
interface ScriptCardGridProps {
  scripts: VideoScript[]
  title?: string
  subtitle?: string
}

// Component for individual script sections (Hook, Bridge, etc.)
const ScriptSection: React.FC<{ section: ScriptSection }> = ({ section }) => {
  // Map section types to their color classes using numbered variants
  const colorClasses = {
    hook: 'text-destructive-600',
    bridge: 'text-primary-600',
    'golden-nugget': 'text-warning-600',
    wta: 'text-success-600'
  }

  return (
    <div className="p-3 bg-neutral-50 rounded-[var(--radius-card)] border border-neutral-200">
      {/* Section header with label and time */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-medium text-[11px] tracking-[0.02em] ${colorClasses[section.type]}`}>
          {section.label}
        </span>
        <span className="text-[11px] text-neutral-500">
          {section.timeRange}
        </span>
      </div>
      {/* Section content */}
      <div className="space-y-1">
        <div className="text-[13px] text-neutral-900">
          {section.dialogue}
        </div>
        <div className="text-xs italic text-neutral-600">
          {section.action}
        </div>
      </div>
    </div>
  )
}

// Component for individual video script card
const ScriptCard: React.FC<{ script: VideoScript }> = ({ script }) => {
  return (
    <div 
      className={`
        bg-neutral-50 rounded-[var(--radius-card)] p-4 
        border border-neutral-200 hover:border-neutral-300 
        transition-colors duration-200
        ${script.spanRows ? 'row-span-2' : ''}
      `}
    >
      {/* Card header with video number, title, and duration */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-neutral-600 text-sm font-medium">
          {script.id}
        </span>
        <span className="text-base font-medium text-neutral-900 flex-1">
          {script.title}
        </span>
        <span className="text-xs text-neutral-500">
          {script.duration}
        </span>
      </div>

      {/* Script sections container */}
      <div className="flex flex-col gap-2">
        {script.sections.map((section, index) => (
          <ScriptSection key={index} section={section} />
        ))}
      </div>
    </div>
  )
}

// Main grid component for displaying multiple video scripts
const ScriptCardGrid: React.FC<ScriptCardGridProps> = ({ 
  scripts, 
  title = 'Short Form Video Scripts',
  subtitle = 'Complete scripts with Hook, Bridge, Golden Nugget, and WTA structure'
}) => {
  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-neutral-900 mb-2">
            {title}
          </h1>
          <p className="text-neutral-600 text-sm">
            {subtitle}
          </p>
        </div>

        {/* Masonry-style grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-auto grid-flow-dense">
          {scripts.map(script => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ScriptCardGrid