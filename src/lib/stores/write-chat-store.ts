import { create } from "zustand";

export type ChatState = "empty" | "transitioning" | "active";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatStore {
  state: ChatState;
  messages: ChatMessage[];
  isLoading: boolean;

  setState: (state: ChatState) => void;
  addMessage: (message: ChatMessage) => void;
  startTransition: () => void;
  completeTransition: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  state: "empty",
  messages: [],
  isLoading: false,

  setState: (state) => set({ state }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  startTransition: () => {
    set({ state: "transitioning" });
    setTimeout(() => {
      set({ state: "active" });
    }, 300);
  },
  completeTransition: () => set({ state: "active" }),
}));
