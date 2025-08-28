import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "@/lib/gemini";

interface AnalyzeRequest {
  transcripts: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { transcripts } = body;

    if (!transcripts || !Array.isArray(transcripts) || transcripts.length < 3) {
      return NextResponse.json(
        { error: "Need at least 3 transcripts to analyze voice patterns" },
        { status: 400 }
      );
    }

    console.log(`🎙️ Analyzing voice patterns for ${transcripts.length} transcripts`);

    const prompt = `# Advanced Voice Pattern Analysis for Style Cloning

Perform a forensic-level linguistic analysis of these video scripts to extract the creator's unique voice DNA. This analysis will be used to generate NEW scripts on DIFFERENT topics that perfectly mimic the creator's style, patterns, and delivery.

CRITICAL: This is not academic analysis. Every pattern you extract must be REUSABLE as a template for generating new content. Think of yourself as reverse-engineering the creator's script-writing formula.

## Required Analysis Components:

### 1. LINGUISTIC FINGERPRINT
Analyze and extract:
- **Lexical Patterns**: Most frequently used words (excluding common words), preferred vocabulary tier, jargon/slang usage
- **Syntactic Structures**: Sentence length distribution, clause patterns, grammatical preferences
- **Discourse Markers**: How they transition between ideas (e.g., "Now", "Alright", "So", "Trust me")
- **Rhetorical Devices**: Repetition patterns, parallel structures, contrasts, metaphors

### 2. HOOK REPLICATION SYSTEM
Extract EXACT hook formulas that can be reused with new topics:
- **Hook Templates**: Replace content words with [PLACEHOLDERS] while preserving structure
  Example: "Did you know that [SURPRISING_FACT] can [UNEXPECTED_OUTCOME]?"
- **Hook Progression**: Map how they build from hook → context → promise
  Example: [HOOK] → "But here's the thing..." → [VALUE_PROMISE]
- **Hook Variations**: List ALL hook types used, ranked by effectiveness
  - Question hooks: Exact question patterns with [TOPIC] placeholders
  - Statement hooks: Bold claim templates with [METRIC] and [OUTCOME] slots
  - Story hooks: "I just [PAST_ACTION] and [SURPRISING_RESULT]" patterns
- **Hook Length**: Exact word/second count for optimal hooks
- **Emotional Triggers**: Which emotions they target and HOW (fear→solution, curiosity→reveal)

### 3. CREDENTIALING PATTERNS
How and when they establish authority:
- Self-introduction formulas
- Experience/credential dropping patterns
- Social proof insertion points and language
- Client success story structures

### 4. TRANSITIONAL ARCHITECTURE
Map how they move through content:
- Bridge phrases between concepts (exact phrases like "The next thing you need to understand")
- Topic pivot language
- Enumeration patterns ("First", "The next tip", "My last point")
- Parenthetical aside patterns

### 5. PERSUASION FRAMEWORKS
Extract their argumentation patterns:
- Problem agitation formulas
- Solution presentation structures
- Objection handling language
- Call-to-action progressions

### 6. MICRO-PATTERNS
Capture distinctive speech quirks:
- Filler phrases and verbal tics
- Emphasis patterns (what words they stress)
- Repetition for effect patterns
- Specific number usage (round vs specific numbers)
- Time reference patterns

### 7. NARRATIVE STRUCTURES
How they tell stories:
- Personal anecdote formats
- Client story templates
- Before/after frameworks
- Success metric presentations

### 8. EMOTIONAL CADENCE
Track emotional progression:
- Energy level changes throughout videos
- Motivational language clusters
- Empathy/relatability phrases
- Urgency creation patterns

### 9. CONTENT FORMULAS
Identify recurring content templates:
- List post structures
- Comparison frameworks  
- Myth-busting patterns
- How-to templates

### 10. CLOSING PATTERNS
How they end videos:
- Summary structures
- CTA language variations
- Follow/engagement requests
- Value restatement patterns

## Output Format Required:

Return a comprehensive JSON with these exact sections:

{
  "voiceProfile": {
    "distinctiveness": "1-10 score of how unique their voice is",
    "complexity": "simple|moderate|complex",
    "primaryStyle": "educator|entertainer|motivator|authority|friend"
  },
  
  "linguisticFingerprint": {
    "avgSentenceLength": number,
    "vocabularyTier": {
      "simple": percentage,
      "moderate": percentage, 
      "advanced": percentage
    },
    "topUniqueWords": ["words they use unusually often"],
    "avoidedWords": ["words they notably don't use"],
    "grammarQuirks": ["specific patterns like starting sentences with 'So'"]
  },
  
  "hookReplicationSystem": {
    "primaryHookType": "question|statement|story|problem|contrast",
    "hookTemplates": [
      {
        "template": "EXACT template with [PLACEHOLDERS] for content",
        "type": "question|statement|story|problem",
        "frequency": percentage,
        "effectiveness": "high|medium|low based on engagement patterns",
        "emotionalTrigger": "fear|curiosity|frustration|hope|surprise",
        "realExamples": ["actual examples from scripts"],
        "newExamples": ["how to use this template with new topics"]
      }
    ],
    "hookProgression": {
      "structure": "[HOOK_TYPE] → [TRANSITION_PHRASE] → [VALUE_PROMISE]",
      "avgWordCount": number,
      "timing": "seconds if applicable",
      "examples": ["real progressions from scripts"]
    },
    "hookRules": [
      "Specific rules for creating hooks in their style",
      "What they ALWAYS do",
      "What they NEVER do"
    ]
  },
  
  "openingFormulas": [
    {
      "pattern": "[Exact pattern with placeholders]",
      "frequency": number,
      "emotionalTrigger": "fear|curiosity|frustration|hope",
      "examples": ["real examples from scripts"]
    }
  ],
  
  "transitionPhrases": {
    "conceptBridges": ["exact phrases"],
    "enumeration": ["how they count points"],
    "topicPivots": ["how they change subjects"],
    "softeners": ["phrases that reduce resistance"]
  },
  
  "rhetoricalDevices": [
    {
      "device": "name of device",
      "pattern": "how they use it",
      "examples": ["specific instances"]
    }
  ],
  
  "microPatterns": {
    "fillers": ["um", "right", "you know"],
    "emphasisWords": ["really", "literally", "actually"],
    "numberPatterns": "specific|rounded|mixed",
    "timeReferences": ["how they reference time"]
  },
  
  "persuasionFramework": {
    "painPoints": ["how they articulate problems"],
    "solutions": ["how they present solutions"],
    "credibility": ["how they build trust"],
    "urgency": ["how they create FOMO"]
  },
  
  "contentTemplates": [
    {
      "type": "template name",
      "structure": "[Beginning] → [Middle] → [End]",
      "avgLength": "seconds or words",
      "examples": ["which scripts use this"]
    }
  ],
  
  "signatureMoves": [
    {
      "move": "specific technique name",
      "description": "what they do",
      "frequency": "how often",
      "placement": "where in video",
      "verbatim": ["exact quotes"]
    }
  ],
  
  "scriptGenerationRules": {
    "mustInclude": [
      "Elements that MUST appear in every script"
    ],
    "neverInclude": [
      "Things they NEVER say or do"
    ],
    "optimalStructure": {
      "hookSection": "0-10 seconds: [what happens]",
      "bodySection": "10-40 seconds: [what happens]",
      "closeSection": "40-60 seconds: [what happens]"
    },
    "formulaForNewScript": "Step-by-step formula to create a new script in their style"
  }
}

Analyze with forensic precision. Remember: The goal is to create a REUSABLE SYSTEM for generating new scripts that are indistinguishable from the creator's original content. Every pattern must be extractable and applicable to new topics.

IMPORTANT: Return ONLY the JSON object above, no markdown, no code blocks, no additional text.

Scripts to analyze (${transcripts.length} total):
${transcripts.map((t, i) => `---SCRIPT ${i + 1}---\n${t}`).join('\n\n')}`;

