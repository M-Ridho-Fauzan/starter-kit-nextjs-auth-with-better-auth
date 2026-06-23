import { useStore } from "@nanostores/react";
import { authClient, type Session } from "@/auth/auth-client";

/**
 * React hook that returns the raw session data from the Better Auth client.
 *
 * Use this when you need the full session object including both `user` and
 * `session` fields. For convenience, prefer `useAuth()` which also exposes
 * `isLoading` and `isAuthenticated`.
 *
 * @returns The session data (`{ user, session }`) or `null`.
 *
 * @example
 * ```tsx
 * import { useSession } from "@/hooks/use-session";
 *
 * function SessionDebug() {
 *   const session = useSession();
 *   return <pre>{JSON.stringify(session, null, 2)}</pre>;
 * }
 * ```
 */
export function useSession(): Session | null {
  const { data } = useStore(authClient.useSession);
  return data;
}
