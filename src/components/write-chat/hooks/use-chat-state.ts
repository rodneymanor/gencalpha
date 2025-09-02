import { useState, useCallback } from "react";
import { type ChatMessage } from "@/components/write-chat/types";
import { type PersonaOption } from "@/components/write-chat/persona-selector";
import { ACK_LOADING } from "@/components/write-chat/constants";

export interface UseChatStateReturn {
  // Core chat state
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  selectedPersona: PersonaOption | null;
  setSelectedPersona: React.Dispatch<React.SetStateAction<PersonaOption | null>>;
  
  // UI state
  isHeroState: boolean;
  setIsHeroState: React.Dispatch<React.SetStateAction<boolean>>;
  isTransitioning: boolean;
  setIsTransitioning: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Helper methods
  clearInput: () => void;
  addMessage: (message: ChatMessage) => void;
  removeLoadingMessages: () => void;
}

export function useChatState(initialPersona?: PersonaOption): UseChatStateReturn {
  // Core chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<PersonaOption | null>(
    initialPersona ?? null
  );
  
  // UI state
  const [isHeroState, setIsHeroState] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Helper methods
  const clearInput = useCallback(() => {
    setInputValue("");
  }, []);
  
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);
  
  const removeLoadingMessages = useCallback(() => {
    setMessages(prev => prev.filter(m => m.content !== ACK_LOADING));
  }, []);
  
  return {
    // State
    messages,
    setMessages,
    inputValue,
    setInputValue,
    selectedPersona,
    setSelectedPersona,
    isHeroState,
    setIsHeroState,
    isTransitioning,
    setIsTransitioning,
    
    // Methods
    clearInput,
    addMessage,
    removeLoadingMessages,
  };
}
