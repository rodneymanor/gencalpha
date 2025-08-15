import { NextRequest, NextResponse } from "next/server";

import { GeminiService } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  console.log("🎯 [STYLOMETRIC_ANALYSIS] Starting advanced stylometric analysis");

  try {
    // Parse and validate request body
    const { transcript, sourceUrl, platform } = await request.json();

    if (!transcript || typeof transcript !== "string") {
      console.error("❌ [STYLOMETRIC_ANALYSIS] Invalid transcript provided");
      return NextResponse.json({ error: "Valid transcript is required" }, { status: 400 });
    }

    console.log(`📝 [STYLOMETRIC_ANALYSIS] Processing transcript (${transcript.length} chars) from ${platform}`);

    // Advanced AI Script Analyzer & Style Replicator - Enhanced Edition
    const stylometricPrompt = `# Advanced AI Script Analyzer & Style Replicator - Enhanced Edition

## Role Definition
You are a world-class linguistic pattern recognition expert specializing in extracting and replicating authentic speaking styles. Your superpower is identifying the exact verbal DNA that makes each speaker unique, then providing practical, plug-and-play language templates.

## Core Objective
Transform any script/transcript into a practical style guide with ready-to-use sentence templates, signature phrases, and language patterns that enable immediate and authentic voice replication.

## 🔍 DEEP ANALYSIS PROTOCOL

### Stage 1: Signature Language Extraction
When analyzing a script, extract these specific, reusable elements:

#### **Sentence Starters Collection**
Identify the top 10 most frequently used opening patterns:
- How they begin statements
- How they introduce new ideas  
- How they transition between topics
- How they grab attention

#### **Power Phrases Bank**
Extract 15-20 exact phrases they repeatedly use for:
- Emphasizing points ("Here's the thing...")
- Transitioning ideas ("Now, what's interesting is...")
- Building agreement ("You know what I mean?")
- Creating urgency ("Listen, this is crucial...")
- Expressing opinions ("I genuinely believe...")

#### **Sentence Architecture Templates**
Map their 5 core sentence structures with fill-in-the-blank format:
- Simple: [Subject] + [verb] + [object]
- Complex: [Setup clause], [main point], [qualifier]
- Question patterns: [Question word] + [specific construction]
- List structures: How they enumerate points
- Story structures: How they set up anecdotes

#### **Verbal Fingerprints**
Document unique language markers:
- Favorite adjectives/adverbs (top 10)
- Go-to metaphors and analogies
- Filler words and thinking sounds ("um," "like," "you know")
- Emphasis techniques (repetition, volume indicators, CAPS)
- Punctuation habits (... vs — vs !)

### Stage 2: Conversational DNA Mapping

#### **Rhythm Patterns**
- Short burst combinations: [short] + [short] + [long]
- Build-up patterns: [medium] → [longer] → [longest] → [punch]
- Breathing points: Where they naturally pause

#### **Emotional Escalation Markers**
Track how they build intensity:
- Calm → Engaged → Passionate → Peak
- Specific words/phrases used at each level

#### **Credibility Builders**
How they establish authority:
- Data references ("Studies show...")
- Personal experience markers ("In my experience...")
- Certainty language ("Without a doubt...")

## 📋 OUTPUT FORMAT - USER-FRIENDLY STYLE GUIDE

### **🎯 QUICK-START STYLE SNAPSHOT**
\`\`\`markdown
SPEAKER PROFILE: [Name/Source]
OVERALL VIBE: [One sentence capturing their essence]
ENERGY LEVEL: [🔥🔥🔥 High | 🔥🔥 Medium | 🔥 Low]
FORMALITY: [👔 Professional | 👕 Smart Casual | 👟 Casual]
\`\`\`

### **🗣️ INSTANT VOICE REPLICATOR KIT**

#### **Copy-Paste Sentence Starters** (Use these exactly)
1. "[Exact opening phrase]..."
2. "[Exact opening phrase]..."
3. "[Exact opening phrase]..."
(List 7-10 most characteristic)

#### **Plug & Play Power Phrases** (Drop these in anywhere)
**For Emphasis:**
- "[Exact phrase]"
- "[Exact phrase]"

**For Transitions:**
- "[Exact phrase]"
- "[Exact phrase]"

**For Conclusions:**
- "[Exact phrase]"
- "[Exact phrase]"

#### **Fill-in-the-Blank Sentence Templates**
1. "Look, [your point], and that's why [your conclusion]."
2. "The thing about [topic] is that [observation], right?"
3. "I mean, when you really think about [topic], [insight]."
(Provide 5-8 templates)

### **🎨 STYLE INGREDIENTS**

#### **Vocabulary Spice Rack** (Their favorite words)
- **High-frequency words:** [word], [word], [word]
- **Signature adjectives:** [word], [word], [word]
- **Go-to verbs:** [word], [word], [word]

#### **Rhythm Recipe**
\`\`\`
Pattern A: [Short sentence]. [Short sentence]. [Then hit them with a longer thought that really drives the point home].

Pattern B: [Medium setup], [medium continuation], [short punch].
\`\`\`

#### **Authenticity Markers** (Small details that matter)
- Uses "[specific filler]" when thinking
- Often says "[exact phrase]" when excited
- Tends to [specific habit] when making important points

### **🚀 QUICK GENERATION GUIDE**

#### **30-Second Voice Match Formula**
1. Start with one of their signature openers
2. Use their rhythm pattern (shown above)
3. Drop in 2-3 power phrases
4. Include their favorite transition
5. End with their typical closer

#### **Example Output Structure**
\`\`\`
[Signature opener]. [Short supporting sentence]. [Short supporting sentence]. [Longer explanatory sentence with their typical construction]. [Transition phrase], [main point using their template]. [Their style of conclusion].
\`\`\`

### **⚡ INSTANT PRACTICE EXAMPLES**

#### **Original Speaker Example:**
"[Exact quote from transcript showing their style]"

#### **New Topic Using Their Voice:**
"[Generated example on different topic using all their patterns]"

## 🎯 GENERATION INSTRUCTIONS

When creating new content:

1. **Start Strong**: Always use one of their extracted sentence starters
2. **Maintain Rhythm**: Follow their sentence length patterns exactly
3. **Pepper in Signatures**: Use at least 3 power phrases per paragraph
4. **Keep Their Quirks**: Include their filler words and speech patterns
5. **Match Energy**: Maintain their excitement/calm level throughout

## ✅ AUTHENTICITY CHECKLIST

Before delivering generated content, verify:
- [ ] Uses at least 5 of their signature phrases
- [ ] Follows their rhythm patterns
- [ ] Includes their verbal quirks
- [ ] Matches their energy level
- [ ] Sounds natural when read aloud
- [ ] Could fool someone familiar with the speaker

## 💡 PRO TIPS FOR USERS

**Quick Voice Match:**
- Copy 3 sentence starters + 2 power phrases + 1 template = Instant voice match

**For Longer Content:**
- Rotate through different templates to avoid repetition
- Use their transition phrases every 2-3 paragraphs
- End sections with their signature closers

**Make It Natural:**
- Don't overuse any single phrase
- Vary between different rhythm patterns
- Include their "thinking" words for authenticity

---

*This style guide extracts the exact language DNA needed to replicate any speaking style. Simply plug in the templates, phrases, and patterns to sound exactly like your target speaker.*

Now analyze this transcript:

${transcript}

Source: ${sourceUrl}
Platform: ${platform}`;

    // Initialize Gemini service
    const geminiService = new GeminiService();

    console.log("🤖 [STYLOMETRIC_ANALYSIS] Sending to Gemini for analysis");

    // Generate comprehensive stylometric analysis
    const response = await geminiService.generateContent({
      prompt: stylometricPrompt,
      systemPrompt:
        "You are an expert linguistic forensics AI specializing in deep stylometric analysis and voice replication. Provide comprehensive, actionable analysis that enables authentic voice replication.",
      maxTokens: 2000,
      temperature: 0.3, // Lower temperature for more analytical consistency
      model: "gemini-1.5-flash",
    });

    if (!response.success || !response.content) {
      console.error("❌ [STYLOMETRIC_ANALYSIS] Gemini analysis failed:", response.error);
      return NextResponse.json({ error: response.error || "Stylometric analysis failed" }, { status: 500 });
    }

    console.log("✅ [STYLOMETRIC_ANALYSIS] Analysis completed successfully");

    return NextResponse.json({
      success: true,
      analysis: response.content,
      tokensUsed: response.tokensUsed,
      responseTime: response.responseTime,
      metadata: {
        sourceUrl,
        platform,
        transcriptLength: transcript.length,
        analysisTimestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ [STYLOMETRIC_ANALYSIS] Unexpected error:", error);

    const errorMessage = error instanceof Error ? error.message : "Stylometric analysis service failed";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
