import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './firebase-admin';

export type PoolKeyword = {
  id: string;
  keyword: string;
  category?: string | null;
  lastUsed?: FirebaseFirestore.Timestamp | null;
  timesUsed: number;
  createdAt: FirebaseFirestore.Timestamp;
};

const POOL_COLLECTION = 'keyword_pool';
const ROTATION_COLLECTION = 'keyword_rotation_days';

const toId = (kw: string) =>
  kw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\-]/g, '')
    .slice(0, 128) ||
  Math.random().toString(36).slice(2);

export function dateKey(d?: Date | string) {
  const dt = typeof d === 'string' ? new Date(d) : d ?? new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function seedKeywordPool(keywords: string[]) {
  const db = getAdminDb();
  if (!db) throw new Error('Firebase Admin is not initialized');

  const batch = db.batch();
  for (const kw of keywords) {
    const id = toId(kw);
    const ref = db.collection(POOL_COLLECTION).doc(id);
    // Use create to avoid overwriting if exists
    batch.set(
      ref,
      {
        keyword: kw,
        category: null,
        lastUsed: null,
        timesUsed: 0,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
  await batch.commit();
}

// Seed with an explicit category (preferred for new docs)
export async function seedKeywordPoolForCategory(category: string, keywords: string[]) {
  const db = getAdminDb();
  if (!db) throw new Error('Firebase Admin is not initialized');

  const batch = db.batch();
  for (const kw of keywords) {
    const id = toId(`${category}__${kw}`);
    const ref = db.collection(POOL_COLLECTION).doc(id);
    batch.set(
      ref,
      {
        keyword: kw,
        category,
        lastUsed: null,
        timesUsed: 0,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
  await batch.commit();
}

// Auto-seed pool from existing entries in 'keyword_queries' using their 'primaryKeyword' field.
// Limits the number of documents scanned for safety.
export async function seedPoolFromKeywordQueries(options?: { limit?: number }) {
  const db = getAdminDb();
  if (!db) throw new Error('Firebase Admin is not initialized');

  const limit = Math.max(1, Math.min(500, options?.limit ?? 50));
  const snap = await db
    .collection('keyword_queries')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  const set = new Set<string>();
  snap.forEach((doc) => {
    const d = doc.data() as any;
    if (typeof d?.primaryKeyword === 'string' && d.primaryKeyword.trim()) {
      set.add(String(d.primaryKeyword).trim());
    }
  });

  if (set.size === 0) return { added: 0, keywords: [] as string[] };
  const keywords = Array.from(set);
  await seedKeywordPool(keywords);
  return { added: keywords.length, keywords };
}

export async function getActiveKeywordsForDate(d?: Date | string, category?: string | undefined): Promise<string[] | null> {
  const db = getAdminDb();
  if (!db) throw new Error('Firebase Admin is not initialized');
  const base = dateKey(d);
  const suffix = category ? `__${String(category).toLowerCase()}` : '';
  const key = `${base}${suffix}`;
  const doc = await db.collection(ROTATION_COLLECTION).doc(key).get();
  if (!doc.exists) return null;
  const data = doc.data() as any;
  return Array.isArray(data?.keywords) ? (data.keywords as string[]) : [];
}

export async function rotateKeywords(options?: { count?: number; date?: Date | string; force?: boolean; category?: string }) {
  const db = getAdminDb();
  if (!db) throw new Error('Firebase Admin is not initialized');
  const count = Math.max(1, Math.min(10, options?.count ?? 3));
  const baseKey = dateKey(options?.date);
  const key = `${baseKey}${requestedCategory ? `__${requestedCategory}` : ''}`;
  const requestedCategory = (options?.category || '').toString().trim().toLowerCase() || undefined;

  if (!options?.force) {
    const existing = await getActiveKeywordsForDate(options?.date, requestedCategory);
    if (existing && existing.length) {
      return { date: baseKey, keywords: existing, category: requestedCategory } as const;
    }
  }

  // Pick the oldest by lastUsed (nulls first), then createdAt
  async function fetchCandidates() {
    // Fetch a generous number so we can client-filter by category without a composite index
    const limit = Math.max(count * 10, 100);
    const snap = await db
      .collection(POOL_COLLECTION)
      .orderBy('lastUsed', 'asc')
      .limit(limit)
      .get();
    let candidates: Array<{ id: string; keyword: string; createdAt?: FirebaseFirestore.Timestamp | null; category?: string | null }> = [];
    snap.forEach((doc) => {
      const d = doc.data() as any;
      if (typeof d.keyword === 'string' && d.keyword.trim()) {
        candidates.push({ id: doc.id, keyword: d.keyword, createdAt: d.createdAt ?? null, category: d.category ?? null });
      }
    });
    if (requestedCategory) {
      candidates = candidates.filter((c) => (c.category || '').toString().toLowerCase() === requestedCategory);
    }
    // Secondary sort client-side by createdAt asc to avoid composite index
    candidates.sort((a, b) => {
      const at = a.createdAt?.toMillis?.() ?? 0;
      const bt = b.createdAt?.toMillis?.() ?? 0;
      return at - bt;
    });
    return candidates;
  }

  let candidates = await fetchCandidates();
  let seededFromQueries = 0;
  if (candidates.length < count) {
    // On-demand auto-seed from existing keyword_queries, then retry once
    try {
      const seeded = await seedPoolFromKeywordQueries({ limit: 50 });
      seededFromQueries = seeded?.added ?? 0;
      if (seededFromQueries > 0) {
        candidates = await fetchCandidates();
      }
    } catch {
      // ignore seeding failures; continue with what we have
    }
  }

  const chosen = candidates.slice(0, count).map(({ id, keyword }) => ({ id, keyword }));

  if (chosen.length === 0) return { date: baseKey, keywords: [], category: requestedCategory } as const;

  const batch = db.batch();
  const useTimestamp =
    typeof options?.date === 'string' || options?.date instanceof Date
      ? Timestamp.fromDate(new Date(options.date as any))
      : (FieldValue.serverTimestamp() as any);

  for (const c of chosen) {
    const ref = db.collection(POOL_COLLECTION).doc(c.id);
    batch.set(
      ref,
      {
        lastUsed: useTimestamp,
        timesUsed: FieldValue.increment(1),
      },
      { merge: true },
    );
  }

  const dayRef = db.collection(ROTATION_COLLECTION).doc(key);
  batch.set(dayRef, { date: baseKey, keywords: chosen.map((c) => c.keyword), category: requestedCategory ?? null, createdAt: FieldValue.serverTimestamp() });

  await batch.commit();

  return { date: baseKey, keywords: chosen.map((c) => c.keyword), seeded: seededFromQueries, category: requestedCategory } as const;
}
