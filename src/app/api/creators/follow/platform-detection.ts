// Platform detection helpers
// - Responsible for determining which platform a username likely belongs to

export function detectPlatformFromUsername(username: string): "instagram" | "tiktok" {
  const cleanUsername = username.replace("@", "").toLowerCase();

  if (cleanUsername.includes("insta") || cleanUsername.includes("ig")) {
    return "instagram";
  }

  if (cleanUsername.includes("tiktok") || cleanUsername.includes("tt")) {
    return "tiktok";
  }

  // Default heuristic
  return "instagram";
}
