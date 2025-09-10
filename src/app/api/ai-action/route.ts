import { NextRequest, NextResponse } from "next/server";

import { generateContent } from "@/lib/services/gemini-service";

export async function POST(request: NextRequest) {
  try {
    const { text, actionType, option, customPrompt } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!actionType && !customPrompt) {
      return NextResponse.json({ error: "Action type or custom prompt is required" }, { status: 400 });
    }

    let prompt = "";

    // Handle custom prompts
    if (actionType === "custom_prompt" && customPrompt) {
      prompt = `Please apply the following instruction to this text: "${customPrompt}"

Text to modify:
${text}

Please provide only the modified text in your response, no explanations or commentary.`;
    } else {
      // Handle predefined actions
      switch (actionType) {
        case "expand":
          prompt = `Expand and enrich this text while preserving its structure and voice. Add specific supporting details or examples where helpful. Keep it concise enough for short-form content; do not ramble.

Current text:
${text}

Provide ONLY the expanded text, no commentary.`;
          break;

        case "check_grammar":
        case "check-grammar":
          prompt = `Fix grammar, spelling, and punctuation in this text. Preserve original meaning and tone. Improve clarity where needed.

Current text:
${text}

Provide ONLY the corrected text, no commentary.`;
          break;

        case "translate":
          {
            const language = (option as string) || "Spanish";
            prompt = `Translate the following text to ${language}. Keep a natural, conversational style appropriate for spoken short-form video. Preserve formatting cues like headings or numbering.

Text:
${text}

Provide ONLY the translation, no commentary.`;
          }
          break;

        case "generate_ideas":
        case "generate-ideas":
          prompt = `Generate 10 concise content ideas based on the topic and context of the following text. Each idea should be punchy, specific, and suitable for short-form video. Number each idea 1-10.

Source text:
${text}

Provide ONLY the 10 numbered ideas, no commentary.`;
          break;
        case "change_tone":
          const toneInstructions = {
            professional:
              "Transform this text to have a professional, formal business tone. Make it sound authoritative and polished while maintaining clarity.",
            casual:
              "Transform this text to have a casual, relaxed tone. Make it sound conversational and informal, like talking to a friend.",
            friendly: "Transform this text to have a warm, approachable tone. Make it sound welcoming and personable.",
            confident:
              "Transform this text to have a confident, assertive tone. Make it sound self-assured and decisive.",
            persuasive:
              "Transform this text to have a compelling, convincing tone. Make it more persuasive and motivating.",
          };
          prompt = `${toneInstructions[option as keyof typeof toneInstructions] || toneInstructions.professional}

Text to transform:
${text}

Please provide only the transformed text in your response, no explanations or commentary.`;
          break;

        case "change_hook_style":
          const hookStyles = {
            question:
              "Rewrite this hook as an engaging question that captures attention and makes viewers want to know the answer.",
            statistic:
              "Rewrite this hook to lead with a compelling statistic or data point that surprises and engages viewers.",
            story:
              "Rewrite this hook to start with a brief, relatable personal story or narrative that draws viewers in.",
            provocative:
              "Rewrite this hook as a bold, controversial statement that challenges common beliefs and grabs attention.",
            direct:
              "Rewrite this hook as a clear, direct statement that gets straight to the point without fluff or buildup.",
            contrarian:
              "Rewrite this hook to challenge common beliefs or conventional wisdom in your niche, making viewers question what they think they know.",
          };
          prompt = `${hookStyles[option as keyof typeof hookStyles] || hookStyles.question}

Current hook:
${text}

Please provide only the rewritten hook in your response, no explanations or commentary.`;
          break;

        case "change_bridge_style":
          const bridgeStyles = {
            smooth: "Rewrite this bridge to create a smooth, gentle logical flow between ideas.",
            contrast: "Rewrite this bridge to highlight differences or contrasts between concepts.",
            problem_solution: "Rewrite this bridge to present a problem and then lead to its resolution.",
          };
          prompt = `${bridgeStyles[option as keyof typeof bridgeStyles] || bridgeStyles.smooth}

Current bridge:
${text}

Please provide only the rewritten bridge in your response, no explanations or commentary.`;
          break;

        case "change_cta_style":
          const ctaStyles = {
            urgent: "Rewrite this call-to-action to create a sense of urgency and immediate action.",
            soft_ask: "Rewrite this call-to-action as a gentle invitation that doesn't feel pushy.",
            direct_command:
              "Rewrite this call-to-action as a clear, direct directive that tells viewers exactly what to do.",
            benefit_focused: "Rewrite this call-to-action to emphasize the benefits and value the user will receive.",
          };
          prompt = `${ctaStyles[option as keyof typeof ctaStyles] || ctaStyles.direct_command}

Current call-to-action:
${text}

Please provide only the rewritten call-to-action in your response, no explanations or commentary.`;
          break;

        case "enhance_value":
          prompt = `Enhance this golden nugget to make it more valuable and impactful. Strengthen the core message and make it more compelling for the audience.

Current text:
${text}

Please provide only the enhanced text in your response, no explanations or commentary.`;
          break;

        case "add_evidence":
          prompt = `Add supporting evidence, data, or examples to this golden nugget to make it more credible and compelling. Include statistics, research findings, or concrete examples where appropriate.

Current text:
${text}

Please provide only the enhanced text with evidence in your response, no explanations or commentary.`;
          break;

        case "simplify":
          prompt = `Simplify this text to make it easier to understand. Use simpler words, shorter sentences, and clearer language while maintaining the core message.

Current text:
${text}

Please provide only the simplified text in your response, no explanations or commentary.`;
          break;

        case "generate_variations":
          prompt = `Generate 10 different variations of this text. Each variation should maintain the core message but use different wording, structure, or approach. Number each variation.

Current text:
${text}

Please provide only the 10 numbered variations in your response, no explanations or commentary.`;
          break;

        case "convert_hook_type":
          const hookTypes = {
            problem: "Convert this to a problem hook that identifies a pain point or challenge the audience faces.",
            benefit: "Convert this to a benefit hook that promises a reward or positive outcome.",
            curiosity: "Convert this to a curiosity hook that creates intrigue and makes viewers want to know more.",
            question: "Convert this to a question hook that engages viewers by asking something relevant.",
            story: "Convert this to a story hook that starts with a brief narrative or anecdote.",
          };
          prompt = `${hookTypes[option as keyof typeof hookTypes] || hookTypes.problem}

Current hook:
${text}

Please provide only the converted hook in your response, no explanations or commentary.`;
          break;

        case "strengthen_connection":
          prompt = `Strengthen the connection in this bridge text to better link the previous section to what comes next. Make the transition smoother and more logical.

Current bridge:
${text}

Please provide only the improved bridge text in your response, no explanations or commentary.`;
          break;

        default:
          return NextResponse.json({ error: "Unknown action type" }, { status: 400 });
      }
    }

    const response = await generateContent({
      prompt,
      model: "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 1000,
    });

    if (!response.success || !response.content) {
      return NextResponse.json({ error: response.error || "Failed to process AI action" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      modifiedText: response.content.trim(),
      tokensUsed: response.tokensUsed,
      responseTime: response.responseTime,
    });
  } catch (error) {
    console.error("AI Action API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
