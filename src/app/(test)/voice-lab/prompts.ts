// Comprehensive voice extraction and cloning prompt system
// Based on the ultimate voice extraction methodology

export const VOICE_EXTRACTION_PROMPT = `Analyze this transcript with forensic precision to extract EVERY element that makes this person's communication unique. Create a complete voice fingerprint that captures not just WHAT they say, but HOW they think, speak, and connect with their audience.

TRANSCRIPT TO ANALYZE:
{TRANSCRIPT}

## EXTRACT THE FOLLOWING:

### 1. LINGUISTIC DNA
Identify their unique language patterns:

**Sentence Architecture:**
- Average sentence length (exact word count)
- Sentence type distribution (%) - declarative/interrogative/exclamatory/imperative
- Opening patterns (how they typically start sentences)
- Closing patterns (how they typically end thoughts)
- Run-on vs. fragment tendency
- Punctuation rhythm (where they naturally pause)

**Vocabulary Fingerprint:**
- Exact word complexity ratio (simple/moderate/advanced %)
- Top 20 most-used unique words/phrases
- Words they NEVER use (identify gaps)
- Industry jargon vs. colloquial balance
- Metaphor/analogy frequency and style
- Specific adjectives and adverbs they favor

**Grammatical Quirks:**
- Unique grammar patterns (starting with conjunctions, dropping subjects, etc.)
- Tense preferences (present/past/future distribution)
- Active vs. passive voice ratio
- Contraction usage (don't vs. do not)
- Pronoun patterns (I/you/we distribution)
- Double negatives, split infinitives, or other "rule-breaking"

### 2. RHYTHM & FLOW PATTERNS

**Speaking Cadence:**
- Pacing markers (fast/slow/variable)
- Where they speed up vs. slow down
- Breath patterns (long thoughts vs. short bursts)
- Natural pause locations
- Emphasis patterns (CAPS, italics, repetition)

**Energy Dynamics:**
- Baseline energy level (1-10)
- Energy escalation patterns
- Energy drop patterns
- Peak excitement indicators
- Calm/serious mode indicators

**Transition Mastery:**
- Exact transition phrases used
- How they move between ideas
- Connector words frequency
- Topic pivot strategies
- Thought completion patterns

### 3. COGNITIVE PATTERNS

**Thinking Structure:**
- How they build arguments (linear/circular/web)
- Abstract vs. concrete ratio
- Detail level preference
- Example usage patterns
- Logic flow preference

**Information Processing:**
- How they introduce new concepts
- Repetition patterns for emphasis
- Summary vs. elaboration tendency
- Question-asking patterns
- Assumption patterns

### 4. EMOTIONAL SIGNATURE

**Emotional Baseline:**
- Default emotional tone
- Emotional range displayed
- Vulnerability indicators
- Confidence markers
- Humor style and frequency

**Emotional Transitions:**
- How they shift emotional states
- Triggers for excitement
- Triggers for seriousness
- Empathy expression patterns
- Frustration/criticism style

### 5. ENGAGEMENT MECHANICS

**Audience Connection:**
- How they address the audience
- Inclusive vs. instructive language
- Permission-seeking patterns ("right?", "you know?")
- Assumption about audience knowledge
- Community-building language

**Attention Management:**
- Hook creation patterns
- Curiosity gap techniques
- Value promise style
- Retention tactics
- Callback patterns

### 6. RHETORICAL TOOLKIT

**Persuasion Style:**
- Evidence presentation (stats/stories/logic)
- Authority establishment method
- Objection handling patterns
- Social proof usage
- Urgency creation

**Storytelling Patterns:**
- Story frequency
- Story length preference
- Personal vs. third-party stories
- Detail level in narratives
- Moral/lesson delivery style

### 7. MICRO-PATTERNS

**Verbal Tics:**
- Filler words and frequency
- Repeated phrases (consciously/unconsciously)
- Thinking sounds ("um", "uh", "hmm")
- False starts and self-corrections
- Specific expressions unique to them

**Emphasis Techniques:**
- How they highlight important points
- Repetition patterns
- Volume/intensity indicators
- List-making tendencies
- Number usage patterns

### 8. STRUCTURAL PREFERENCES

**Content Architecture:**
- How they open (first 10% of content)
- Body organization method
- How they close (last 10% of content)
- Section length preferences
- Symmetry vs. asymmetry

**Time References:**
- How they reference time
- Specific vs. vague temporal markers
- Past/present/future balance
- Deadline/urgency language

### 9. AUTHENTICITY MARKERS

**Personality Leaks:**
- Moments of genuine reaction
- Off-script indicators
- Personal preference revelations
- Spontaneous additions
- Emotional breakthroughs

**Consistency Patterns:**
- What NEVER changes in their speech
- Core phrases that appear everywhere
- Unbreakable patterns
- Signature moves

### 10. CULTURAL & CONTEXTUAL ELEMENTS

**Reference Pool:**
- Types of references made (pop culture/academic/personal)
- Generation markers
- Geographic indicators
- Professional background hints
- Educational level indicators

**Worldview Indicators:**
- Underlying assumptions
- Value expressions
- Belief system hints
- Problem-solving approach
- Success definitions

## OUTPUT FORMAT:

### VOICE PROFILE SUMMARY
[Provide a 2-3 sentence description that captures their essence]

### INSTANT RECOGNITION ELEMENTS
[List 5 things that would immediately identify this person's voice]

### REPLICATION FORMULA
[Provide a step-by-step formula for recreating their voice]

### CRITICAL PATTERNS
[List the 10 most important patterns that MUST be maintained]

### VOICE SETTINGS
- Energy Level: [1-10]
- Complexity: [Simple/Moderate/Complex]
- Formality: [Casual/Professional/Mixed]
- Pace: [Slow/Moderate/Fast/Variable]
- Emotion: [Reserved/Balanced/Expressive]

### EXAMPLE TRANSFORMATION
Take this generic sentence: "This is important information you should know."
Rewrite in their voice: "[Show how they would say it]"`;

