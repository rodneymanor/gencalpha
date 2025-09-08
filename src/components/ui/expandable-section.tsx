'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronsUp } from 'lucide-react'

interface ExpandableSectionProps {
  triggerText?: string
  collapsedText?: string
  expandedText?: string
  children: React.ReactNode
  className?: string
  plain?: boolean // when true, remove background and borders
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  triggerText = 'Explore Daily Content',
  collapsedText = 'Explore Daily Content',
  expandedText = 'Hide Content Library',
  children,
  className = '',
  plain = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  // Handle scroll wheel to expand section
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Only trigger if the section is not expanded and user is scrolling down
      if (!isExpanded && event.deltaY > 0) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        
        // Check if user is near the bottom of the page (within 100px of trigger)
        const triggerElement = triggerRef.current
        if (triggerElement) {
          const triggerRect = triggerElement.getBoundingClientRect()
          const triggerVisible = triggerRect.top < windowHeight && triggerRect.bottom > 0
          
          // If trigger is visible and user scrolls down, expand the section
          if (triggerVisible) {
            event.preventDefault()
            setIsExpanded(true)
          }
        }
      }
    }

    // Add wheel event listener to window
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [isExpanded])

  // Scroll the expanded content into view when it opens
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      // Delay to allow the animation to complete
      const timer = setTimeout(() => {
        contentRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 450) // Match the animation duration

      return () => clearTimeout(timer)
    }
  }, [isExpanded])

  return (
    <div className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className={
          `w-full py-4 px-6 transition-all duration-200 group ` +
          (plain ? '' : 'bg-neutral-100 hover:bg-neutral-200 border-t border-neutral-200')
        }
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-center gap-3">
          <span className="text-neutral-700 font-medium text-sm motion-safe:animate-pulse [animation-duration:2.5s]">
            {isExpanded ? expandedText : collapsedText}
          </span>
          <ChevronsUp 
            className={`
              w-4 h-4 text-neutral-600
              transition-transform duration-500 ease-out
              motion-safe:animate-pulse [animation-duration:2.5s]
              ${isExpanded ? 'rotate-180' : ''}
            `}
          />
        </div>
      </button>

      {/* Expandable content */}
      <div 
        ref={contentRef}
        className="overflow-hidden"
        style={{
          maxHeight: isExpanded ? '2000px' : '0px',
          opacity: isExpanded ? 1 : 0,
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className={plain ? '' : 'border-t border-neutral-200'}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default ExpandableSection
