"use client";

import { createContext, useContext, useReducer, ReactNode, useMemo } from "react";

import { Collection, Video } from "@/lib/collections";

interface CollectionsState {
  collections: Collection[];
  videos: Video[];
  loading: boolean;
  selectedVideo: Video | null;
  isInsightsDialogOpen: boolean;
  manageMode: boolean;
  selectedVideos: Set<string>;
}

type CollectionsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_COLLECTIONS"; payload: Collection[] }
  | { type: "SET_VIDEOS"; payload: Video[] }
  | { type: "ADD_COLLECTION"; payload: Collection }
  | { type: "UPDATE_COLLECTION"; payload: { id: string; updates: Partial<Collection> } }
  | { type: "DELETE_COLLECTION"; payload: string }
  | { type: "ADD_VIDEO"; payload: Video }
  | { type: "UPDATE_VIDEO"; payload: { id: string; updates: Partial<Video> } }
  | { type: "DELETE_VIDEO"; payload: string }
  | { type: "SET_SELECTED_VIDEO"; payload: Video | null }
  | { type: "SET_INSIGHTS_DIALOG_OPEN"; payload: boolean }
  | { type: "SET_MANAGE_MODE"; payload: boolean }
  | { type: "TOGGLE_VIDEO_SELECTION"; payload: string }
  | { type: "CLEAR_VIDEO_SELECTION" }
  | { type: "SELECT_ALL_VIDEOS"; payload: string[] };

const initialState: CollectionsState = {
  collections: [],
  videos: [],
  loading: false,
  selectedVideo: null,
  isInsightsDialogOpen: false,
  manageMode: false,
  selectedVideos: new Set(),
};

function collectionsReducer(state: CollectionsState, action: CollectionsAction): CollectionsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_COLLECTIONS":
      return { ...state, collections: action.payload };
    case "SET_VIDEOS":
      return { ...state, videos: action.payload };
    case "ADD_COLLECTION":
      return { ...state, collections: [action.payload, ...state.collections] };
    case "UPDATE_COLLECTION": {
      const updatedCollections = state.collections.map((collection) =>
        collection.id === action.payload.id ? { ...collection, ...action.payload.updates } : collection,
      );
      return { ...state, collections: updatedCollections };
    }
    case "DELETE_COLLECTION":
      return {
        ...state,
        collections: state.collections.filter((collection) => collection.id !== action.payload),
      };
    case "ADD_VIDEO":
      return { ...state, videos: [action.payload, ...state.videos] };
    case "UPDATE_VIDEO": {
      const updatedVideos = state.videos.map((video) =>
        video.id === action.payload.id ? { ...video, ...action.payload.updates } : video,
      );
      return { ...state, videos: updatedVideos };
    }
    case "DELETE_VIDEO":
      return {
        ...state,
        videos: state.videos.filter((video) => video.id !== action.payload),
        selectedVideos: new Set([...state.selectedVideos].filter((id) => id !== action.payload)),
      };
    case "SET_SELECTED_VIDEO":
      return { ...state, selectedVideo: action.payload };
    case "SET_INSIGHTS_DIALOG_OPEN":
      return { ...state, isInsightsDialogOpen: action.payload };
    case "SET_MANAGE_MODE":
      return {
        ...state,
        manageMode: action.payload,
        selectedVideos: action.payload ? state.selectedVideos : new Set(),
      };
    case "TOGGLE_VIDEO_SELECTION": {
      const newSelection = new Set(state.selectedVideos);
      if (newSelection.has(action.payload)) {
        newSelection.delete(action.payload);
      } else {
        newSelection.add(action.payload);
      }
      return { ...state, selectedVideos: newSelection };
    }
    case "CLEAR_VIDEO_SELECTION":
      return { ...state, selectedVideos: new Set() };
    case "SELECT_ALL_VIDEOS":
      return { ...state, selectedVideos: new Set(action.payload) };
    default:
      return state;
  }
}

const CollectionsContext = createContext<{
  state: CollectionsState;
  dispatch: React.Dispatch<CollectionsAction>;
} | null>(null);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(collectionsReducer, initialState);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <CollectionsContext.Provider value={contextValue}>{children}</CollectionsContext.Provider>;
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error("useCollections must be used within a CollectionsProvider");
  }
  return context;
}
