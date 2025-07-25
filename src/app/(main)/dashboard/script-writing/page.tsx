"use client";

import { SimpleScriptEditor } from "@/components/script-writing/simple-script-editor";
import { SimpleScriptProvider } from "@/contexts/simple-script-context";

export default function ScriptWritingPage() {
  return (
    <SimpleScriptProvider>
      <div className="flex h-screen flex-col">
        <SimpleScriptEditor
          initialValue="Welcome to the script writing experience!\n\nThis editor connects to your Gemini AI script writing workflow:\n\n1. Click the panel button to open the side panel\n2. Enter a script idea and generate content\n3. Script components are created as JSON objects\n4. Click 'Add to Editor' to insert components\n5. Save and export your scripts\n\nStart writing your script here..."
          onSave={(content) => {
            console.log("Saving script:", content);
            // Integrate with your save functionality
          }}
        />
      </div>
    </SimpleScriptProvider>
  );
}
