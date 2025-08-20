"use client";

import React from "react";

import { type AssistantType } from "@/components/chatbot/persona-selector";
import { UnifiedWriteClient } from "@/components/write-chat/unified-write-client";

export function WriteShell({
  initialPrompt,
  initialAssistant,
}: {
  initialPrompt?: string;
  initialAssistant?: AssistantType;
}) {
  return <UnifiedWriteClient initialPrompt={initialPrompt} initialAssistant={initialAssistant} />;
}

export default WriteShell;
