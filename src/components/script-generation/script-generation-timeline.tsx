"use client";

import React, { useState, useEffect } from "react";

import { Sparkles, Brain, FileText, Wand2, CheckCircle2, Loader2 } from "lucide-react";

interface TimelineStep {
  icon: React.ReactNode;
  content: string;
  status: "pending" | "active" | "completed";
  timestamp?: string;
}

interface ScriptGenerationTimelineProps {
  isActive: boolean;
  onComplete: (script: string) => void;
  userPrompt: string;
  selectedPersona?: any;
  selectedQuickGenerator?: string | null;
}

// AI Script Generation Steps - Mimics the actual process
const getGenerationSteps = (generatorType?: string | null) => {
  if (generatorType === "generate-hooks") {
    return [
      {
        time: "Step 1",
        steps: [
          {
            icon: <Brain className="h-4 w-4" />,
            content: "Analyzing your topic and audience",
          },
        ],
      },
      {
        time: "Step 2",
        steps: [
          {
            icon: <Sparkles className="h-4 w-4" />,
            content: "Generating hook variations",
          },
          {
            icon: <Wand2 className="h-4 w-4" />,
            content: "Testing different angles",
          },
        ],
      },
      {
        time: "Final",
        steps: [
          {
            icon: <CheckCircle2 className="h-4 w-4" />,
            content: "Selecting 10 best hooks",
          },
        ],
      },
    ];
  }

  if (generatorType === "content-ideas") {
    return [
      {
        time: "Step 1",
        steps: [
          {
            icon: <Brain className="h-4 w-4" />,
            content: "Researching your topic",
          },
        ],
      },
      {
        time: "Step 2",
        steps: [
          {
            icon: <Sparkles className="h-4 w-4" />,
            content: "Brainstorming unique angles",
          },
          {
            icon: <FileText className="h-4 w-4" />,
            content: "Creating content concepts",
          },
        ],
      },
      {
        time: "Final",
        steps: [
          {
            icon: <CheckCircle2 className="h-4 w-4" />,
            content: "Organizing ideas by impact",
          },
        ],
      },
    ];
  }

  if (generatorType === "value-bombs") {
    return [
      {
        time: "Step 1",
        steps: [
          {
            icon: <Brain className="h-4 w-4" />,
            content: "Analyzing topic expertise",
          },
        ],
      },
      {
        time: "Step 2",
        steps: [
          {
            icon: <Sparkles className="h-4 w-4" />,
            content: "Extracting actionable insights",
          },
          {
            icon: <Wand2 className="h-4 w-4" />,
            content: "Crafting practical tips",
          },
        ],
      },
      {
        time: "Final",
        steps: [
          {
            icon: <CheckCircle2 className="h-4 w-4" />,
            content: "Selecting 10 highest-value tips",
          },
        ],
      },
    ];
  }

  // Default full script steps
  return [
    {
      time: "Step 1",
      steps: [
        {
          icon: <Brain className="h-4 w-4" />,
          content: "Analyzing your idea and intent",
        },
      ],
    },
    {
      time: "Step 2",
      steps: [
        {
          icon: <Sparkles className="h-4 w-4" />,
          content: "Crafting compelling hook",
        },
        {
          icon: <Wand2 className="h-4 w-4" />,
          content: "Building narrative bridge",
        },
      ],
    },
    {
      time: "Step 3",
      steps: [
        {
          icon: <FileText className="h-4 w-4" />,
          content: "Developing golden nugget content",
        },
        {
          icon: <CheckCircle2 className="h-4 w-4" />,
          content: "Creating call-to-action",
        },
      ],
    },
    {
      time: "Final",
      steps: [
        {
          icon: <CheckCircle2 className="h-4 w-4" />,
          content: "Polishing and optimizing script",
        },
      ],
    },
  ];
};

