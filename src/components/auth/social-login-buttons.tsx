"use client";

import { useSocialLogin } from "@/hooks/use-social-login";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Props for the {@link SocialLoginButtons} component.
 *
 * @param providers - Array of OAuth provider IDs to render as buttons.
 * @param redirectTo - Optional URL to redirect to after successful login.
 */
interface SocialLoginButtonsProps {
  providers: string[];
  redirectTo?: string;
}

const providerLabels: Record<string, string> = {
  github: "GitHub",
  google: "Google",
};

/**
 * Social login buttons for OAuth providers.
 *
 * Renders a button for each enabled provider. Handles empty provider lists
 * gracefully (returns null). Uses `useSocialLogin` hook for sign-in logic.
 */
export function SocialLoginButtons({
  providers,
  redirectTo,
}: SocialLoginButtonsProps) {
  const { signIn } = useSocialLogin();

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Separator />
      {providers.map((providerId) => (
        <Button
          key={providerId}
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => signIn(providerId, redirectTo)}
        >
          Sign in with {providerLabels[providerId] ?? providerId}
        </Button>
      ))}
    </div>
  );
}
