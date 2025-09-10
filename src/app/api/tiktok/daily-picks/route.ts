import { NextRequest } from "next/server";

import { normalizeCategory } from "@/data/keyword-pools";
import { getOrComputeDailyPicks, getOrComputeProcessedDailyScripts } from "@/lib/daily-picks";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "1" || searchParams.get("force") === "true";
    let categoryParam = searchParams.get("category") || searchParams.get("topic");
    const userId = searchParams.get("userId") || "public";
    let category = normalizeCategory(categoryParam || undefined);

    // If no category provided, try to resolve from the user's profile (server-side)
    if (!category) {
      try {
        const db = getAdminDb();
        if (db && userId && userId !== "public") {
          const snap = await db
            .collection("user_profiles")
            .where("uid", "==", userId)
            .where("isActive", "==", true)
            .limit(1)
            .get();
          if (!snap.empty) {
            const doc = snap.docs[0];
            const ct = doc.data()?.contentTopic as string | undefined;
            category = normalizeCategory(ct || undefined);
            categoryParam = ct ?? categoryParam;
          }
        }
      } catch {}
    }

    // Fetch raw daily picks (for visibility of keywords) and processed scripts
    const { videos, date } = await getOrComputeDailyPicks({ category: category ?? undefined, force });
    const keywordsUsed = Array.from(new Set((videos || []).map((v: any) => v.keyword).filter(Boolean)));
    const { scripts } = await getOrComputeProcessedDailyScripts({ category: category ?? undefined, force, userId });
    return Response.json(
      { ok: true, count: scripts.length, scripts, category: category ?? null, keywordsUsed, date },
      { status: 200 },
    );
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "Failed to get daily picks" }, { status: 500 });
  }
}