export function ScriptGenerationTimeline({
  isActive,
  onComplete,
  userPrompt,
  selectedPersona,
  selectedQuickGenerator,
}: ScriptGenerationTimelineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get the appropriate generation steps based on the generator type
  const generationSteps = getGenerationSteps(selectedQuickGenerator);

  // Generate script when timeline becomes active
  useEffect(() => {
    if (isActive && !isGenerating) {
      generateScript();
    }
  }, [isActive, isGenerating]);

  const generateScript = async () => {
    setIsGenerating(true);

    try {
      // Simulate realistic AI generation timing
      await simulateGenerationSteps();

      // Make actual API call with proper auth headers
      // Get Firebase Auth token
      const { auth } = await import("@/lib/firebase");
      if (!auth?.currentUser) {
        throw new Error("User not authenticated");
      }

      const token = await auth.currentUser.getIdToken();

      console.log("🚀 [Script Generation] Making API call with:", {
        idea: userPrompt.substring(0, 50),
        generatorType: selectedQuickGenerator,
        hasPersona: !!selectedPersona,
      });

      const response = await fetch("/api/script/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idea: userPrompt,
          length: "60",
          persona: selectedPersona,
          generatorType: selectedQuickGenerator,
        }),
      });

      console.log("🌐 [Script Generation] Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ [Script Generation] API response:", {
          success: result.success,
          hasScript: !!result.script,
          scriptType: typeof result.script,
        });

        if (result.success && result.script) {
          // Convert to our expected format
          const scriptMarkdown = formatScriptForEditor(result.script);
          console.log("📝 [Script Generation] Formatted script:", scriptMarkdown.substring(0, 100));
          onComplete(scriptMarkdown);
        } else {
          throw new Error(result.error || "Script generation failed");
        }
      } else {
        const errorText = await response.text();
        console.error("❌ [Script Generation] API error:", {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText.substring(0, 500),
        });
        throw new Error(`API error (${response.status}): ${response.statusText}`);
      }
    } catch (error) {
      console.error("Script generation error:", error);
      // Show user-friendly error message and provide fallback
      const errorMessage = error instanceof Error ? error.message : "Script generation failed";

      // Create a helpful fallback script
      const fallbackScript = createFallbackScript(userPrompt, errorMessage);
      onComplete(fallbackScript);
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateGenerationSteps = async () => {
    // Step through each major step
    for (let stepIndex = 0; stepIndex < generationSteps.length; stepIndex++) {
      setCurrentStepIndex(stepIndex);
      const step = generationSteps[stepIndex];

      // Step through substeps within each major step
      for (let subStepIndex = 0; subStepIndex < step.steps.length; subStepIndex++) {
        setCurrentSubStepIndex(subStepIndex);

        // Realistic timing based on step complexity
        const delay = getStepDelay(stepIndex, subStepIndex);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  const getStepDelay = (stepIndex: number, subStepIndex: number) => {
    // Realistic delays that match actual AI processing
    const stepDelays = [
      [1000], // Step 1: Analysis (1s)
      [1500, 1200], // Step 2: Hook and Bridge (1.5s, 1.2s)
      [2000, 1800], // Step 3: Content and CTA (2s, 1.8s)
      [800], // Final: Polish (0.8s)
    ];
    return stepDelays[stepIndex]?.[subStepIndex] || 1000;
  };

  const formatScriptForEditor = (script: any) => {
    // Check if we're generating specific content types
    if (selectedQuickGenerator === "generate-hooks") {
      // Format hooks only
      return `## 10 Hooks for Your Content

${script.hook || script.content || "Generated hooks will appear here"}

---

> **💡 Tip:** Each hook is designed to grab attention immediately. Pick the ones that resonate with your style and adapt them to your voice!`;
    }

    if (selectedQuickGenerator === "content-ideas") {
      // Format content ideas
      return `## Content Ideas

${script.hook || script.content || "Generated content ideas will appear here"}

---

> **💡 Tip:** These ideas are starting points. Expand on the ones that excite you most and make them your own!`;
    }

    if (selectedQuickGenerator === "value-bombs") {
      // Format value tips
      return `## 10 Value Tips

${script.hook || script.content || "Generated value tips will appear here"}

---

> **💡 Tip:** These are actionable tips your audience can implement immediately. Use them as standalone posts or combine them into comprehensive content!`;
    }

    // Format full script (default)
    return `**Hook:**
${script.hook}

**Bridge:**
${script.bridge}

**Golden Nugget:**
${script.goldenNugget || script.content}

**Call to Action:**
${script.wta || script.callToAction}`;
  };

  const createFallbackScript = (prompt: string, errorMessage?: string) => {
    const topicWords = prompt.split(" ").slice(0, 3).join(" ");

    return `> **⚠️ Note:** We encountered an issue generating your custom script${errorMessage ? ` (${errorMessage})` : ""}. Here's a template you can customize:

**Hook:**
Here's something you might not know about ${topicWords}.

**Bridge:**
The key is understanding that this isn't just about the obvious solution - it's about the approach that actually works.

**Golden Nugget:**
The secret is to focus on the fundamentals first. Start with the basic principles, then build complexity. This creates a solid foundation that actually delivers results, rather than trying shortcuts that ultimately fail.

**Call to Action:**
What's your experience with this approach? Let me know in the comments below!

> **💡 Tip:** You can edit any section above by clicking on it. Try using our AI actions to improve each part!`;
  };

  const getStepStatus = (stepIndex: number, subStepIndex: number) => {
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex && subStepIndex <= currentSubStepIndex) return "active";
    return "pending";
  };

  if (!isActive) return null;

  return (
    <div className="bg-background fixed inset-0 z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center space-x-3">
            <div className="relative">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-foreground text-2xl font-bold">
                {selectedQuickGenerator === "generate-hooks"
                  ? "Generating Hooks"
                  : selectedQuickGenerator === "content-ideas"
                    ? "Creating Content Ideas"
                    : selectedQuickGenerator === "value-bombs"
                      ? "Generating Value Tips"
                      : "Crafting Your Script"}
              </h2>
              <p className="text-muted-foreground">
                {selectedQuickGenerator === "generate-hooks"
                  ? "AI is creating 10 compelling hooks for your content..."
                  : selectedQuickGenerator === "content-ideas"
                    ? "AI is brainstorming content ideas for your topic..."
                    : selectedQuickGenerator === "value-bombs"
                      ? "AI is generating high-value actionable tips..."
                      : "AI is analyzing and creating your content..."}
              </p>
            </div>
          </div>
        </div>

        {/* Arc Timeline */}
        <div className="space-y-8">
          {generationSteps.map((step, stepIndex) => (
            <div key={step.time} className="relative">
              {/* Step Time Label */}
              <div className="text-muted-foreground mb-4 text-center text-sm font-semibold">{step.time}</div>

              {/* Step Content */}
              <div className="space-y-4">
                {step.steps.map((subStep, subStepIndex) => {
                  const status = getStepStatus(stepIndex, subStepIndex);

                  return (
                    <div
                      key={subStepIndex}
                      className={`flex items-center space-x-4 rounded-[var(--radius-card)] border p-4 transition-all duration-500 ${status === "active" ? "border-primary bg-primary/5 shadow-sm" : ""} ${status === "completed" ? "border-green-200 bg-green-50" : ""} ${status === "pending" ? "border-border bg-muted/30" : ""} `}
                    >
                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${status === "active" ? "bg-primary text-primary-foreground" : ""} ${status === "completed" ? "bg-green-500 text-white" : ""} ${status === "pending" ? "bg-muted text-muted-foreground" : ""} `}
                      >
                        {status === "active" ? <Loader2 className="h-4 w-4 animate-spin" /> : subStep.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium transition-colors ${status === "active" ? "text-foreground" : ""} ${status === "completed" ? "text-foreground" : ""} ${status === "pending" ? "text-muted-foreground" : ""} `}
                        >
                          {subStep.content}
                        </p>
                      </div>

                      {/* Status Indicator */}
                      {status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </div>
                  );
                })}
              </div>

              {/* Connecting Line */}
              {stepIndex < generationSteps.length - 1 && (
                <div className="mt-6 flex justify-center">
                  <div
                    className={`h-8 w-px transition-colors duration-500 ${stepIndex < currentStepIndex ? "bg-green-500" : "bg-border"} `}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <div className="text-muted-foreground text-xs">
            Step {Math.min(currentStepIndex + 1, generationSteps.length)} of {generationSteps.length}
          </div>
        </div>
      </div>
    </div>
  );
}
