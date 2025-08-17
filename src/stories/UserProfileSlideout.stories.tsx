import type { Meta, StoryObj } from "@storybook/react";

import { UserProfileSlideoutStory } from "@/components/standalone/user-profile-slideout-story";

const meta: Meta<typeof UserProfileSlideoutStory> = {
  title: "Components/UserProfileSlideout",
  component: UserProfileSlideoutStory,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "A slideout panel for user profile settings including keyword search, personal description, and main topics.",
      },
    },
  },
  argTypes: {
    onClose: { action: "closed" },
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-screen bg-background">
        <div className="flex h-full">
          {/* Mock main content */}
          <div className="flex-1 bg-card p-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">Main Content Area</h1>
            <p className="text-muted-foreground">
              This is the main content area. The slideout panel appears on the right side.
            </p>
          </div>
          
          {/* Slideout panel */}
          <div className="bg-background border-border w-[400px] max-w-[90vw] border-l shadow-[var(--shadow-soft-drop)]">
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClose: () => console.log("Profile slideout closed"),
    mockUser: {
      uid: "mock-user-123",
      email: "user@example.com",
      getIdToken: async () => "mock-token-123",
    },
    initialData: {
      keywords: ["content creation", "social media", "video editing"],
      personalDescription: "I'm a content creator focused on educational videos about technology and productivity.",
      mainTopics: "Technology, Productivity, Education",
    },
  },
};

export const WithKeywordSearch: Story = {
  args: {
    onClose: () => console.log("Profile slideout closed"),
    mockUser: {
      uid: "mock-user-123",
      email: "user@example.com",
      getIdToken: async () => "mock-token-123",
    },
    initialData: {
      keywords: ["content creation", "social media"],
      personalDescription: "I'm a content creator focused on educational videos.",
      mainTopics: "Technology, Education",
    },
  },
};

export const EmptyState: Story = {
  args: {
    onClose: () => console.log("Profile slideout closed"),
    mockUser: {
      uid: "mock-user-123",
      email: "user@example.com",
      getIdToken: async () => "mock-token-123",
    },
    initialData: {
      keywords: [],
      personalDescription: "",
      mainTopics: "",
    },
  },
};

export const LoadingState: Story = {
  args: {
    onClose: () => console.log("Profile slideout closed"),
    mockUser: undefined, // No user to trigger loading state
    initialData: {
      keywords: [],
      personalDescription: "",
      mainTopics: "",
    },
  },
};