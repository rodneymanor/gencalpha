'use client'

import React from 'react'

// Types for dropdown items and sections
export interface DropdownItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
  selected?: boolean
  badge?: string
  onClick?: () => void
}

export interface DropdownSection {
  id: string
  label?: string
  items: DropdownItem[]
}

interface DropdownMenuProps {
  sections: DropdownSection[]
  className?: string
  maxHeight?: number
  style?: React.CSSProperties
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  sections,
  className = '',
  maxHeight = 400,
  style
}) => {

  return (
    <div
      className={`
        fixed z-[9999] w-72 
        bg-neutral-50 
        border border-neutral-200 
        rounded-[var(--radius-card)] 
        shadow-[var(--shadow-soft-drop)]
        opacity-100 visible transform-none
        ${className}
      `}
      style={{
        maxHeight: `${maxHeight}px`,
        overflowY: 'auto',
        ...style
      }}
    >
      {sections.map((section, sectionIndex) => (
        <div key={section.id} className="py-2">
          {/* Section Label */}
          {section.label && (
            <div className="px-4 py-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
              {section.label}
            </div>
          )}

          {/* Section Items */}
          <div className="space-y-0">
            {section.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                disabled={item.disabled}
                className={`
                  w-full px-4 py-2.5 
                  flex items-center gap-3 
                  text-left cursor-pointer
                  transition-colors duration-150
                  ${item.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : item.selected
                      ? 'bg-primary-50 text-primary-900 border-l-2 border-primary-500'
                      : 'text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200'
                  }
                `}
              >
                {/* Icon */}
                {item.icon && (
                  <div className={`flex-shrink-0 ${item.selected ? 'text-primary-600' : 'text-neutral-500'}`}>
                    {item.icon}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${item.selected ? 'text-primary-900' : 'text-neutral-900'}`}>
                    {item.label}
                  </div>
                  {item.description && (
                    <div className={`text-xs mt-0.5 ${item.selected ? 'text-primary-700' : 'text-neutral-500'}`}>
                      {item.description}
                    </div>
                  )}
                </div>

                {/* Badge */}
                {item.badge && (
                  <div className="flex-shrink-0">
                    <span className="bg-success-500 text-neutral-50 text-[10px] font-semibold px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Section Divider */}
          {sectionIndex < sections.length - 1 && (
            <div className="h-px bg-neutral-200 my-2" />
          )}
        </div>
      ))}
    </div>
  )
}

export default DropdownMenu