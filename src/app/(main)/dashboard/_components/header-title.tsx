"use client";

import { usePathname } from "next/navigation";

/**
 * HeaderTitle dynamically derives a human-readable page title from the current pathname.
 * It replaces dashes with spaces and ensures the first letter is capitalized.
 */
export function HeaderTitle() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  let rawTitle = segments[segments.length - 1] ?? "dashboard";

  // Convert kebab-case or other dash-separated strings to spaced words.
  rawTitle = rawTitle.replace(/-/g, " ");

  // Capitalize first letter only.
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

  return <h1 className="text-lg font-semibold capitalize">{title}</h1>;
}
