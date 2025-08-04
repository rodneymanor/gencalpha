import type { Meta, StoryObj } from '@storybook/react'
import { Heart, MessageCircle, Share2, Bookmark, Eye, TrendingUp } from 'lucide-react'

import { SocialMediaAnalyticsDashboard } from './social-media-analytics-dashboard'

const meta: Meta<typeof SocialMediaAnalyticsDashboard> = {
  title: 'UI/Social Media Analytics Dashboard',
  component: SocialMediaAnalyticsDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive social media analytics dashboard displaying video analysis insights including hook ideas, content suggestions, performance metrics, captions, and transcripts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    userProfile: {
      description: 'User profile information including username, followers, publish date, and category',
      control: { type: 'object' },
    },
    hookIdeas: {
      description: 'Array of hook ideas extracted from the video',
      control: { type: 'object' },
    },
    contentIdeas: {
      description: 'Array of content ideas generated from the video',
      control: { type: 'object' },
    },
    metrics: {
      description: 'Performance metrics data with values and labels',
      control: { type: 'object' },
    },
    caption: {
      description: 'Video caption text',
      control: { type: 'text' },
    },
    transcript: {
      description: 'Video transcript content',
      control: { type: 'text' },
    },
    duration: {
      description: 'Video duration string',
      control: { type: 'text' },
    },
  },
}

export default meta
type Story = StoryObj<typeof SocialMediaAnalyticsDashboard>

// Mock data for different scenarios
const mockUserProfile = {
  username: '@creativecreator',
  followers: '125.8K',
  publishDate: 'Jan 15, 2024',
  category: 'Entertainment',
}

const mockHookIdeas = [
  { text: 'The moment I realized everything I knew about productivity was wrong...' },
  { text: 'This simple trick saved me 3 hours every day (you won\'t believe #3)' },
  { text: 'Why everyone is doing morning routines completely backwards' },
  { text: 'The $5 purchase that changed my entire workflow forever' },
  { text: 'Stop doing this one thing and watch your productivity skyrocket' },
]

const mockContentIdeas = [
  {
    title: 'Morning Routine Breakdown',
    description: 'Create a detailed walkthrough of an optimized morning routine that actually works for busy professionals.',
  },
  {
    title: 'Productivity Tools Comparison',
    description: 'Compare popular productivity apps and tools, showing real-world usage scenarios and effectiveness.',
  },
  {
    title: 'Time Management Myths',
    description: 'Debunk common time management myths and share science-backed alternatives that deliver results.',
  },
  {
    title: 'Workspace Setup Tutorial',
    description: 'Show how to create an inspiring workspace on any budget, including organization tips and equipment recommendations.',
  },
]

const mockMetrics = [
  { value: '2.4M', label: 'Views', icon: Eye },
  { value: '89.2K', label: 'Likes', icon: Heart },
  { value: '12.5K', label: 'Comments', icon: MessageCircle },
  { value: '34.1K', label: 'Shares', icon: Share2 },
  { value: '4.8%', label: 'Engagement', icon: Bookmark },
  { value: '+15.2%', label: 'Growth', icon: TrendingUp },
]

const mockCaption = `🚀 The productivity game-changer nobody talks about!

After testing 50+ productivity methods, I discovered this ONE thing that actually moves the needle. It's not another app, hack, or morning routine...

It's about changing how you think about time itself ⏰

✨ What you'll learn:
• The 3-2-1 method that eliminates decision fatigue
• Why multitasking is killing your productivity
• The "energy audit" that reveals your peak performance hours
• Simple tweaks that compound into massive results

Drop a 🔥 if you're ready to level up your productivity game!

#productivity #timemanagement #workflow #entrepreneur #lifehacks #motivation #success #business #mindset #growthmindset`

const mockTranscript = `Hey everyone! So today I want to talk about something that completely changed how I approach productivity. And I know, I know - another productivity video, right? But hear me out because this isn't about another app or another morning routine.

This is about fundamentally changing how you think about time and energy management. So about six months ago, I was struggling. I was working 12-hour days, checking off tons of tasks, but I wasn't actually moving forward on the things that mattered.

I was busy, but not productive. And that's when I discovered what I call the "energy audit." Instead of managing time, I started managing my energy. Here's how it works:

First, for one week, I tracked not just what I did, but how I felt doing it. When was I most focused? When did I feel drained? When did I feel energized?

What I discovered shocked me. My most productive hours weren't in the morning like everyone says. They were actually between 2 PM and 4 PM. And my creative work? Best done at night, around 9 PM.

So I completely restructured my day around my energy patterns instead of forcing myself into someone else's ideal schedule. The result? I cut my working hours in half while doubling my output.

The key insight is this: productivity isn't about doing more things. It's about doing the right things when you have the energy to do them well. It's about working with your natural rhythms instead of against them.

Now, this doesn't mean you can't improve your energy levels. Sleep, nutrition, exercise - all of that matters. But once you have those basics down, the real game-changer is matching your tasks to your energy state.

High-energy times? That's for your most important creative work. Medium energy? That's for meetings and collaborative tasks. Low energy? That's perfect for administrative tasks and planning.

I call this the 3-2-1 method: 3 hours of high-energy work, 2 hours of medium-energy tasks, and 1 hour of low-energy activities. And you schedule them based on when you naturally have that energy level.

Try this for just one week and I guarantee you'll see a difference. Let me know in the comments how it goes for you!`

