import { type AssistantType } from "@/components/write-chat/persona-selector";
import { UnifiedWriteClient } from "@/components/write-chat/unified-write-client";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initialPrompt = typeof params.prompt === "string" ? params.prompt : undefined;
  const initialAssistant = typeof params.assistant === "string" ? (params.assistant as AssistantType) : undefined;
  const chatId = typeof params.chatId === "string" ? params.chatId : undefined;
  const remountKey = typeof params.new === "string" ? params.new : undefined;
  return (
    <div className="font-sans bg-neutral-50 min-h-screen">
      <UnifiedWriteClient
        key={remountKey}
        initialPrompt={initialPrompt}
        initialAssistant={initialAssistant}
        conversationIdToLoad={chatId}
      />
    </div>
  );
}
