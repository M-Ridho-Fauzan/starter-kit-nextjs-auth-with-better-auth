import { useStore } from "@nanostores/react";
import { authClient } from "@/auth/auth-client";
import type { Session } from "@/auth/auth-client";

/**
 * Authentication state returned by `useAuth()`.
 */
export interface UseAuthResult {
  /** The authenticated user, or `null` when not authenticated. */
  user: Session["user"] | null;
  /** The session object, or `null` when not authenticated. */
  session: Session["session"] | null;
  /** `true` while the initial session fetch is in progress. */
  isLoading: boolean;
  /** `true` when a valid session exists. */
  isAuthenticated: boolean;
}

/**
 * React hook that exposes the current authentication state.
 *
 * Subscribes to the Better Auth client session store under the hood.
 * Returns stable authentication status including loading state.
 *
 * @returns The current authentication state.
 *
 * @example
 * ```tsx
 * import { useAuth } from "@/hooks/use-auth";
 *
 * function UserMenu() {
 *   const { user, isLoading, isAuthenticated } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <SignInButton />;
 *   return <span>{user?.name}</span>;
 * }
 * ```
 */
export function useAuth(): UseAuthResult {
  const { data, isPending } = useStore(authClient.useSession);

  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    isLoading: isPending,
    isAuthenticated: data !== null,
  };
}
