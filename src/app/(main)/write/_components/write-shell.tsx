"use client";

import React from "react";

import { type PersonaType } from "@/components/chatbot/persona-selector";
import { UnifiedWriteClient } from "@/components/write-chat/unified-write-client";

export function WriteShell({
  initialPrompt,
  initialPersona,
}: {
  initialPrompt?: string;
  initialPersona?: PersonaType;
}) {
  return <UnifiedWriteClient initialPrompt={initialPrompt} initialPersona={initialPersona} />;
}

export default WriteShell;
