import { buildAuthHeaders } from "@/lib/http/auth-headers";

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const headers = await buildAuthHeaders();
  const res = await fetch(path, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return (await res.json()) as T;
}