// Story variations
export const Default: Story = {
  args: {
    userProfile: mockUserProfile,
    hookIdeas: mockHookIdeas,
    contentIdeas: mockContentIdeas,
    metrics: mockMetrics,
    caption: mockCaption,
    transcript: mockTranscript,
    duration: '02:47',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default analytics dashboard showing typical video analysis data including hook ideas, content suggestions, performance metrics, captions, and transcripts.',
      },
    },
  },
}

export const HighEngagement: Story = {
  args: {
    userProfile: {
      ...mockUserProfile,
      followers: '1.2M',
      category: 'Viral',
    },
    hookIdeas: [
      { text: 'This video has 10M views and changed everything I thought I knew...' },
      { text: 'The mistake 99% of creators make that kills their growth (I did this too)' },
      { text: 'Why this "boring" content strategy went viral overnight' },
      { text: 'The algorithm change nobody is talking about (but should be)' },
      { text: 'Stop copying viral videos and do this instead' },
    ],
    contentIdeas: mockContentIdeas,
    metrics: [
      { value: '10.2M', label: 'Views', icon: Eye },
      { value: '456K', label: 'Likes', icon: Heart },
      { value: '78.9K', label: 'Comments', icon: MessageCircle },
      { value: '234K', label: 'Shares', icon: Share2 },
      { value: '12.8%', label: 'Engagement', icon: Bookmark },
      { value: '+89.3%', label: 'Growth', icon: TrendingUp },
    ],
    caption: mockCaption,
    transcript: mockTranscript,
    duration: '03:24',
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showcasing high-engagement metrics with viral content performance indicators.',
      },
    },
  },
}

export const LowEngagement: Story = {
  args: {
    userProfile: {
      ...mockUserProfile,
      followers: '2.1K',
      category: 'Tutorial',
    },
    hookIdeas: [
      { text: 'Quick tip that might help with your daily routine' },
      { text: 'Something I learned recently about time management' },
      { text: 'A simple change that made a small difference for me' },
    ],
    contentIdeas: [
      {
        title: 'Basic Productivity Tips',
        description: 'Simple suggestions for getting started with better time management.',
      },
      {
        title: 'Daily Habit Formation',
        description: 'How to build small habits that lead to bigger changes over time.',
      },
    ],
    metrics: [
      { value: '1.2K', label: 'Views', icon: Eye },
      { value: '45', label: 'Likes', icon: Heart },
      { value: '8', label: 'Comments', icon: MessageCircle },
      { value: '12', label: 'Shares', icon: Share2 },
      { value: '2.1%', label: 'Engagement', icon: Bookmark },
      { value: '-5.2%', label: 'Growth', icon: TrendingUp },
    ],
    caption: 'Just sharing a small productivity tip that helped me today. Hope it helps someone else too! 🙂 #productivity #tips',
    transcript: 'Hey everyone, just wanted to share this quick tip about organizing your workspace. I found that having a dedicated spot for everything really helps with focus. It\'s not groundbreaking, but it worked for me. Let me know if you try it!',
    duration: '01:15',
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard displaying lower engagement metrics for smaller content creators.',
      },
    },
  },
}

export const MinimalContent: Story = {
  args: {
    userProfile: {
      ...mockUserProfile,
      followers: '432',
      category: 'Personal',
    },
    hookIdeas: [
      { text: 'Just a thought I had today...' },
      { text: 'Maybe this will help someone' },
    ],
    contentIdeas: [
      {
        title: 'Personal Reflection',
        description: 'Share more personal experiences and thoughts.',
      },
    ],
    metrics: [
      { value: '89', label: 'Views', icon: Eye },
      { value: '3', label: 'Likes', icon: Heart },
      { value: '1', label: 'Comments', icon: MessageCircle },
      { value: '0', label: 'Shares', icon: Share2 },
      { value: '4.5%', label: 'Engagement', icon: Bookmark },
      { value: '+2.1%', label: 'Growth', icon: TrendingUp },
    ],
    caption: 'Quick thought for today 💭',
    transcript: 'Just wanted to share something that crossed my mind today. Sometimes the smallest changes make the biggest difference.',
    duration: '00:45',
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard for new creators with minimal content and engagement.',
      },
    },
  },
}