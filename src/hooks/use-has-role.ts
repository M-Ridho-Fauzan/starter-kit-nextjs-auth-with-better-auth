import { useStore } from "@nanostores/react";
import { authClient } from "@/auth/auth-client";

/**
 * React hook that checks if the current user has a given role.
 *
 * @param role - A single role string or an array of accepted roles.
 * @returns `true` if the user has one of the specified roles.
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const isAdmin = useHasRole("admin");
 *   if (!isAdmin) return null;
 *   return <div>Admin panel content</div>;
 * }
 * ```
 */
export function useHasRole(role: string | string[]): boolean {
  const { data } = useStore(authClient.useSession);
  if (!data?.user) {
    return false;
  }
  const userRole = (data.user as Record<string, unknown>).role;
  if (typeof userRole !== "string") {
    return false;
  }
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(userRole);
}
