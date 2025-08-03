import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ChatRequest {
  message: string;
  persona: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const PERSONA_PROMPTS = {
  Scribo: "You are Scribo, a professional script writer specialized in creating viral social media content. You help users craft compelling scripts for videos, posts, and stories. Focus on engagement, storytelling, and viral potential.",
  MiniBuddy: "You are MiniBuddy, a friendly and concise assistant that provides quick, helpful responses. Keep your answers brief but valuable, and maintain a warm, approachable tone.",
  StoryBuddy: "You are StoryBuddy, a creative storytelling assistant. You excel at helping users develop narratives, character arcs, plot structures, and engaging story elements for any medium.",
  HookBuddy: "You are HookBuddy, an expert at creating attention-grabbing hooks and openings. You specialize in crafting compelling first lines, intros, and headlines that capture audience attention immediately.",
  MVBB: "You are MiniValueBombBuddy (MVBB), a concentrated value delivery expert. You provide high-impact, actionable insights in minimal time. Every response should be a 'value bomb' - packed with useful, implementable advice."
};

export async function POST(request: NextRequest) {
  console.log("🚀 [Chatbot API] Request received");
  
  try {
    console.log("📥 [Chatbot API] Parsing request body...");
    const body = await request.json();
    console.log("📥 [Chatbot API] Request body:", JSON.stringify(body, null, 2));
    
    const { message, persona, conversationHistory = [] }: ChatRequest = body;

    console.log("🔍 [Chatbot API] Extracted data:", {
      message: message?.substring(0, 100) + (message?.length > 100 ? '...' : ''),
      persona,
      historyLength: conversationHistory.length
    });

    if (!message || !persona) {
      console.log("❌ [Chatbot API] Missing required fields");
      return NextResponse.json(
        { error: "Message and persona are required" },
        { status: 400 }
      );
    }

    console.log("🔑 [Chatbot API] Checking API key...");
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("🔑 [Chatbot API] API key exists:", !!apiKey);
    console.log("🔑 [Chatbot API] API key length:", apiKey?.length || 0);
    
    if (!apiKey) {
      console.log("❌ [Chatbot API] API key not configured");
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    console.log("🤖 [Chatbot API] Initializing model...");
    // Get the model - using gemini-1.5-flash (faster and more cost-effective)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build the prompt with persona context
    const systemPrompt = PERSONA_PROMPTS[persona as keyof typeof PERSONA_PROMPTS] || PERSONA_PROMPTS.MiniBuddy;
    console.log("🎭 [Chatbot API] Using persona:", persona);
    console.log("🎭 [Chatbot API] System prompt:", systemPrompt.substring(0, 100) + "...");
    
    // Build conversation context
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      conversationContext = "\n\nPrevious conversation:\n" +
        conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
      console.log("💬 [Chatbot API] Conversation context length:", conversationContext.length);
    }

    const fullPrompt = `${systemPrompt}${conversationContext}\n\nUser: ${message}\n\nAssistant:`;
    console.log("📝 [Chatbot API] Full prompt length:", fullPrompt.length);

    console.log("🤖 [Chatbot API] Generating response for persona:", persona);

    // Generate response
    console.log("⚡ [Chatbot API] Calling Gemini API...");
    const result = await model.generateContent(fullPrompt);
    console.log("⚡ [Chatbot API] Gemini API call completed");
    
    const response = await result.response;
    console.log("📤 [Chatbot API] Response object received");
    
    const text = response.text();
    console.log("📤 [Chatbot API] Response text extracted, length:", text?.length || 0);

    console.log("✅ [Chatbot API] Generated response successfully");

    return NextResponse.json({
      success: true,
      response: text,
      persona
    });

  } catch (error) {
    console.error("❌ [Chatbot API] Detailed error:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined
    });
    
    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}