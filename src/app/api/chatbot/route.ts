import { NextRequest, NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { enhancePromptWithPersona } from "@/lib/persona-integration";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface VoiceAnalysis {
  voiceProfile: {
    distinctiveness: string;
    complexity: string;
    primaryStyle: string;
  };
  hookReplicationSystem?: {
    primaryHookType: string;
    hookTemplates: Array<{
      template: string;
      type: string;
      frequency: number;
      effectiveness: string;
      emotionalTrigger: string;
      realExamples: string[];
      newExamples: string[];
    }>;
    hookProgression: {
      structure: string;
      avgWordCount: number;
      timing: string;
      examples: string[];
    };
    hookRules: string[];
  };
  linguisticFingerprint: {
    avgSentenceLength: number;
    vocabularyTier: {
      simple: number;
      moderate: number;
      advanced: number;
    };
    topUniqueWords: string[];
    avoidedWords: string[];
    grammarQuirks: string[];
  };
  transitionPhrases: {
    conceptBridges: string[];
    enumeration: string[];
    topicPivots: string[];
    softeners: string[];
  };
  microPatterns: {
    fillers: string[];
    emphasisWords: string[];
    numberPatterns: string;
    timeReferences: string[];
  };
  scriptGenerationRules?: {
    mustInclude: string[];
    neverInclude: string[];
    optimalStructure: {
      hookSection: string;
      bodySection: string;
      closeSection: string;
    };
    formulaForNewScript: string;
  };
  signatureMoves: Array<{
    move: string;
    description: string;
    frequency: string;
    placement: string;
    verbatim: string[];
  }>;
}

interface ChatRequest {
  message: string;
  assistant: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  persona?: VoiceAnalysis;
}

// Legacy chatbot route - now simplified since assistant system was removed
const DEFAULT_PROMPT = "You are a helpful AI assistant that provides concise, valuable responses while maintaining a warm and professional tone.";

export async function POST(request: NextRequest) {
  console.log("🚀 [Chatbot API] Request received");

  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    console.log("📥 [Chatbot API] Parsing request body...");
    const body = await request.json();
    console.log("📥 [Chatbot API] Request body:", JSON.stringify(body, null, 2));

    const { message, assistant, conversationHistory = [], persona }: ChatRequest = body;

    console.log("🔍 [Chatbot API] Extracted data:", {
      message: message?.substring(0, 100) + (message?.length > 100 ? "..." : ""),
      assistant,
      historyLength: conversationHistory.length,
      hasPersona: !!persona,
    });

    if (!message || !assistant) {
      console.log("❌ [Chatbot API] Missing required fields");
      return NextResponse.json({ error: "Message and assistant are required" }, { status: 400 });
    }

    console.log("🔑 [Chatbot API] Checking API key...");
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("🔑 [Chatbot API] API key exists:", !!apiKey);
    console.log("🔑 [Chatbot API] API key length:", apiKey?.length ?? 0);

    if (!apiKey) {
      console.log("❌ [Chatbot API] API key not configured");
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    console.log("🤖 [Chatbot API] Initializing model...");
    // Get the model - using gemini-1.5-flash (faster and more cost-effective)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build the prompt - simplified since assistant system was removed
    let systemPrompt = DEFAULT_PROMPT;

    // Apply persona enhancement if provided
    if (persona) {
      console.log(`🎯 [Chatbot API] Applying persona: ${persona.voiceProfile.primaryStyle} style`);
      systemPrompt = enhancePromptWithPersona(systemPrompt, persona);
      console.log("🎭 [Chatbot API] Enhanced prompt with persona");
    } else {
      console.log("🎭 [Chatbot API] Using base assistant prompt");
    }

    console.log("🎭 [Chatbot API] Using assistant:", assistant);
    console.log("🎭 [Chatbot API] System prompt length:", systemPrompt.length);

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      conversationContext =
        "\n\nPrevious conversation:\n" +
        conversationHistory.map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`).join("\n");
      console.log("💬 [Chatbot API] Conversation context length:", conversationContext.length);
    }

    const fullPrompt = `${systemPrompt}${conversationContext}\n\nUser: ${message}\n\nAssistant:`;
    console.log("📝 [Chatbot API] Full prompt length:", fullPrompt.length);

    console.log("🤖 [Chatbot API] Generating response for assistant:", assistant);

    // Generate response
    console.log("⚡ [Chatbot API] Calling Gemini API...");
    const result = await model.generateContent(fullPrompt);
    console.log("⚡ [Chatbot API] Gemini API call completed");

    const response = await result.response;
    console.log("📤 [Chatbot API] Response object received");

    const text = response.text();
    console.log("📤 [Chatbot API] Response text extracted, length:", text?.length || 0);

    console.log("✅ [Chatbot API] Generated response successfully");

    // Best-effort logging of exchange to Firestore for analytics
    try {
      if (isAdminInitialized) {
        const adminDb = getAdminDb();
        const now = new Date().toISOString();
        await adminDb.collection("chat_logs").add({
          userId: authResult.user.uid,
          assistant,
          request: { message, conversationHistory, persona: persona ? "applied" : "none" },
          response: text,
          createdAt: now,
        });
      }
    } catch (logErr) {
      console.warn("⚠️ [Chatbot API] Failed to persist chat log:", logErr);
    }

    return NextResponse.json({
      success: true,
      response: text,
      assistant,
    });
  } catch (error) {
    console.error("❌ [Chatbot API] Detailed error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
