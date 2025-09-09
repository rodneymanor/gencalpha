import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { getAdminDb } from "./firebase-admin";

export const KeywordQuerySchema = z.object({
  primaryKeyword: z.string({ required_error: "primaryKeyword is required" }).min(1).max(100),
  generatedQuery: z.string({ required_error: "generatedQuery is required" }).min(1),
  queryType: z.string().max(50).optional(),
  performanceScore: z
    .number()
    .min(0)
    .max(9.9999)
    .transform((n) => Math.round(n * 10000) / 10000)
    .optional()
    .default(0.5),
  lastUsed: z
    .union([z.date(), z.number()])
    .transform((v) => (v instanceof Date ? Timestamp.fromDate(v) : Timestamp.fromMillis(v)))
    .optional(),
  timesUsed: z.number().int().min(0).optional().default(0),
});

export type KeywordQueryInput = z.infer<typeof KeywordQuerySchema>;

export type KeywordQueryDoc = {
  id: string;
  primaryKeyword: string;
  generatedQuery: string;
  queryType?: string;
  performanceScore: number;
  lastUsed?: FirebaseFirestore.Timestamp;
  timesUsed: number;
  createdAt: FirebaseFirestore.Timestamp;
};

export async function saveKeywordQuery(input: KeywordQueryInput): Promise<KeywordQueryDoc> {
  const adminDb = getAdminDb();
  if (!adminDb) throw new Error("Firebase Admin is not initialized");

  const parsed = KeywordQuerySchema.parse(input);

  const payload: Omit<KeywordQueryDoc, "id" | "createdAt"> & {
    createdAt: FirebaseFirestore.FieldValue;
  } = {
    primaryKeyword: parsed.primaryKeyword,
    generatedQuery: parsed.generatedQuery,
    queryType: parsed.queryType,
    performanceScore: parsed.performanceScore ?? 0.5,
    lastUsed: parsed.lastUsed,
    timesUsed: parsed.timesUsed ?? 0,
    createdAt: FieldValue.serverTimestamp(),
  } as any;

  const ref = await adminDb.collection("keyword_queries").add(payload);
  const snap = await ref.get();
  const data = snap.data();

  return {
    id: ref.id,
    primaryKeyword: data.primaryKeyword,
    generatedQuery: data.generatedQuery,
    queryType: data.queryType,
    performanceScore: data.performanceScore,
    lastUsed: data.lastUsed,
    timesUsed: data.timesUsed,
    createdAt: data.createdAt,
  };
}
