import { Prompt } from "../types";

export interface HookTypeClassifierVariables {
  hook: string;
}

export interface HookTypeClassifierResult {
  typeId: "problem" | "benefit" | "curiosity" | "question" | "story";
  label: string;
  reason?: string;
}

export const hookTypeClassifierPrompt: Prompt = {
  id: "hook-type-classifier-v1",
  name: "Hook Type Classifier",
  description: "Classify a hook into Problem/Benefit/Curiosity/Question/Story",
  version: "1.0.0",
  tags: ["script", "hook", "classification"],
  template: `You will be given a short-form video hook line. Classify WHAT strategy it uses (type).

HOOK TYPES:
- problem: Highlights a pain point or frustration (escape a negative)
- benefit: Leads with the positive outcome or transformation
- curiosity: Creates an information gap or mystery
- question: Poses a thought-provoking question
- story: Begins with a narrative or anecdote

HOOK: {{hook}}

Return strict JSON: {"typeId":"problem|benefit|curiosity|question|story","label":"Type Label","reason":"why"}`,
  config: {
    systemInstruction: `Output strict JSON only. Use the best matching typeId and a human-readable label like "Problem Hook".`,
    temperature: 0.2,
    maxTokens: 120,
    responseType: "json",
    jsonSchema: {
      type: "object",
      properties: {
        typeId: {
          type: "string",
          enum: ["problem", "benefit", "curiosity", "question", "story"],
        },
        label: { type: "string" },
        reason: { type: "string" },
      },
      required: ["typeId", "label"],
      additionalProperties: false,
    },
    validation: {
      required: ["hook"],
      minLength: { hook: 3 },
      maxLength: { hook: 500 },
    },
  },
};

export default hookTypeClassifierPrompt;

