import { headers } from "next/headers";
import { auth, type Session } from "@/auth/server";

export async function getServerSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

export function getUserRole(
  session: Session | null | undefined,
): string | undefined {
  if (!session?.user) {
    return undefined;
  }
  const role = (session.user as Record<string, unknown>).role;
  return typeof role === "string" ? role : undefined;
}

export function hasRole(
  session: Session | null | undefined,
  role: string | string[],
): boolean {
  const userRole = getUserRole(session);
  if (!userRole) {
    return false;
  }
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(userRole);
}
