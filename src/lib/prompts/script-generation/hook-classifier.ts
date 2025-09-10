import { Prompt } from "../types";

export interface HookClassifierVariables {
  hook: string;
}

export interface HookClassifierResult {
  category: "speed" | "educational" | "viral";
  reason?: string;
}

export const hookClassifierPrompt: Prompt = {
  id: "hook-classifier-v1",
  name: "Hook Category Classifier",
  description: "Classify a hook line into speed | educational | viral based on our patterns",
  version: "1.0.0",
  tags: ["script", "hook", "classification"],
  template: `You will be given a short hook line used as the opening of a short-form video.

Classify it into one of exactly these categories:
- "speed": direct, imperative, contrarian, mistake-avoidance, quick-hit value
- "educational": how/why explanations, questions, breakdowns, research-backed framing
- "viral": sensational, dramatic, personal challenge, shock/surprise, insider/secret framing

HOOK: {{hook}}

Return strictly valid JSON with fields: {"category": "speed|educational|viral", "reason": "brief justification"}.`,
  config: {
    systemInstruction: `You are a precise classifier. Output strict JSON only. No extra text.`,
    temperature: 0.2,
    maxTokens: 120,
    responseType: "json",
    jsonSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["speed", "educational", "viral"],
          description: "Hook category label",
        },
        reason: { type: "string" },
      },
      required: ["category"],
      additionalProperties: false,
    },
    validation: {
      required: ["hook"],
      minLength: { hook: 3 },
      maxLength: { hook: 500 },
    },
  },
};

export default hookClassifierPrompt;

