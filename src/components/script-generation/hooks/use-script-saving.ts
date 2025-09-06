import { useCallback } from "react";

import { useScriptsApi } from "@/hooks/use-scripts-api";

import { ScriptPersistenceService } from "../services/script-persistence-service";
import type { ScriptPersistenceOptions, ScriptPersistenceCallbacks } from "../services/script-persistence-service";

/**
 * Custom hook for script saving operations
 * Wraps the ScriptPersistenceService and provides callbacks
 */
export function useScriptSaving() {
  const { createScript, updateScript } = useScriptsApi();

  // Create service instance with API functions
  const persistenceService = new ScriptPersistenceService(createScript, updateScript);

  const saveScript = useCallback(
    async (options: ScriptPersistenceOptions, callbacks: ScriptPersistenceCallbacks) => {
      await persistenceService.saveScript(options, callbacks);
    },
    [persistenceService],
  );

  return {
    saveScript,
  };
}
