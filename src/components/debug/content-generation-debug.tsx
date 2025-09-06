"use client";

import { useEffect } from "react";

interface ContentGenerationDebugProps {
  generatedContent?: any;
  generationType?: string;
  originalIdea?: string;
}

/**
 * Debug component to log content generation details
 */
export function ContentGenerationDebug({
  generatedContent,
  generationType,
  originalIdea,
}: ContentGenerationDebugProps) {
  useEffect(() => {
    if (generatedContent) {
      console.group("🔍 [ContentGenerationDebug] Content Generated");
      console.log("📄 Type:", generationType);
      console.log("💡 Original Idea:", originalIdea);
      console.log("📊 Generated Content Type:", typeof generatedContent);
      console.log("📊 Generated Content:", generatedContent);

      // Handle both object and string formats safely
      let actualContent = generatedContent;
      let contentKeys = [];

      try {
        if (typeof generatedContent === "string") {
          console.log("📝 Content is string format (legacy)");
          contentKeys = ["length", "substring(0,50)"];
        } else if (generatedContent && typeof generatedContent === "object") {
          console.log("🎯 Content is enhanced object format");
          contentKeys = Object.keys(generatedContent);
          actualContent = generatedContent;
        }

        console.log("🏷️ Content Keys:", contentKeys);

        // Check for title specifically
        if (actualContent && typeof actualContent === "object" && actualContent.title) {
          console.log("✅ Title Found:", actualContent.title);
        } else {
          console.warn("⚠️ No title found in generated content");
        }

        // Check for hook structure if it's hooks
        if (generationType === "generate-hooks") {
          console.log("🎣 Hook Analysis:");
          if (typeof actualContent === "object") {
            console.log("  - Content object:", actualContent.content?.substring(0, 100));
            console.log("  - Hook data type:", typeof actualContent.content);
            console.log("  - Elements found:", actualContent.elements ? "✅" : "❌");
            console.log("  - Title found:", actualContent.title ? "✅" : "❌");
          } else {
            console.log("  - Hook content type:", typeof actualContent);
            console.log("  - Hook preview:", actualContent?.substring(0, 100));
          }
        }
      } catch (error) {
        console.error("❌ [ContentGenerationDebug] Error processing content:", error);
      }

      console.groupEnd();
    }
  }, [generatedContent, generationType, originalIdea]);

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!generatedContent) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 max-h-64 max-w-sm overflow-y-auto rounded-lg bg-gray-900 p-4 text-xs text-white shadow-lg">
      <div className="mb-2 font-bold">🔍 Debug: Content Generation</div>
      <div>
        <strong>Type:</strong> {generationType}
      </div>
      <div>
        <strong>Title:</strong>{" "}
        {typeof generatedContent === "object" && generatedContent?.title ? generatedContent.title : "❌ No title"}
      </div>
      <div>
        <strong>Content Keys:</strong>{" "}
        {typeof generatedContent === "object" ? Object.keys(generatedContent || {}).join(", ") : "string format"}
      </div>
      {generationType === "generate-hooks" && (
        <div className="mt-2 border-t border-gray-700 pt-2">
          <strong>Hook Analysis:</strong>
          <div>
            Content Length:{" "}
            {typeof generatedContent === "object" && generatedContent?.content
              ? generatedContent.content.length
              : typeof generatedContent === "string"
                ? generatedContent.length
                : 0}{" "}
            chars
          </div>
          <div>Elements: {typeof generatedContent === "object" && generatedContent?.elements ? "✅" : "❌"}</div>
        </div>
      )}
    </div>
  );
}
