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
    type: "bridge" as const,
    title: "Transition Bridge",
    content:
      "Now, you might be thinking - 'This sounds too good to be true.' I get it. I was skeptical too. But here's the thing...",
    description: "Connects the problem to the solution",
  },
  {
    id: "3",
    type: "golden-nugget" as const,
    title: "Golden Nugget",
    content:
      "Here's the secret that changed everything for me: Success isn't about working harder, it's about working smarter. This one insight alone is worth more than any course you could buy.",
    description: "The key insight or valuable takeaway",
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
    type: "main-content-script" as const,
    title: "Main Content Script",
    content:
      "In today's fast-paced world, everyone is looking for solutions that actually work. That's exactly what we're going to cover today.\n\nI'm going to show you the exact 3-step process that helped over 10,000 people achieve their goals in just 30 days.\n\nStep one is all about mindset. You need to shift from thinking about problems to thinking about solutions.\n\nStep two involves creating a clear action plan. Without a roadmap, you're just wandering in circles.\n\nStep three is the most important: consistent daily action. Small steps compound into massive results over time.",
    description: "The complete transcript separated by paragraphs",
  },
]

export default function ScriptCardDemo() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <ScriptCard scripts={sampleScripts} initialScript="hook" className="shadow-2xl" />
    </div>
  )
}
