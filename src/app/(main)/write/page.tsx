import { type PersonaType } from "@/components/chatbot/persona-selector";
import { WriteClient } from "@/components/write-chat/write-client";

export default function WritePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const initialPrompt = typeof searchParams?.prompt === "string" ? searchParams.prompt : undefined;
  const initialPersona = typeof searchParams?.persona === "string" ? (searchParams.persona as PersonaType) : undefined;
  return (
    <div className="font-sans">
      <WriteClient initialPrompt={initialPrompt} initialPersona={initialPersona} />
    </div>
  );
}
