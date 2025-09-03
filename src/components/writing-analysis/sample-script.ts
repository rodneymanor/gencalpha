// Sample script for demonstrating AI Actions functionality

export const SAMPLE_INTERACTIVE_SCRIPT = `**Hook:**
Are you tired of spending hours writing scripts that don't convert?

**Micro Hook:**  
Here's the secret that most content creators don't know about.

**Bridge:**
Most people think that writing viral scripts is about creativity, but the truth is it's about following proven formulas that have been tested by thousands of creators.

**Golden Nugget:**
The 3-part framework that turns boring scripts into viral content: Problem + Agitation + Solution. Start with a relatable problem your audience faces, agitate it by explaining why it's worse than they think, then provide your solution as the hero that saves the day.

**Call to Action:**
Try this framework in your next video and watch your engagement skyrocket. Drop a comment below with your results!`

export const SAMPLE_SCRIPT_SECTIONS = [
  {
    type: 'hook' as const,
    title: 'Hook',
    content: 'Are you tired of spending hours writing scripts that don\'t convert?'
  },
  {
    type: 'micro-hook' as const,
    title: 'Micro Hook',
    content: 'Here\'s the secret that most content creators don\'t know about.'
  },
  {
    type: 'bridge' as const,
    title: 'Bridge',
    content: 'Most people think that writing viral scripts is about creativity, but the truth is it\'s about following proven formulas that have been tested by thousands of creators.'
  },
  {
    type: 'nugget' as const,
    title: 'Golden Nugget',
    content: 'The 3-part framework that turns boring scripts into viral content: Problem + Agitation + Solution. Start with a relatable problem your audience faces, agitate it by explaining why it\'s worse than they think, then provide your solution as the hero that saves the day.'
  },
  {
    type: 'cta' as const,
    title: 'Call to Action',
    content: 'Try this framework in your next video and watch your engagement skyrocket. Drop a comment below with your results!'
  }
]
