import { authClient } from "@/auth/auth-client";

/**
 * Hook for initiating OAuth social login flows.
 *
 * @example
 * ```tsx
 * function GitHubButton() {
 *   const { signIn } = useSocialLogin();
 *   return <button onClick={() => signIn("github")}>Sign in with GitHub</button>;
 * }
 * ```
 */
export function useSocialLogin() {
  /**
   * Sign in with the given OAuth provider.
   * Navigates away to the provider's authorization page.
   */
  const signIn = (providerId: string, redirectTo?: string) => {
    authClient.signIn.social({
      provider: providerId as never,
      callbackURL: redirectTo,
    });
  };

  return { signIn };
}
