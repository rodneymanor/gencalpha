import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";

// The cleaned up getting started content
const GETTING_STARTED_CONTENT = {
  title: "🚀 Getting Started with Gen.C",
  description: `Welcome to Gen.C! Your creative companion for transforming inspiration into compelling scripts.

Gen.C helps you collect ideas and inspiration, organize them efficiently, and transform them into your unique voice faster than ever before.`,
  content: `## 📥 Content Inbox Basics

### Collect & Organize
Import short-form social media content and organize it into 4 strategic categories:
• **Inspiration** - Creative ideas that spark your imagination
• **Competitor** - Content from your space to analyze and improve upon  
• **Trending** - What's hot right now in your niche
• **Educational** - Learning resources and how-to content

### 🎯 Smart Actions
Apply AI-powered actions to any content:
• Generate hooks that grab attention
• Extract key talking points
• Identify viral patterns
• Create script outlines

### ✨ Quick Start
1. Click the **"+"** button in the top right to add new content
2. Paste any social media URL to import it instantly
3. Select a category to keep things organized
4. Apply actions to transform content into your voice

### 📚 Helpful Resources
• [Gen.C Guide](https://gencapp.pro/guide) - Complete platform walkthrough
• [Prompt Library](https://gencapp.pro/prompts) - Ready-to-use prompts for better results
• [FAQs](https://gencapp.pro/faqs) - Answers to common questions

💡 **Pro Tip:** Start by importing 5-10 pieces of content that resonate with your style. This helps Gen.C learn your preferences faster!`,
  platform: "genc" as const,
  category: "educational" as const,
  tags: ["onboarding", "getting-started", "tutorial"],
  isSystemContent: true,
  isPinned: true,
};

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuth(request);
    if (!auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has content in their inbox
    const contentSnapshot = await db
      .collection("users")
      .doc(auth.uid)
      .collection("contentInbox")
      .limit(1)
      .get();

    // If user already has content, don't add the getting started note
    if (!contentSnapshot.empty) {
      return NextResponse.json({ 
        hasContent: true, 
        gettingStartedAdded: false 
      });
    }

    // Check if getting started note already exists
    const gettingStartedSnapshot = await db
      .collection("users")
      .doc(auth.uid)
      .collection("contentInbox")
      .where("isSystemContent", "==", true)
      .where("title", "==", GETTING_STARTED_CONTENT.title)
      .limit(1)
      .get();

    if (!gettingStartedSnapshot.empty) {
      return NextResponse.json({ 
        hasContent: false, 
        gettingStartedAdded: true,
        gettingStartedId: gettingStartedSnapshot.docs[0].id
      });
    }

    // Add the getting started note
    const contentItem = {
      ...GETTING_STARTED_CONTENT,
      url: "https://gencapp.pro/getting-started", // Internal URL for the getting started guide
      savedAt: new Date(),
      transcription: {
        status: "complete",
        text: GETTING_STARTED_CONTENT.content,
      },
      userId: auth.uid,
      order: 0, // Always show first
    };

    const docRef = await db
      .collection("users")
      .doc(auth.uid)
      .collection("contentInbox")
      .add(contentItem);

    return NextResponse.json({
      hasContent: false,
      gettingStartedAdded: true,
      gettingStartedId: docRef.id,
      item: {
        id: docRef.id,
        ...contentItem,
      }
    });
  } catch (error) {
    console.error("Error checking/creating onboarding content:", error);
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    );
  }
}