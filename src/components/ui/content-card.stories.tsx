import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { ContentCard } from './content-card';

const meta = {
  title: 'UI/ContentCard',
  component: ContentCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A content card component that displays information with a badge, rating, and action buttons. Fully integrated with the theme system.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The main title of the content card',
    },
    description: {
      control: 'text',
      description: 'A brief description displayed below the title',
    },
    badge: {
      control: 'object',
      description: 'Badge configuration with label and variant',
    },
    rating: {
      control: 'object',
      description: 'Rating configuration with value and icon visibility',
    },
    onShare: {
      action: 'shared',
      description: 'Callback function triggered when share button is clicked',
    },
    onBookmark: {
      action: 'bookmarked',
      description: 'Callback function triggered when bookmark button is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the card',
    },
  },
  args: {
    onShare: fn(),
    onBookmark: fn(),
  },
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Amazing Content Title',
    description: 'This is a detailed description of the content that provides context and additional information to users.',
    badge: {
      label: 'Premium',
      variant: 'secondary',
    },
    rating: {
      value: '4.8',
      showIcon: true,
    },
  },
};

export const WithPrimaryBadge: Story = {
  args: {
    title: 'Featured Article',
    description: 'A high-quality article that deserves special attention from our readers.',
    badge: {
      label: 'Featured',
      variant: 'default',
    },
    rating: {
      value: '5.0',
      showIcon: true,
    },
  },
};

export const WithOutlineBadge: Story = {
  args: {
    title: 'Draft Content',
    description: 'Content that is currently in draft mode and under review.',
    badge: {
      label: 'Draft',
      variant: 'outline',
    },
    rating: {
      value: '3.5',
      showIcon: true,
    },
  },
};

export const WithoutRatingIcon: Story = {
  args: {
    title: 'Text-Only Rating',
    description: 'Sometimes you might want to show just the rating value without the star icon.',
    badge: {
      label: 'Review',
      variant: 'secondary',
    },
    rating: {
      value: '4.2',
      showIcon: false,
    },
  },
};

export const LongContent: Story = {
  args: {
    title: 'This is a Much Longer Title That Demonstrates How the Component Handles Extended Text Content',
    description: 'This is an extended description that shows how the content card component handles longer text content. It should wrap appropriately and maintain proper spacing and readability even with more text than usual.',
    badge: {
      label: 'Long Content',
      variant: 'secondary',
    },
    rating: {
      value: '4.6',
      showIcon: true,
    },
  },
};

export const HighRating: Story = {
  args: {
    title: 'Excellent Content',
    description: 'This content has received exceptional ratings from users.',
    badge: {
      label: 'Top Rated',
      variant: 'default',
    },
    rating: {
      value: '5.0',
      showIcon: true,
    },
  },
};

export const CustomStyling: Story = {
  args: {
    title: 'Custom Styled Card',
    description: 'This card demonstrates custom styling capabilities.',
    badge: {
      label: 'Custom',
      variant: 'outline',
    },
    rating: {
      value: '4.4',
      showIcon: true,
    },
    className: 'max-w-md border-2 border-primary/20',
  },
};

export const Interactive: Story = {
  args: {
    title: 'Interactive Content Card',
    description: 'Try clicking the share and bookmark buttons to see the interactions.',
    badge: {
      label: 'Interactive',
      variant: 'default',
    },
    rating: {
      value: '4.9',
      showIcon: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the interactive features of the ContentCard component. Click the share and bookmark buttons to trigger the callback functions.',
      },
    },
  },
};