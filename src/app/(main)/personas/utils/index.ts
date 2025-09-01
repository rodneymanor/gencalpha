// Utility functions for personas

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins === 0) return "just now";
      return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
    }
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
};

export const extractUsername = (input: string): string => {
  const trimmed = input.trim();

  // If it's already just a username (no URL), return as is
  if (!trimmed.includes("/") && !trimmed.includes(".")) {
    return trimmed.replace("@", ""); // Remove @ if present
  }

  try {
    const url = new URL(trimmed);
    const pathSegments = url.pathname.split("/").filter(Boolean);

    // Look for username in path (starts with @)
    for (const segment of pathSegments) {
      if (segment.startsWith("@")) {
        return segment.substring(1); // Remove @ prefix
      }
    }

    return "";
  } catch {
    // Not a valid URL, treat as plain username
    return trimmed.replace("@", "");
  }
};
