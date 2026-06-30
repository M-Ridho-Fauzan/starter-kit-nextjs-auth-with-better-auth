"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { authClient } from "@/auth/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Avatar fallback — renders initials when no profile image is available.
 *
 * @param name - The user's display name used to derive initials.
 */
function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold">
      {initials}
    </div>
  );
}

/**
 * Props for the {@link UserProfile} component.
 */
export interface UserProfileProps {
  /**
   * Base path for two-factor settings (default: `/settings/2fa`).
   * The full page at this path must be implemented by the consuming app.
   */
  twoFactorSettingsPath?: string;
}

/**
 * User profile card.
 *
 * Displays the authenticated user's name, email, role badge, and links to
 * 2FA settings and sign-out. Returns null when no user is logged in.
 */
export function UserProfile({
  twoFactorSettingsPath = "/settings/2fa",
}: UserProfileProps = {}) {
  const { user } = useAuth();
  const role = useRole();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <AvatarFallback name={user.name ?? ""} />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>

        {role && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Role:</span>
            <Badge variant="secondary">{role}</Badge>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(twoFactorSettingsPath)}
          >
            Two-factor settings
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
