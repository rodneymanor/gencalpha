import { useAuth } from "@/contexts/auth-context";

/**
 * Hook to check if authentication is still initializing.
 * Use this in components that need to show loading states while auth resolves.
 *
 * @returns boolean - true if auth is still initializing
 */
export function useAuthLoading(): boolean {
  const { user, initializing } = useAuth();

  // Consider auth "loading" if we're still initializing and don't have a user yet
  return initializing && !user;
}
