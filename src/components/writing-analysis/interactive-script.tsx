'use client'

import React, { useState, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { AISuggestionPopup } from './ai-suggestion-popup'

interface ScriptSection {
  type: 'hook' | 'micro-hook' | 'bridge' | 'nugget' | 'cta'
  title: string
  content: string
}

interface ScriptComponent {
  component: string
  text: string
  complexity: string
  gradeLevel: string
  suggestions: string[]
}

interface InteractiveScriptProps {
  script: string
  onScriptUpdate: (updatedScript: string) => void
  className?: string
  scriptAnalysis?: {
    hasComponentAnalysis: boolean
    componentAnalysis?: {
      components: ScriptComponent[]
    }
  }
}

// Parse script sections from markdown format  
const parseScriptSections = (script: string): ScriptSection[] => {
  const sections: ScriptSection[] = []
  const lines = script.split('\n')
  let currentSection: ScriptSection | null = null
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Check for section headers (support both ## Header and **Header:** formats)
    if (trimmedLine.startsWith('##') || (trimmedLine.startsWith('**') && trimmedLine.endsWith(':**'))) {
      // Save previous section if exists
      if (currentSection?.content.trim()) {
        sections.push(currentSection)
      }
      
      // Start new section - extract title from either format
      let title = ''
      if (trimmedLine.startsWith('##')) {
        title = trimmedLine.replace('##', '').trim()
      } else {
        title = trimmedLine.replace(/\*\*/g, '').replace(':', '')
      }
      const type = getSectionType(title.toLowerCase())
      
      currentSection = { type, title, content: '' }
    } else if (currentSection && trimmedLine) {
      // Add content to current section
      currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine
    }
  }
  
  // Don't forget the last section
  if (currentSection?.content.trim()) {
    sections.push(currentSection)
  }
  
  return sections
}

// Helper function to determine section type
const getSectionType = (title: string): ScriptSection['type'] => {
  switch (title) {
    case 'hook': return 'hook'
    case 'micro hook': return 'micro-hook' 
    case 'bridge': return 'bridge'
    case 'golden nugget': return 'nugget'
    case 'call to action': return 'cta'
    default: return 'nugget'
  }
}

// Rebuild script from sections
const buildScriptFromSections = (sections: ScriptSection[]): string => {
  return sections
    .map(section => `**${section.title}:**\n${section.content}`)
    .join('\n\n')
}

// Get complexity-based background color
const getComplexityBackgroundColor = (complexity: string) => {
  switch (complexity) {
    case "graduate":
      return "rgba(239, 68, 68, 0.1)";
    case "college":
      return "rgba(249, 115, 22, 0.1)";
    case "high-school":
      return "rgba(245, 158, 11, 0.1)";
    case "middle-school":
      return "rgba(59, 130, 246, 0.08)";
    case "elementary":
      return "transparent";
    default:
      return "transparent";
  }
}

// Apply complexity highlighting to text
const applyComplexityHighlighting = (
  text: string, 
  components: ScriptComponent[]
): string => {
  let result = text;
  
  // Apply complexity-based highlighting to each component's content
  components.forEach((component) => {
    if (component.text.trim()) {
      const bgColor = getComplexityBackgroundColor(component.complexity);
      if (bgColor !== "transparent") {
        const escapedText = component.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedText, "gi");
        
        result = result.replace(
          regex,
          `<span style="background-color: ${bgColor}; padding: 4px 2px; border-radius: 4px; display: inline-block; margin: 1px 0;">${component.text}</span>`,
        );
      }
    }
  });

  return result;
}

export function InteractiveScript({ 
  script, 
  onScriptUpdate, 
  className = '',
  scriptAnalysis
}: InteractiveScriptProps) {
  const [sections, setSections] = useState<ScriptSection[]>(() => parseScriptSections(script))
  const [showPopup, setShowPopup] = useState(false)
  const [selectedSection, setSelectedSection] = useState<ScriptSection | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [hoveredSection, setHoveredSection] = useState<number | null>(null)
  
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleSectionClick = (section: ScriptSection, index: number, event: React.MouseEvent) => {
    event.preventDefault()
    
    const rect = sectionRefs.current[index]?.getBoundingClientRect()
    if (rect) {
      setPopupPosition({
        x: rect.right + 10,
        y: rect.top
      })
    }
    
    setSelectedSection(section)
    setShowPopup(true)
  }

  const handleApplySuggestion = (newText: string) => {
    if (!selectedSection) return
    
    const updatedSections = sections.map(section => 
      section === selectedSection 
        ? { ...section, content: newText }
        : section
    )
    
    setSections(updatedSections)
    const updatedScript = buildScriptFromSections(updatedSections)
    onScriptUpdate(updatedScript)
    setShowPopup(false)
    setSelectedSection(null)
  }

  const getSectionColor = (type: ScriptSection['type']) => {
    switch (type) {
      case 'hook':
        return 'border-2 border-red-200 bg-red-50'
      case 'micro-hook':
        return 'border-2 border-orange-200 bg-orange-50'
      case 'bridge':
        return 'border-2 border-yellow-200 bg-yellow-50'
      case 'nugget':
        return 'border-2 border-green-200 bg-green-50'
      case 'cta':
        return 'border-2 border-blue-200 bg-blue-50'
      default:
        return 'border-2 border-gray-200 bg-gray-50'
    }
  }

  return (
    <>
      <div className={`prose max-w-none text-foreground leading-relaxed min-h-[300px] ${className}`}>
        {sections.map((section, index) => (
          <div key={`section-${section.type}-${index}`} className="mb-6">
            {/* Section Title */}
            <h4 className="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0">
              {section.title}:
            </h4>
            
            {/* Interactive Section Content */}
            <div
              ref={el => sectionRefs.current[index] = el}
              className={`
                relative p-4 rounded-[var(--radius-button)] cursor-pointer transition-all duration-200
                ${hoveredSection === index ? `${getSectionColor(section.type)} shadow-sm` : 'hover:bg-background-hover'}
              `}
              onClick={(e) => handleSectionClick(section, index, e)}
              onMouseEnter={() => setHoveredSection(index)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              {/* AI Action Indicator */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary text-primary-foreground p-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>
              
              {/* Hover indicator */}
              {hoveredSection === index && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                  Click for AI actions
                </div>
              )}
              
              {/* Section Content */}
              <div 
                className="text-base leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: scriptAnalysis?.hasComponentAnalysis && scriptAnalysis.componentAnalysis?.components 
                    ? applyComplexityHighlighting(section.content, scriptAnalysis.componentAnalysis.components)
                    : section.content.replace(/\n/g, '<br />')
                }}
              />
            </div>
          </div>
        ))}
        
        {/* Instructions */}
        <div className="mt-8 p-4 bg-muted/50 rounded-[var(--radius-button)] border border-border">
          <p className="text-sm text-muted-foreground text-center">
            💡 Click any section above to access AI-powered improvements and variations
          </p>
        </div>
      </div>

      {/* AI Suggestion Popup */}
      {showPopup && selectedSection && (
        <AISuggestionPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          sectionType={selectedSection.type}
          originalText={selectedSection.content}
          onApply={handleApplySuggestion}
          position={popupPosition}
        />
      )}
    </>
  )
}
