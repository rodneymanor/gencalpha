import { type PersonaType } from "@/components/chatbot/persona-selector";
import { UnifiedWriteClient } from "@/components/write-chat/unified-write-client";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initialPrompt = typeof params.prompt === "string" ? params.prompt : undefined;
  const initialPersona = typeof params.persona === "string" ? (params.persona as PersonaType) : undefined;
  const remountKey = typeof params.new === "string" ? params.new : undefined;
  return (
    <div className="font-sans">
      <UnifiedWriteClient key={remountKey} initialPrompt={initialPrompt} initialPersona={initialPersona} />
    </div>
  );
}
