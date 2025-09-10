import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { authenticateWithFirebaseToken } from "@/lib/firebase-auth-helpers";

interface UpdatePersonaRequest {
  personaId: string;
  name?: string;
  description?: string;
  tags?: string[];
  status?: "active" | "draft";
  creationStatus?: "pending" | "videos_collected" | "analyzed" | "created";
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const authResult = await authenticateWithFirebaseToken(token);
    if (authResult instanceof NextResponse) return authResult;

    if (!isAdminInitialized) {
      return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const body: UpdatePersonaRequest = await request.json();
    const { personaId, ...updates } = body;
    if (!personaId) {
      return NextResponse.json({ error: "personaId is required" }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection("personas").doc(personaId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }
    const data = doc.data() as any;
    if (data.userId !== authResult.user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const safeUpdates: any = { updatedAt: new Date().toISOString() };
    if (typeof updates.name === "string") safeUpdates.name = updates.name.trim();
    if (typeof updates.description === "string") safeUpdates.description = updates.description.trim();
    if (Array.isArray(updates.tags)) safeUpdates.tags = updates.tags;
    if (updates.status) safeUpdates.status = updates.status;
    if (updates.creationStatus) safeUpdates.creationStatus = updates.creationStatus;

    await docRef.update(safeUpdates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [Update Persona API] Error:", error);
    return NextResponse.json({ error: "Failed to update persona" }, { status: 500 });
  }
}

