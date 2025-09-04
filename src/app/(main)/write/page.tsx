import { StreamlinedScriptWriter } from "@/components/script-generation/streamlined-script-writer";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initialPrompt = typeof params.prompt === "string" ? params.prompt : undefined;
  const remountKey = typeof params.new === "string" ? params.new : undefined;
  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <StreamlinedScriptWriter
        key={remountKey}
        initialPrompt={initialPrompt}
        className="from-background to-background-muted bg-gradient-to-b"
      />
    </div>
  );
}
