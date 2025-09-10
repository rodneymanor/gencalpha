import { Prompt } from "../types";

export interface HookStyleClassifierVariables {
  hook: string;
}

export interface HookStyleClassifierResult {
  styleId: "question" | "statistic" | "story" | "provocative" | "direct" | "contrarian";
  label: string;
  reason?: string;
}

export const hookStyleClassifierPrompt: Prompt = {
  id: "hook-style-classifier-v1",
  name: "Hook Style Classifier",
  description: "Classify HOW the hook is delivered (Question/Statistic/Story/Provocative/Direct/Contrarian)",
  version: "1.0.0",
  tags: ["script", "hook", "classification"],
  template: `You will be given a short-form video hook line. Classify HOW it's delivered (style).

HOOK STYLES:
- question: Interrogative format; can apply to any type
- statistic: Opens with specific numbers, percentages, or data points
- story: Uses narrative elements (e.g., "Last week I...", "When I started...")
- provocative: Bold/controversial claim or challenge to trigger emotion
- direct: Clear and simple phrasing (e.g., "Here's how to...")
- contrarian: Explicitly contradicts popular advice (e.g., "Stop doing X", "Everyone is wrong about Y")

HOOK: {{hook}}

Return strict JSON: {"styleId":"question|statistic|story|provocative|direct|contrarian","label":"Style Label","reason":"why"}`,
  config: {
    systemInstruction: `Output strict JSON only. Use the best matching styleId and a human-readable label like "Question".`,
    temperature: 0.2,
    maxTokens: 120,
    responseType: "json",
    jsonSchema: {
      type: "object",
      properties: {
        styleId: {
          type: "string",
          enum: ["question", "statistic", "story", "provocative", "direct", "contrarian"],
        },
        label: { type: "string" },
        reason: { type: "string" },
      },
      required: ["styleId", "label"],
      additionalProperties: false,
    },
    validation: {
      required: ["hook"],
      minLength: { hook: 3 },
      maxLength: { hook: 500 },
    },
  },
};

export default hookStyleClassifierPrompt;

