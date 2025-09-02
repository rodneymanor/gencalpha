"use client";
import ChatInput from "@/components/ChatInterface/ChatInput";
import { 
  type AssistantType, 
  AssistantSelector,
  ContentActionSelector,
  type ActionType 
} from "@/components/write-chat/assistant-selector";
import { PlaybookCards } from "@/components/write-chat/playbook-cards";

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
  selectedAssistant: AssistantType | null;
  setSelectedAssistant: (p: AssistantType | null) => void;
  selectedPersona?: string;
  onPersonaSelect?: (persona: string) => void;
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
    selectedAssistant,
    setSelectedAssistant,
    selectedPersona,
    onPersonaSelect,
    onActionTrigger,
    useActionSystem = true, // Default to new system
    selectedAction,
    setSelectedAction,
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

  return (
    <div className="flex max-h-screen min-h-screen flex-col items-center justify-center overflow-y-auto px-4 py-8 transition-all duration-300">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-5">
        <div className="text-center">
          <h1 className="text-neutral-900 text-4xl leading-10 font-bold tracking-tight">
            {`Hello${resolvedName ? ", " + resolvedName : ""}`}
            <br />
            <span className="text-neutral-600 text-4xl font-bold">What will you create today?</span>
          </h1>
        </div>

        <div className="w-full max-w-3xl">
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

        <div className="mx-auto w-full max-w-3xl">
          {useActionSystem ? (
            <ContentActionSelector
              onActionTrigger={handleActionTrigger}
              inputValue={inputValue}
              onInputFocus={handleInputFocus}
              selectedAction={selectedAction}
              onActionSelect={handleActionSelect}
              className="justify-center"
            />
          ) : (
            <AssistantSelector
              selectedAssistant={selectedAssistant}
              onAssistantChange={setSelectedAssistant}
              className="justify-center"
              showCallout={Boolean(selectedAssistant)}
            />
          )}
        </div>

        <div className="mt-6 w-full">
          <PlaybookCards />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;