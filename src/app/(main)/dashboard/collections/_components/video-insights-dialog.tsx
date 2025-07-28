"use client";

import { VideoInsightsDialog } from "../../daily/_components/daily-video-insights-dialog";
import { useCollections } from "./collections-context";

export function CollectionsVideoInsightsDialog() {
  const { state, dispatch } = useCollections();

  const handleClose = () => {
    dispatch({ type: "SET_INSIGHTS_DIALOG_OPEN", payload: false });
    dispatch({ type: "SET_SELECTED_VIDEO", payload: null });
  };

  const handleGenerateHooks = (video: any) => {
    console.log("🎬 Generate Hooks for video:", video.title);
    // TODO: Implement hook generation from video transcript
  };

  const handleGenerateTranscript = (video: any) => {
    console.log("🎤 Generate Transcript for video:", video.title);
    // TODO: Implement transcript generation
  };

  const handleRewriteScript = (video: any) => {
    console.log("📝 Rewrite Script for video:", video.title);
    // TODO: Implement script rewriting
  };

  return (
    <VideoInsightsDialog
      video={state.selectedVideo}
      open={state.isInsightsDialogOpen}
      onOpenChange={handleClose}
      onGenerateHooks={handleGenerateHooks}
      onGenerateTranscript={handleGenerateTranscript}
      onRewriteScript={handleRewriteScript}
    />
  );
}

// Export the wrapper as the default VideoInsightsDialog for backwards compatibility
export { CollectionsVideoInsightsDialog as VideoInsightsDialog };