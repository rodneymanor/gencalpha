import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "firebase-admin/auth";

import { adminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Extract Firebase ID token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authorization header required",
        },
        { status: 401 },
      );
    }

    const idToken = authHeader.substring(7);

    if (!isAdminInitialized) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Admin SDK not configured",
        },
        { status: 500 },
      );
    }

    // Verify Firebase ID token
    const auth = getAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Firebase token",
        },
        { status: 401 },
      );
    }

    const userId = decodedToken.uid;

    // Get user brand settings from Firestore
    const settingsDoc = await adminDb.collection("userBrandSettings").doc(userId).get();

    if (!settingsDoc.exists) {
      return NextResponse.json({
        success: true,
        settings: null,
        message: "No brand settings found",
      });
    }

    const settings = settingsDoc.data();

    return NextResponse.json({
      success: true,
      settings: {
        userId,
        selectedCategories: settings?.selectedCategories ?? [],
        customKeywords: settings?.customKeywords ?? [],
        updatedAt: settings?.updatedAt ?? new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching brand settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch brand settings",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract Firebase ID token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authorization header required",
        },
        { status: 401 },
      );
    }

    const idToken = authHeader.substring(7);

    if (!isAdminInitialized) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Admin SDK not configured",
        },
        { status: 500 },
      );
    }

    // Verify Firebase ID token
    const auth = getAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Firebase token",
        },
        { status: 401 },
      );
    }

    const userId = decodedToken.uid;

    const body = await request.json();
    const { selectedCategories, customKeywords } = body;

    // Validate input
    if (!Array.isArray(selectedCategories)) {
      return NextResponse.json(
        {
          success: false,
          error: "selectedCategories must be an array",
        },
        { status: 400 },
      );
    }

    const settings = {
      userId,
      selectedCategories,
      customKeywords: customKeywords ?? [],
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore
    await adminDb.collection("userBrandSettings").doc(userId).set(settings, { merge: true });

    return NextResponse.json({
      success: true,
      settings,
      message: "Brand settings saved successfully",
    });
  } catch (error) {
    console.error("Error saving brand settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save brand settings",
      },
      { status: 500 },
    );
  }
}
