// PostHog provider disabled - returns children directly without PostHog integration
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
