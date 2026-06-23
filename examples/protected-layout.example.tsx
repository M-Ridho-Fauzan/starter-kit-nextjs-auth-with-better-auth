/**
 * Protected layout — example for copy-pasting into your app.
 *
 * Usage:
 * 1. Create `src/app/(protected)/layout.tsx`
 * 2. Paste this file's content there
 * 3. Place pages like `dashboard/page.tsx` inside `(protected)/`
 *
 * This layout redirects unauthenticated users to the login page.
 * For role-based access, add checks inside the layout using `hasRole()`.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/server-utils";
import config from "../../auth.config";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect(config.ui.redirectAfterLogout);
  }

  // Optional role check — uncomment to restrict layout by role:
  // if (!hasRole(session, "admin")) {
  //   redirect(config.ui.redirectAfterLogin);
  // }

  return <>{children}</>;
}
