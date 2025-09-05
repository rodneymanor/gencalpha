"use client";

import React from "react";

import { UnifiedWriteClient } from "@/components/write-chat/unified-write-client";

export function WriteShell({ initialPrompt }: { initialPrompt?: string }) {
  return <UnifiedWriteClient initialPrompt={initialPrompt} />;
}

export default WriteShell;
