"use client";

import dynamic from "next/dynamic";

const SimpleScriptProvider = dynamic(
  () => import("@/contexts/simple-script-context").then((mod) => mod.SimpleScriptProvider),
  { ssr: false },
);

const SimpleScriptEditor = dynamic(
  () => import("@/components/script-writing/simple-script-editor").then((mod) => mod.SimpleScriptEditor),
  { ssr: false },
);

export default function ScriptWritingPage() {
  return (
    <SimpleScriptProvider>
      <div className="flex h-full flex-col">
        <SimpleScriptEditor
          initialValue="Welcome to the script writing experience!\n\nThis editor connects to your Gemini AI script writing workflow:\n\n1. Click the panel button to open the side panel\n2. Enter a script idea and generate content\n3. Script components are created as JSON objects\n4. Click 'Add to Editor' to insert components\n5. Save and export your scripts\n\nStart writing your script here..."
          onSave={(content) => {
            console.log("Saving script:", content);
          }}
        />
      </div>
    </SimpleScriptProvider>
  );
}
