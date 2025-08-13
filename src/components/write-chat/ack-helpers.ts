import { ACK_LOADING } from "@/components/write-chat/constants";
import { type ChatMessage } from "@/components/write-chat/types";

export const startAckWithLoader = (
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void,
  ackText: string,
) => {
  const ackMessageId = crypto.randomUUID();
  const ackLoadingId = crypto.randomUUID();
  setMessages((prev) => [
    ...prev,
    { id: ackMessageId, role: "assistant", content: ackText },
    { id: ackLoadingId, role: "assistant", content: ACK_LOADING },
  ]);
};

export const finishAndRemoveLoader = (
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => ChatMessage[] | void,
) => {
  setMessages((prev) => prev.filter((m) => m.content !== ACK_LOADING));
};
