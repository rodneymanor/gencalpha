import { NextRequest } from "next/server";

import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages,
    } as any);

    const stream = OpenAIStream(response as any);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message ?? "Chat error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
