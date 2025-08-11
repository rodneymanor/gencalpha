import { type PersonaType } from "@/components/chatbot/persona-selector";
import ClaudeChat from "@/components/write-chat/claude-chat";

export default function WritePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const initialPrompt = typeof searchParams?.prompt === "string" ? searchParams.prompt : undefined;
  const initialPersona = typeof searchParams?.persona === "string" ? (searchParams.persona as PersonaType) : undefined;
  return (
    <div className="font-sans">
      <ClaudeChat initialPrompt={initialPrompt} initialPersona={initialPersona} />
    </div>
  );
}
