import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { authenticateWithFirebaseToken } from "@/lib/firebase-auth-helpers";

interface DeletePersonaRequest {
  personaId: string;
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

    const body: DeletePersonaRequest = await request.json();
    const { personaId } = body;
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

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [Delete Persona API] Error:", error);
    return NextResponse.json({ error: "Failed to delete persona" }, { status: 500 });
  }
}

