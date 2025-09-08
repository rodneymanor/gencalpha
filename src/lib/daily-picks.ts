import { getAdminDb, isAdminInitialized } from '@/lib/firebase-admin';
import { getTopSixFromRotatedKeywords, RankedVideo } from '@/lib/tiktok/top-six';
import { FieldValue } from 'firebase-admin/firestore';
import { VideoTranscriber } from '@/core/video/transcriber';
import { scriptGenerationService } from '@/lib/services/script-generation-service';
import type { VideoScript } from '@/components/script-display/types';

type DailyPicksDoc = {
  date: string; // YYYY-MM-DD
  category: string | null;
  videos: RankedVideo[];
  scripts?: VideoScript[];
  createdAt: FirebaseFirestore.FieldValue | FirebaseFirestore.Timestamp;
};

const COLLECTION = 'daily_picks';

// In-memory fallback cache (when Firebase Admin is not initialized in dev)
type MemEntry = { date: string; category: string | null; videos?: RankedVideo[]; scripts?: VideoScript[]; at: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any;
if (!g.__dailyPicksMem) {
  g.__dailyPicksMem = { map: new Map<string, MemEntry>() };
}
const memStore: { map: Map<string, MemEntry> } = g.__dailyPicksMem;

function docId(dateKey: string, category?: string | null) {
  const cat = (category || 'all').toString().toLowerCase();
  return `${dateKey}__${cat}`;
}

export async function getOrComputeDailyPicks(params?: { category?: string; force?: boolean }) {
  const db = getAdminDb();

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const dateKey = `${y}-${m}-${d}`;
  const cat = params?.category || null;
  const id = docId(dateKey, cat);

  if (!params?.force) {
    if (db) {
      const snap = await db.collection(COLLECTION).doc(id).get();
      if (snap.exists) {
        const data = snap.data() as DailyPicksDoc | undefined;
        const videos = (data?.videos as RankedVideo[]) || [];
        return { date: dateKey, category: cat, videos } as const;
      }
    } else {
      const mem = memStore.map.get(id);
      if (mem?.videos && mem.date === dateKey) {
        return { date: dateKey, category: cat, videos: mem.videos } as const;
      }
    }
  }

  // Compute via TikTok search using rotated keywords (per-day+category aware)
  const videos = await getTopSixFromRotatedKeywords({ category: cat || undefined, force: true });

  if (db) {
    const payload: DailyPicksDoc = {
      date: dateKey,
      category: cat,
      videos,
      createdAt: FieldValue.serverTimestamp(),
    } as any;
    await db.collection(COLLECTION).doc(id).set(payload, { merge: true });
  } else {
    memStore.map.set(id, { date: dateKey, category: cat, videos, at: Date.now() });
  }

  return { date: dateKey, category: cat, videos } as const;
}

export async function getOrComputeProcessedDailyScripts(params?: {
  category?: string;
  force?: boolean; // force processing
  userId?: string; // used for negative keyword personalization
}) {
  const db = getAdminDb();

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const dateKey = `${y}-${m}-${d}`;
  const cat = params?.category || null;
  const id = docId(dateKey, cat);

  // Ensure daily picks (videos) exist
  const { videos } = await getOrComputeDailyPicks({ category: cat || undefined, force: false });

  let data: DailyPicksDoc = {} as any;
  if (db) {
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    data = (snap.exists ? (snap.data() as DailyPicksDoc) : undefined) || ({} as DailyPicksDoc);
  } else {
    const mem = memStore.map.get(id);
    if (mem) data = { date: mem.date, category: mem.category, videos, scripts: mem.scripts, createdAt: FieldValue.serverTimestamp() as any };
  }

  if (!params?.force && Array.isArray(data.scripts) && data.scripts.length > 0) {
    return { date: dateKey, category: cat, scripts: data.scripts } as const;
  }

  // Process videos into scripts
  const scripts: VideoScript[] = [];
  for (let idx = 0; idx < videos.length; idx++) {
    const v = videos[idx];
    let transcript: string | undefined;
    let hookText: string | undefined;

    try {
      if ((v as any)?.url && process.env.INTERNAL_API_SECRET) {
        const cdnUrl = (v as any).url as string;
        const t = await VideoTranscriber.transcribeFromUrl(cdnUrl, 'tiktok' as any);
        transcript = t?.transcript ?? undefined;
        hookText = t?.components?.hook ?? undefined;
      }
    } catch (e) {
      // continue; fallback to description
    }

    const ideaBase = hookText || (transcript ? transcript.slice(0, 200) : String(v.description || 'Script idea from trending video'));
    const idea = String(ideaBase).slice(0, 900);

    let contentFromGen: string | null = null;
    try {
      // If admin not initialized, negative keyword service may fail; ignore errors
      const gen = await scriptGenerationService.generateScript({ idea, length: '60', userId: params?.userId || 'public', type: 'speed' });
      if (gen.success && gen.content) {
        contentFromGen = gen.content;
      }
    } catch (e) {
      // ignore; we'll fallback to components/transcript
    }

    const content = contentFromGen || '';
    const parts = content
      ? content.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)
      : [hookText || '', '', '', ''];

    const [hook = idea, bridge = parts[1] || '', nugget = parts[2] || '', wta = parts[3] || ''] = parts;

    const secs = typeof v.duration === 'number' ? v.duration : 0;
    const durationLabel = secs ? `${Math.round(secs)}s` : '';
    const title = (v.description as string | undefined)?.slice(0, 80) || `Video ${idx + 1}`;

    scripts.push({
      id: idx + 1,
      title,
      duration: durationLabel,
      status: 'ready',
      sections: [
        { type: 'hook', label: 'Hook', timeRange: '0-3s', dialogue: hook, action: 'Open strong' },
        { type: 'bridge', label: 'Bridge', timeRange: '3-8s', dialogue: bridge, action: 'Set context' },
        { type: 'golden-nugget', label: 'Golden Nugget', timeRange: '8-20s', dialogue: nugget, action: 'Deliver insight' },
        { type: 'wta', label: 'What To Action', timeRange: '20-30s', dialogue: wta, action: 'Give next step' },
      ],
    });
  }

  if (db) {
    const ref = db.collection(COLLECTION).doc(id);
    await ref.set({ scripts }, { merge: true });
  } else {
    const existing = memStore.map.get(id) || { date: dateKey, category: cat, at: Date.now() };
    memStore.map.set(id, { ...existing, scripts, videos, date: dateKey, category: cat, at: Date.now() });
  }

  return { date: dateKey, category: cat, scripts } as const;
}
