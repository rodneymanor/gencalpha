import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import { TikTokVideoPlayer, generateSampleVideoData } from './tiktok-video-player';

// Local VideoData interface to match the component's interface
interface VideoData {
  id: string;
  videoUrl?: string;
  thumbnailUrl: string;
  poster?: string;
  visibility: 'visible' | 'hidden';
  badge: {
    text: string;
    emoji: string;
  };
  author: {
    username: string;
    avatarUrl: string;
  };
  description: string;
  isExpanded?: boolean;
}

const meta = {
  title: 'UI/TikTokVideoPlayer',
  component: TikTokVideoPlayer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A TikTok-style video player component with vertical scrolling, overlay content, and action buttons. Supports video playback, thumbnails, and interactive elements.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    videos: {
      description: 'Array of video data objects to display',
      control: { type: 'object' },
    },
    likeCount: {
      description: 'Number of likes to display',
      control: { type: 'number', min: 0 },
    },
    onLike: {
      description: 'Callback fired when like button is clicked',
      action: 'liked',
    },
    onSave: {
      description: 'Callback fired when save button is clicked',
      action: 'saved',
    },
    onAnalyze: {
      description: 'Callback fired when analyze button is clicked',
      action: 'analyzed',
    },
    onRewrite: {
      description: 'Callback fired when rewrite button is clicked',
      action: 'rewritten',
    },
    onShare: {
      description: 'Callback fired when share button is clicked',
      action: 'shared',
    },
    onPlay: {
      description: 'Callback fired when play button is clicked',
      action: 'played',
    },
    className: {
      description: 'Additional CSS classes to apply to the component',
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof TikTokVideoPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with sample data
export const Default: Story = {
  args: {
    videos: generateSampleVideoData(),
    likeCount: 11700,
    onLike: action('like-clicked'),
    onSave: action('save-clicked'),
    onAnalyze: action('analyze-clicked'),
    onRewrite: action('rewrite-clicked'),
    onShare: action('share-clicked'),
    onPlay: action('play-clicked'),
  },
};

// Story with custom video data
const customVideoData: VideoData[] = [
  {
    id: 'custom-1',
    thumbnailUrl: 'https://picsum.photos/202/365?random=1',
    visibility: 'hidden',
    badge: { emoji: '🔥', text: 'Hot Content' },
    author: {
      username: 'content_creator_pro',
      avatarUrl: 'https://picsum.photos/40/40?random=1'
    },
    description: 'Check out this amazing content that will blow your mind! #viral #trending #amazing'
  },
  {
    id: 'custom-2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://picsum.photos/202/365?random=2',
    visibility: 'visible',
    badge: { emoji: '⚡', text: 'Lightning Fast' },
    author: {
      username: 'speed_demon',
      avatarUrl: 'https://picsum.photos/40/40?random=2'
    },
    description: 'Speed is everything in this fast-paced world. Learn how to optimize your workflow and become 10x more productive. #productivity #speed #workflow #optimization'
  },
  {
    id: 'custom-3',
    thumbnailUrl: 'https://picsum.photos/202/365?random=3',
    visibility: 'hidden',
    badge: { emoji: '🎯', text: 'Targeted' },
    author: {
      username: 'marketing_guru',
      avatarUrl: 'https://picsum.photos/40/40?random=3'
    },
    description: 'Master the art of targeted marketing with these proven strategies that actually work in 2024.'
  },
];

export const CustomContent: Story = {
  args: {
    videos: customVideoData,
    likeCount: 25400,
    onLike: action('like-clicked'),
    onSave: action('save-clicked'),
    onAnalyze: action('analyze-clicked'),
    onRewrite: action('rewrite-clicked'),
    onShare: action('share-clicked'),
    onPlay: action('play-clicked'),
  },
};

// Story with minimal data (single video)
export const SingleVideo: Story = {
  args: {
    videos: [
      {
        id: 'single',
        thumbnailUrl: 'https://picsum.photos/202/365?random=single',
        visibility: 'hidden',
        badge: { emoji: '🌟', text: 'Featured' },
        author: {
          username: 'solo_creator',
          avatarUrl: 'https://picsum.photos/40/40?random=single'
        },
        description: 'Sometimes less is more. This single video showcases the power of focused content.'
      },
    ],
    likeCount: 1337,
    onLike: action('like-clicked'),
    onSave: action('save-clicked'),
    onAnalyze: action('analyze-clicked'),
    onRewrite: action('rewrite-clicked'),
    onShare: action('share-clicked'),
    onPlay: action('play-clicked'),
  },
};

// Story with high engagement numbers
export const HighEngagement: Story = {
  args: {
    videos: generateSampleVideoData(),
    likeCount: 1250000,
    onLike: action('like-clicked'),
    onSave: action('save-clicked'),
    onAnalyze: action('analyze-clicked'),
    onRewrite: action('rewrite-clicked'),
    onShare: action('share-clicked'),
    onPlay: action('play-clicked'),
  },
};

// Story without action handlers (testing optional props)
export const WithoutHandlers: Story = {
  args: {
    videos: generateSampleVideoData().slice(0, 2),
    likeCount: 542,
  },
};

// Story with custom styling
export const CustomStyling: Story = {
  args: {
    videos: generateSampleVideoData(),
    likeCount: 8900,
    className: 'border-4 border-purple-500 rounded-2xl shadow-2xl',
    onLike: action('like-clicked'),
    onSave: action('save-clicked'),
    onAnalyze: action('analyze-clicked'),
    onRewrite: action('rewrite-clicked'),
    onShare: action('share-clicked'),
    onPlay: action('play-clicked'),
  },
};

// Story demonstrating different badge types
const badgeVariationsData: VideoData[] = [
  {
    id: 'badge-1',
    thumbnailUrl: 'https://picsum.photos/202/365?random=badge1',
    visibility: 'hidden',
    badge: { emoji: '💎', text: 'Untapped Potential' },
    author: { username: 'user1', avatarUrl: 'https://picsum.photos/40/40?random=badge1' },
    description: 'Diamond badge content here'
  },
  {
    id: 'badge-2',
    thumbnailUrl: 'https://picsum.photos/202/365?random=badge2',
    visibility: 'hidden',
    badge: { emoji: '🚀', text: 'Viral Hit' },
    author: { username: 'user2', avatarUrl: 'https://picsum.photos/40/40?random=badge2' },
    description: 'Rocket badge for viral content'
  },
  {
    id: 'badge-3',
    thumbnailUrl: 'https://picsum.photos/202/365?random=badge3',
    visibility: 'hidden',
    badge: { emoji: '📈', text: 'Trending Topic' },
    author: { username: 'user3', avatarUrl: 'https://picsum.photos/40/40?random=badge3' },
    description: 'Chart badge for trending topics'
  },
  {
    id: 'badge-4',
    thumbnailUrl: 'https://picsum.photos/202/365?random=badge4',
    visibility: 'hidden',
    badge: { emoji: '🔥', text: 'Hot Content' },
    author: { username: 'user4', avatarUrl: 'https://picsum.photos/40/40?random=badge4' },
    description: 'Fire badge for hot content'
  },
];

export const BadgeVariations: Story = {
  args: {
    videos: badgeVariationsData,
    likeCount: 15600,
    onLike: action('like-clicked'),
    onSave: action('save-clicked'),
    onAnalyze: action('analyze-clicked'),
    onRewrite: action('rewrite-clicked'),
    onShare: action('share-clicked'),
    onPlay: action('play-clicked'),
  },
};

// Story for testing responsive behavior
export const ResponsiveBehavior: Story = {
  args: {
    videos: generateSampleVideoData().slice(0, 3),
    likeCount: 7890,
    onLike: action('like-clicked'),
    onSave: action('save-clicked'),
    onAnalyze: action('analyze-clicked'),
    onRewrite: action('rewrite-clicked'),
    onShare: action('share-clicked'),
    onPlay: action('play-clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Story with empty state
export const EmptyState: Story = {
  args: {
    videos: [],
    likeCount: 0,
    onLike: action('like-clicked'),
    onSave: action('save-clicked'),
    onAnalyze: action('analyze-clicked'),
    onRewrite: action('rewrite-clicked'),
    onShare: action('share-clicked'),
    onPlay: action('play-clicked'),
  },
};