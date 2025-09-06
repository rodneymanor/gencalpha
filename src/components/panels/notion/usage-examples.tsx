/**
 * NotionPanel Usage Examples
 *
 * The NotionPanel system provides two main components:
 * 1. NotionPanel - Core panel component (use when embedding in existing layouts)
 * 2. NotionPanelWrapper - Full-featured slide-out panel (use for overlays)
 */

import { NotionPanel, NotionPanelWrapper, PanelPresets } from "@/components/panels/notion";

// ============================================
// Example 1: Simple New Idea Panel
// ============================================
export function NewIdeaExample() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <NotionPanelWrapper
      {...PanelPresets.newIdea}
      title={title}
      onTitleChange={setTitle}
      onCopy={() => navigator.clipboard.writeText(content)}
      onDownload={() => {
        /* download logic */
      }}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter text or type / for commands"
        className="h-full w-full resize-none border-0 outline-none"
      />
    </NotionPanelWrapper>
  );
}

// ============================================
// Example 2: Content Generation Panel with Tabs
// ============================================
export function ContentGenerationExample() {
  const [title, setTitle] = useState("My Content Idea");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState({ label: "Script Ready", color: "success" });

  const tabData = {
    video: <VideoPlayer src="/path/to/video" />,
    transcript: <TranscriptView content="..." />,
    components: <ComponentsList items={[]} />,
    metadata: <MetadataView data={{}} />,
    suggestions: <SuggestionsList items={[]} />,
    analysis: <AnalysisView metrics={{}} />,
  };

  return (
    <NotionPanelWrapper
      {...PanelPresets.contentGeneration}
      title={title}
      onTitleChange={setTitle}
      properties={[
        { id: "1", type: "url", name: "URL", value: url, icon: "link" },
        { id: "2", type: "status", name: "Generation", value: status, icon: "burst" },
      ]}
      onPropertyChange={(id, value) => {
        if (id === "1") setUrl(value as string);
        if (id === "2") setStatus(value as { label: string; color: string });
      }}
      tabData={tabData}
      defaultTab="video"
      onRewrite={() => console.log("Rewrite clicked")}
      onAddHooks={() => console.log("Add hooks clicked")}
      onAddContentIdeas={() => console.log("Add content ideas clicked")}
    />
  );
}

// ============================================
// Example 3: Embedded Panel (No Wrapper)
// ============================================
export function EmbeddedPanelExample() {
  return (
    <div className="flex h-screen">
      <div className="flex-1">{/* Main content */}</div>

      <div className="w-[600px] border-l border-neutral-200">
        <NotionPanel
          title="Embedded Panel"
          properties={[
            { id: "1", type: "text", name: "Title", value: "Example" },
            { id: "2", type: "date", name: "Created", value: "2024-01-01" },
          ]}
          showPageControls={false}
          isOpen={true}
        >
          <div className="p-4">Your content here</div>
        </NotionPanel>
      </div>
    </div>
  );
}

// ============================================
// Example 4: Controlled Panel State
// ============================================
export function ControlledPanelExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(600);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Panel</button>

      <NotionPanelWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isFullScreen={isFullScreen}
        onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        width={panelWidth}
        onWidthChange={setPanelWidth}
        title="Controlled Panel"
        showPageControls={true}
      >
        <div>Content with controlled state</div>
      </NotionPanelWrapper>
    </>
  );
}

// ============================================
// Example 5: Dynamic Tab Content
// ============================================
export function DynamicTabsExample() {
  const [activeContent, setActiveContent] = useState(null);

  // Only show tabs that have content
  const tabData = {
    ...(activeContent?.video && { video: activeContent.video }),
    ...(activeContent?.transcript && { transcript: activeContent.transcript }),
    ...(activeContent?.analysis && { analysis: activeContent.analysis }),
  };

  return (
    <NotionPanelWrapper title="Dynamic Content" tabData={tabData} defaultTab={Object.keys(tabData)[0] as TabType}>
      {/* Fallback if no tabs */}
      {Object.keys(tabData).length === 0 && (
        <div className="p-8 text-center text-neutral-400">No content available</div>
      )}
    </NotionPanelWrapper>
  );
}

// ============================================
// Integration Guide
// ============================================

/**
 * Quick Start:
 *
 * 1. Import the components:
 *    import { NotionPanelWrapper, PanelPresets } from '@/components/panels/notion';
 *
 * 2. Use a preset configuration:
 *    <NotionPanelWrapper {...PanelPresets.newIdea} />
 *
 * 3. Customize as needed:
 *    <NotionPanelWrapper
 *      title="My Panel"
 *      showPageControls={true}
 *      onCopy={() => {}}
 *      onDownload={() => {}}
 *    />
 *
 * Key Props:
 * - isNewIdea: Toggle between editor mode and tab mode
 * - tabData: Object with content for each tab (only shown tabs have data)
 * - properties: Array of property objects for metadata display
 * - showPageControls: Show/hide Rewrite, +Hooks, +Content Ideas buttons
 * - onCopy/onDownload: Action handlers for header buttons
 *
 * Styling:
 * - Follows Clarity Design System automatically
 * - Uses 4px grid spacing
 * - Soft UI with numbered color variants
 * - Smooth animations with proper easing
 */
