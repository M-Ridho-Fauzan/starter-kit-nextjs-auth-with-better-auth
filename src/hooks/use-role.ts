import { useStore } from "@nanostores/react";
import { authClient } from "@/auth/auth-client";

/**
 * React hook that returns the current user's role from the session.
 *
 * @returns The user's role string, or `undefined` if not logged in.
 *
 * @example
 * ```tsx
 * function ProfileBadge() {
 *   const role = useRole();
 *   return <span>Role: {role ?? "guest"}</span>;
 * }
 * ```
 */
export function useRole(): string | undefined {
  const { data } = useStore(authClient.useSession);
  if (!data?.user) {
    return undefined;
  }
  return (data.user as Record<string, unknown>).role as string | undefined;
}
