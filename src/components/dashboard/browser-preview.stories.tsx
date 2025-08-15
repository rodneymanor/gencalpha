import type { Meta, StoryObj } from "@storybook/react";

import { BrowserPreview } from "./browser-preview";

const meta: Meta<typeof BrowserPreview> = {
  title: "Dashboard/BrowserPreview",
  component: BrowserPreview,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    deviceName: {
      control: "text",
      description: "Name of the device",
    },
    userName: {
      control: "text",
      description: "Name of the user",
    },
    currentApp: {
      control: "text",
      description: "Current application being used",
    },
    url: {
      control: "text",
      description: "URL being browsed",
    },
    imageUrl: {
      control: "text",
      description: "Screenshot URL for the browser preview",
    },
    mainActionText: {
      control: "text",
      description: "Text for the main action button",
    },
    currentTask: {
      control: "text",
      description: "Current task description",
    },
    currentTaskStatus: {
      control: "text",
      description: "Current task status",
    },
    taskProgress: {
      control: "text",
      description: "Task progress indicator",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with all default props
export const Default: Story = {};

// Story with custom device and user
export const CustomUser: Story = {
  args: {
    deviceName: "Sarah's MacBook Pro",
    userName: "Sarah",
    currentApp: "Chrome",
    url: "https://example.com",
    mainActionText: "Take Screenshot",
    currentTask: "Testing the new feature",
    currentTaskStatus: "In progress...",
    taskProgress: "3 / 5",
  },
};

// Story for development environment
export const Development: Story = {
  args: {
    deviceName: "Developer's Computer",
    userName: "Dev",
    currentApp: "VS Code Browser",
    url: "http://localhost:3000",
    mainActionText: "Debug",
    currentTask: "Running development server",
    currentTaskStatus: "Server running on port 3000",
    taskProgress: "✓ Ready",
  },
};

// Story for production deployment
export const Production: Story = {
  args: {
    deviceName: "Production Server",
    userName: "Admin",
    currentApp: "Browser",
    url: "https://myapp.vercel.app",
    mainActionText: "Monitor",
    currentTask: "Application deployed successfully",
    currentTaskStatus: "Live and running",
    taskProgress: "✓ Complete",
  },
};

// Story showing long URL truncation
export const LongURL: Story = {
  args: {
    deviceName: "Designer's iMac",
    userName: "Alex",
    currentApp: "Safari",
    url: "https://very-long-domain-name-for-testing-truncation.example.com/path/to/very/long/page/name",
    mainActionText: "Capture",
    currentTask: "Testing URL truncation behavior in the interface",
    currentTaskStatus: "Analyzing layout...",
    taskProgress: "2 / 4",
  },
};

// Story with minimal props
export const Minimal: Story = {
  args: {
    deviceName: "Computer",
    userName: "User",
    url: "localhost",
    mainActionText: "Go",
    currentTask: "Task",
    currentTaskStatus: "Ready",
    taskProgress: "1",
  },
};
