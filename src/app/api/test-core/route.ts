import { NextResponse } from "next/server";

async function testFirebaseConnection() {
  try {
    const { getAdminDb, isAdminInitialized } = await import("@/lib/firebase-admin");

    if (!isAdminInitialized) {
      return {
        status: "error",
        service: "firebase",
        error: "Firebase Admin not initialized - check environment variables",
      };
    }

    const db = getAdminDb();
    if (!db) {
      return { status: "error", service: "firebase", error: "Firebase database not available" };
    }

    // Test with a simple query
    await db.collection("test").limit(1).get();
    return { status: "connected", service: "firebase" };
  } catch (error) {
    return { status: "error", service: "firebase", error: error.message };
  }
}

async function testGeminiConnection() {
  try {
    const { generateScript } = await import("@/lib/gemini");

    if (!process.env.GEMINI_API_KEY) {
      return { status: "error", service: "gemini", error: "GEMINI_API_KEY not configured" };
    }

    // Test with a simple prompt
    const result = await generateScript("Hello", { maxTokens: 10 });

    if (result.success) {
      return { status: "connected", service: "gemini" };
    } else {
      return { status: "error", service: "gemini", error: result.error || "Unknown error" };
    }
  } catch (error) {
    return { status: "error", service: "gemini", error: error.message };
  }
}

async function testBunnyConnection() {
  try {
    const { isBunnyStreamConfigured, testBunnyStreamConfig } = await import("@/lib/bunny-stream");

    if (!isBunnyStreamConfigured()) {
      return { status: "error", service: "bunny", error: "Bunny Stream not configured - check environment variables" };
    }

    // Test configuration
    testBunnyStreamConfig();
    return { status: "connected", service: "bunny" };
  } catch (error) {
    return { status: "error", service: "bunny", error: error.message };
  }
}

export async function GET() {
  try {
    const firebase = await testFirebaseConnection();
    const gemini = await testGeminiConnection();
    const bunny = await testBunnyConnection();

    return NextResponse.json({
      status: "success",
      services: { firebase, gemini, bunny },
    });
  } catch (error) {
    console.error("🚨 Core services test failed:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
