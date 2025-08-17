import type { Meta, StoryObj } from "@storybook/react";

import SocialMediaVideoAnalyzer from "@/components/standalone/social-media-video-analyzer";
import type { VideoData } from "@/components/standalone/social-media-video-analyzer/types";

const meta = {
  title: "Components/SocialMediaVideoAnalyzer",
  component: SocialMediaVideoAnalyzer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A comprehensive video analysis tool for social media content. Analyzes TikTok, Instagram, and YouTube Shorts videos to extract metrics, content patterns, and voice signatures.",
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes for styling",
    },
    initialData: {
      control: "object",
      description: "Pre-loaded video data for the analyzer",
    },
    onExportProfile: {
      action: "exportProfile",
      description: "Callback when user exports analysis profile",
    },
    onUseStyleForRescript: {
      action: "useStyleForRescript",
      description: "Callback when user applies style to rescript",
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof SocialMediaVideoAnalyzer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleVideoData: VideoData = {
  platform: "tiktok",
  videoUrl: "https://www.tiktok.com/@creator/video/123456789",
  creator: {
    name: "Sarah Johnson",
    handle: "@sarahjohnson",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
  },
  title: "5 Productivity Hacks That Actually Work",
  durationSec: 34,
  metrics: {
    likes: 24500,
    comments: 892,
    shares: 1205,
    saves: 3420,
    views: 156000,
    engagementRate: 0.196,
  },
  content: {
    format: "List-based tips with visual demonstrations",
    hook: "Stop wasting time with productivity advice that doesn't work",
    hookIdeas: [
      "The productivity hack nobody talks about",
      "Why your to-do list is sabotaging you",
      "5 minutes that will change your entire day",
    ],
    caption: "Which one are you trying first? 👀 #productivity #lifehacks #timemanagement #workfromhome",
    contentIdeas: [
      "Time-blocking with color coding",
      "The 2-minute rule for small tasks",
      "Batch processing similar activities",
      "Energy-based task scheduling",
      "Digital minimalism for focus",
    ],
    transcript: `Stop wasting time with productivity advice that doesn't work. Here's what you need to do. First, let's talk about time blocking. Instead of just writing down tasks, you need to assign them specific time slots. But here's the key - color code them by energy level. High energy tasks in the morning, low energy tasks in the afternoon. Second, the two minute rule. If something takes less than two minutes, do it immediately. Stop adding it to your to-do list. Third, batch similar tasks together. All your emails at once, all your calls at once. Your brain doesn't have to switch gears constantly. Fourth, work with your natural energy, not against it. Track when you feel most focused and schedule your hardest work then. And finally, turn off all notifications except the ones that are truly urgent. Your phone is not your boss. Try these for one week and watch your productivity skyrocket.`,
  },
};

export const Default: Story = {
  args: {},
};

export const WithPreloadedData: Story = {
  args: {
    initialData: sampleVideoData,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the analyzer with pre-loaded video data and metrics displayed",
      },
    },
  },
};

export const YouTubeExample: Story = {
  args: {
    initialData: {
      ...sampleVideoData,
      platform: "youtube",
      videoUrl: "https://www.youtube.com/shorts/abc123",
      creator: {
        name: "Tech Review Mike",
        handle: "@techreviewmike",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
      title: "iPhone vs Android: The Truth",
      durationSec: 58,
      metrics: {
        likes: 45200,
        comments: 1840,
        shares: 892,
        saves: 2100,
        views: 312000,
        engagementRate: 0.162,
      },
      content: {
        ...sampleVideoData.content,
        format: "Comparison with visual examples",
        hook: "Everyone gets this iPhone vs Android debate wrong",
        caption: "What do you think? Team iPhone or Team Android? 📱 #tech #iphone #android #comparison",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Example with YouTube Shorts content and different creator data",
      },
    },
  },
};

export const InstagramExample: Story = {
  args: {
    initialData: {
      ...sampleVideoData,
      platform: "instagram",
      videoUrl: "https://www.instagram.com/reel/xyz789",
      creator: {
        name: "Fitness Emma",
        handle: "@fitnessemma",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      },
      title: "Morning Workout You Can Do Anywhere",
      durationSec: 42,
      metrics: {
        likes: 18900,
        comments: 654,
        shares: 432,
        saves: 2890,
        views: 89000,
        engagementRate: 0.254,
      },
      content: {
        ...sampleVideoData.content,
        format: "Exercise demonstration with form tips",
        hook: "No gym? No problem. Here's your 5-minute morning routine",
        caption: "Save this for tomorrow morning! 💪 #morningworkout #fitness #homeworkout #quickworkout",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Example with Instagram Reel content focused on fitness",
      },
    },
  },
};

export const HighEngagement: Story = {
  args: {
    initialData: {
      ...sampleVideoData,
      metrics: {
        likes: 125000,
        comments: 4200,
        shares: 8900,
        saves: 15600,
        views: 890000,
        engagementRate: 0.342,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Example with very high engagement metrics to test display of large numbers",
      },
    },
  },
};

export const LowEngagement: Story = {
  args: {
    initialData: {
      ...sampleVideoData,
      metrics: {
        likes: 156,
        comments: 12,
        shares: 8,
        saves: 34,
        views: 2400,
        engagementRate: 0.088,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Example with lower engagement metrics to test different number formatting",
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    className: "border-2 border-primary",
    initialData: sampleVideoData,
  },
  parameters: {
    docs: {
      description: {
        story: "Example with custom CSS classes applied to the analyzer",
      },
    },
  },
};

export const WithCallbacks: Story = {
  args: {
    initialData: sampleVideoData,
    onExportProfile: (analysis) => {
      console.log("Exporting profile:", analysis);
      alert("Profile exported! Check console for details.");
    },
    onUseStyleForRescript: (analysis) => {
      console.log("Using style for rescript:", analysis);
      alert("Style applied to rescript! Check console for details.");
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Example with callback functions that log to console and show alerts",
      },
    },
  },
};
