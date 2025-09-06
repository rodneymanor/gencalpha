import { CONTENT_ACTIONS } from "../constants/content-actions";
import type { ScriptGeneratorData } from "../types/script-writer-types";

import { QUICK_GENERATORS_CONFIG, TEMPLATES_CONFIG } from "./constants";

/**
 * Maps CONTENT_ACTIONS to ContentGeneratorCards format for quick generators
 * Extracted from lines 374-391 of the original component
 */
export function getQuickGenerators(): ScriptGeneratorData[] {
  return CONTENT_ACTIONS.filter((action) => action.category === "generators").map((action) => {
    const config = QUICK_GENERATORS_CONFIG[action.key];

    return {
      id: action.key,
      title: action.label,
      description: action.description,
      icon: config?.icon ?? ("heart" as const),
      label: config?.label ?? "Value Content",
    };
  });
}

/**
 * Maps CONTENT_ACTIONS to ContentGeneratorCards format for templates
 * Extracted from lines 392-409 of the original component
 */
export function getTemplates(): ScriptGeneratorData[] {
  return CONTENT_ACTIONS.filter((action) => action.category === "templates").map((action) => {
    const config = TEMPLATES_CONFIG[action.key];

    return {
      id: action.key,
      title: action.label,
      description: action.description,
      icon: config?.icon ?? ("layers" as const),
      label: config?.label ?? "Tutorial",
      duration: config?.duration ?? "5 min",
    };
  });
}
