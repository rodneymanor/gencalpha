"use client";

import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";

import { HookBlock, BridgeBlock, GoldenNuggetBlock, CTABlock } from "./script-blocks";

// Create enhanced schema with script-specific blocks
export const customBlockSchema = BlockNoteSchema.create({
  blockSpecs: {
    // Keep all default blocks (paragraph, heading, bulletListItem, etc.)
    ...defaultBlockSpecs,

    // Add script-specific blocks
    hook: HookBlock,
    bridge: BridgeBlock,
    goldenNugget: GoldenNuggetBlock,
    cta: CTABlock,
  },
});

// Export the schema type for use in components
export type CustomBlockSchema = typeof customBlockSchema;
