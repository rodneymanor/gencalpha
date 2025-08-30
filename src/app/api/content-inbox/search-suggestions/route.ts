// Content Inbox Search Suggestions API Route

import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";

// GET - Get search suggestions based on query
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuth(request);
    if (!auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search query
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const queryLower = query.toLowerCase();

    // Get recent items to build suggestions from
    const snapshot = await db
      .collection("users")
      .doc(auth.uid)
      .collection("contentInbox")
      .orderBy("savedAt", "desc")
      .limit(100)
      .get();

    const suggestions = new Set<string>();

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Check title
      if (data.title && data.title.toLowerCase().includes(queryLower)) {
        suggestions.add(data.title);
      }

      // Check creator name
      if (data.creator?.name && data.creator.name.toLowerCase().includes(queryLower)) {
        suggestions.add(data.creator.name);
      }

      // Check tags
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(queryLower)) {
            suggestions.add(tag);
          }
        });
      }

      // Check transcript snippets
      if (data.transcription?.text) {
        const text = data.transcription.text.toLowerCase();
        if (text.includes(queryLower)) {
          // Extract a relevant snippet around the match
          const index = text.indexOf(queryLower);
          const start = Math.max(0, index - 20);
          const end = Math.min(text.length, index + queryLower.length + 20);
          const snippet = text.substring(start, end).trim();
          if (snippet.length > 10) {
            suggestions.add("..." + snippet + "...");
          }
        }
      }
    });

    // Convert to array and limit results
    const suggestionArray = Array.from(suggestions)
      .filter((s) => s.toLowerCase().includes(queryLower))
      .slice(0, 10);

    return NextResponse.json(suggestionArray);
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return NextResponse.json({ error: "Failed to get search suggestions" }, { status: 500 });
  }
}
