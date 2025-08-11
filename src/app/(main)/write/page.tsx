import dynamic from "next/dynamic";

const ClaudeChat = dynamic(() => import("@/components/write-chat/claude-chat"), { ssr: false });

export default function WritePage() {
  return (
    <div className="font-sans">
      <ClaudeChat />
    </div>
  );
}
