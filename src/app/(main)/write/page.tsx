import { type PersonaType } from "@/components/chatbot/persona-selector";
import { WriteClient } from "@/components/write-chat/write-client";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initialPrompt = typeof params?.prompt === "string" ? params.prompt : undefined;
  const initialPersona = typeof params?.persona === "string" ? (params.persona as PersonaType) : undefined;
  return (
    <div className="font-sans">
      <WriteClient initialPrompt={initialPrompt} initialPersona={initialPersona} />
    </div>
  );
}
