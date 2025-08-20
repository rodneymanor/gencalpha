import { ACK_LOADING } from "@/components/write-chat/constants";
import { ScriptData } from "@/types/script-panel";

export const sendToSlideout = (markdown: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("write:editor-set-content", {
      detail: { markdown },
    }),
  );
};

export const sendScriptToSlideout = (scriptData: ScriptData, title?: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("write:script-set-content", {
      detail: { scriptData, title },
    }),
  );
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const removeAckLoader = <T extends { content: string }>(messages: T[]): T[] =>
  messages.filter((m) => m.content !== ACK_LOADING);
