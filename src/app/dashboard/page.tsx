import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/server-utils";
import { UserProfile } from "@/components/user/user-profile";
import config from "../../../auth.config";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect(config.ui.redirectAfterLogout);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome back, {session.user.name ?? session.user.email}
          </p>
        </div>
        <UserProfile twoFactorSettingsPath={config.ui.twoFactorSettingsPath} />
      </div>
    </div>
  );
}