    const result = await GeminiService.generateContent({
      prompt,
      responseType: 'json',
      temperature: 0.3,
      maxTokens: 8192,
      model: 'gemini-1.5-flash'
    });

    if (!result.success || !result.content) {
      console.error('Voice analysis failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to analyze voice patterns' },
        { status: 500 }
      );
    }

    // Clean and parse JSON response
    let analysis;
    try {
      let cleanContent = result.content;
      
      // Remove markdown code blocks if present
      if (cleanContent.includes('```json')) {
        const jsonMatch = cleanContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          cleanContent = jsonMatch[1].trim();
        }
      } else if (cleanContent.includes('```')) {
        const codeMatch = cleanContent.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch && codeMatch[1]) {
          cleanContent = codeMatch[1].trim();
        }
      }
      
      // Find JSON object boundaries
      const startIndex = cleanContent.indexOf('{');
      const lastIndex = cleanContent.lastIndexOf('}');
      
      if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
        cleanContent = cleanContent.substring(startIndex, lastIndex + 1);
      }
      
      analysis = JSON.parse(cleanContent);
      console.log('✅ Voice analysis completed successfully');
      
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('❌ Raw content (first 1000 chars):', result.content.substring(0, 1000));
      
      return NextResponse.json(
        { 
          error: 'Failed to parse analysis results',
          details: parseError instanceof Error ? parseError.message : 'JSON parsing failed',
          rawContent: result.content.substring(0, 1000) // First 1000 chars for debugging
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Voice analysis error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to analyze voice patterns' 
      },
      { status: 500 }
    );
  }
}