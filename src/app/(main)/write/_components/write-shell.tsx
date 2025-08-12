"use client";

import React from "react";

import { type PersonaType } from "@/components/chatbot/persona-selector";
import ContentViewer from "@/components/standalone/content-viewer";
import { SlideoutWrapper } from "@/components/standalone/slideout-wrapper";
import { WriteClient } from "@/components/write-chat/write-client";

export function WriteShell({
  initialPrompt,
  initialPersona,
}: {
  initialPrompt?: string;
  initialPersona?: PersonaType;
}) {
  return (
    <SlideoutWrapper contentClassName="" slideout={<ContentViewer className="h-full" />}>
      <WriteClient initialPrompt={initialPrompt} initialPersona={initialPersona} />
    </SlideoutWrapper>
  );
}

export default WriteShell;