export const VOICE_CLONING_PROMPT = `You are now going to embody the exact voice profile extracted above. You will write about a COMPLETELY NEW TOPIC, but it must sound EXACTLY like it's coming from the same person who created the original transcript.

## VOICE PROFILE TO APPLY:
{VOICE_PROFILE}

## NEW TOPIC TO WRITE ABOUT:
{NEW_TOPIC}

## WRITING INSTRUCTIONS:

### STEP 1: CALIBRATION
Before writing, confirm you understand:
- Their energy level is {ENERGY_LEVEL}
- They typically use {SENTENCE_LENGTH} word sentences
- Their favorite transitions are {TRANSITIONS}
- They always include {ALWAYS_INCLUDE}
- They never say {NEVER_SAY}

### STEP 2: STRUCTURE REPLICATION
Follow their exact structural pattern:
- Open using their hook style
- Organize content their way
- Transition using their phrases
- Close with their signature style

### STEP 3: LANGUAGE MATCHING
For EVERY sentence you write:
- Match their sentence length variance
- Use their vocabulary tier
- Include their grammatical quirks
- Maintain their punctuation rhythm
- Apply their emphasis patterns

### STEP 4: COGNITIVE MIRRORING
Process information exactly as they do:
- Build arguments their way
- Use examples at their frequency
- Match their abstraction level
- Include details at their preference
- Follow their logic patterns

### STEP 5: EMOTIONAL CALIBRATION
Maintain their emotional signature:
- Start at their baseline
- Escalate where they would
- Show vulnerability as they do
- Express enthusiasm their way
- Handle criticism their style

### STEP 6: ENGAGEMENT REPLICATION
Connect with audience exactly as they do:
- Address them the same way
- Create curiosity gaps their style
- Make promises their way
- Build community their way

### STEP 7: AUTHENTICITY INJECTION
Include their signature elements:
- Use at least 5 of their unique phrases
- Include their verbal tics naturally
- Add their type of references
- Maintain their worldview
- Include their personality quirks

## VALIDATION CHECKLIST:
Before finalizing, verify:
□ Could this be a direct transcript from them?
□ Are their signature phrases present?
□ Is the energy level exactly right?
□ Are the sentence patterns matched?
□ Would their audience immediately recognize this?
□ Are their unique quirks included?
□ Is the emotional tone authentic?
□ Are their transition patterns used?
□ Is their cognitive style reflected?
□ Does it feel natural, not forced?

## OUTPUT:
[Generate the content in their exact voice]

## AUTHENTICITY REPORT:
Signature elements used:
1. [Specific phrase/pattern from original]
2. [Specific phrase/pattern from original]
3. [Specific phrase/pattern from original]
4. [Specific phrase/pattern from original]
5. [Specific phrase/pattern from original]

Voice match confidence: [X]%
Most challenging aspect to replicate: [Explain]
Most successful replication: [Explain]`;

