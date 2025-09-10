"use client"

import { ScriptCard } from "@/components/magicui/script-card"

const sampleScripts = [
  {
    id: "1",
    type: "hook" as const,
    title: "Attention Grabber",
    content:
      "Did you know that 90% of people scroll past content in the first 3 seconds? Here's how to stop them in their tracks...",
    description: "The opening hook that captures immediate attention",
  },
  {
    id: "2",
    type: "script" as const,
    title: "Main Content Script",
    content:
      "In today's fast-paced world, everyone is looking for solutions that actually work. That's exactly what we're going to cover today. I'm going to show you the exact 3-step process that helped over 10,000 people achieve their goals in just 30 days.",
    description: "The core message and value proposition",
  },
  {
    id: "3",
    type: "bridge" as const,
    title: "Transition Bridge",
    content:
      "Now, you might be thinking - 'This sounds too good to be true.' I get it. I was skeptical too. But here's the thing...",
    description: "Connects the problem to the solution",
  },
  {
    id: "4",
    type: "wta" as const,
    title: "What To Action",
    content:
      "Ready to get started? Click the link in my bio to access the free guide that breaks down each step. Don't wait - this offer expires in 48 hours!",
    description: "Clear call-to-action for next steps",
  },
  {
    id: "5",
    type: "short-form-video" as const,
    title: "Video Script",
    content:
      "[Scene 1: Close-up shot]\n'Stop scrolling if you want to change your life'\n\n[Scene 2: Wide shot]\n'Here's what nobody tells you about success...'\n\n[Scene 3: Product demo]\n'This simple tool changed everything'",
    description: "Short-form video content with scene directions",
  },
]

export const ClientTweetCard = ({ id, className }: { id?: string; className?: string }) => {
  return <ScriptCard scripts={sampleScripts} initialScript="hook" className={className} />
}
