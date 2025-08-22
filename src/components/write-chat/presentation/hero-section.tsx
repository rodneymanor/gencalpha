"use client";
import { type AssistantType, AssistantSelector } from "@/components/write-chat/persona-selector";
import { PlaybookCards } from "@/components/write-chat/playbook-cards";
import ChatInput from "@/components/ChatInterface/ChatInput";

export function HeroSection(props: {
  resolvedName?: string | null;
  inputValue: string;
  setInputValue: (v: string) => void;
  placeholder: string;
  isRecording: boolean;
  showListening: boolean;
  isUrlProcessing: boolean;
  handleSend: (value: string) => void;
  selectedAssistant: AssistantType | null;
  setSelectedAssistant: (p: AssistantType | null) => void;
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
  } = props;

  return (
    <div className="flex max-h-screen min-h-screen flex-col items-center justify-center overflow-y-auto px-4 py-8 transition-all duration-300">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-5">
        <div className="text-center">
          <h1 className="text-foreground text-4xl leading-10 font-bold tracking-tight">
            {`Hello${resolvedName ? ", " + resolvedName : ""}`}
            <br />
            <span className="text-muted-foreground text-4xl font-bold">What will you script today?</span>
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
          />
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <AssistantSelector
            selectedAssistant={selectedAssistant}
            onAssistantChange={setSelectedAssistant}
            className="justify-center"
            showCallout={Boolean(selectedAssistant)}
          />
        </div>

        <div className="mt-6 w-full">
          <PlaybookCards />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
