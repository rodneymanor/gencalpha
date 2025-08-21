import { NextRequest, NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GenerateTitleBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

interface GenerateTitleResponse {
  success: boolean;
  title?: string;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
): Promise<NextResponse<GenerateTitleResponse>> {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<GenerateTitleResponse>;
    }

    const { conversationId } = await params;
    if (!conversationId) {
      return NextResponse.json({ success: false, error: "conversationId required" }, { status: 400 });
    }

    if (!isAdminInitialized) {
      return NextResponse.json({ success: false, error: "Admin SDK not configured" }, { status: 500 });
    }
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const body: GenerateTitleBody = await request.json();
    if (!body?.messages || body.messages.length === 0) {
      return NextResponse.json({ success: false, error: "messages required" }, { status: 400 });
    }

    // Check if conversation exists and belongs to user
    const convDoc = await adminDb.collection("chat_conversations").doc(conversationId).get();
    if (!convDoc.exists) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    const convData = convDoc.data();
    if (convData?.userId !== authResult.user.uid) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // If already has a title, return it
    if (convData?.title && convData?.status === "saved") {
      return NextResponse.json({ success: true, title: convData.title });
    }

    // Generate title using Gemini
    let cleanTitle = "Chat Session"; // Default fallback
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Build context from conversation
      const conversationContext = body.messages
        .slice(0, 4) // Use first few messages for context
        .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content.substring(0, 500)}`)
        .join("\n");

      const prompt = `Based on the following conversation, generate a concise and descriptive title (max 60 characters) that captures the main topic or purpose of the discussion. 
      
The title should be clear, specific, and help the user remember what this conversation was about.
      
Conversation:
${conversationContext}

Generate only the title, nothing else:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedTitle = response.text().trim();

      // Clean up the title (remove quotes if present, truncate if too long)
      cleanTitle = generatedTitle.replace(/^["']|["']$/g, "").trim();

      // Fallback if title is empty or too short
      if (!cleanTitle || cleanTitle.length < 3) {
        // Extract first meaningful words from user's first message
        const firstUserMessage = body.messages.find((m) => m.role === "user")?.content ?? "";
        const words = firstUserMessage.split(/\s+/).slice(0, 5).join(" ");
        cleanTitle = words.length > 3 ? words : "Chat Session";
      }

      if (cleanTitle.length > 60) {
        cleanTitle = cleanTitle.substring(0, 57) + "...";
      }
    } catch (genError) {
      console.error("⚠️ [CHAT] Title generation failed, using fallback:", genError);
      // Fallback title based on first user message
      const firstUserMessage = body.messages.find((m) => m.role === "user")?.content ?? "";
      const words = firstUserMessage.split(/\s+/).slice(0, 5).join(" ");
      cleanTitle = words.length > 3 ? words : "Chat Session";
      if (cleanTitle.length > 60) {
        cleanTitle = cleanTitle.substring(0, 57) + "...";
      }
    }

    // Update conversation with title and mark as saved
    const now = new Date().toISOString();
    await adminDb.collection("chat_conversations").doc(conversationId).update({
      title: cleanTitle,
      status: "saved",
      updatedAt: now,
    });

    return NextResponse.json({ success: true, title: cleanTitle });
  } catch (error) {
    console.error("❌ [CHAT] Generate title error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate title" }, { status: 500 });
  }
}
