"use client";

import * as React from "react";
import { 
  Send, 
  Sparkles, 
  Heart, 
  Power, 
  CheckCircle, 
  Clock, 
  Layers, 
  Plus, 
  ArrowUp
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Type definitions
interface QuickGeneratorCardData {
  id: string;
  title: string;
  description: string;
  icon: "send" | "sparkles" | "heart";
  label: string;
}

interface TemplateCardData {
  id: string;
  title: string;
  description: string;
  icon: "power" | "check-circle" | "layers";
  label: string;
  duration: string;
  badge?: "Popular" | "New" | "Featured";
}

interface ContentGeneratorCardsProps {
  quickGenerators?: QuickGeneratorCardData[];
  templates?: TemplateCardData[];
  selectedQuickGenerator?: string; // ID of selected quick generator
  selectedTemplate?: string; // ID of selected template
  onQuickGeneratorSelect?: (generator: QuickGeneratorCardData) => void;
  onTemplateSelect?: (template: TemplateCardData) => void;
  onCreateCustomTemplate?: () => void;
  className?: string;
}

// Default data
const defaultQuickGenerators: QuickGeneratorCardData[] = [
  {
    id: "hooks",
    title: "Generate 10 Hooks",
    description: "Create compelling hooks to capture your audience's attention instantly",
    icon: "send",
    label: "Hook Generator"
  },
  {
    id: "content-ideas",
    title: "10 Content Ideas",
    description: "Generate fresh content ideas tailored to your niche and audience",
    icon: "sparkles",
    label: "Ideation"
  },
  {
    id: "value-tips",
    title: "10 Value Tips",
    description: "Share actionable tips that provide immediate value to your readers",
    icon: "heart",
    label: "Value Content"
  }
];

const defaultTemplates: TemplateCardData[] = [
  {
    id: "if-you-then",
    title: '"If You... Then Do This"',
    description: "Create conditional content that addresses specific scenarios your audience faces",
    icon: "power",
    label: "Conditional",
    duration: "2 min",
    badge: "Popular"
  },
  {
    id: "problem-solution",
    title: "Problem → Solution",
    description: "Structure your content to identify problems and provide clear, actionable solutions",
    icon: "check-circle",
    label: "Solution-Based",
    duration: "3 min"
  },
  {
    id: "step-by-step",
    title: "Step-by-Step Tutorial",
    description: "Break down complex processes into easy-to-follow sequential steps",
    icon: "layers",
    label: "Tutorial",
    duration: "5 min"
  }
];

// Icon mapping
const getIcon = (iconName: string, className: string = "") => {
  const iconProps = { className };
  
  switch (iconName) {
    case "send":
      return <Send {...iconProps} />;
    case "sparkles":
      return <Sparkles {...iconProps} />;
    case "heart":
      return <Heart {...iconProps} />;
    case "power":
      return <Power {...iconProps} />;
    case "check-circle":
      return <CheckCircle {...iconProps} />;
    case "layers":
      return <Layers {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
};

// Quick Generator Card Component
interface QuickGeneratorCardProps {
  generator: QuickGeneratorCardData;
  isSelected?: boolean;
  onSelect?: (generator: QuickGeneratorCardData) => void;
}

function QuickGeneratorCard({ generator, isSelected = false, onSelect }: QuickGeneratorCardProps) {
  const handleClick = () => {
    onSelect?.(generator);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        "group relative",
        "rounded-[var(--radius-card)]",
        "p-6 min-h-[120px]",
        "flex flex-col cursor-pointer",
        "transition-all duration-[var(--transition-base)]",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]",
        "active:scale-[0.98] active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // Selected state styling
        isSelected
          ? "bg-primary-50 border-[1.5px] border-primary-400 shadow-[var(--shadow-soft-drop)]"
          : "bg-card border-[0.5px] border-border hover:border-border-hover"
      )}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${generator.title} generator`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 mb-5">
        <h3 className="text-[15px] font-semibold text-foreground mb-1.5 leading-[1.4]">
          {generator.title}
        </h3>
        <p className="text-[14px] text-muted-foreground leading-[1.5]">
          {generator.description}
        </p>
      </div>
      
      <div className="flex items-center gap-1.5 mt-auto">
        {getIcon(generator.icon, "w-3.5 h-3.5 text-muted-foreground flex-shrink-0")}
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em]">
          {generator.label}
        </span>
      </div>
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: TemplateCardData;
  isSelected?: boolean;
  onSelect?: (template: TemplateCardData) => void;
}

function TemplateCard({ template, isSelected = false, onSelect }: TemplateCardProps) {
  const handleClick = () => {
    onSelect?.(template);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        "group relative",
        "rounded-[var(--radius-card)]",
        "p-6 min-h-[140px]",
        "flex flex-col cursor-pointer",
        "transition-all duration-[var(--transition-base)]",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]",
        "active:scale-[0.98] active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // Selected state styling
        isSelected
          ? "bg-primary-50 border-[1.5px] border-primary-400 shadow-[var(--shadow-soft-drop)]"
          : "bg-card border-[0.5px] border-border hover:border-border-hover"
      )}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${template.title} template`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Badge */}
      {template.badge && (
        <div className="absolute top-5 right-5">
          <div className={cn(
            "bg-background border-[0.5px] border-border",
            "px-2 py-1 rounded-[var(--radius-subtle)]",
            "text-[10px] font-medium text-muted-foreground",
            "uppercase tracking-[0.05em]"
          )}>
            {template.badge}
          </div>
        </div>
      )}

      <div className="flex-1 mb-6">
        <h3 className="text-[15px] font-semibold text-foreground mb-1.5 leading-[1.4]">
          {template.title}
        </h3>
        <p className="text-[14px] text-muted-foreground leading-[1.5]">
          {template.description}
        </p>
      </div>
      
      <div className={cn(
        "flex items-center justify-between",
        "pt-4 border-t border-border",
        "mt-auto"
      )}>
        <div className="flex items-center gap-1.5">
          {getIcon(template.icon, "w-3.5 h-3.5 text-muted-foreground flex-shrink-0")}
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.05em]">
            {template.label}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {template.duration}
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function ContentGeneratorCards({
  quickGenerators = defaultQuickGenerators,
  templates = defaultTemplates,
  selectedQuickGenerator,
  selectedTemplate,
  onQuickGeneratorSelect,
  onTemplateSelect,
  onCreateCustomTemplate,
  className
}: ContentGeneratorCardsProps) {
  return (
    <div className={cn("max-w-6xl mx-auto", className)}>
      {/* Quick Generators Section */}
      <div className="mb-8">
        <div className="mb-8">
          <h2 className={cn(
            "text-[13px] font-medium text-muted-foreground",
            "uppercase tracking-[0.08em] mb-6"
          )}>
            Quick Generators
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {quickGenerators.map((generator) => (
            <QuickGeneratorCard
              key={generator.id}
              generator={generator}
              isSelected={selectedQuickGenerator === generator.id}
              onSelect={onQuickGeneratorSelect}
            />
          ))}
        </div>
      </div>

      {/* Script Templates Section */}
      <div className="mb-8">
        <div className="mb-8">
          <h2 className={cn(
            "text-[13px] font-medium text-muted-foreground",
            "uppercase tracking-[0.08em] mb-6"
          )}>
            Script Templates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={onTemplateSelect}
            />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <Button
          onClick={onCreateCustomTemplate}
          className={cn(
            "bg-primary text-primary-foreground",
            "border-0 px-5 py-2.5",
            "rounded-[var(--radius-button)]",
            "text-[14px] font-medium",
            "inline-flex items-center gap-2",
            "transition-all duration-[var(--transition-base)]",
            "hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
            "active:translate-y-0"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          Create Custom Template
        </Button>
      </div>
    </div>
  );
}

export default ContentGeneratorCards;
