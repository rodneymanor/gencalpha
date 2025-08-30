import { useReducer, useCallback, useEffect, useRef } from "react";

export type VideoAction = "transcribe" | "ideas" | "hooks";

export interface VideoActionState {
  status: "idle" | "processing" | "debouncing";
  activeAction: VideoAction | null;
  lastActionTime: number;
  requestId: string | null;
}

export type VideoActionEvent =
  | { type: "REQUEST_ACTION"; action: VideoAction; requestId: string }
  | { type: "START_PROCESSING"; action: VideoAction }
  | { type: "COMPLETE_ACTION" }
  | { type: "RESET_DEBOUNCE" }
  | { type: "FORCE_RESET" };

const DEBOUNCE_TIME = 500; // 500ms debounce

function videoActionReducer(state: VideoActionState, event: VideoActionEvent): VideoActionState {
  const now = Date.now();
  console.log("🔄 [VideoActionReducer]", event.type, "Current state:", state.status);

  switch (event.type) {
    case "REQUEST_ACTION":
      // Prevent duplicate requests
      if (state.status === "processing") {
        console.log("🚫 [VideoActionReducer] Blocked: already processing");
        return state; // Ignore request while processing
      }

      // Check debounce window
      if (state.status === "debouncing" && now - state.lastActionTime < DEBOUNCE_TIME) {
        console.log("🚫 [VideoActionReducer] Blocked: within debounce window");
        return state; // Ignore request within debounce window
      }

      // Same request ID check (idempotency)
      if (state.requestId === event.requestId && state.status !== "idle") {
        console.log("🚫 [VideoActionReducer] Blocked: duplicate request ID");
        return state; // Ignore duplicate request ID
      }

      console.log("✅ [VideoActionReducer] Accepting request for:", event.action);
      return {
        ...state,
        status: "debouncing",
        activeAction: event.action,
        lastActionTime: now,
        requestId: event.requestId,
      };

    case "START_PROCESSING":
      // Only allow processing if we're in debouncing state with matching action
      if (state.status === "debouncing" && state.activeAction === event.action) {
        return {
          ...state,
          status: "processing",
        };
      }
      return state;

    case "COMPLETE_ACTION":
      console.log("✅ [VideoActionReducer] Completing action");
      return {
        status: "idle",
        activeAction: null,
        lastActionTime: state.lastActionTime,
        requestId: null,
      };

    case "RESET_DEBOUNCE":
      if (state.status === "debouncing") {
        return {
          ...state,
          status: "idle",
          activeAction: null,
          requestId: null,
        };
      }
      return state;

    case "FORCE_RESET":
      return {
        status: "idle",
        activeAction: null,
        lastActionTime: 0,
        requestId: null,
      };

    default:
      return state;
  }
}

const initialState: VideoActionState = {
  status: "idle",
  activeAction: null,
  lastActionTime: 0,
  requestId: null,
};

export function useVideoActionState() {
  const [state, dispatch] = useReducer(videoActionReducer, initialState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-reset debouncing after 2 seconds if no processing starts
  useEffect(() => {
    if (state.status === "debouncing") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: "RESET_DEBOUNCE" });
      }, 2000);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.status]);

  const requestAction = useCallback((action: VideoAction): string | null => {
    const requestId = `${action}-${Date.now()}-${Math.random()}`;
    dispatch({ type: "REQUEST_ACTION", action, requestId });

    // Return request ID if action was accepted (not blocked by debounce/processing)
    return requestId;
  }, []);

  const startProcessing = useCallback((action: VideoAction) => {
    dispatch({ type: "START_PROCESSING", action });
  }, []);

  const completeAction = useCallback(() => {
    dispatch({ type: "COMPLETE_ACTION" });
  }, []);

  const resetDebounce = useCallback(() => {
    dispatch({ type: "RESET_DEBOUNCE" });
  }, []);

  const forceReset = useCallback(() => {
    dispatch({ type: "FORCE_RESET" });
  }, []);

  return {
    state,
    actions: {
      requestAction,
      startProcessing,
      completeAction,
      resetDebounce,
      forceReset,
    },
    // Computed values for easier use
    isIdle: state.status === "idle",
    isProcessing: state.status === "processing",
    isDebouncing: state.status === "debouncing",
    canAcceptAction:
      state.status === "idle" || (state.status === "debouncing" && Date.now() - state.lastActionTime >= DEBOUNCE_TIME),
  };
}
