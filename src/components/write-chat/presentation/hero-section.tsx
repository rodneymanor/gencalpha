"use client";
import ChatInput from "@/components/ChatInterface/chat-input";
import { ContentGeneratorCards } from "@/components/content-generator-cards";
import {
  PersonaSelector,
  type ActionType,
  CONTENT_ACTIONS,
  type PersonaOption,
} from "@/components/write-chat/persona-selector";

export function HeroSection(props: {
  resolvedName?: string | null;
  inputValue: string;
  setInputValue: (v: string) => void;
  placeholder: string;
  isRecording: boolean;
  showListening: boolean;
  isUrlProcessing: boolean;
  linkDetection?: any;
  hasValidVideoUrl?: boolean;
  handleSend: (value: string) => void;
  heroInputRef?: React.RefObject<HTMLTextAreaElement>;
  selectedPersona?: PersonaOption | null;
  onPersonaSelect?: (persona: PersonaOption | null) => void;
  isIdeaMode?: boolean;
  setIsIdeaMode?: (v: boolean) => void;
  ideaSaveMessage?: string | null;
  ideas?: any[];
  ideasOpen?: boolean;
  setIdeasOpen?: (v: boolean) => void;
  isIdeaInboxEnabled?: boolean;
  onVoiceClick?: () => void;
  // New props for action-based system
  onActionTrigger?: (action: ActionType, prompt: string) => void;
  useActionSystem?: boolean;
  selectedAction?: ActionType | null;
  setSelectedAction?: (action: ActionType | null) => void;
  // New selection state for cards
  selectedQuickGenerator?: string;
  setSelectedQuickGenerator?: (id: string | null) => void;
  selectedTemplate?: string;
  setSelectedTemplate?: (id: string | null) => void;
}) {
  const {
    resolvedName,
    inputValue,
    setInputValue,
    placeholder,
    isRecording,
    showListening,
    isUrlProcessing,
    handleSend,
    selectedPersona,
    onPersonaSelect,
    onActionTrigger,
    useActionSystem = true, // Default to new system
    selectedAction,
    setSelectedAction,
    selectedQuickGenerator,
    setSelectedQuickGenerator,
    selectedTemplate,
    setSelectedTemplate,
    heroInputRef,
    // We don't need to destructure all the other props since they're not used in this component
    // but they need to be in the interface for TypeScript compatibility
  } = props;

  const handleActionTrigger = (action: ActionType, prompt: string) => {
    if (onActionTrigger) {
      onActionTrigger(action, prompt);
    } else {
      // Fallback: send the prompt directly to chat
      handleSend(prompt);
    }
  };

  const handleInputFocus = () => {
    heroInputRef?.current?.focus();
  };

  const handleActionSelect = (action: ActionType) => {
    setSelectedAction?.(action);
  };

  // Map CONTENT_ACTIONS to ContentGeneratorCards format
  const quickGenerators = CONTENT_ACTIONS.filter((action) => action.category === "generators").map((action) => ({
    id: action.key,
    title: action.label,
    description: action.description,
    icon:
      action.key === "generate-hooks"
        ? ("send" as const)
        : action.key === "content-ideas"
          ? ("sparkles" as const)
          : ("heart" as const),
    label:
      action.key === "generate-hooks"
        ? "Hook Generator"
        : action.key === "content-ideas"
          ? "Ideation"
          : "Value Content",
  }));

  const templates = CONTENT_ACTIONS.filter((action) => action.category === "templates").map((action) => ({
    id: action.key,
    title: action.label,
    description: action.description,
    icon:
      action.key === "if-then-script"
        ? ("power" as const)
        : action.key === "problem-solution"
          ? ("check-circle" as const)
          : ("layers" as const),
    label:
      action.key === "if-then-script"
        ? "Conditional"
        : action.key === "problem-solution"
          ? "Solution-Based"
          : "Tutorial",
    duration: action.key === "if-then-script" ? "2 min" : action.key === "problem-solution" ? "3 min" : "5 min",
  }));

  const handleQuickGeneratorSelect = (generator: any) => {
    // Toggle selection - if already selected, deselect
    if (selectedQuickGenerator === generator.id) {
      setSelectedQuickGenerator?.(null);
      setSelectedTemplate?.(null); // Clear template selection when generator changes
    } else {
      setSelectedQuickGenerator?.(generator.id);
      setSelectedTemplate?.(null); // Clear template selection when generator changes
    }
  };

  const handleTemplateSelect = (template: any) => {
    // Toggle selection - if already selected, deselect
    if (selectedTemplate === template.id) {
      setSelectedTemplate?.(null);
      setSelectedQuickGenerator?.(null); // Clear generator selection when template changes
    } else {
      setSelectedTemplate?.(template.id);
      setSelectedQuickGenerator?.(null); // Clear generator selection when template changes
    }
  };

  const handleCreateCustomTemplate = () => {
    // For now, we'll just focus the input - this could be extended with a modal
    handleInputFocus();
  };

  return (
    <div className="flex max-h-screen min-h-screen flex-col overflow-y-auto px-4 py-8 transition-all duration-300">
      {/* Flex spacer to center the hero content */}
      <div className="flex-1"></div>

      {/* Anchored hero content - text and input grouped together */}
      <div className="flex-shrink-0 text-center">
        {/* Hero headline */}
        <div className="pb-8">
          <h1 className="text-4xl leading-10 font-bold tracking-tight">
            <span className="text-foreground">
              {`Hello${resolvedName ? ", " + resolvedName : ""}`}
              {resolvedName && <span className="ml-2">👋</span>}
            </span>
            <br />
            <span className="text-brand">What will you create today?</span>
          </h1>
        </div>

        {/* Input field - anchored close to hero text */}
        <div className="mx-auto w-full max-w-3xl px-5">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={(message, timeLimit) => handleSend(message)}
            placeholder={isRecording ? (showListening ? "listening..." : "") : placeholder}
            disabled={isUrlProcessing}
            showTimeLimit={false}
            showSettings={false}
            showTrending={true}
            showPersonas={true}
            selectedPersona={selectedPersona}
            onPersonaSelect={onPersonaSelect}
          />
        </div>
      </div>

      {/* Spacer between input and bottom cards */}
      <div className="h-16 flex-shrink-0"></div>

      {/* Bottom section with content generator cards */}
      <div className="flex-shrink-0 pb-16">
        <div className="mx-auto w-full max-w-5xl px-5">
          {useActionSystem ? (
            <ContentGeneratorCards
              quickGenerators={quickGenerators}
              templates={templates}
              selectedQuickGenerator={selectedQuickGenerator}
              selectedTemplate={selectedTemplate}
              onQuickGeneratorSelect={handleQuickGeneratorSelect}
              onTemplateSelect={handleTemplateSelect}
              onCreateCustomTemplate={handleCreateCustomTemplate}
            />
          ) : (
            <PersonaSelector
              selectedPersona={selectedPersona}
              onPersonaSelect={onPersonaSelect}
              selectedAction={selectedAction}
              onActionSelect={setSelectedAction}
              onActionTrigger={onActionTrigger || (() => {})}
              inputValue={inputValue}
              onInputFocus={() => heroInputRef?.current?.focus()}
              className="justify-center"
              showCallout={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
