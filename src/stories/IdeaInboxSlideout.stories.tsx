import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";
import { Lightbulb, BookOpen, Archive, Plus, Zap } from "lucide-react";

import { IdeaInboxSlideoutWrapper } from "@/components/standalone/idea-inbox-slideout-wrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { openIdeaInbox, createNewIdea, saveSelectionAsIdea, savePageAsIdea } from "@/lib/idea-inbox-actions";

// Mock the idea inbox actions for Storybook
const mockActions = {
  openIdeaInbox: action("openIdeaInbox"),
  createNewIdea: action("createNewIdea"),
  saveSelectionAsIdea: action("saveSelectionAsIdea"),
  savePageAsIdea: action("savePageAsIdea"),
};

// Demo content component for the story
const DemoContent = () => (
  <div className="bg-background min-h-screen p-6">
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Idea Inbox Slideout Demo</h1>
        <p className="text-muted-foreground text-lg">
          Test the idea inbox slideout functionality with the buttons below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Open Ideas View */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">Ideas View</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Browse and manage your collected ideas with search and filtering.
            </p>
            <Button
              onClick={() => {
                mockActions.openIdeaInbox("ideas");
                openIdeaInbox("ideas");
              }}
              className="w-full"
              data-testid="open-ideas-btn"
            >
              Open Ideas
            </Button>
          </div>
        </Card>

        {/* Open Drafts View */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
                <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold">Drafts View</h3>
            </div>
            <p className="text-muted-foreground text-sm">Access your work-in-progress scripts and content drafts.</p>
            <Button
              onClick={() => {
                mockActions.openIdeaInbox("drafts");
                openIdeaInbox("drafts");
              }}
              variant="outline"
              className="w-full"
              data-testid="open-drafts-btn"
            >
              Open Drafts
            </Button>
          </div>
        </Card>

        {/* Open Archive View */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-900/20">
                <Archive className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-semibold">Archive View</h3>
            </div>
            <p className="text-muted-foreground text-sm">Browse archived ideas and completed projects.</p>
            <Button
              onClick={() => {
                mockActions.openIdeaInbox("archive");
                openIdeaInbox("archive");
              }}
              variant="outline"
              className="w-full"
              data-testid="open-archive-btn"
            >
              Open Archive
            </Button>
          </div>
        </Card>

        {/* Create New Idea */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">Create New Idea</h3>
            </div>
            <p className="text-muted-foreground text-sm">Quickly create a new idea with pre-filled content.</p>
            <Button
              onClick={() => {
                const newIdeaData = {
                  title: "Demo Idea",
                  content: "This is a demo idea created from the Storybook story.",
                  tags: ["demo", "storybook", "test"],
                  source: "storybook-demo",
                };
                mockActions.createNewIdea(newIdeaData);
                createNewIdea(newIdeaData);
              }}
              variant="default"
              className="w-full"
              data-testid="create-idea-btn"
            >
              Create Idea
            </Button>
          </div>
        </Card>

        {/* Save Selection Demo */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Save Selection</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Simulate saving selected text as an idea (like from Chrome extension).
            </p>
            <Button
              onClick={() => {
                const selectionData = {
                  selection: "This is some selected text that would be saved as an idea from Storybook.",
                  title: "Selected Text Demo",
                  source: "storybook-demo",
                };
                mockActions.saveSelectionAsIdea(selectionData);
                saveSelectionAsIdea(selectionData.selection, selectionData.title, selectionData.source);
              }}
              variant="outline"
              className="w-full"
              data-testid="save-selection-btn"
            >
              Save Selection
            </Button>
          </div>
        </Card>

        {/* Save Page Demo */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/20">
                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold">Save Page</h3>
            </div>
            <p className="text-muted-foreground text-sm">Simulate saving the current page as an idea reference.</p>
            <Button
              onClick={() => {
                const pageData = {
                  url: "https://storybook.js.org/docs/react/get-started/introduction",
                  title: "Storybook Demo Page - Idea Inbox",
                };
                mockActions.savePageAsIdea(pageData);
                savePageAsIdea(pageData.url, pageData.title);
              }}
              variant="outline"
              className="w-full"
              data-testid="save-page-btn"
            >
              Save Page
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-2 text-center">
        <p className="text-muted-foreground text-sm">
          The slideout will appear from the right side of the screen when triggered.
        </p>
        <p className="text-muted-foreground text-xs">
          Use the Actions dropdown in the slideout to test idea-specific functionality.
        </p>
      </div>
    </div>
  </div>
);

const meta: Meta<typeof IdeaInboxSlideoutWrapper> = {
  title: "Components/IdeaInboxSlideoutWrapper",
  component: IdeaInboxSlideoutWrapper,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A slideout wrapper specifically designed for managing ideas, drafts, and archived content. Built on top of the base SlideoutWrapper for consistency and maintainability.",
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes for the wrapper",
    },
    contentClassName: {
      control: "text",
      description: "Additional CSS classes for the content area",
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background min-h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {},
  render: (args) => (
    <IdeaInboxSlideoutWrapper {...args}>
      <DemoContent />
    </IdeaInboxSlideoutWrapper>
  ),
};

// Story with custom styling
export const CustomStyling: Story = {
  args: {
    className: "custom-wrapper",
    contentClassName: "custom-content",
  },
  render: (args) => (
    <IdeaInboxSlideoutWrapper {...args}>
      <DemoContent />
    </IdeaInboxSlideoutWrapper>
  ),
};

// Interactive test story
export const InteractiveTest: Story = {
  args: {},
  render: (args) => (
    <IdeaInboxSlideoutWrapper {...args}>
      <DemoContent />
    </IdeaInboxSlideoutWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test opening ideas view
    const openIdeasBtn = canvas.getByTestId("open-ideas-btn");
    await userEvent.click(openIdeasBtn);

    // Wait for slideout to appear
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if slideout opened (you might need to adjust this selector)
    const slideout = canvasElement.querySelector('[class*="translate-x-0"]');
    expect(slideout).toBeTruthy();
  },
};

// Minimal story for testing just the wrapper
export const MinimalDemo: Story = {
  args: {},
  render: (args) => (
    <IdeaInboxSlideoutWrapper {...args}>
      <div className="p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Minimal Demo</h2>
        <p className="text-muted-foreground mb-6">This is a minimal demo of the Idea Inbox Slideout Wrapper.</p>
        <Button onClick={() => openIdeaInbox("ideas")}>
          <Zap className="mr-2 h-4 w-4" />
          Open Ideas Slideout
        </Button>
      </div>
    </IdeaInboxSlideoutWrapper>
  ),
};

// Story for testing different views
export const ViewSwitching: Story = {
  args: {},
  render: (args) => (
    <IdeaInboxSlideoutWrapper {...args}>
      <div className="space-y-4 p-8">
        <h2 className="mb-6 text-center text-2xl font-bold">View Switching Test</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={() => openIdeaInbox("ideas")} variant="default">
            Open Ideas
          </Button>
          <Button onClick={() => openIdeaInbox("drafts")} variant="outline">
            Open Drafts
          </Button>
          <Button onClick={() => openIdeaInbox("archive")} variant="outline">
            Open Archive
          </Button>
        </div>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Test switching between different views in the slideout.
        </p>
      </div>
    </IdeaInboxSlideoutWrapper>
  ),
};
