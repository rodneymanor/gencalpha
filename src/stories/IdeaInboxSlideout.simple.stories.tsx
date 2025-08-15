import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { Lightbulb, Zap } from "lucide-react";

import { IdeaInboxSlideoutWrapper } from "@/components/standalone/idea-inbox-slideout-wrapper";
import { Button } from "@/components/ui/button";
import { openIdeaInbox, closeIdeaInbox } from "@/lib/idea-inbox-actions";

// Simple content for testing
const SimpleContent = () => (
  <div className="bg-background flex min-h-screen items-center justify-center">
    <div className="space-y-6 p-8 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Idea Inbox Slideout Test</h1>
        <p className="text-muted-foreground">Click the button below to open the slideout from the right.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Button
          onClick={() => {
            action("Opening Ideas slideout")();
            openIdeaInbox("ideas");
          }}
          size="lg"
          className="gap-2"
        >
          <Lightbulb className="h-5 w-5" />
          Open Ideas Slideout
        </Button>

        <Button
          onClick={() => {
            action("Opening Drafts slideout")();
            openIdeaInbox("drafts");
          }}
          variant="outline"
          size="lg"
        >
          Open Drafts
        </Button>

        <Button
          onClick={() => {
            action("Opening Archive slideout")();
            openIdeaInbox("archive");
          }}
          variant="outline"
          size="lg"
        >
          Open Archive
        </Button>
      </div>

      <div className="text-center">
        <Button
          onClick={() => {
            action("Closing slideout")();
            closeIdeaInbox();
          }}
          variant="ghost"
          size="sm"
        >
          Close Slideout
        </Button>
      </div>

      <div className="text-muted-foreground mx-auto max-w-md space-y-1 text-xs">
        <p>• The slideout should slide in from the right side</p>
        <p>• Try switching between Ideas, Drafts, and Archive tabs</p>
        <p>• Test the Actions dropdown in the slideout header</p>
        <p>• Click the X button or use the close button to dismiss</p>
      </div>
    </div>
  </div>
);

const meta: Meta<typeof IdeaInboxSlideoutWrapper> = {
  title: "Components/IdeaInboxSlideoutWrapper/Simple",
  component: IdeaInboxSlideoutWrapper,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A simple test of the Idea Inbox Slideout Wrapper functionality. This story focuses on testing the slideout behavior without complex demo content.",
      },
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

export const SimpleTest: Story = {
  render: () => (
    <IdeaInboxSlideoutWrapper>
      <SimpleContent />
    </IdeaInboxSlideoutWrapper>
  ),
};

export const OpenByDefault: Story = {
  render: () => (
    <IdeaInboxSlideoutWrapper>
      <SimpleContent />
    </IdeaInboxSlideoutWrapper>
  ),
  play: async () => {
    // Auto-open the slideout when the story loads
    setTimeout(() => {
      openIdeaInbox("ideas");
    }, 500);
  },
};

export const MinimalLayout: Story = {
  render: () => (
    <IdeaInboxSlideoutWrapper>
      <div className="p-4">
        <h2 className="mb-4 text-xl font-semibold">Minimal Test Layout</h2>
        <Button onClick={() => openIdeaInbox("ideas")}>
          <Zap className="mr-2 h-4 w-4" />
          Test Slideout
        </Button>
      </div>
    </IdeaInboxSlideoutWrapper>
  ),
};
