import { redirect } from "next/navigation";

export default function LegacyDashboardSettingsRedirect({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const query = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        for (const v of value) query.append(key, v);
      } else if (typeof value === "string") {
        query.set(key, value);
      }
    }
  }
  const qs = query.toString();
  const target = qs ? `/settings?${qs}` : "/settings";
  redirect(target);
}
