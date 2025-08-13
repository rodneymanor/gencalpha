import { auth as firebaseAuth } from "@/lib/firebase";

export async function buildAuthHeaders(): Promise<HeadersInit> {
  const token =
    firebaseAuth?.currentUser && typeof firebaseAuth.currentUser.getIdToken === "function"
      ? await firebaseAuth.currentUser.getIdToken()
      : undefined;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["authorization"] = `Bearer ${token}`;
  return headers;
}
