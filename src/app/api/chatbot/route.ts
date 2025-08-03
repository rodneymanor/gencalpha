import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

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
  try {
    const { message, persona, conversationHistory = [] }: ChatRequest = await request.json();

    if (!message || !persona) {
      return NextResponse.json(
        { error: "Message and persona are required" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Google Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build the prompt with persona context
    const systemPrompt = PERSONA_PROMPTS[persona as keyof typeof PERSONA_PROMPTS] || PERSONA_PROMPTS.MiniBuddy;
    
    // Build conversation context
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      conversationContext = "\n\nPrevious conversation:\n" + 
        conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    }

    const fullPrompt = `${systemPrompt}${conversationContext}\n\nUser: ${message}\n\nAssistant:`;

    console.log("🤖 Generating response for persona:", persona);

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Generated response successfully");

    return NextResponse.json({
      success: true,
      response: text,
      persona
    });

  } catch (error) {
    console.error("❌ Chatbot API error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}