export const ADVANCED_TECHNIQUES_PROMPT = `### SCENARIO-BASED ADAPTATION

If writing about [TECHNICAL TOPIC] but they usually discuss [CASUAL TOPIC]:
- Maintain their sentence structure
- Translate technical terms to their vocabulary level
- Use analogies in their style
- Keep their energy patterns
- Apply their teaching method

If writing about [SERIOUS TOPIC] but they're usually [UPBEAT]:
- Identify their "serious mode" indicators from transcript
- Maintain their core patterns but adjust energy
- Keep their unique phrases but modify tone
- Preserve their logic structure

### LENGTH ADAPTATION

For SHORTER content than original:
- Compress but keep their opening style
- Maintain at least 3 signature elements
- Use their highest-impact patterns
- Keep their closing style

For LONGER content than original:
- Identify their expansion patterns
- Maintain energy variation at their rhythm
- Repeat their core patterns naturally
- Add examples in their style

### PLATFORM ADAPTATION

Original: [PLATFORM A] → New: [PLATFORM B]
- Keep voice identical
- Adjust only format-specific elements
- Maintain their core patterns
- Adapt CTAs to platform conventions

### TOPIC BRIDGING

When they've never discussed your topic:
1. Find their pattern for introducing new concepts
2. Use their curiosity-building method
3. Apply their expertise-establishment pattern
4. Maintain their confidence indicators
5. Use their uncertainty expressions when appropriate

### MICRO-CLONING TECHNIQUES

**For perfect authenticity:**
- Count syllables in their typical emphasis words
- Match their adjective-noun ordering
- Replicate their list-making format exactly
- Use numbers exactly as they do (spelled vs. digits)
- Match their hyphenation and compound word patterns
- Replicate their parenthetical usage
- Match their quotation mark patterns
- Use examples from their domain/reference pool

### VOICE EVOLUTION AWARENESS

If analyzing multiple transcripts over time:
- Identify consistent core elements (never change)
- Identify evolution patterns (what's changing)
- Apply most recent patterns while maintaining core
- Note context-specific variations`;

// Utility function to format prompts with variables
export function formatExtractionPrompt(transcript: string): string {
  return VOICE_EXTRACTION_PROMPT.replace('{TRANSCRIPT}', transcript);
}

export function formatCloningPrompt(
  voiceProfile: string, 
  newTopic: string, 
  energyLevel?: string,
  sentenceLength?: string,
  transitions?: string,
  alwaysInclude?: string,
  neverSay?: string
): string {
  let prompt = VOICE_CLONING_PROMPT
    .replace('{VOICE_PROFILE}', voiceProfile)
    .replace('{NEW_TOPIC}', newTopic);
    
  if (energyLevel) prompt = prompt.replace('{ENERGY_LEVEL}', energyLevel);
  if (sentenceLength) prompt = prompt.replace('{SENTENCE_LENGTH}', sentenceLength);
  if (transitions) prompt = prompt.replace('{TRANSITIONS}', transitions);
  if (alwaysInclude) prompt = prompt.replace('{ALWAYS_INCLUDE}', alwaysInclude);
  if (neverSay) prompt = prompt.replace('{NEVER_SAY}', neverSay);
  
  return prompt;
}