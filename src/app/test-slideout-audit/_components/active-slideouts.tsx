"use client";

import { FileText, Grid3X3, Settings, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Legacy components have been removed and replaced with UnifiedSlideout
import SlideoutWrapper from "@/components/standalone/slideout-wrapper";
import { FloatingVideoPlayer } from "@/components/video/video-slideout-player";
import { 
  UnifiedSlideout, 
  ClaudeArtifactConfig,
  ModalOverlayConfig,
  CompactSlideoutConfig
} from "@/components/ui/unified-slideout";
import { Video as VideoType } from "@/lib/collections";
import { ClaudeArtifactDemo, ClaudeArtifactHeader } from "./claude-artifact-demo";

interface SlideoutTestState {
  slideoutWrapper: boolean;
  unified: boolean;
  claudeArtifact: boolean;
  modalOverlay: boolean;
  compact: boolean;
}

interface ActiveSlideotsProps {
  activeSlideouts: SlideoutTestState;
  onToggle: (key: keyof SlideoutTestState) => void;
  floatingOpen: boolean;
  currentVideo: VideoType | null;
  onCloseVideo: () => void;
}

export function ActiveSlideouts({
  activeSlideouts,
  onToggle,
  floatingOpen,
  currentVideo,
  onCloseVideo,
}: ActiveSlideotsProps) {
  return (
    <>
      {/* Remaining Legacy Component */}
      <SlideoutWrapper
        slideout={
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-semibold">SlideoutWrapper Test</h3>
            <p className="text-muted-foreground">
              This is the complex SlideoutWrapper component with multi-tab interface and feature flags.
              This component is still used in production layouts and requires careful evaluation for migration.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-[var(--radius-card)] border border-yellow-200/50 dark:border-yellow-800/50 p-4">
              <h4 className="text-foreground font-medium mb-2">⚠️ Production Usage</h4>
              <p className="text-muted-foreground text-sm">
                This component is actively used in layout files and provides complex multi-tab functionality 
                with event-driven behavior. Migration requires careful planning.
              </p>
            </div>
          </div>
        }
        openEvents={["test:open"]}
        closeEvents={["test:close"]}
      >
        <div />
      </SlideoutWrapper>

      <FloatingVideoPlayer
        isOpen={floatingOpen}
        onClose={onCloseVideo}
        video={currentVideo}
        mode="fixed"
      />

      {/* New Unified Slideouts */}
      <UnifiedSlideout
        isOpen={activeSlideouts.unified}
        onClose={() => onToggle("unified")}
        title="Unified Slideout Demo"
        config={{
          width: "lg",
          variant: "elevated",
          backdrop: true,
          backdropBlur: true,
          showHeader: true,
          showCloseButton: true
        }}
        headerActions={<Badge variant="secondary">NEW</Badge>}
        footerActions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <h3 className="text-foreground text-lg font-semibold">Unified Slideout Component</h3>
          <p className="text-muted-foreground">
            This is the new UnifiedSlideout component that consolidates all slideout patterns.
          </p>
        </div>
      </UnifiedSlideout>

      <UnifiedSlideout
        isOpen={activeSlideouts.claudeArtifact}
        onClose={() => onToggle("claudeArtifact")}
        title="Claude Artifact Panel"
        config={ClaudeArtifactConfig}
        headerActions={<ClaudeArtifactHeader />}
      >
        <ClaudeArtifactDemo />
      </UnifiedSlideout>

      <UnifiedSlideout
        isOpen={activeSlideouts.modalOverlay}
        onClose={() => onToggle("modalOverlay")}
        title="Modal Overlay Example"
        config={ModalOverlayConfig}
        headerActions={<Badge variant="destructive">MODAL</Badge>}
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/20 rounded-[var(--radius-card)] border border-red-200/50 dark:border-red-800/50 p-4">
            <h3 className="text-foreground text-lg font-semibold mb-2">Traditional Modal Behavior</h3>
            <p className="text-muted-foreground text-sm">
              This demonstrates traditional modal overlay behavior with backdrop and body scroll prevention.
            </p>
          </div>
        </div>
      </UnifiedSlideout>

      <UnifiedSlideout
        isOpen={activeSlideouts.compact}
        onClose={() => onToggle("compact")}
        config={CompactSlideoutConfig}
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-foreground text-lg font-semibold">Compact Panel</h3>
            <p className="text-muted-foreground text-sm">Perfect for navigation or tool palettes</p>
          </div>
          
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Grid3X3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Team
            </Button>
          </div>
        </div>
      </UnifiedSlideout>
    </>
  );
}
